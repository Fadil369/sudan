export default {
  async fetch(request) {
    const data = {
      totalCases: 12500,
      resolvedCases: 9800,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
