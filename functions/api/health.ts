/**
 * Health check endpoint
 * Tests connectivity to D1, KV, R2, and Durable Objects
 */

export async function onRequestGet(context) {
  const { env } = context;
  const checks = {};
  const isProd = env.ENVIRONMENT === 'production';

  // Check D1
  try {
    const result = await env.DB.prepare('SELECT 1 as health').first();
    checks.d1 = result?.health === 1 ? 'healthy' : 'degraded';
  } catch (error) {
    checks.d1 = 'error';
    if (!isProd) checks.d1_error = error.message;
  }

  // Check KV (SESSIONS)
  try {
    await env.SESSIONS.put('health_check', Date.now().toString(), { expirationTtl: 60 });
    const value = await env.SESSIONS.get('health_check');
    checks.kv_sessions = value ? 'healthy' : 'degraded';
  } catch (error) {
    checks.kv_sessions = 'error';
    if (!isProd) checks.kv_sessions_error = error.message;
  }

  // Check R2 (DOCUMENTS)
  try {
    await env.DOCUMENTS.put('health_check.txt', 'OK', {
      httpMetadata: { contentType: 'text/plain' },
    });
    const object = await env.DOCUMENTS.get('health_check.txt');
    checks.r2_documents = object ? 'healthy' : 'degraded';
    await env.DOCUMENTS.delete('health_check.txt');
  } catch (error) {
    checks.r2_documents = 'error';
    if (!isProd) checks.r2_documents_error = error.message;
  }

  // Overall status
  const allHealthy = Object.entries(checks).every(
    ([key, status]) => !key.endsWith('_error') && status === 'healthy'
  );

  const responseBody = {
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
  };

  // Only include detailed checks in non-production
  if (!isProd) {
    responseBody.checks = checks;
  }

  return new Response(
    JSON.stringify(responseBody, null, 2),
    {
      status: allHealthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
