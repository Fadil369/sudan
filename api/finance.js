export default {
  async fetch(request) {
    const data = {
      gdp: 50000000000,
      inflation: 25.5,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
