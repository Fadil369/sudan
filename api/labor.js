/**
 * Labor Ministry Worker — Sudan Digital Government Portal
 */

export const getData = async (sub, env) => {
  const workforce = {
    total: 15_200_000,
    employed: 12_400_000,
    unemployed: 2_800_000,
    unemploymentRate_pct: 18.4,
    youthUnemployment_pct: 31.2,
    informal_pct: 62.0,
    byGender: { male: 0.68, female: 0.32 },
    bySector: {
      agriculture: 0.45,
      services: 0.32,
      industry: 0.14,
      government: 0.09,
    },
  };

  const jobMarket = {
    newJobsThisYear: 320_000,
    vacanciesPosted: 85_000,
    placementsThisYear: 68_000,
    topSectors: ['agriculture', 'construction', 'healthcare', 'education', 'IT'],
    minimumWage_SDG: 30_000,
    averageWage_SDG: 85_000,
  };

  const training = {
    vocationalCenters: 185,
    enrolledStudents: 42_000,
    certifiedThisYear: 28_000,
    programs: [
      'Construction & Carpentry',
      'IT & Digital Skills',
      'Automotive Mechanics',
      'Electrical Works',
      'Healthcare Assistants',
      'Agri-Business',
    ],
  };

  const migrantWorkers = {
    sudaneseAbroad: 3_800_000,
    remittances_USD: 2_400_000_000,
    foreignWorkersInSudan: 420_000,
    topDestinations: ['Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Libya'],
  };

  if (sub === 'workforce') return workforce;
  if (sub === 'jobs') return jobMarket;
  if (sub === 'training') return training;
  if (sub === 'migrants') return migrantWorkers;
  return { workforce, jobMarket, training, migrantWorkers };
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
