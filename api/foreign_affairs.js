/**
 * Foreign Affairs Ministry Worker — Sudan Digital Government Portal
 */

export const getData = async (sub, env) => {
  const missions = {
    embassies: 68,
    consulates: 17,
    permanentMissions: 5,
    total: 90,
    topHosts: ['Egypt', 'Saudi Arabia', 'UAE', 'USA', 'UK', 'China', 'Ethiopia', 'Chad'],
  };

  const agreements = {
    bilateral: 312,
    multilateral: 180,
    activeTradeAgreements: 28,
    investmentTreaties: 45,
    recentlySigned: [
      { country: 'Qatar', type: 'Investment', year: 2024 },
      { country: 'Turkey', type: 'Trade', year: 2024 },
      { country: 'Russia', type: 'Military', year: 2024 },
      { country: 'China', type: 'Infrastructure', year: 2023 },
      { country: 'UAE', type: 'Financial', year: 2023 },
    ],
  };

  const passports = {
    passportsIssuedThisYear: 485_000,
    processingTime_days: 14,
    validityYears: 7,
    ePassportEnabled: true,
    biometricEnabled: true,
    cost_SDG: 55_000,
    expedited_SDG: 110_000,
  };

  const visas = {
    issuedThisYear: 280_000,
    eVisaEnabled: true,
    visaOnArrival: ['Egypt', 'Turkey', 'Malaysia'],
    visaFreeAccess: ['Arab League members', 'African Union members'],
    rejectionRate_pct: 8.5,
  };

  const foreignRelations = {
    recognizedBy: 168,
    embassiesInKhartoum: 52,
    activeDiplomatic: 145,
    suspendedRelations: ['Israel'],
    internationalOrgs: ['UN', 'AU', 'Arab League', 'OIC', 'COMESA', 'IGAD'],
  };

  if (sub === 'missions') return missions;
  if (sub === 'agreements') return agreements;
  if (sub === 'passports') return passports;
  if (sub === 'visas') return visas;
  if (sub === 'relations') return foreignRelations;
  return { missions, agreements, passports, visas, foreignRelations };
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
