export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.split('/').filter(Boolean);
    
    // Farming/Agriculture data
    const agriculture = {
      totalFarmers: 2800000,
      registeredLand: 18500000, // hectares
      farmingTypes: {
        irrigated: 3500000,
        rainfed: 12000000,
        mechanized: 2800000,
        pastoral: 2500000
      }
    };

    // Crops data
    const crops = {
      mainCrops: [
        { name: 'Sorghum', area: 6000000, production: 5000000, unit: 'tons', states: ['Kordofan', 'Darfur', 'Gezira'] },
        { name: 'Millet', area: 4000000, production: 2500000, unit: 'tons', states: ['Darfur', 'Kordofan', 'Kassala'] },
        { name: 'Wheat', area: 1200000, production: 900000, unit: 'tons', states: ['Gezira', 'Nile', 'Kassala'] },
        { name: 'Cotton', area: 800000, production: 600000, unit: 'tons', states: ['Gezira', 'White Nile', 'Sennar'] },
        { name: 'Groundnuts', area: 1500000, production: 1200000, unit: 'tons', states: ['Kordofan', 'Darfur', 'Blue Nile'] },
        { name: 'Sesame', area: 900000, production: 450000, unit: 'tons', states: ['Darfur', 'Kordofan', 'Blue Nile'] },
        { name: 'Sugar Cane', area: 150000, production: 1800000, unit: 'tons', states: ['Gezira', 'Kassala', 'Sennar'] }
      ],
      vegetables: [
        { name: 'Onions', production: 800000 },
        { name: 'Tomatoes', production: 650000 },
        { name: 'Okra', production: 400000 },
        { name: 'Peppers', production: 350000 }
      ]
    };

    // Livestock data
    const livestock = {
      cattle: 58000000,
      sheep: 42000000,
      goats: 32000000,
      camels: 4800000,
      poultry: 55000000,
      states: {
        Darfur: { cattle: 15000000, sheep: 12000000 },
        Kordofan: { cattle: 12000000, sheep: 10000000 },
        BlueNile: { cattle: 8000000, sheep: 6000000 }
      }
    };

    // Fisheries data
    const fisheries = {
      fishProduction: 150000, // tons annually
      redSea: 45000,
      nileSystem: 80000,
      damsAndLakes: 25000,
      exportValue: 180000000 // USD
    };

    // Check what data is requested
    if (path.includes('crops')) {
      return new Response(JSON.stringify(crops), { headers: { 'Content-Type': 'application/json' } });
    }
    if (path.includes('livestock')) {
      return new Response(JSON.stringify(livestock), { headers: { 'Content-Type': 'application/json' } });
    }
    if (path.includes('fisheries')) {
      return new Response(JSON.stringify(fisheries), { headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ ...agriculture, crops, livestock, fisheries }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
