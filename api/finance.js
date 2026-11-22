import { getTreasurySummaryData } from './treasury.js';

export default {
  async fetch(request, env) {
    const staSummary = await getTreasurySummaryData(env);
    const data = {
      gdp: 50000000000,
      inflation: 25.5,
      singleTreasuryAccount: {
        totalRevenueSdg: staSummary.totalRevenueSdg,
        totalDisbursementsSdg: staSummary.totalDisbursementsSdg,
        netBalanceSdg: staSummary.netBalanceSdg,
        latestEntryHash: staSummary.latestEntryHash,
        endpoint: '/api/treasury/summary',
      },
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
