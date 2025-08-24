export default {
  async fetch(request) {
    const data = {
      roadNetwork: 12000,
      bridges: 500,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
