/**
 * Social Welfare Ministry Worker — Sudan Digital Government Portal
 */

export const getData = async (sub, env) => {
  const programs = [
    { id: 'cash_transfer', name: 'Tawakkalna Cash Transfer', beneficiaries: 1_200_000, budgetSDG: 12_000_000_000, status: 'active' },
    { id: 'disabled', name: 'Disability Support Grant', beneficiaries: 280_000, budgetSDG: 2_800_000_000, status: 'active' },
    { id: 'orphan', name: 'Orphan Care Programme', beneficiaries: 185_000, budgetSDG: 1_500_000_000, status: 'active' },
    { id: 'elderly', name: 'Elderly Pension', beneficiaries: 420_000, budgetSDG: 5_040_000_000, status: 'active' },
    { id: 'food', name: 'Food Security Subsidy', beneficiaries: 2_500_000, budgetSDG: 20_000_000_000, status: 'active' },
    { id: 'housing', name: 'Social Housing Initiative', beneficiaries: 95_000, budgetSDG: 8_000_000_000, status: 'active' },
    { id: 'microfinance', name: 'Zakat & Microfinance', beneficiaries: 380_000, budgetSDG: 3_800_000_000, status: 'active' },
  ];

  const overview = {
    totalBeneficiaries: 5_060_000,
    totalPrograms: programs.length,
    totalBudgetSDG: programs.reduce((a, p) => a + p.budgetSDG, 0),
    coverageRate_pct: 11.3,
    womenBeneficiaries_pct: 58.5,
    childrenBeneficiaries_pct: 34.2,
  };

  const socialCenters = {
    total: 420,
    byState: {
      Khartoum: 65, Gezira: 38, 'North Kordofan': 35, 'South Darfur': 42,
      Kassala: 28, Gedaref: 25, 'White Nile': 30, 'River Nile': 22,
    },
  };

  const disabilityStats = {
    totalRegistered: 680_000,
    employed_pct: 12.5,
    inSchool_pct: 28.0,
    monthlyGrant_SDG: 10_000,
    accessiblePublicBuildings_pct: 23.4,
  };

  if (sub === 'programs') return programs;
  if (sub === 'centers') return socialCenters;
  if (sub === 'disability') return disabilityStats;
  return { ...overview, programs, socialCenters };
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
