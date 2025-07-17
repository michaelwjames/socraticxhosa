// This is a minimal entry point for Cloudflare Pages
// It's intentionally left empty as we're serving static files
export default {
  async fetch(request, env, ctx) {
    // This will be handled by Cloudflare Pages' static assets handler
    return env.ASSETS.fetch(request);
  },
};
