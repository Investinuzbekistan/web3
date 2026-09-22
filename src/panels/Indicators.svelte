<script lang="ts">
  /** Every figure on the site in one sortable table, with a CSV export. */
  import SourceTag from '../components/SourceTag.svelte';
  import { app, tr } from '../lib/state.svelte';
  import { formatDate } from '../lib/shared/content';
  import { buildIndicators, downloadCsv, toCsv, type IndicatorRow } from '../lib/indicators';

  type Column = 'label' | 'value' | 'group' | 'source' | 'asOf';

  let sortBy = $state<Column>('group');
  let ascending = $state(true);

  const rows = $derived(app.content ? buildIndicators(app.content, app.lang) : []);

  const sorted = $derived.by(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const direction = ascending ? 1 : -1;
      if (sortBy === 'value') return (a.value - b.value) * direction;
      return String(a[sortBy]).localeCompare(String(b[sortBy]), app.lang) * direction;
    });
    return copy;
  });

  function sort(column: Column) {
    if (sortBy === column) ascending = !ascending;
    else {
      sortBy = column;
      ascending = true;
    }
  }

  const ariaSort = (column: Column): 'ascending' | 'descending' | 'none' =>
    sortBy === column ? (ascending ? 'ascending' : 'descending') : 'none';

  function exportCsv() {
    const c = app.t.indicators.columns;
    downloadCsv(
      `invest-uzbekistan-indicators-${app.lang}.csv`,
      toCsv(sorted, [c.indicator, c.value, c.group, c.source, c.asOf]),
    );
  }

  const groupLabel = (row: IndicatorRow) => app.t.indicators.groups[row.group];
</script>

<section class="panel" aria-labelledby="ind-title">
  <header class="panel__head">
    <h1 id="ind-title">{app.t.indicators.title}</h1>
    <p>{app.t.indicators.body}</p>
    <button type="button" class="btn btn--ghost export" onclick={exportCsv}>
      {app.t.actions.downloadCsv}
    </button>
  </header>

  <div class="cell table-wrap">
    <table>
      <caption class="sr-only">{app.t.indicators.title}</caption>
      <thead>
        <tr>
          {#each [['label', app.t.indicators.columns.indicator], ['value', app.t.indicators.columns.value], ['group', app.t.indicators.columns.group], ['source', app.t.indicators.columns.source], ['asOf', app.t.indicators.columns.asOf]] as [key, label] (key)}
            <th scope="col" aria-sort={ariaSort(key as Column)}>
              <button type="button" onclick={() => sort(key as Column)}>
                {label}
                <span aria-hidden="true">{sortBy === key ? (ascending ? '↑' : '↓') : '↕'}</span>
              </button>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each sorted as row (row.id)}
          <tr>
            <th scope="row">{row.label}</th>
            <td class="num value-cell">{row.display}</td>
            <td>{groupLabel(row)}</td>
            <td><SourceTag id={row.source} /></td>
            <td class="num asof">{row.asOf ? formatDate(row.asOf, app.lang) : app.t.state.noData}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if app.content}
    <p class="cell cell--quiet note">
      {app.content.human_capital.note_population}
    </p>
    {#if app.content.strategy_2030.verify}
      <p class="cell cell--quiet note">{app.content.strategy_2030.verify_note}</p>
    {/if}
    <p class="cell cell--quiet note">{tr(app.content.regions.items[0])}: {app.content.regions.todo}</p>
  {/if}
</section>

<style>
  .panel {
    display: grid;
    gap: 1px;
    background: var(--rule);
  }
  .panel__head {
    background: var(--paper);
    padding: clamp(1.25rem, 3vw, 2.25rem);
  }
  .panel__head h1 {
    font-size: clamp(1.4rem, 2.6vw, 2rem);
  }
  .panel__head p {
    margin-top: 0.5rem;
    max-width: 44rem;
  }
  .export {
    margin-top: 1.25rem;
  }

  .table-wrap {
    overflow-x: auto;
    padding-inline: 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  th,
  td {
    padding: 0.45rem clamp(0.5rem, 1.5vw, 1rem);
    text-align: start;
    border-bottom: 1px solid var(--rule);
    white-space: nowrap;
  }
  thead th {
    position: sticky;
    top: 0;
    background: var(--paper);
    border-bottom: 1px solid var(--rule-strong);
    padding: 0;
  }
  thead button {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    width: 100%;
    padding: 0.55rem clamp(0.5rem, 1.5vw, 1rem);
    border: 0;
    background: transparent;
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-3);
    cursor: pointer;
  }
  thead button:hover {
    color: var(--ink);
  }
  tbody th {
    font-weight: 400;
    color: var(--ink);
    white-space: normal;
    min-width: 14rem;
  }
  tbody tr:hover {
    background: var(--paper-2);
  }
  .value-cell {
    color: var(--ink);
    text-align: end;
  }
  .asof {
    font-size: 0.75rem;
    color: var(--ink-3);
  }
  .note {
    font-size: 0.75rem;
    color: var(--ink-3);
  }
</style>
