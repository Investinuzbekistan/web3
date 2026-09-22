<script lang="ts">
  import CommandPalette from './components/CommandPalette.svelte';
  import Shell from './components/Shell.svelte';
  import Shortcuts from './components/Shortcuts.svelte';
  import Calculator from './panels/Calculator.svelte';
  import Configurator from './panels/Configurator.svelte';
  import Contact from './panels/Contact.svelte';
  import Indicators from './panels/Indicators.svelte';
  import MapPanel from './panels/MapPanel.svelte';
  import Overview from './panels/Overview.svelte';
  import Sectors from './panels/Sectors.svelte';
  import { app, boot, PANELS, setPanel, syncFromHash } from './lib/state.svelte';

  boot();

  /** Global shortcuts. Typing in a field never triggers them. */
  function onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable === true;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      app.paletteOpen = true;
      return;
    }
    if (typing) return;

    if (event.key === '/') {
      event.preventDefault();
      const search = document.querySelector<HTMLInputElement>('[data-search]');
      if (search) search.focus();
      else app.paletteOpen = true;
    } else if (event.key === '?') {
      event.preventDefault();
      app.shortcutsOpen = true;
    } else if (event.key === 'Escape') {
      app.paletteOpen = false;
      app.shortcutsOpen = false;
    } else if (/^[1-7]$/.test(event.key)) {
      const panel = PANELS[Number(event.key) - 1];
      if (panel) {
        event.preventDefault();
        setPanel(panel);
      }
    }
  }
</script>

<svelte:window onkeydown={onKeydown} onhashchange={syncFromHash} />

<a class="skip-link" href="#main">{app.t.skip}</a>

{#if app.error}
  <div class="state" role="alert">
    <h1>{app.t.state.errorTitle}</h1>
    <p>{app.t.state.errorBody}</p>
    <p class="state__detail num">{app.error}</p>
    <button type="button" class="btn" onclick={boot}>{app.t.actions.retry}</button>
  </div>
{:else if !app.ready}
  <div class="state" aria-busy="true">
    <p>{app.t.state.loading}</p>
  </div>
{:else}
  <Shell>
    {#if app.panel === 'overview'}
      <Overview />
    {:else if app.panel === 'map'}
      <MapPanel />
    {:else if app.panel === 'sectors'}
      <Sectors />
    {:else if app.panel === 'configurator'}
      <Configurator />
    {:else if app.panel === 'calculator'}
      <Calculator />
    {:else if app.panel === 'indicators'}
      <Indicators />
    {:else}
      <Contact />
    {/if}
  </Shell>

  <CommandPalette />
  <Shortcuts />
{/if}

<style>
  .state {
    min-height: 100svh;
    display: grid;
    align-content: center;
    justify-items: start;
    gap: 0.6rem;
    padding: 2rem;
    background: var(--paper);
  }
  .state h1 {
    font-size: 1.5rem;
  }
  .state__detail {
    font-size: 0.75rem;
    color: var(--ink-3);
    overflow-wrap: anywhere;
  }
</style>
