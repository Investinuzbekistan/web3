<script lang="ts">
  /**
   * The application chrome: a collapsible sidebar on desktop, a bottom tab bar
   * on mobile, and the language switch. Section changes go through setPanel so
   * the URL hash stays shareable.
   */
  import { app, PANELS, setLang, setPanel, type Panel } from '../lib/state.svelte';
  import { LANGS, type Lang } from '../lib/shared/content-types';

  let { children } = $props();

  const LOGO = 'brand/logo-mono-dark.svg';

  /** Single-character glyphs instead of an icon package: seven marks do not
   *  justify a dependency, and these scale with the type. */
  const GLYPH: Record<Panel, string> = {
    overview: '◻',
    map: '◈',
    sectors: '▤',
    configurator: '◐',
    calculator: '≡',
    indicators: '↕',
    contact: '✉',
  };
</script>

<div class="shell">
  <aside class="sidebar">
    <a class="brand" href="#overview" onclick={() => setPanel('overview')}>
      <img src={LOGO} alt="Invest in Uzbekistan" width="120" height="67" />
      <span class="brand__name">{app.t.appName}</span>
    </a>

    <nav aria-label={app.t.nav.label}>
      <ul>
        {#each PANELS as panel, i (panel)}
          <li>
            <button
              type="button"
              aria-current={app.panel === panel ? 'page' : undefined}
              onclick={() => setPanel(panel)}
            >
              <span class="glyph" aria-hidden="true">{GLYPH[panel]}</span>
              <span class="nav__label">{app.t.nav[panel]}</span>
              <span class="nav__key num" aria-hidden="true">{i + 1}</span>
            </button>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="sidebar__foot">
      <button type="button" class="chip" onclick={() => (app.paletteOpen = true)}>
        {app.t.actions.search}
        <kbd class="num">{app.t.palette.hint}</kbd>
      </button>
      <div class="langs" role="group" aria-label="Language">
        {#each LANGS as code (code)}
          <button
            type="button"
            aria-pressed={app.lang === code}
            onclick={() => setLang(code as Lang)}
          >
            {code}
          </button>
        {/each}
      </div>
      <button type="button" class="help" onclick={() => (app.shortcutsOpen = true)}>
        {app.t.actions.shortcuts}
      </button>
    </div>
  </aside>

  <main id="main" class="main">
    {@render children?.()}
  </main>

  <nav class="tabbar" aria-label={app.t.nav.label}>
    {#each PANELS as panel (panel)}
      <button
        type="button"
        aria-current={app.panel === panel ? 'page' : undefined}
        onclick={() => setPanel(panel)}
      >
        <span class="glyph" aria-hidden="true">{GLYPH[panel]}</span>
        <span>{app.t.nav[panel]}</span>
      </button>
    {/each}
  </nav>
</div>

<style>
  .shell {
    min-height: 100svh;
    display: grid;
    background: var(--rule);
  }

  @media (min-width: 60rem) {
    .shell {
      grid-template-columns: var(--sidebar) minmax(0, 1fr);
      gap: var(--gap);
    }
  }

  .sidebar {
    display: none;
    flex-direction: column;
    background: var(--paper);
    padding: 1.25rem 0.75rem;
    position: sticky;
    top: 0;
    height: 100svh;
  }
  @media (min-width: 60rem) {
    .sidebar {
      display: flex;
    }
  }

  .brand {
    display: grid;
    gap: 0.35rem;
    padding: 0.5rem;
    text-decoration: none;
    color: inherit;
  }
  .brand img {
    width: 7.5rem;
    height: auto;
  }
  .brand__name {
    font-size: 0.6875rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }

  nav ul {
    list-style: none;
    margin: 1.75rem 0 0;
    padding: 0;
    display: grid;
    gap: 1px;
  }
  nav button {
    display: grid;
    grid-template-columns: 1.25rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.55rem 0.5rem;
    border: 0;
    border-left: 2px solid transparent;
    background: transparent;
    text-align: start;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.12s, border-color 0.12s;
  }
  nav button:hover {
    background: var(--paper-2);
  }
  nav button[aria-current='page'] {
    border-left-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent-text);
    font-weight: 500;
  }
  .glyph {
    text-align: center;
    color: var(--ink-3);
  }
  nav button[aria-current='page'] .glyph {
    color: var(--accent-text);
  }
  .nav__key {
    font-size: 0.6875rem;
    color: var(--ink-3);
  }

  .sidebar__foot {
    margin-top: auto;
    display: grid;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--rule);
  }
  .sidebar__foot .chip {
    justify-content: space-between;
    width: 100%;
  }
  kbd {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--ink-3);
  }
  .langs {
    display: flex;
    gap: 1px;
  }
  .langs button {
    flex: 1;
    padding: 0.4rem 0;
    border: 1px solid var(--rule);
    background: var(--paper);
    font-size: 0.75rem;
    text-transform: uppercase;
    cursor: pointer;
  }
  .langs button[aria-pressed='true'] {
    background: var(--ink);
    color: #fff;
    border-color: var(--ink);
  }
  .help {
    padding: 0.35rem 0;
    border: 0;
    background: transparent;
    color: var(--ink-3);
    font-size: 0.75rem;
    text-align: start;
    cursor: pointer;
  }
  .help:hover {
    color: var(--ink);
  }

  .main {
    background: var(--paper);
    min-width: 0;
    padding-bottom: 5rem;
  }
  @media (min-width: 60rem) {
    .main {
      padding-bottom: 0;
    }
  }

  .tabbar {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 40;
    display: flex;
    overflow-x: auto;
    background: var(--paper);
    border-top: 1px solid var(--rule);
  }
  @media (min-width: 60rem) {
    .tabbar {
      display: none;
    }
  }
  .tabbar button {
    flex: 1 0 4.75rem;
    display: grid;
    justify-items: center;
    gap: 0.15rem;
    padding: 0.55rem 0.35rem;
    border: 0;
    border-top: 2px solid transparent;
    background: transparent;
    font-size: 0.625rem;
    cursor: pointer;
  }
  .tabbar button[aria-current='page'] {
    border-top-color: var(--accent);
    color: var(--accent-text);
  }
</style>
