import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://senmu-notes.vercel.app',
  // ignore：/admin 与 /admin/ 都能打开（发文后台更友好）
  trailingSlash: 'ignore',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
