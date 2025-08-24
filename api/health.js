export default {
  async fetch(request) {
    const data = {
      hospitals: 120,
      beds: 25000,
      doctors: 8000,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
