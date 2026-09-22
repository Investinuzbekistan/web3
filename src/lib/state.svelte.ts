/**
 * Application state for site 3, as Svelte 5 runes.
 *
 * This site behaves like a small app rather than a scrolling page: the visible
 * panel, the selected region and the language all live in the URL hash, so any
 * view can be linked to and the back button works.
 */
import { loadContent } from './shared/content';
import { isLang, type Content, type Lang } from './shared/content-types';
import { applyDocumentSeo } from './shared/seo';
import { loadFx, type FxResult } from './shared/fx';
import { UI, type UiStrings } from './ui';

export const PANELS = [
  'overview',
  'map',
  'sectors',
  'configurator',
  'calculator',
  'indicators',
  'contact',
] as const;
export type Panel = (typeof PANELS)[number];

const isPanel = (value: string): value is Panel => (PANELS as readonly string[]).includes(value);

const LANG_KEY = 'iu-lang';

interface GeoFeature {
  type: 'Feature';
  id: string;
  properties: { id: string };
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] };
}
export interface GeoCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

/* ---------------------------------------------------------------- URL state */

interface HashState {
  panel: Panel;
  region: string | null;
  lang: Lang | null;
}

function readHash(): HashState {
  // "#map?region=samarkand&lang=en"
  const raw = window.location.hash.replace(/^#/, '');
  const [panelPart, queryPart] = raw.split('?');
  const params = new URLSearchParams(queryPart ?? '');
  const searchLang = new URLSearchParams(window.location.search).get('lang');
  const hashLang = params.get('lang');
  return {
    panel: panelPart && isPanel(panelPart) ? panelPart : 'overview',
    region: params.get('region'),
    lang: isLang(hashLang) ? hashLang : isLang(searchLang) ? searchLang : null,
  };
}

function storedLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY);
  return isLang(saved) ? saved : 'uz';
}

const initial = readHash();

/* -------------------------------------------------------------------- state */

class AppState {
  content = $state<Content | null>(null);
  geo = $state<GeoCollection | null>(null);
  fx = $state<FxResult | null>(null);
  error = $state<string | null>(null);

  panel = $state<Panel>(initial.panel);
  region = $state<string | null>(initial.region);
  lang = $state<Lang>(initial.lang ?? storedLang());

  paletteOpen = $state(false);
  shortcutsOpen = $state(false);

  get t(): UiStrings {
    return UI[this.lang];
  }

  get ready(): boolean {
    return this.content !== null;
  }

  /** The currently selected region record, if any. */
  get selectedRegion() {
    if (!this.content || !this.region) return null;
    return this.content.regions.items.find((r) => r.id === this.region) ?? null;
  }
}

export const app = new AppState();

/* ------------------------------------------------------------------ actions */

let loaded = false;

export async function boot(): Promise<void> {
  if (loaded) return;
  loaded = true;
  app.error = null;
  try {
    const content = await loadContent();
    app.content = content;
    // The map is one panel out of seven; its outlines load alongside but a
    // failure there must not take down the rest of the app.
    fetch('geo/uz-adm1.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((geo: GeoCollection) => {
        app.geo = geo;
      })
      .catch(() => {
        app.geo = null;
      });
    loadFx(content).then((result) => {
      app.fx = result;
    });
  } catch (cause) {
    loaded = false;
    app.error = cause instanceof Error ? cause.message : String(cause);
  }
}

export function setPanel(panel: Panel): void {
  app.panel = panel;
  if (panel !== 'map') app.region = null;
  writeHash();
}

export function setRegion(id: string | null): void {
  app.region = id;
  writeHash();
}

export function setLang(lang: Lang): void {
  app.lang = lang;
  localStorage.setItem(LANG_KEY, lang);
  applyDocumentSeo({ lang, title: UI[lang].meta.title, description: UI[lang].meta.description });
  writeHash();
}

function writeHash(): void {
  // Local string builder, discarded at the end of the call — nothing reads it
  // reactively, so SvelteURLSearchParams would buy nothing here.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const params = new URLSearchParams();
  if (app.region) params.set('region', app.region);
  params.set('lang', app.lang);
  const hash = `#${app.panel}${params.size ? `?${params}` : ''}`;
  if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
}

/** Keeps the app in step with the back/forward buttons. */
export function syncFromHash(): void {
  const next = readHash();
  app.panel = next.panel;
  app.region = next.region;
  if (next.lang && next.lang !== app.lang) setLang(next.lang);
}

/** Read a {uz, ru, en} triple with the active language. */
export function tr(text: { uz: string; ru: string; en: string } | undefined): string {
  if (!text) return '';
  return text[app.lang] || text.en || text.uz;
}

/** Read a `prefix_uz` / `prefix_ru` / `prefix_en` family with the active language. */
export function trSuffixed<T>(row: Record<string, unknown>, prefix: string): T {
  return (row[`${prefix}_${app.lang}`] ?? row[`${prefix}_en`] ?? row[`${prefix}_uz`]) as T;
}
