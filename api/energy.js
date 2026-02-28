/**
 * Energy Ministry Worker — Sudan Digital Government Portal
 */

export const getData = async (sub, env) => {
  const electricity = {
    installedCapacity_MW: 4_200,
    totalGeneration_GWh: 15_000,
    totalConsumption_GWh: 13_500,
    transmissionLosses_pct: 10.0,
    nationwideElectrificationRate_pct: 42,
    sources: {
      hydro: { capacity_MW: 2_100, share_pct: 50 },
      thermal: { capacity_MW: 1_500, share_pct: 35.7 },
      solar: { capacity_MW: 450, share_pct: 10.7 },
      wind: { capacity_MW: 150, share_pct: 3.6 },
    },
    majorPlants: [
      { name: 'Merowe Hydroelectric', capacity_MW: 1_250, type: 'hydro', state: 'Northern' },
      { name: 'Roseires Hydroelectric', capacity_MW: 280, type: 'hydro', state: 'Blue Nile' },
      { name: 'Khartoum North Thermal', capacity_MW: 550, type: 'thermal', state: 'Khartoum' },
      { name: 'Atbara Wind Farm', capacity_MW: 120, type: 'wind', state: 'River Nile' },
      { name: 'Kassala Solar', capacity_MW: 100, type: 'solar', state: 'Kassala' },
      { name: 'Sennar Hydroelectric', capacity_MW: 15, type: 'hydro', state: 'Sennar' },
    ],
  };

  const oil = {
    reserves_barrels: 1_500_000_000,
    currentProduction_bpd: 30_000,
    majorBlocks: [
      { block: '2/85', operator: 'CNPC', production_bpd: 12_000, state: 'White Nile' },
      { block: '6', operator: 'Petronas', production_bpd: 8_000, state: 'Upper Nile' },
      { block: '3/7', operator: 'Sudapet', production_bpd: 10_000, state: 'Kordofan' },
    ],
    refineries: [
      { name: 'Khartoum Refinery', capacity_bpd: 100_000, location: 'Khartoum' },
      { name: 'Port Sudan Refinery', capacity_bpd: 21_700, location: 'Red Sea' },
    ],
  };

  const renewables = {
    solarPotential_kWhm2day: 6.5,
    windPotential_avg_ms: 7.2,
    installedSolar_MW: 450,
    installedWind_MW: 150,
    targetBy2030_MW: 4_000,
    projects: [
      { name: 'Kassala Solar Park', capacity_MW: 200, status: 'operational' },
      { name: 'Atbara Wind', capacity_MW: 120, status: 'operational' },
      { name: 'Dongola Solar', capacity_MW: 300, status: 'under_construction' },
      { name: 'Red Sea Offshore Wind', capacity_MW: 500, status: 'planned' },
    ],
  };

  if (sub === 'electricity') return electricity;
  if (sub === 'oil') return oil;
  if (sub === 'renewables') return renewables;
  return { electricity, oil, renewables };
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
