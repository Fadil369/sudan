export default {
  async fetch(request) {
    const data = {
      missionsAbroad: 85,
      bilateralAgreements: 250,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
