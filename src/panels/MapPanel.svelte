<script lang="ts">
  /**
   * Choropleth of the 14 regions, shaded by average monthly salary.
   *
   * Sequential encoding (magnitude), so one hue light-to-dark — not the
   * categorical slots. The legend is a real scale with the national average
   * marked, and the same numbers are in the table below, which is both the
   * accessible alternative and the fallback when the outlines fail to load.
   */
  import SourceTag from '../components/SourceTag.svelte';
  import { app, setRegion, tr } from '../lib/state.svelte';
  import { formatNumber } from '../lib/shared/content';
  import { onDark, projectRegions, shadeFor as shade } from '../lib/map';
  import { VIZ } from '../lib/shared/viz-palette';

  const WIDTH = 900;
  const HEIGHT = 500;

  const regions = $derived(app.content?.regions);
  const salaries = $derived(regions ? regions.items.map((r) => r.avg_salary) : []);
  const min = $derived(salaries.length ? Math.min(...salaries) : 0);
  const max = $derived(salaries.length ? Math.max(...salaries) : 1);

  const ramp = VIZ.light.sequential;
  const shadeFor = (value: number | undefined) => shade(value, min, max);

  const paths = $derived(projectRegions(app.geo, WIDTH, HEIGHT));

  const byId = $derived(new Map(regions?.items.map((r) => [r.id, r]) ?? []));

  const salaryOf = (id: string) => byId.get(id)?.avg_salary;
  const nameOf = (id: string) => {
    const region = byId.get(id);
    return region ? tr(region) : id;
  };

  /** Position of the national average along the legend, 0..1. */
  const averageAt = $derived(
    regions && max > min ? (regions.national_avg_salary - min) / (max - min) : 0,
  );

  const profile = $derived(app.selectedRegion?.profile ?? null);
  const fmt = (value: number | undefined, suffix = '') =>
    value === undefined
      ? app.t.state.noData
      : `${formatNumber(value, app.lang, { maximumFractionDigits: 1 })}${suffix}`;
</script>

