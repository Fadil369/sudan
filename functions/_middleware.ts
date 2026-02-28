/**
 * Global middleware for Cloudflare Pages Functions
 * Handles CORS, auth, logging, and error handling
 */

// CORS configuration
const ALLOWED_ORIGINS = [
  '',
  '',
  ''
];

const CORS_HEADERS = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OID-Token',
  'Access-Control-Max-Age': '86400',
});

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

export async function onRequest(context) {
  const { request, next, env } = context;

  // Handle OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }

  // Log request
  console.log(`[${request.method}] ${new URL(request.url).pathname}`);

  try {
    // Continue to next handler
    const response = await next();

    // Add security headers to all responses
    const headers = new Headers(response.headers);
    Object.entries({ ...CORS_HEADERS, ...SECURITY_HEADERS }).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('[Middleware Error]', error);

    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}
