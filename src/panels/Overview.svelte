<script lang="ts">
  /** Bento overview: what the Agency is, the four headline figures, live FX, CTA. */
  import MiniMap from '../components/MiniMap.svelte';
  import SourceTag from '../components/SourceTag.svelte';
  import { app, setPanel, tr } from '../lib/state.svelte';
  import { formatDate, formatNumber, formatValue } from '../lib/shared/content';

  const HERO_KPIS = ['gdp', 'gdp_growth', 'foreign_investment', 'population_eoy'];

  const economy = $derived(app.content?.economy_2025);
  const kpis = $derived(
    HERO_KPIS.map((id) => economy?.kpis.find((k) => k.id === id)).filter((k) => k !== undefined),
  );
  const org = $derived(app.content?.organization);
  const usd = $derived(app.fx?.rates.find((r) => r.ccy === 'USD'));
</script>

<section class="panel" aria-labelledby="overview-title">
  <header class="panel__head">
    <h1 id="overview-title">{app.t.overview.title}</h1>
    {#if app.content}
      <p>{tr(app.content.organization.mission)}</p>
    {/if}
  </header>

  <div class="bento grid">
    <article class="cell cell--about">
      <span class="label">{app.t.overview.about}</span>
      {#if org}
        <h2>{tr(org.tagline)}</h2>
        <p class="about__name">{tr(org.name)}</p>
        <p class="about__legal num">
          {org.founded} · {org.legal_basis.text}
          <SourceTag id={org.source} />
        </p>
      {/if}
    </article>

    {#each kpis as kpi (kpi.id)}
      <article class="cell">
        <span class="value kpi">{kpi.prefix ?? ''}{formatValue(kpi.value, app.lang)}{kpi.suffix ?? ''}</span>
        <span class="kpi__label">
          {tr(kpi.label)}
          <SourceTag id={economy?.source} />
        </span>
      </article>
    {/each}

    <article class="cell cell--quiet cell--fx">
      <span class="label">{app.t.overview.fxTile}</span>
      {#if usd}
        <span class="value kpi">{formatNumber(usd.rate, app.lang, { maximumFractionDigits: 0 })}</span>
        <span class="kpi__label">
          {app.t.calculator.rateLine('USD', '')}
          {#if app.fx?.date}
            · {app.fx.status === 'live' ? app.t.calculator.live : app.t.calculator.stored},
            {app.t.calculator.asOf(formatDate(app.fx.date, app.lang))}
          {/if}
        </span>
        <button type="button" class="chip fx__link" onclick={() => setPanel('calculator')}>
          {app.t.nav.calculator}
        </button>
      {:else}
        <p class="kpi__label">{app.t.calculator.unavailable}</p>
      {/if}
    </article>

    <article class="cell cell--cta">
      <h2>{app.t.overview.cta}</h2>
      <p>{app.t.overview.ctaBody}</p>
      <button type="button" class="btn" onclick={() => setPanel('contact')}>
        {app.t.overview.cta}
      </button>
    </article>

    <article class="cell cell--map">
      <span class="label">{app.t.nav.map}</span>
      <MiniMap />
      <p>{app.t.map.body}</p>
      <button type="button" class="btn btn--ghost" onclick={() => setPanel('map')}>
        {app.t.nav.map}
      </button>
    </article>

    <article class="cell cell--sectors">
      <span class="label">{app.t.nav.sectors}</span>
      <ul>
        {#each app.content?.sectors.items ?? [] as sector (sector.id)}
          <li>{tr(sector)}</li>
        {/each}
      </ul>
      <button type="button" class="btn btn--ghost" onclick={() => setPanel('sectors')}>
        {app.t.nav.sectors}
      </button>
    </article>
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
    max-width: 48rem;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-inline: 0;
    border-bottom: 0;
  }
  @media (min-width: 48rem) {
    .grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  .cell--about {
    grid-column: 1 / -1;
  }
  /* Four columns, five rows, no holes:
       about (2x2) | kpi kpi
                   | kpi kpi
       fx    (2)   | cta (2)
       map   (2x2) | sectors (2x2)                                            */
  @media (min-width: 48rem) {
    .cell--about {
      grid-column: span 2;
      grid-row: span 2;
    }
    .cell--fx,
    .cell--cta,
    .cell--map,
    .cell--sectors {
      grid-column: span 2;
    }
    .cell--map,
    .cell--sectors {
      grid-row: span 2;
    }
  }

  .cell--about h2 {
    margin-top: 0.6rem;
    font-size: clamp(1.2rem, 2.2vw, 1.65rem);
  }
  .about__name {
    margin-top: 0.75rem;
    font-size: 0.8125rem;
    color: var(--ink-3);
  }
  .about__legal {
    margin-top: 0.75rem;
    font-size: 0.6875rem;
    color: var(--ink-3);
  }

  .kpi {
    display: block;
    font-size: clamp(1.5rem, 3.2vw, 2.25rem);
    line-height: 1.05;
  }
  .kpi__label {
    display: block;
    margin-top: 0.4rem;
    font-size: 0.8125rem;
    color: var(--ink-3);
  }
  .fx__link {
    margin-top: 0.75rem;
  }

  .cell--cta h2,
  .cell--map .label {
    font-size: 1rem;
  }
  .cell--cta p,
  .cell--map p {
    margin: 0.5rem 0 1rem;
    font-size: 0.875rem;
  }

  .cell--sectors ul {
    margin: 0.75rem 0 1rem;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 1px;
    font-size: 0.875rem;
  }
  .cell--sectors li {
    padding: 0.3rem 0;
    border-bottom: 1px solid var(--rule);
  }
</style>
