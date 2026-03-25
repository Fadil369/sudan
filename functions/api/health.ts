/**
 * Health check endpoint
 * Tests connectivity to all D1, KV, R2 bindings and the API Worker.
 */

async function checkD1(binding: any, label: string, checks: Record<string, string>) {
  try {
    const result = await binding.prepare('SELECT 1 as health').first();
    checks[label] = result?.health === 1 ? 'healthy' : 'degraded';
  } catch (e: any) {
    checks[label] = 'error';
    checks[`${label}_error`] = e.message;
  }
}

async function checkKV(binding: any, label: string, checks: Record<string, string>) {
  try {
    const probe = `_health_${Date.now()}`;
    await binding.put(probe, '1', { expirationTtl: 60 });
    const val = await binding.get(probe);
    checks[label] = val === '1' ? 'healthy' : 'degraded';
  } catch (e: any) {
    checks[label] = 'error';
    checks[`${label}_error`] = e.message;
  }
}

async function checkR2(binding: any, label: string, checks: Record<string, string>) {
  try {
    const key = `_health/${Date.now()}.txt`;
    await binding.put(key, 'OK', { httpMetadata: { contentType: 'text/plain' } });
    const obj = await binding.get(key);
    checks[label] = obj ? 'healthy' : 'degraded';
    await binding.delete(key);
  } catch (e: any) {
    checks[label] = 'error';
    checks[`${label}_error`] = e.message;
  }
}

export async function onRequestGet(context) {
  const { env } = context;
  const checks: Record<string, string> = {};
  const isProd = env.ENVIRONMENT === 'production';

  // D1 databases
  await checkD1(env.DB, 'd1_main', checks);
  await checkD1(env.ANALYTICS_DB, 'd1_analytics', checks);

  // KV namespaces
  await checkKV(env.SESSIONS, 'kv_sessions', checks);
  await checkKV(env.CACHE, 'kv_cache', checks);
  await checkKV(env.OID_REGISTRY, 'kv_oid_registry', checks);
  await checkKV(env.CITIZEN_PROFILES, 'kv_citizen_profiles', checks);

  // R2 buckets
  await checkR2(env.DOCUMENTS, 'r2_documents', checks);
  await checkR2(env.MEDIA, 'r2_media', checks);
  await checkR2(env.AUDIT_LOGS, 'r2_audit_logs', checks);

  // API Worker health (includes DO status from workers.toml health route)
  if (env.WORKER_URL) {
    try {
      const res = await fetch(`${env.WORKER_URL}/api/health`, {
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': 'pages-health-check' },
      });
      if (res.ok) {
        const body: any = await res.json();
        checks.worker = (body.status === 'healthy' || body.status === 'ok') ? 'healthy' : 'degraded';
        // Surface DO status from Worker's own health payload if present
        if (body.bindings?.do_session !== undefined) checks.do_session = body.bindings.do_session ? 'healthy' : 'degraded';
        if (body.bindings?.do_ratelimit !== undefined) checks.do_ratelimit = body.bindings.do_ratelimit ? 'healthy' : 'degraded';
      } else {
        checks.worker = 'degraded';
      }
    } catch (e: any) {
      checks.worker = 'error';
      checks.worker_error = e.message;
    }
  }

  // Overall status: healthy only when no binding has error/degraded
  const statusKeys = Object.keys(checks).filter((k) => !k.endsWith('_error'));
  const allHealthy = statusKeys.length > 0 && statusKeys.every((k) => checks[k] === 'healthy');

  const responseBody: Record<string, any> = {
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
  };

  if (!isProd) {
    // Strip internal error detail keys from production response
    responseBody.checks = checks;
  } else {
    // In production expose only pass/fail per check, no error messages
    responseBody.checks = Object.fromEntries(
      statusKeys.map((k) => [k, checks[k]])
    );
  }

  return new Response(JSON.stringify(responseBody, null, 2), {
    status: allHealthy ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
