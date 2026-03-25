/**
 * API proxy to Cloudflare Workers
 * Forwards all /api/* requests to the worker defined in wrangler.toml
 */

export async function onRequest(context) {
  const { request, params, env } = context;

  const upstreamBaseUrl = env.API_BASE_URL || env.WORKER_URL || 'https://sudan-gov-api.brainsait-fadil.workers.dev';

  // Extract the path after /api/
  const path = params.path ? params.path.join('/') : '';
  const url = new URL(request.url);

  const base = upstreamBaseUrl.replace(/\/$/, '');
  const upstreamHasApiPrefix = /\/api$/.test(base);
  const targetPath = path ? `${upstreamHasApiPrefix ? '' : '/api'}/${path}` : `${upstreamHasApiPrefix ? '' : '/api'}`;
  const targetUrl = new URL(`${targetPath}${url.search}`, `${base}/`);

  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
  });

  try {
    const response = await fetch(proxyRequest);

    // Return worker response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    const isProd = env.ENVIRONMENT === 'production';
    console.error('[API Proxy Error]', isProd ? error.message : error);

    // Production: Generic error message
    return new Response(
      JSON.stringify({
        error: 'Service Unavailable',
        message: isProd 
          ? 'The service is temporarily unavailable. Please try again later.' 
          : `API proxy connection failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