<section class="panel" aria-labelledby="map-title">
  <header class="panel__head">
    <h1 id="map-title">{app.t.map.title}</h1>
    <p>{app.t.map.body}</p>
  </header>

  <div class="map__layout">
    <div class="cell map__figure">
      {#if app.geo && paths.length}
        <svg viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-label={app.t.map.title}>
          {#each paths as region (region.id)}
            {@const value = salaryOf(region.id)}
            {@const fill = shadeFor(value)}
            <g
              class="region"
              class:region--active={app.region === region.id}
              role="button"
              tabindex="0"
              aria-pressed={app.region === region.id}
              aria-label="{nameOf(region.id)}: {fmt(value)} {app.t.map.unit}"
              onclick={() => setRegion(app.region === region.id ? null : region.id)}
              onkeydown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setRegion(app.region === region.id ? null : region.id);
                }
              }}
            >
              <path d={region.d} fill={fill} />
              <text
                x={region.centroid[0]}
                y={region.centroid[1]}
                class="region__value num"
                class:region__value--light={onDark(fill)}
                text-anchor="middle"
              >
                {value === undefined ? '' : formatNumber(value, app.lang, { maximumFractionDigits: 0 })}
              </text>
            </g>
          {/each}
        </svg>

        <div class="legend">
          <span class="label">{app.t.map.legend}</span>
          <div class="legend__ramp" aria-hidden="true">
            {#each ramp as step (step)}
              <span style="background: {step}"></span>
            {/each}
            {#if regions}
              <span
                class="legend__avg"
                style="left: {Math.max(0, Math.min(1, averageAt)) * 100}%"
              ></span>
            {/if}
          </div>
          <div class="legend__ends num">
            <span>{formatNumber(min, app.lang, { maximumFractionDigits: 0 })}</span>
            <span>{formatNumber(max, app.lang, { maximumFractionDigits: 0 })}</span>
          </div>
          {#if regions}
            <p class="legend__note">
              {app.t.map.nationalAverage}:
              <span class="num">{formatNumber(regions.national_avg_salary, app.lang, { maximumFractionDigits: 0 })}</span>
              {app.t.map.unit}
              <SourceTag id={regions.source} />
            </p>
          {/if}
        </div>
      {:else}
        <p class="map__fallback">{app.t.state.noMap}</p>
      {/if}
    </div>

    <aside class="cell map__profile" aria-live="polite">
      {#if app.selectedRegion}
        {@const region = app.selectedRegion}
        <h2>{tr(region)}</h2>
        <dl>
          <div>
            <dt>{app.t.map.profile.salary}</dt>
            <dd class="num">{fmt(region.avg_salary)} <small>{app.t.map.unit}</small></dd>
          </div>
          {#if profile}
            <div>
              <dt>{app.t.map.profile.population}</dt>
              <dd class="num">{fmt(profile.population_k)} {app.t.map.units.thousand}</dd>
            </div>
            <div>
              <dt>{app.t.map.profile.births}</dt>
              <dd class="num">{fmt(profile.births_2025_k)} {app.t.map.units.thousand}</dd>
            </div>
            <div>
              <dt>{app.t.map.profile.employed}</dt>
              <dd class="num">{fmt(profile.employed_k)} {app.t.map.units.thousand}</dd>
            </div>
            <div>
              <dt>{app.t.map.profile.workingAge}</dt>
              <dd class="num">{fmt(profile.working_age_k)} {app.t.map.units.thousand}</dd>
            </div>
            <div>
              <dt>{app.t.map.profile.employmentRate}</dt>
              <dd class="num">{fmt(profile.employment_rate, '%')}</dd>
            </div>
            <div>
              <dt>{app.t.map.profile.unemploymentRate}</dt>
              <dd class="num">{fmt(profile.unemployment_rate, '%')}</dd>
            </div>
            <div>
              <dt>{app.t.map.profile.universities}</dt>
              <dd class="num">{fmt(profile.universities)}</dd>
            </div>
            <div>
              <dt>{app.t.map.profile.students}</dt>
              <dd class="num">{fmt(profile.students_k)} {app.t.map.units.thousand}</dd>
            </div>
          {:else}
            <!-- No estimates: the source only publishes a full profile for one
                 region, so the rest stay empty rather than invented. -->
            {#each [app.t.map.profile.population, app.t.map.profile.employed, app.t.map.profile.employmentRate, app.t.map.profile.universities] as field (field)}
              <div>
                <dt>{field}</dt>
                <dd class="num dash">{app.t.state.noData}</dd>
              </div>
            {/each}
          {/if}
        </dl>

        {#if profile?.specializations?.length}
          <h3>{app.t.map.profile.specializations}</h3>
          <ul class="specs">
            {#each profile.specializations as spec (spec)}
              <li>{spec}</li>
            {/each}
          </ul>
        {/if}

        {#if !profile}
          <p class="map__note">{app.t.map.profileMissing}</p>
        {/if}
      {:else}
        <p class="map__hint">{app.t.map.pickHint}</p>
        <ul class="ranked">
          {#each [...(regions?.items ?? [])].sort((a, b) => b.avg_salary - a.avg_salary) as region (region.id)}
            <li>
              <button type="button" onclick={() => setRegion(region.id)}>
                <span class="swatch" style="background: {shadeFor(region.avg_salary)}" aria-hidden="true"
                ></span>
                <span class="ranked__name">{tr(region)}</span>
                <span class="num">{formatNumber(region.avg_salary, app.lang, { maximumFractionDigits: 0 })}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </aside>
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

  .map__layout {
    display: grid;
    gap: 1px;
  }
  @media (min-width: 64rem) {
    .map__layout {
      grid-template-columns: minmax(0, 1fr) 21rem;
    }
  }

  .map__figure svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .region path {
    stroke: #fff;
    stroke-width: 1;
    transition: fill 0.15s;
    cursor: pointer;
  }
  .region:hover path,
  .region:focus-visible path {
    stroke: var(--ink);
    stroke-width: 1.5;
  }
  .region--active path {
    stroke: var(--ink);
    stroke-width: 2;
  }
  .region:focus-visible {
    outline: none;
  }
  .region__value {
    font-size: 11px;
    fill: var(--ink);
    pointer-events: none;
  }
  .region__value--light {
    fill: #fff;
  }

  .legend {
    margin-top: 1.25rem;
    display: grid;
    gap: 0.4rem;
  }
  .legend__ramp {
    position: relative;
    display: flex;
    height: 0.5rem;
  }
  .legend__ramp > span {
    flex: 1;
  }
  .legend__avg {
    position: absolute;
    inset-block: -0.25rem;
    width: 2px;
    background: var(--ink);
    flex: none;
  }
  .legend__ends {
    display: flex;
    justify-content: space-between;
    font-size: 0.6875rem;
    color: var(--ink-3);
  }
  .legend__note {
    font-size: 0.8125rem;
    color: var(--ink-3);
  }

  .map__fallback {
    padding: 2rem 0;
    color: var(--ink-3);
  }

  .map__profile h2 {
    font-size: 1.125rem;
  }
  .map__profile h3 {
    margin-top: 1.25rem;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  dl {
    margin: 1rem 0 0;
    display: grid;
    gap: 1px;
    background: var(--rule);
    border: 1px solid var(--rule);
  }
  dl > div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.7rem;
    background: var(--paper);
  }
  dt {
    font-size: 0.8125rem;
    color: var(--ink-3);
  }
  dd {
    margin: 0;
    color: var(--ink);
    text-align: end;
  }
  dd small {
    color: var(--ink-3);
    font-size: 0.6875rem;
  }
  .dash {
    color: var(--ink-3);
  }

  .specs {
    margin: 0.6rem 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  .specs li {
    padding: 0.2rem 0.5rem;
    border: 1px solid var(--rule);
    font-size: 0.75rem;
  }

  .map__note,
  .map__hint {
    margin-top: 1rem;
    font-size: 0.8125rem;
    color: var(--ink-3);
  }

  .ranked {
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 1px;
  }
  .ranked button {
    display: grid;
    grid-template-columns: 0.6rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.4rem 0.3rem;
    border: 0;
    background: transparent;
    text-align: start;
    font-size: 0.8125rem;
    cursor: pointer;
  }
  .ranked button:hover {
    background: var(--paper-2);
  }
  .swatch {
    width: 0.6rem;
    height: 0.6rem;
  }
  .ranked__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
