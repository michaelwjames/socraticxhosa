import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

// Handle requests for static files
addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event, {
      mapRequestToAsset: req => {
        // Handle SPA routing by serving index.html for all non-asset requests
        const url = new URL(req.url)
        if (!url.pathname.includes('.')) {
          return new Request(`${url.origin}/index.html`, req)
        }
        return req
      }
    })
  } catch (e) {
    // If an error occurs, try to serve index.html for SPA routing
    try {
      return await getAssetFromKV(event, {
        mapRequestToAsset: () => new Request(`${new URL(event.request.url).origin}/index.html`, event.request)
      })
    } catch (e) {
      return new Response('Page not found', { status: 404 })
    }
  }
}
