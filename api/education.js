export default {
  async fetch(request) {
    const data = {
      schools: 5000,
      students: 10000000,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
