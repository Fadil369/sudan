/**
 * Global middleware for Cloudflare Pages Functions
 * Handles CORS, auth, logging, and error handling
 */

// CORS configuration - PRODUCTION READY
const ALLOWED_ORIGINS = [
  'https://sudan.elfadil.com',
  'https://portal.sudan.elfadil.com',
  'https://sudan-gov.pages.dev',
];

function getCorsHeaders(origin) {
  const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
                    (origin && origin.endsWith('.sudan.elfadil.com')) ||
                    (origin && origin.endsWith('.sudan-gov.pages.dev')); // Pages preview + production domains
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OID-Token',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://*.sudan.elfadil.com wss://*.sudan.elfadil.com https://*.workers.dev; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

export async function onRequest(context) {
  const { request, next, env } = context;
  const origin = request.headers.get('Origin');
  const pathname = new URL(request.url).pathname;
  const isApiRequest = pathname.startsWith('/api/');

  // Handle OPTIONS (preflight)
  if (request.method === 'OPTIONS' && isApiRequest) {
    return new Response(null, {
      headers: getCorsHeaders(origin),
    });
  }

  // Log request (production: use structured logging)
  const isProd = env.ENVIRONMENT === 'production';
  if (!isProd) {
    console.log(`[${request.method}] ${new URL(request.url).pathname}`);
  }

  try {
    // Continue to next handler
    const response = await next();

    // SPA routing: if a non-API, non-asset path returns 404, serve index.html.
    // This replaces the "/* /index.html 200" _redirects rule which Wrangler v3
    // incorrectly flags as an infinite loop and silently discards.
    if (
      response.status === 404 &&
      !isApiRequest &&
      !pathname.includes('.')  // skip file-extension paths (real 404s)
    ) {
      const indexReq = new Request(new URL('/index.html', request.url).toString());
      const indexRes = await (context as any).env.ASSETS.fetch(indexReq);
      const spaHeaders = new Headers(indexRes.headers);
      Object.entries(SECURITY_HEADERS).forEach(([k, v]) => spaHeaders.set(k, v));
      return new Response(indexRes.body, { status: 200, headers: spaHeaders });
    }

    // Add security headers to all responses
    const headers = new Headers(response.headers);
    
    // CORS is only needed for API endpoints. Avoid attaching CORS to static assets.
    if (isApiRequest) {
      Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
    
    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('[Middleware Error]', isProd ? error.message : error);

    // Production: Don't leak internal details
    const errorMessage = isProd 
      ? 'An error occurred processing your request' 
      : error.message;

    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...(isApiRequest ? getCorsHeaders(origin) : {}),
        },
      }
    );
  }
}
