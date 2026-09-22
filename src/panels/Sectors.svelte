<script lang="ts">
  import SourceTag from '../components/SourceTag.svelte';
  import { app, tr } from '../lib/state.svelte';

  let query = $state('');
  let view = $state<'grid' | 'list'>('grid');
  let searchEl = $state<HTMLInputElement | null>(null);

  const items = $derived(app.content?.sectors.items ?? []);
  const results = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase(app.lang);
    if (!needle) return items;
    return items.filter((sector) =>
      [sector.uz, sector.ru, sector.en].some((label) =>
        label.toLocaleLowerCase(app.lang).includes(needle),
      ),
    );
  });

  /** The "/" shortcut focuses this field. */
  export function focusSearch() {
    searchEl?.focus();
  }
</script>

<section class="panel" aria-labelledby="sectors-title">
  <header class="panel__head">
    <h1 id="sectors-title">{app.t.sectors.title}</h1>
    <p>{app.t.sectors.body} <SourceTag id={app.content?.sectors.source} /></p>

    <div class="toolbar">
      <label class="search">
        <span class="sr-only">{app.t.sectors.searchLabel}</span>
        <input
          bind:this={searchEl}
          bind:value={query}
          type="search"
          placeholder={app.t.sectors.searchLabel}
          data-search
        />
      </label>
      <p class="count num" aria-live="polite">{app.t.sectors.count(results.length, items.length)}</p>
      <div class="views" role="group">
        <button type="button" class="chip" aria-pressed={view === 'grid'} onclick={() => (view = 'grid')}>
          {app.t.actions.grid}
        </button>
        <button type="button" class="chip" aria-pressed={view === 'list'} onclick={() => (view = 'list')}>
          {app.t.actions.list}
        </button>
      </div>
    </div>
  </header>

  {#if results.length === 0}
    <p class="cell empty">{app.t.state.empty}</p>
  {:else if view === 'grid'}
    <ul class="bento cards">
      {#each results as sector, i (sector.id)}
        <li class="cell card">
          <span class="card__n num">{String(i + 1).padStart(2, '0')}</span>
          <h2>{tr(sector)}</h2>
          <a href={sector.url} target="_blank" rel="noopener noreferrer">{app.t.actions.openOfficial} ↗</a>
        </li>
      {/each}
    </ul>
  {:else}
    <ul class="rows cell">
      {#each results as sector, i (sector.id)}
        <li>
          <span class="num">{String(i + 1).padStart(2, '0')}</span>
          <span>{tr(sector)}</span>
          <a href={sector.url} target="_blank" rel="noopener noreferrer">{app.t.actions.openOfficial} ↗</a>
        </li>
      {/each}
    </ul>
  {/if}

  <p class="cell cell--quiet note">{app.content?.sectors.note ?? ''}</p>
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
  .panel__head > p {
    margin-top: 0.5rem;
    max-width: 44rem;
  }

  .toolbar {
    margin-top: 1.25rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }
  .search input {
    width: min(20rem, 60vw);
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--rule);
    border-radius: 2px;
  }
  .search input:focus-visible {
    border-color: var(--accent);
  }
  .count {
    font-size: 0.8125rem;
    color: var(--ink-3);
  }
  .views {
    margin-left: auto;
    display: flex;
    gap: 0.35rem;
  }

  .cards {
    margin: 0;
    padding: 0;
    list-style: none;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    border-inline: 0;
    border-bottom: 0;
  }
  .card {
    display: grid;
    align-content: start;
    gap: 0.5rem;
  }
  .card__n {
    font-size: 0.6875rem;
    color: var(--ink-3);
  }
  .card h2 {
    font-size: 1rem;
  }
  .card a,
  .rows a {
    font-size: 0.8125rem;
    text-decoration: none;
  }
  .card a:hover,
  .rows a:hover {
    text-decoration: underline;
  }

  .rows {
    margin: 0;
    list-style: none;
    display: grid;
    gap: 1px;
  }
  .rows li {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 1rem;
    padding: 0.55rem 0;
    border-bottom: 1px solid var(--rule);
    font-size: 0.9375rem;
  }
  .rows li:last-child {
    border-bottom: 0;
  }
  .rows span:first-child {
    font-size: 0.6875rem;
    color: var(--ink-3);
  }

  .empty,
  .note {
    font-size: 0.8125rem;
    color: var(--ink-3);
  }
</style>
