export default {
  async fetch(request) {
    const data = {
      workforce: 15000000,
      unemploymentRate: 18.5,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
