/**
 * Justice Ministry Worker — Sudan Digital Government Portal
 */

export const getData = async (sub, env) => {
  const courts = {
    supreme: 1,
    appellate: 18,
    general: 180,
    criminal: 95,
    civil: 85,
    family: 60,
    total: 439,
  };

  const caseStats = {
    totalCases: 245_000,
    newCasesThisYear: 38_500,
    resolvedCases: 210_000,
    pendingCases: 35_000,
    resolutionRate_pct: 85.7,
    avgResolutionDays: 120,
    byType: {
      civil: { total: 85_000, resolved: 72_000 },
      criminal: { total: 95_000, resolved: 82_000 },
      family: { total: 45_000, resolved: 39_000 },
      commercial: { total: 20_000, resolved: 17_000 },
    },
  };

  const prisons = {
    facilities: 68,
    totalCapacity: 35_000,
    currentPopulation: 41_200,
    occupancyRate_pct: 117.7,
    rehabilitationPrograms: 24,
  };

  const lawyers = {
    licensed: 12_500,
    activePracticing: 9_800,
    legalAidProviders: 450,
  };

  const legalAid = {
    beneficiaries2024: 28_000,
    centersNationwide: 68,
    coverage: 'All 18 states',
  };

  if (sub === 'courts') return courts;
  if (sub === 'cases') return caseStats;
  if (sub === 'prisons') return prisons;
  if (sub === 'lawyers') return lawyers;
  if (sub === 'legal-aid') return legalAid;
  return { courts, caseStats, prisons, lawyers, legalAid };
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const sub = url.pathname.split('/').filter(Boolean).pop();
    const data = await getData(sub, env);
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
