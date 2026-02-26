export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.split('/').filter(Boolean);
    
    // Infrastructure data
    const data = {
      roadNetwork: 12000,
      bridges: 500,
    };

    // Water management data
    const water = {
      dams: 85,
      irrigationSchemes: 120,
      waterTreatmentPlants: 45,
      rivers: ['Nile', 'Blue Nile', 'White Nile', 'Atbara', 'Gash', 'Barkadeer'],
      reservoirs: 200,
      irrigationCapacity: 4500000, // hectares
      waterSupplyCoverage: 68, // percentage
      majorDams: [
        { name: 'Merowe Dam', capacity: 1250, state: 'Northern' },
        { name: 'Roseires Dam', capacity: 300, state: 'Blue Nile' },
        { name: 'Sennar Dam', capacity: 100, state: 'Sennar' },
        { name: 'Kassala Dam', capacity: 50, state: 'Kassala' }
      ],
      irrigationProjects: [
        { name: 'Gezira Scheme', area: 880000, state: 'Gezira' },
        { name: 'Rahad Scheme', area: 300000, state: 'Blue Nile' },
        { name: 'New Halfa Scheme', area: 250000, state: 'Kassala' }
      ]
    };

    // Ports data
    const ports = {
      majorPorts: [
        { name: 'Port Sudan', capacity: '4.5M TEU', type: 'Main', region: 'Red Sea' },
        { name: 'Suakin Port', capacity: '1.5M TEU', type: 'Free Zone', region: 'Red Sea' },
        { name: 'Damazin Port', capacity: '500K tons', type: 'River', region: 'Blue Nile' },
        { name: 'Kosti Port', capacity: '800K tons', type: 'River', region: 'White Nile' }
      ],
      totalThroughput: 4500000, // tons
      containerTerminals: 3,
      berths: 45,
      warehouses: 120,
      customsClearanceTime: 24, // hours
    };

    // Check what data is being requested
    if (path.includes('water')) {
      return new Response(JSON.stringify(water), { headers: { 'Content-Type': 'application/json' } });
    }
    if (path.includes('ports')) {
      return new Response(JSON.stringify(ports), { headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ ...data, water, ports }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
