import type { D1Database, KVNamespace, R2Bucket, EventContext } from '@cloudflare/workers-types';

/**
 * Health check endpoint
 * Tests connectivity to D1, KV, R2, and Durable Objects
 */

interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  DOCUMENTS: R2Bucket;
}

interface HealthChecks {
  d1?: string;
  kv_sessions?: string;
  kv_sessions_error?: string;
  r2_documents?: string;
  r2_documents_error?: string;
}

export async function onRequestGet(context: EventContext<Env, any, any>) {
  const { env } = context;
  const checks: HealthChecks = {};

  // Check D1
  try {
    const result = await env.DB.prepare('SELECT 1 as health').first();
    checks.d1 = result?.health === 1 ? 'healthy' : 'degraded';
  } catch (error) {
    checks.d1 = 'error';
    console.error('[D1 Health Check Error]', error);
  }

  // Check KV (SESSIONS)
  try {
    await env.SESSIONS.put('health_check', Date.now().toString(), { expirationTtl: 60 });
    const value = await env.SESSIONS.get('health_check');
    checks.kv_sessions = value ? 'healthy' : 'degraded';
  } catch (error) {
    checks.kv_sessions = 'error';
    checks.kv_sessions_error = error.message;
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
    checks.r2_documents_error = error.message;
  }

  // Overall status
  const allHealthy = Object.values(checks).every(
    (status) => typeof status === 'string' && status === 'healthy'
  );

  return new Response(
    JSON.stringify(
      {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        checks,
      },
      null,
      2
    ),
    {
      status: allHealthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
