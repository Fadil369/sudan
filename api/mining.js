export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.split('/').filter(Boolean);
    
    // Gold mining data
    const gold = {
      production: {
        totalOunces: 2500000, // annual
        value: 4500000000, // USD
        majorMines: [
          { name: 'Hassai Gold Mine', production: 150000, state: 'Red Sea' },
          { name: 'Kakara Gold Mine', production: 80000, state: 'Red Sea' },
          { name: 'Ariab Mining', production: 65000, state: 'Red Sea' }
        ]
      },
      exports: {
        destinations: ['UAE', 'Switzerland', 'India', 'China'],
        annualValue: 4200000000, // USD
        customsCode: 'gold_7108'
      },
      artisanal: {
        miners: 150000,
        annualProduction: 500000, // ounces
        states: ['Red Sea', 'Kassala', 'Nile Valley', 'North Darfur']
      }
    };

    // Mining sector data
    const mining = {
      minerals: [
        { name: 'Gold', reserves: 1500, unit: 'tons' },
        { name: 'Chrome', reserves: 25000000, unit: 'tons' },
        { name: 'Manganese', reserves: 15000000, unit: 'tons' },
        { name: 'Copper', reserves: 2000000, unit: 'tons' },
        { name: 'Iron Ore', reserves: 3000000000, unit: 'tons' }
      ],
      licenses: {
        exploration: 450,
        mining: 180,
        artisanal: 2500
      },
      economicContribution: {
        gdp: 8.5, // percentage
        employment: 250000,
        exports: 65 // percentage of total exports
      }
    };

    // Check what data is being requested
    if (path.includes('gold')) {
      return new Response(JSON.stringify(gold), { headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ gold, mining }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
