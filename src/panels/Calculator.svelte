<script lang="ts">
  /**
   * USD/EUR/RUB/CNY -> UZS at the Central Bank rate.
   *
   * The rate's provenance is part of the result, not a footnote: whether it is
   * live or the stored fallback, and the date it was published, sit next to the
   * converted figure.
   */
  import { app } from '../lib/state.svelte';
  import { formatDate, formatNumber } from '../lib/shared/content';
  import { toUzs } from '../lib/shared/fx';

  let amount = $state(1000);
  let currency = $state('USD');

  const rates = $derived(app.fx?.rates ?? []);
  const converted = $derived(toUzs(amount, currency, rates));
  const rate = $derived(rates.find((r) => r.ccy === currency));
  const dateLabel = $derived(app.fx?.date ? formatDate(app.fx.date, app.lang) : '');
</script>

<section class="panel" aria-labelledby="calc-title">
  <header class="panel__head">
    <h1 id="calc-title">{app.t.calculator.title}</h1>
    <p>{app.t.calculator.body}</p>
  </header>

  <div class="bento calc">
    <div class="cell">
      <label class="field">
        <span>{app.t.calculator.amount}</span>
        <input class="num" type="number" min="0" step="1" bind:value={amount} />
      </label>

      <fieldset class="currencies">
        <legend class="label">{app.t.calculator.from}</legend>
        {#each app.content?.live_data.fx.currencies ?? [] as ccy (ccy)}
          <button type="button" class="chip" aria-pressed={currency === ccy} onclick={() => (currency = ccy)}>
            {ccy}
          </button>
        {/each}
      </fieldset>
    </div>

    <div class="cell cell--quiet result" aria-live="polite">
      <span class="label">{app.t.calculator.result}</span>
      {#if converted === null}
        <p class="value big">{app.t.calculator.unavailable}</p>
      {:else}
        <p class="value big">{formatNumber(converted, app.lang, { maximumFractionDigits: 0 })}</p>
        <p class="rate num">
          {app.t.calculator.rateLine(
            currency,
            formatNumber(rate?.rate ?? 0, app.lang, { maximumFractionDigits: 2 }),
          )}
        </p>
        <p class="provenance">
          <span class="dot" class:dot--live={app.fx?.status === 'live'} aria-hidden="true"></span>
          {app.fx?.status === 'live' ? app.t.calculator.live : app.t.calculator.stored}
          {#if dateLabel}· {app.t.calculator.asOf(dateLabel)}{/if}
        </p>
      {/if}
    </div>

    <div class="cell rates">
      <span class="label">cbu.uz</span>
      <table>
        <tbody>
          {#each rates as row (row.ccy)}
            <tr>
              <th scope="row">{row.ccy}</th>
              <td class="num">{formatNumber(row.rate, app.lang, { maximumFractionDigits: 2 })}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
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

  .calc {
    grid-template-columns: minmax(0, 1fr);
    border-inline: 0;
    border-bottom: 0;
  }
  @media (min-width: 52rem) {
    .calc {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) 12rem;
    }
  }

  .currencies {
    margin: 1.25rem 0 0;
    padding: 0;
    border: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .currencies legend {
    margin-bottom: 0.5rem;
  }

  .big {
    font-size: clamp(1.8rem, 5vw, 3rem);
    line-height: 1.05;
    margin-top: 0.5rem;
  }
  .rate {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--ink-3);
  }
  .provenance {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: var(--ink-3);
  }
  .dot {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 999px;
    background: var(--ink-3);
  }
  .dot--live {
    background: var(--accent);
  }

  .rates table {
    width: 100%;
    margin-top: 0.75rem;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .rates th {
    text-align: start;
    font-weight: 500;
    color: var(--ink-3);
  }
  .rates td {
    text-align: end;
    color: var(--ink);
  }
  .rates tr {
    border-bottom: 1px solid var(--rule);
  }
  .rates tr:last-child {
    border-bottom: 0;
  }
  .rates th,
  .rates td {
    padding: 0.3rem 0;
  }
</style>
