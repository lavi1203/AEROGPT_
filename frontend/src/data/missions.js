export const MISSIONS = [
  {
    id: 'chandrayaan-3',
    name: 'Chandrayaan-3',
    agency: 'ISRO',
    summary: 'India\'s successful lunar south pole landing mission.',
    launchDate: 'July 14, 2023',
    vehicle: 'LVM3-M4',
    objective: 'Demonstrate safe and soft landing on lunar surface, rover roving on the moon and conduct in-situ scientific experiments.',
    facts: [
      'Landed near the lunar south pole on August 23, 2023.',
      'Made India the first country to land near the lunar south pole.',
      'Detected Sulphur and other elements on the lunar surface.',
      'Pragyan rover traversed over 100 meters on the moon.'
    ]
  },
  {
    id: 'mangalyaan',
    name: 'Mangalyaan (MOM)',
    agency: 'ISRO',
    summary: 'First Asian mission to reach Mars orbit.',
    launchDate: 'November 5, 2013',
    vehicle: 'PSLV-C25',
    objective: 'Explore Martian surface features, morphology, mineralogy and atmosphere.',
    facts: [
      'Made India the first nation to reach Mars orbit on its first attempt.',
      'One of the cheapest interplanetary missions ever launched ($74M).',
      'Operated for over 8 years, well beyond its 6-month designed life.',
      'Captured full-disc images of Mars and its moons.'
    ]
  },
  {
    id: 'aditya-l1',
    name: 'Aditya-L1',
    agency: 'ISRO',
    summary: 'India\'s first dedicated solar observation mission.',
    launchDate: 'September 2, 2023',
    vehicle: 'PSLV-C57',
    objective: 'Study the solar atmosphere, solar magnetic storms and their impact on environment around Earth.',
    facts: [
      'Placed in a halo orbit around Lagrange point 1 (L1).',
      'Carries 7 payloads to observe the photosphere, chromosphere and corona.',
      'VELC payload takes images of the solar corona.',
      'Provides continuous observation of the Sun without eclipses.'
    ]
  },
  {
    id: 'apollo-11',
    name: 'Apollo 11',
    agency: 'NASA',
    summary: 'First human landing on the Moon.',
    launchDate: 'July 16, 1969',
    vehicle: 'Saturn V',
    objective: 'Perform a crewed lunar landing and return to Earth.',
    facts: [
      'Neil Armstrong and Buzz Aldrin were the first humans on the Moon.',
      'Collected 21.5 kg of lunar material for return to Earth.',
      'Command Module Columbia remained in orbit piloted by Michael Collins.',
      'Fulfilled President Kennedy\'s goal of landing a man on the moon before the decade ended.'
    ]
  },
  {
    id: 'voyager-1',
    name: 'Voyager 1',
    agency: 'NASA',
    summary: 'Farthest human-made object in space.',
    launchDate: 'September 5, 1977',
    vehicle: 'Titan IIIE / Centaur',
    objective: 'Explore the outer solar system and beyond.',
    facts: [
      'Crossed the heliopause and entered interstellar space in 2012.',
      'Provided detailed images of Jupiter and Saturn systems.',
      'Carries the Golden Record with sounds and images of Earth.',
      'Currently over 24 billion km away from Earth.'
    ]
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope',
    agency: 'NASA',
    summary: 'Space telescope providing deep views of the universe.',
    launchDate: 'April 24, 1990',
    vehicle: 'Space Shuttle Discovery (STS-31)',
    objective: 'Observe the universe in visible, ultraviolet, and near-infrared light.',
    facts: [
      'Helped determine the rate of expansion of the universe.',
      'Discovered that the universe\'s expansion is accelerating.',
      'Serviced 5 times by Space Shuttle crews to repair and upgrade instruments.',
      'Captured the Hubble Deep Field, revealing thousands of galaxies.'
    ]
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope',
    agency: 'NASA',
    summary: 'Premier infrared space observatory.',
    launchDate: 'December 25, 2021',
    vehicle: 'Ariane 5',
    objective: 'Observe first stars and galaxies, study planetary systems and origins of life.',
    facts: [
      'Operates at Lagrange point 2 (L2), 1.5 million km from Earth.',
      'Features a 6.5-meter primary mirror made of 18 gold-plated beryllium segments.',
      'Must be kept extremely cold (under 50 K) using a 5-layer sunshield.',
      'Can observe high-redshift objects that Hubble cannot see.'
    ]
  },
  {
    id: 'gaganyaan',
    name: 'Gaganyaan',
    agency: 'ISRO',
    summary: 'India\'s upcoming crewed orbital spacecraft.',
    launchDate: '2025-2026 (Planned)',
    vehicle: 'HLVM3',
    objective: 'Demonstrate human spaceflight capability to Low Earth Orbit (LEO).',
    facts: [
      'Planned to carry a crew of 3 to a 400 km orbit for a 3-day mission.',
      'Involves testing Crew Escape System (CES) for safety.',
      'Vyommitra, a humanoid robot, will fly on uncrewed precursor missions.',
      'Will make India the 4th country to launch humans to space independently.'
    ]
  },
  {
    id: 'curiosity',
    name: 'Curiosity Rover',
    agency: 'NASA',
    summary: 'Car-sized rover exploring Gale Crater on Mars.',
    launchDate: 'November 26, 2011',
    vehicle: 'Atlas V 541',
    objective: 'Investigate Martian climate, geology, and past habitability.',
    facts: [
      'Landed using an innovative "sky crane" hovering system.',
      'Found evidence of ancient stream beds and liquid water.',
      'Determined that Gale Crater could have supported microbial life.',
      'Powered by a Multi-Mission Radioisotope Thermoelectric Generator (MMRTG).'
    ]
  },
  {
    id: 'cartosat-3',
    name: 'Cartosat-3',
    agency: 'ISRO',
    summary: 'Advanced high-resolution Earth observation satellite.',
    launchDate: 'November 27, 2019',
    vehicle: 'PSLV-C47',
    objective: 'Provide high-resolution imagery for urban planning, infrastructure, and coastal land use.',
    facts: [
      'Features a panchromatic resolution of 0.25 meters.',
      'Operates in a 509 km Sun-synchronous orbit.',
      'One of the highest resolution civilian satellites in the world.',
      'Highly agile satellite capable of capturing images at various angles.'
    ]
  },
  {
    id: 'cassini',
    name: 'Cassini-Huygens',
    agency: 'NASA/ESA',
    summary: 'Mission to explore the Saturn system.',
    launchDate: 'October 15, 1997',
    vehicle: 'Titan IVB / Centaur',
    objective: 'Study Saturn, its rings, and its moons in unprecedented detail.',
    facts: [
      'Delivered the Huygens probe to land on Titan, the first landing in the outer solar system.',
      'Discovered active water-ice plumes on the moon Enceladus.',
      'Revealed liquid methane lakes on Titan.',
      'Ended via a planned plunge into Saturn\'s atmosphere in 2017 to protect its moons.'
    ]
  },
  {
    id: 'gsat-series',
    name: 'GSAT Series',
    agency: 'ISRO',
    summary: 'India\'s indigenous communication satellite system.',
    launchDate: 'Various (2001-Present)',
    vehicle: 'GSLV, LVM3, Ariane 5',
    objective: 'Provide telecommunication, broadcasting, and disaster management services.',
    facts: [
      'Operate primarily in Geostationary Earth Orbit (GEO).',
      'GSAT-20/24 are high-throughput satellites providing broadband connectivity.',
      'Crucial for DTH television, VSAT networks, and strategic communications.',
      'Replaced the older INSAT series of satellites.'
    ]
  },
  {
    id: 'artemis-1',
    name: 'Artemis I',
    agency: 'NASA',
    summary: 'First uncrewed test flight of the SLS and Orion.',
    launchDate: 'November 16, 2022',
    vehicle: 'Space Launch System (SLS)',
    objective: 'Test the integrated SLS rocket and Orion spacecraft for future lunar missions.',
    facts: [
      'Travelled 2.25 million km in a 25-day mission around the Moon.',
      'Orion flew farther than any spacecraft built for humans has ever flown.',
      'Successfully tested Orion\'s heat shield at lunar reentry velocities (40,000 km/h).',
      'Paved the way for Artemis II crewed lunar flyby.'
    ]
  },
  {
    id: 'astrosat',
    name: 'AstroSat',
    agency: 'ISRO',
    summary: 'India\'s first dedicated multi-wavelength space observatory.',
    launchDate: 'September 28, 2015',
    vehicle: 'PSLV-C30',
    objective: 'Simultaneous multi-wavelength observations of various astronomical objects.',
    facts: [
      'Observes in X-ray, optical, and UV spectral bands.',
      'Operates in a 650 km near-equatorial orbit.',
      'Has discovered extreme-UV light from a galaxy 9.3 billion light-years away.',
      'Designed to study black holes, neutron stars, and active galactic nuclei.'
    ]
  },
  {
    id: 'perseverance',
    name: 'Perseverance Rover',
    agency: 'NASA',
    summary: 'Mars rover designed to seek signs of ancient life.',
    launchDate: 'July 30, 2020',
    vehicle: 'Atlas V 541',
    objective: 'Seek signs of ancient life and collect samples for future return to Earth.',
    facts: [
      'Landed in Jezero Crater on February 18, 2021.',
      'Carried the Ingenuity helicopter, the first aircraft to fly on another planet.',
      'MOXIE instrument successfully produced oxygen from the Martian atmosphere.',
      'Currently storing rock and soil samples in sealed tubes for a future return mission.'
    ]
  }
];
