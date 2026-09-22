<script lang="ts">
  import { app } from '../lib/state.svelte';

  const ROWS = $derived([
    ['Ctrl K', app.t.shortcuts.palette],
    ['/', app.t.shortcuts.search],
    ['1 – 7', app.t.shortcuts.panels],
    ['?', app.t.shortcuts.help],
    ['Esc', app.t.shortcuts.escape],
  ]);
</script>

{#if app.shortcutsOpen}
  <div class="scrim">
    <button
      type="button"
      class="scrim__hit"
      aria-label={app.t.actions.close}
      onclick={() => (app.shortcutsOpen = false)}
    ></button>
    <div class="sheet" role="dialog" aria-modal="true" aria-label={app.t.shortcuts.title}>
      <h2>{app.t.shortcuts.title}</h2>
      <dl>
        {#each ROWS as [key, label] (key)}
          <div>
            <dt><kbd class="num">{key}</kbd></dt>
            <dd>{label}</dd>
          </div>
        {/each}
      </dl>
      <button type="button" class="btn btn--ghost" onclick={() => (app.shortcutsOpen = false)}>
        {app.t.actions.close}
      </button>
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 85;
    display: grid;
    place-items: center;
    padding: 1rem;
  }
  .scrim__hit {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgb(14 17 22 / 0.35);
    cursor: pointer;
  }
  .sheet {
    position: relative;
    width: min(22rem, 100%);
    padding: 1.5rem;
    background: var(--paper);
    border: 1px solid var(--rule-strong);
  }
  h2 {
    font-size: 1rem;
  }
  dl {
    margin: 1.25rem 0;
    display: grid;
    gap: 0.5rem;
  }
  dl > div {
    display: grid;
    grid-template-columns: 5rem minmax(0, 1fr);
    gap: 0.75rem;
    align-items: baseline;
  }
  dt,
  dd {
    margin: 0;
  }
  kbd {
    display: inline-block;
    padding: 0.1rem 0.4rem;
    border: 1px solid var(--rule);
    border-bottom-width: 2px;
    border-radius: 3px;
    font-size: 0.75rem;
    color: var(--ink);
  }
  dd {
    font-size: 0.875rem;
  }
</style>
