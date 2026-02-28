/**
 * Health Ministry Worker — Sudan Digital Government Portal
 * Cloudflare Worker: handles /api/health routes
 *
 * Sub-routes:
 *   /api/health                → full overview
 *   /api/health/facilities     → hospitals, clinics, PHC units
 *   /api/health/workforce      → doctors, nurses, specialists
 *   /api/health/diseases       → surveillance data
 *   /api/health/insurance      → NHIF coverage
 *   /api/health/vaccines       → vaccination programme
 *   /api/health/telemedicine   → teleconsult services
 *   /api/health/medicines      → essential medicines availability
 */

export const getData = async (sub, env) => {
  const facilities = {
    hospitals: {
      total: 735,
      federal: 45,
      state: 340,
      private: 280,
      teaching: 18,
      specialized: 52,
    },
    primaryHealthCareUnits: 5_840,
    ruralHealthClinics: 3_210,
    maternityUnits: 1_180,
    dentalClinics: 420,
    ophthalmicClinics: 185,
    dialysisCenters: 68,
    cancerCenters: 12,
    cardiacCenters: 8,
    traumaCenters: 24,
    bloodBanks: 38,
    totalBeds: 37_500,
    bedsPerThousand: 0.89,
    icuBeds: 1_240,
    byState: {
      Khartoum:   { hospitals: 145, phcUnits: 620, beds: 9_800 },
      Gezira:     { hospitals: 68,  phcUnits: 410, beds: 3_200 },
      Kassala:    { hospitals: 42,  phcUnits: 280, beds: 1_900 },
      'Blue Nile':{ hospitals: 28,  phcUnits: 190, beds: 1_100 },
      Sennar:     { hospitals: 35,  phcUnits: 220, beds: 1_400 },
      'Red Sea':  { hospitals: 30,  phcUnits: 175, beds: 1_200 },
      Northern:   { hospitals: 25,  phcUnits: 155, beds: 980 },
      'River Nile':{ hospitals: 28, phcUnits: 168, beds: 1_050 },
      'North Kordofan': { hospitals: 38, phcUnits: 260, beds: 1_550 },
      'South Kordofan': { hospitals: 32, phcUnits: 210, beds: 1_280 },
      'North Darfur':   { hospitals: 40, phcUnits: 285, beds: 1_680 },
      'South Darfur':   { hospitals: 45, phcUnits: 320, beds: 1_850 },
      'East Darfur':    { hospitals: 22, phcUnits: 140, beds: 820 },
      'Central Darfur': { hospitals: 20, phcUnits: 128, beds: 750 },
      'West Darfur':    { hospitals: 25, phcUnits: 158, beds: 900 },
      'White Nile':     { hospitals: 35, phcUnits: 230, beds: 1_420 },
      Gedaref:          { hospitals: 30, phcUnits: 195, beds: 1_180 },
      Aj_Jazirah:       { hospitals: 47, phcUnits: 292, beds: 2_140 },
    },
  };

  const workforce = {
    doctors: {
      total: 18_500,
      specialists: 6_200,
      generalPractitioners: 12_300,
      perThousandPopulation: 0.44,
      bySpecialty: {
        internalMedicine: 1_850,
        surgery: 1_420,
        pediatrics: 1_680,
        obstetrics: 1_250,
        psychiatry: 380,
        ophthalmology: 480,
        cardiology: 320,
        oncology: 180,
        radiology: 520,
        anesthesiology: 680,
        dermatology: 290,
        orthopedics: 540,
        urology: 210,
        neurology: 195,
        nephrology: 170,
      },
    },
    nurses: 38_400,
    midwives: 9_200,
    pharmacists: 7_800,
    laboratoryTechnicians: 5_600,
    physiotherapists: 1_850,
    dentists: 3_400,
    publicHealthOfficers: 4_200,
    communityHealthWorkers: 28_000,
    doctorNurseRatio: '1:2.07',
    attritionRate_pct: 8.4,
    brainDrain_pct: 12.6,
  };

  const diseasesSurveillance = {
    reportingFacilities_pct: 78,
    outbreaksThisYear: [
      { disease: 'Malaria', cases: 3_200_000, deaths: 1_850, region: 'All states', status: 'endemic' },
      { disease: 'Dengue Fever', cases: 28_500, deaths: 42, region: 'Red Sea, Kassala', status: 'outbreak' },
      { disease: 'Cholera', cases: 4_200, deaths: 38, region: 'Darfur, Kordofan', status: 'alert' },
      { disease: 'Tuberculosis', cases: 48_000, deaths: 2_100, region: 'Nationwide', status: 'endemic' },
      { disease: 'Leishmaniasis', cases: 12_800, deaths: 180, region: 'Gedaref, Blue Nile', status: 'endemic' },
      { disease: 'Measles', cases: 3_800, deaths: 22, region: 'Darfur', status: 'alert' },
      { disease: 'COVID-19', cases: 890, deaths: 2, region: 'Khartoum', status: 'monitoring' },
    ],
    maternalMortality_per100kLiveBirths: 295,
    infantMortality_per1000LiveBirths: 42,
    under5Mortality_per1000: 65,
    lifeExpectancy: { overall: 67.5, male: 65.2, female: 69.8 },
    stunting_pct: 38.2,
    wasting_pct: 13.6,
    malnutrition_pct: 22.4,
  };

  const insurance = {
    nhifCoverage_pct: 28.5,
    enrolledMembers: 12_025_000,
    activePolicies: 9_850_000,
    annualBudget_SDG: 35_000_000_000,
    benefitsPackage: [
      'Outpatient consultations',
      'Emergency services (24/7)',
      'Inpatient hospitalization (up to 30 days/year)',
      'Surgical procedures (essential list)',
      'Maternity care (4 antenatal + delivery)',
      'Essential medicines (NHIF formulary)',
      'Radiology and laboratory diagnostics',
      'Chronic disease management (diabetes, hypertension, asthma)',
      'Dental (basic extractions and fillings)',
      'Mental health (outpatient)',
    ],
    premiumTiers: [
      { tier: 'Government Employee', monthly_SDG: 2_500, employerPays_pct: 80 },
      { tier: 'Private Sector', monthly_SDG: 4_500, employerPays_pct: 60 },
      { tier: 'Self-Employed', monthly_SDG: 6_000, employerPays_pct: 0 },
      { tier: 'Indigent (subsidized)', monthly_SDG: 0, employerPays_pct: 0 },
    ],
    accreditedFacilities: 680,
  };

  const vaccines = {
    programCoverage_pct: {
      BCG: 82,
      OPV3: 74,
      DTP3: 72,
      measlesRubella: 68,
      rotavirus: 55,
      pneumococcal: 58,
      HPV_girls: 35,
      yellowFever: 61,
    },
    coldChainFacilities: 1_240,
    vaccinationCenters: 4_200,
    schedule: [
      { vaccine: 'BCG + OPV0', when: 'At birth' },
      { vaccine: 'OPV1 + DTP-HepB-Hib1 + PCV1 + RV1', when: '6 weeks' },
      { vaccine: 'OPV2 + DTP-HepB-Hib2 + PCV2 + RV2', when: '10 weeks' },
      { vaccine: 'OPV3 + DTP-HepB-Hib3 + PCV3', when: '14 weeks' },
      { vaccine: 'Measles-Rubella 1 + Yellow Fever', when: '9 months' },
      { vaccine: 'Measles-Rubella 2 + OPV booster + DTP booster', when: '18 months' },
      { vaccine: 'HPV dose 1', when: '9-14 years (girls)' },
      { vaccine: 'COVID-19 (adults)', when: '18+ years' },
    ],
    supplyStatus: 'adequate',
  };

  const telemedicine = {
    status: 'operational',
    platforms: ['BrainSAIT TeleHealth', 'Sudan eHealth Portal', 'USSD *140*HEALTH#'],
    totalConsultations2024: 285_000,
    activeProviders: 1_840,
    specialtiesAvailable: [
      'General Practice', 'Internal Medicine', 'Pediatrics',
      'Dermatology', 'Psychiatry & Mental Health', 'Obstetrics',
      'Cardiology', 'Diabetology', 'Ophthalmology',
    ],
    averageWaitMinutes: 18,
    satisfactionScore: 4.3,
    costPerConsultation_SDG: 3_500,
    freeForNHIF: true,
    supportedLanguages: ['Arabic', 'English'],
    ussdCode: '*140*4#',
  };

  const medicines = {
    essentialMedicinesListItems: 480,
    availabilityAtPHC_pct: 62,
    availabilityAtHospitals_pct: 78,
    locallyManufactured_pct: 35,
    importDependency_pct: 65,
    pharmacies: 12_500,
    genericMedicinesProgram: true,
    subsidizedItems: 95,
    criticalShortages: [
      'Insulin (periodic)',
      'Some cancer chemotherapy agents',
      'Certain antibiotics (rural areas)',
    ],
  };

  if (sub === 'facilities') return facilities;
  if (sub === 'workforce') return workforce;
  if (sub === 'diseases') return diseasesSurveillance;
  if (sub === 'insurance') return insurance;
  if (sub === 'vaccines') return vaccines;
  if (sub === 'telemedicine') return telemedicine;
  if (sub === 'medicines') return medicines;

  return {
    facilities,
    workforce,
    diseasesSurveillance,
    insurance,
    vaccines,
    telemedicine,
    medicines,
  };
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const sub = url.pathname.split('/').filter(Boolean).pop();
    const data = await getData(sub === 'health' ? null : sub, env);
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
