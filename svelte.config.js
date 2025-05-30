// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  kit: {
    adapter: adapter({
      // generate "index.html" as the SPA fallback
      fallback: 'index.html'
    })
  },
  preprocess: vitePreprocess()
};

export default config;
