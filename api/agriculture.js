export default {
  async fetch(request) {
    const data = {
      totalFarmers: 2800000,
      registeredLand: 18500000,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
