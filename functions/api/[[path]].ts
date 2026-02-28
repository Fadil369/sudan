/**
 * API proxy to Cloudflare Workers
 * Forwards all /api/* requests to the worker defined in wrangler.toml
 */

const WORKER_URL = context.env.API_WORKER_URL; // Set API_WORKER_URL in Pages environment variables

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
    console.error('[API Proxy Error]', error);

    return new Response(
      JSON.stringify({
        error: 'Service Unavailable',
        message: 'Unable to process request at this time. Please try again later.',
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
