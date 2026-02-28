/**
 * API proxy to Cloudflare Workers
 * Forwards all /api/* requests to the worker defined in wrangler.toml
 */

const WORKER_URL = 'https://sudan-gov-api.workers.dev'; // Update after worker deployment

export async function onRequest(context) {
  const { request, params, env } = context;

  // Extract the path after /api/
  const path = params.path ? params.path.join('/') : '';
  const url = new URL(request.url);

  // Build worker URL
  const workerUrl = new URL(`/api/${path}${url.search}`, WORKER_URL);

  // Forward request to worker
  const workerRequest = new Request(workerUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
  });

  try {
    const response = await fetch(workerRequest);

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
          : `Worker connection failed: ${error.message}`,
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
