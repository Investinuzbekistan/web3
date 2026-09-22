<script lang="ts">
  /**
   * Ctrl/Cmd+K jump-to: sections, sectors and regions in one list.
   *
   * Implemented as a combobox so a screen reader announces the active option
   * while focus stays in the input.
   */
  import { app, PANELS, setPanel, setRegion, tr, type Panel } from '../lib/state.svelte';

  interface Entry {
    id: string;
    group: 'sections' | 'sectors' | 'regions';
    label: string;
    run: () => void;
  }

  let query = $state('');
  let active = $state(0);
  let input = $state<HTMLInputElement | null>(null);

  const entries = $derived.by<Entry[]>(() => {
    const list: Entry[] = PANELS.map((panel) => ({
      id: `panel:${panel}`,
      group: 'sections',
      label: app.t.nav[panel as Panel],
      run: () => setPanel(panel),
    }));

    for (const sector of app.content?.sectors.items ?? []) {
      list.push({
        id: `sector:${sector.id}`,
        group: 'sectors',
        label: tr(sector),
        run: () => setPanel('sectors'),
      });
    }
    for (const region of app.content?.regions.items ?? []) {
      list.push({
        id: `region:${region.id}`,
        group: 'regions',
        label: tr(region),
        run: () => {
          setPanel('map');
          setRegion(region.id);
        },
      });
    }
    return list;
  });

  const results = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase(app.lang);
    const matched = needle
      ? entries.filter((entry) => entry.label.toLocaleLowerCase(app.lang).includes(needle))
      : entries;
    return matched.slice(0, 40);
  });

  // Clamp the highlight whenever the result list shrinks under it.
  $effect(() => {
    if (active >= results.length) active = 0;
  });

  $effect(() => {
    if (app.paletteOpen) {
      query = '';
      active = 0;
      queueMicrotask(() => input?.focus());
    }
  });

  function choose(entry: Entry | undefined) {
    if (!entry) return;
    entry.run();
    app.paletteOpen = false;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      active = results.length ? (active + 1) % results.length : 0;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      active = results.length ? (active - 1 + results.length) % results.length : 0;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(results[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      app.paletteOpen = false;
    }
  }
</script>

{#if app.paletteOpen}
  <div class="scrim">
    <button
      type="button"
      class="scrim__hit"
      aria-label={app.t.actions.close}
      onclick={() => (app.paletteOpen = false)}
    ></button>

    <div class="palette" role="dialog" aria-modal="true" aria-label={app.t.palette.label}>
      <input
        bind:this={input}
        bind:value={query}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-list"
        aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
        aria-label={app.t.palette.label}
        placeholder={app.t.palette.placeholder}
        onkeydown={onKeydown}
      />

      <ul id="palette-list" role="listbox" aria-label={app.t.palette.label}>
        {#each results as entry, i (entry.id)}
          <li
            id="palette-{entry.id}"
            role="option"
            aria-selected={i === active}
            class:active={i === active}
          >
            <button type="button" onclick={() => choose(entry)} onmouseenter={() => (active = i)}>
              <span class="group">{app.t.palette.groups[entry.group]}</span>
              <span class="label-text">{entry.label}</span>
            </button>
          </li>
        {:else}
          <li class="empty">{app.t.state.empty}</li>
        {/each}
      </ul>
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    align-items: start;
    justify-items: center;
    padding-top: 12vh;
  }
  .scrim__hit {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgb(14 17 22 / 0.35);
    cursor: pointer;
  }
  .palette {
    position: relative;
    width: min(34rem, calc(100vw - 2rem));
    background: var(--paper);
    border: 1px solid var(--rule-strong);
    box-shadow: 0 24px 60px -24px rgb(14 17 22 / 0.4);
  }
  .palette input {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 0;
    border-bottom: 1px solid var(--rule);
    background: transparent;
    font-size: 0.9375rem;
  }
  .palette input:focus-visible {
    outline: none;
    border-bottom-color: var(--accent);
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 50vh;
    overflow-y: auto;
  }
  li button {
    display: grid;
    grid-template-columns: 6rem minmax(0, 1fr);
    gap: 0.75rem;
    width: 100%;
    padding: 0.5rem 1rem;
    border: 0;
    background: transparent;
    text-align: start;
    font-size: 0.875rem;
    cursor: pointer;
  }
  li.active button {
    background: var(--accent-soft);
    color: var(--accent-text);
  }
  .group {
    font-size: 0.6875rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .label-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .empty {
    padding: 1rem;
    font-size: 0.875rem;
    color: var(--ink-3);
  }
</style>
