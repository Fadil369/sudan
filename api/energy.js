export default {
  async fetch(request) {
    const data = {
      totalGeneration: 15000,
      totalConsumption: 13500,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
