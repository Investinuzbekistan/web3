<script lang="ts">
  /**
   * Three inputs, then the Agency services and next steps that apply.
   *
   * It deliberately does not compute eligibility or quote incentives: those
   * depend on the zone, the activity and the investment size, and change often.
   * What it does is route the visitor to the right services and say plainly
   * that this is not advice.
   */
  import SourceTag from '../components/SourceTag.svelte';
  import { app, setPanel, tr, trSuffixed } from '../lib/state.svelte';

  const SIZES = ['any', 'under-1m', '1-10m', '10-50m', 'over-50m'] as const;
  const SIZE_LABEL: Record<(typeof SIZES)[number], string> = {
    any: '',
    'under-1m': '< $1M',
    '1-10m': '$1–10M',
    '10-50m': '$10–50M',
    'over-50m': '> $50M',
  };

  let sector = $state('');
  let size = $state<(typeof SIZES)[number]>('any');
  let region = $state('');

  const org = $derived(app.content?.organization);
  const sez = $derived(app.content?.sez_and_incentives);

  /** Which of the five services are most relevant to the answers given. */
  const services = $derived.by(() => {
    const all = org?.services ?? [];
    if (!all.length) return [];
    // Rebuilt from scratch on every run of this $derived; never read outside it.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const ids = new Set(['info', 'analytics', 'meetings']);
    // A named region means site selection is on the table.
    if (region) ids.add('site');
    // Larger commitments are where aftercare matters most.
    if (size === '10-50m' || size === 'over-50m') ids.add('issues');
    if (sector) ids.add('analytics');
    return all.filter((service) => ids.has(service.id));
  });

  const steps = $derived(app.content?.investor_journey ?? []);
  const zoneTypes = $derived(
    sez ? trSuffixed<string[]>(sez as unknown as Record<string, unknown>, 'zone_types') : [],
  );

  const reset = () => {
    sector = '';
    size = 'any';
    region = '';
  };
</script>

<section class="panel" aria-labelledby="config-title">
  <header class="panel__head">
    <h1 id="config-title">{app.t.configurator.title}</h1>
    <p>{app.t.configurator.body}</p>
  </header>

  <div class="bento inputs">
    <label class="cell field">
      <span>{app.t.configurator.q1}</span>
      <select bind:value={sector}>
        <option value="">{app.t.configurator.any}</option>
        {#each app.content?.sectors.items ?? [] as item (item.id)}
          <option value={item.id}>{tr(item)}</option>
        {/each}
      </select>
    </label>

    <label class="cell field">
      <span>{app.t.configurator.q2}</span>
      <select bind:value={size}>
        {#each SIZES as option (option)}
          <option value={option}>{option === 'any' ? app.t.configurator.any : SIZE_LABEL[option]}</option>
        {/each}
      </select>
    </label>

    <label class="cell field">
      <span>{app.t.configurator.q3}</span>
      <select bind:value={region}>
        <option value="">{app.t.configurator.any}</option>
        {#each app.content?.regions.items ?? [] as item (item.id)}
          <option value={item.id}>{tr(item)}</option>
        {/each}
      </select>
    </label>

    <div class="cell cell--quiet actions">
      <button type="button" class="btn btn--ghost" onclick={reset}>{app.t.actions.reset}</button>
      <button type="button" class="btn" onclick={() => setPanel('contact')}>{app.t.actions.send}</button>
    </div>
  </div>

  <div class="bento results" aria-live="polite">
    <article class="cell">
      <h2>{app.t.configurator.resultTitle}</h2>
      <ol class="services">
        {#each services as service (service.id)}
          <li>{tr(service)}</li>
        {/each}
      </ol>
      <p class="attribution">
        <SourceTag id={org?.source} />
      </p>
    </article>

    <article class="cell">
      <h2>{app.t.configurator.stepsTitle}</h2>
      <ol class="steps">
        {#each steps as step (step.step)}
          <li>
            <span class="num">{step.step}</span>
            <span>
              <strong>{tr(step)}</strong>
              <em>{trSuffixed<string>(step as unknown as Record<string, unknown>, 'desc')}</em>
            </span>
          </li>
        {/each}
      </ol>
    </article>

    <article class="cell cell--quiet">
      <h2>{app.t.configurator.sezTitle}</h2>
      <ul class="zones">
        {#each zoneTypes as zone (zone)}
          <li>{zone}</li>
        {/each}
      </ul>
      {#if sez}
        <ul class="points">
          {#each sez.points as point (point.source + point.en.slice(0, 12))}
            <li>{tr(point)} <SourceTag id={point.source} /></li>
          {/each}
        </ul>
        <p class="disclaimer">{tr(sez.disclaimer)}</p>
      {/if}
      <p class="disclaimer disclaimer--strong">{app.t.configurator.disclaimer}</p>
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
    max-width: 44rem;
  }

  .inputs,
  .results {
    border-inline: 0;
    border-bottom: 0;
    grid-template-columns: minmax(0, 1fr);
  }
  @media (min-width: 48rem) {
    .inputs {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  @media (min-width: 64rem) {
    .results {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .actions {
    display: flex;
    align-items: end;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  h2 {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-3);
  }

  .services,
  .steps,
  .points {
    margin: 0.9rem 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.6rem;
    font-size: 0.875rem;
  }
  .services li {
    padding-left: 0.9rem;
    border-left: 2px solid var(--accent);
  }
  .steps li {
    display: grid;
    grid-template-columns: 1.4rem minmax(0, 1fr);
    gap: 0.5rem;
  }
  .steps strong {
    display: block;
    color: var(--ink);
    font-weight: 500;
  }
  .steps em {
    font-style: normal;
    color: var(--ink-3);
    font-size: 0.8125rem;
  }

  .zones {
    margin: 0.9rem 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  .zones li {
    padding: 0.2rem 0.5rem;
    border: 1px solid var(--rule);
    background: var(--paper);
    font-size: 0.75rem;
  }
  .points {
    margin-top: 1rem;
    font-size: 0.8125rem;
  }
  .points li {
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--rule);
  }

  .disclaimer {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: var(--ink-3);
  }
  .disclaimer--strong {
    padding: 0.6rem 0.75rem;
    border-left: 2px solid var(--ink);
    color: var(--ink);
  }
  .attribution {
    margin-top: 1rem;
  }
</style>
