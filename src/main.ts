import { mount } from 'svelte';

import App from './App.svelte';
import { app, setLang } from './lib/state.svelte';
import './styles/app.css';

const target = document.getElementById('app');
if (!target) throw new Error('#app is missing from index.html');

// Title, description, canonical and hreflang follow the language chosen from the
// URL hash or localStorage.
setLang(app.lang);

mount(App, { target });
