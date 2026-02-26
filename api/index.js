export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1).split('/');

    if (path[0] === 'api') {
      const service = path[1];
      const serviceWorker = env[service.toUpperCase()];

      if (serviceWorker) {
        return await serviceWorker.fetch(request);
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
