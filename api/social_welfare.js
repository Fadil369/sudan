export default {
  async fetch(request) {
    const data = {
      beneficiaries: 5000000,
      programs: 50,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
