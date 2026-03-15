import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.friseur-hollenstedt.de',
  integrations: [tailwind(), sitemap({ i18n: { defaultLocale: 'de', locales: { de: 'de-DE' } } })],
  adapter: vercel(),
  output: 'static',
});
