/**
 * demoData.js
 * Demo / fallback data for BusTrace.
 *
 * Structure matches REAL API responses exactly so the frontend
 * can consume them with zero changes.
 *
 * Activated when:
 *   1. DEMO_MODE=true in .env  → always use demo data
 *   2. DB/API is unreachable   → automatic fallback per-service
 *
 * ── COVERAGE ──────────────────────────────────────────────────────────────────
 *  Cities  : Delhi, Noida, Ghaziabad, Gurugram, Faridabad, Agra, Meerut
 *  Routes  : 12 routes (city local + inter-city)
 *  Stops   : 80 stops across all cities + Bus Addas / ISBT terminals
 *  Buses   : 20 buses across all routes
 */

// ─── STOPS ────────────────────────────────────────────────────────────────────
// Shape: { stopId, name, lat, lng, city, routeIds, landmark?, isTerminus?, isBusAdda? }

const demoStops = [

  // ══════════════════════════════════════════════════════════════
  //  DELHI — LOCAL STOPS
  // ══════════════════════════════════════════════════════════════

  // ROUTE-A  (Rajiv Chowk → Pragati Maidan corridor)
  { stopId: 'S01', name: 'Connaught Place',            city: 'Delhi',     lat: 28.6315, lng: 77.2167, routeIds: ['ROUTE-A', 'ROUTE-B'], isTerminus: true,  landmark: 'Central Delhi Hub' },
  { stopId: 'S02', name: 'Mandi House',                city: 'Delhi',     lat: 28.6258, lng: 77.2321, routeIds: ['ROUTE-A'],            landmark: 'Near ITO' },
  { stopId: 'S03', name: 'ITO Crossing',               city: 'Delhi',     lat: 28.6285, lng: 77.2399, routeIds: ['ROUTE-A', 'ROUTE-C'], landmark: 'Near Delhi Secretariat' },
  { stopId: 'S04', name: 'Pragati Maidan',             city: 'Delhi',     lat: 28.6197, lng: 77.2460, routeIds: ['ROUTE-A'],            landmark: 'Exhibition Ground', isTerminus: true },
  { stopId: 'S05', name: 'Supreme Court',              city: 'Delhi',     lat: 28.6239, lng: 77.2390, routeIds: ['ROUTE-A', 'ROUTE-B'], landmark: 'Tilak Marg' },
  { stopId: 'S11', name: 'Rajiv Chowk',                city: 'Delhi',     lat: 28.6328, lng: 77.2197, routeIds: ['ROUTE-A', 'ROUTE-B', 'ROUTE-C'], landmark: 'Metro Hub' },

  // ROUTE-B  (Connaught Place → AIIMS corridor)
  { stopId: 'S06', name: 'India Gate',                 city: 'Delhi',     lat: 28.6129, lng: 77.2295, routeIds: ['ROUTE-B'],            landmark: 'War Memorial' },
  { stopId: 'S07', name: 'Khan Market',                city: 'Delhi',     lat: 28.6001, lng: 77.2258, routeIds: ['ROUTE-B'],            landmark: 'Market Area' },
  { stopId: 'S08', name: 'AIIMS Gate',                 city: 'Delhi',     lat: 28.5665, lng: 77.2100, routeIds: ['ROUTE-B', 'ROUTE-D'], isTerminus: true,  landmark: 'AIIMS Hospital Main Gate' },
  { stopId: 'S30', name: 'Safdarjung Hospital',        city: 'Delhi',     lat: 28.5693, lng: 77.2067, routeIds: ['ROUTE-B'],            landmark: 'Safdarjung Enclave' },
  { stopId: 'S31', name: 'Dhaula Kuan',                city: 'Delhi',     lat: 28.5921, lng: 77.1521, routeIds: ['ROUTE-B', 'ROUTE-D'], landmark: 'NH-48 Junction' },

  // ROUTE-C  (Kashmere Gate → Rajiv Chowk corridor)
  { stopId: 'S09', name: 'Kashmere Gate ISBT',         city: 'Delhi',     lat: 28.6672, lng: 77.2290, routeIds: ['ROUTE-C', 'ROUTE-G'], isTerminus: true,  isBusAdda: true, landmark: 'Inter-State Bus Terminal' },
  { stopId: 'S10', name: 'Civil Lines',                city: 'Delhi',     lat: 28.6780, lng: 77.2200, routeIds: ['ROUTE-C'],            landmark: 'Delhi High Court Nearby' },
  { stopId: 'S12', name: 'Old Delhi Railway Station',  city: 'Delhi',     lat: 28.6567, lng: 77.2150, routeIds: ['ROUTE-C'],            landmark: 'Railway Station' },
  { stopId: 'S32', name: 'Chandni Chowk',              city: 'Delhi',     lat: 28.6506, lng: 77.2303, routeIds: ['ROUTE-C'],            landmark: 'Old Delhi Market' },
  { stopId: 'S33', name: 'Red Fort',                   city: 'Delhi',     lat: 28.6562, lng: 77.2410, routeIds: ['ROUTE-C'],            landmark: 'Lal Qila' },

  // ROUTE-D  (Anand Vihar → AIIMS — East-West Delhi)
  { stopId: 'S34', name: 'Anand Vihar ISBT',           city: 'Delhi',     lat: 28.6469, lng: 77.3152, routeIds: ['ROUTE-D', 'ROUTE-H'], isTerminus: true,  isBusAdda: true, landmark: 'Inter-State Bus Terminal East' },
  { stopId: 'S35', name: 'Kaushambi',                  city: 'Delhi',     lat: 28.6412, lng: 77.3170, routeIds: ['ROUTE-D'] },
  { stopId: 'S36', name: 'Akshardham',                 city: 'Delhi',     lat: 28.6127, lng: 77.2773, routeIds: ['ROUTE-D'],            landmark: 'Akshardham Temple' },
  { stopId: 'S37', name: 'Yamuna Bank',                city: 'Delhi',     lat: 28.6204, lng: 77.2900, routeIds: ['ROUTE-D'] },
  { stopId: 'S38', name: 'Laxmi Nagar',                city: 'Delhi',     lat: 28.6322, lng: 77.2795, routeIds: ['ROUTE-D'],            landmark: 'Laxmi Nagar Market' },
  { stopId: 'S39', name: 'Nirman Vihar',               city: 'Delhi',     lat: 28.6340, lng: 77.2940, routeIds: ['ROUTE-D'] },
  { stopId: 'S40', name: 'Sahibabad',                  city: 'Delhi',     lat: 28.6580, lng: 77.3460, routeIds: ['ROUTE-D'] },

  // ROUTE-E  (Saket → Rohini — South to North)
  { stopId: 'S41', name: 'Saket',                      city: 'Delhi',     lat: 28.5244, lng: 77.2090, routeIds: ['ROUTE-E'], isTerminus: true,  landmark: 'Saket Select City Walk' },
  { stopId: 'S42', name: 'Malviya Nagar',              city: 'Delhi',     lat: 28.5322, lng: 77.2094, routeIds: ['ROUTE-E'],            landmark: 'IIT Delhi Nearby' },
  { stopId: 'S43', name: 'Hauz Khas',                  city: 'Delhi',     lat: 28.5494, lng: 77.2001, routeIds: ['ROUTE-E'],            landmark: 'Hauz Khas Village' },
  { stopId: 'S44', name: 'Green Park',                 city: 'Delhi',     lat: 28.5601, lng: 77.2060, routeIds: ['ROUTE-E'] },
  { stopId: 'S45', name: 'South Extension',            city: 'Delhi',     lat: 28.5700, lng: 77.2182, routeIds: ['ROUTE-E'],            landmark: 'South Ex Market' },
  { stopId: 'S46', name: 'Moti Bagh',                  city: 'Delhi',     lat: 28.5850, lng: 77.1948, routeIds: ['ROUTE-E'] },
  { stopId: 'S47', name: 'Rohini Sector 18',           city: 'Delhi',     lat: 28.7420, lng: 77.0674, routeIds: ['ROUTE-E'], isTerminus: true,  landmark: 'Rohini West' },

  // ══════════════════════════════════════════════════════════════
  //  NOIDA
  // ══════════════════════════════════════════════════════════════

  // ROUTE-F  (Noida Sector 18 → Greater Noida)
  { stopId: 'N01', name: 'Noida Sector 18',            city: 'Noida',     lat: 28.5705, lng: 77.3219, routeIds: ['ROUTE-F', 'ROUTE-H'], isTerminus: true,  landmark: 'Atta Market' },
  { stopId: 'N02', name: 'Noida Sector 62',            city: 'Noida',     lat: 28.6273, lng: 77.3742, routeIds: ['ROUTE-F'],            landmark: 'IT Hub' },
  { stopId: 'N03', name: 'Botanical Garden',           city: 'Noida',     lat: 28.5635, lng: 77.3395, routeIds: ['ROUTE-F'],            landmark: 'Near Golf Course' },
  { stopId: 'N04', name: 'Noida City Centre',          city: 'Noida',     lat: 28.5744, lng: 77.3601, routeIds: ['ROUTE-F'],            landmark: 'DLF Mall of India Area' },
  { stopId: 'N05', name: 'Pari Chowk',                 city: 'Noida',     lat: 28.4756, lng: 77.5040, routeIds: ['ROUTE-F', 'ROUTE-L'], isTerminus: true,  isBusAdda: true, landmark: 'Greater Noida Bus Stand' },
  { stopId: 'N06', name: 'Noida Sector 37',            city: 'Noida',     lat: 28.5618, lng: 77.3295, routeIds: ['ROUTE-F'] },
  { stopId: 'N07', name: 'Noida Sector 15A',           city: 'Noida',     lat: 28.5814, lng: 77.3170, routeIds: ['ROUTE-F'] },
  { stopId: 'N08', name: 'Film City',                  city: 'Noida',     lat: 28.5960, lng: 77.3520, routeIds: ['ROUTE-F'],            landmark: 'Noida Film City Sector 16A' },

  // ══════════════════════════════════════════════════════════════
  //  GHAZIABAD
  // ══════════════════════════════════════════════════════════════

  // ROUTE-G  (Ghaziabad Bus Stand → Kashmere Gate)
  { stopId: 'G01', name: 'Ghaziabad Bus Stand',        city: 'Ghaziabad', lat: 28.6692, lng: 77.4376, routeIds: ['ROUTE-G'],            isTerminus: true,  isBusAdda: true, landmark: 'Main Bus Adda Ghaziabad' },
  { stopId: 'G02', name: 'Rajnagar',                   city: 'Ghaziabad', lat: 28.6630, lng: 77.4215, routeIds: ['ROUTE-G'],            landmark: 'Raj Nagar Extension' },
  { stopId: 'G03', name: 'Vaishali',                   city: 'Ghaziabad', lat: 28.6456, lng: 77.3417, routeIds: ['ROUTE-G'] },
  { stopId: 'G04', name: 'Mohan Nagar',                city: 'Ghaziabad', lat: 28.6847, lng: 77.4101, routeIds: ['ROUTE-G'],            landmark: 'Mohan Nagar Crossing' },
  { stopId: 'G05', name: 'Vijay Nagar',                city: 'Ghaziabad', lat: 28.6588, lng: 77.4003, routeIds: ['ROUTE-G'] },
  { stopId: 'G06', name: 'Kavi Nagar',                 city: 'Ghaziabad', lat: 28.6720, lng: 77.4500, routeIds: ['ROUTE-G'],            landmark: 'Near Ghaziabad Railway Station' },
  { stopId: 'G07', name: 'Ghaziabad Railway Station',  city: 'Ghaziabad', lat: 28.6621, lng: 77.4340, routeIds: ['ROUTE-G'],            landmark: 'GZB Railway Station' },
  { stopId: 'G08', name: 'Indirapuram',                city: 'Ghaziabad', lat: 28.6406, lng: 77.3682, routeIds: ['ROUTE-G', 'ROUTE-H'], landmark: 'Shipra Mall Area' },

  // ══════════════════════════════════════════════════════════════
  //  GURUGRAM (GURGAON)
  // ══════════════════════════════════════════════════════════════

  // ROUTE-D extended / ROUTE-I  (Delhi → Gurugram)
  { stopId: 'GG01', name: 'IFFCO Chowk',              city: 'Gurugram',  lat: 28.4726, lng: 77.0747, routeIds: ['ROUTE-I'],            isTerminus: false, landmark: 'Golf Course Road Junction' },
  { stopId: 'GG02', name: 'MG Road Gurugram',         city: 'Gurugram',  lat: 28.4795, lng: 77.0833, routeIds: ['ROUTE-I'],            landmark: 'MG Road Metro' },
  { stopId: 'GG03', name: 'Sohna Road',               city: 'Gurugram',  lat: 28.4199, lng: 77.0365, routeIds: ['ROUTE-I'] },
  { stopId: 'GG04', name: 'Cyber City',               city: 'Gurugram',  lat: 28.4950, lng: 77.0878, routeIds: ['ROUTE-I'],            landmark: 'DLF Cyber City' },
  { stopId: 'GG05', name: 'Sector 29 Gurugram',       city: 'Gurugram',  lat: 28.4564, lng: 77.0731, routeIds: ['ROUTE-I'] },
  { stopId: 'GG06', name: 'Gurugram Bus Stand',        city: 'Gurugram',  lat: 28.4601, lng: 77.0265, routeIds: ['ROUTE-I', 'ROUTE-D'], isTerminus: true,  isBusAdda: true, landmark: 'Old Gurgaon Bus Adda' },
  { stopId: 'GG07', name: 'Huda City Centre',         city: 'Gurugram',  lat: 28.4595, lng: 77.0726, routeIds: ['ROUTE-I'],            landmark: 'HUDA Metro Station' },
  { stopId: 'GG08', name: 'Manesar',                  city: 'Gurugram',  lat: 28.3583, lng: 76.9399, routeIds: ['ROUTE-I'], isTerminus: true, landmark: 'Industrial Area' },

  // ══════════════════════════════════════════════════════════════
  //  FARIDABAD
  // ══════════════════════════════════════════════════════════════

  // ROUTE-J  (Faridabad → Delhi Badarpur Border)
  { stopId: 'F01', name: 'Faridabad New Town Bus Stand', city: 'Faridabad', lat: 28.4089, lng: 77.3178, routeIds: ['ROUTE-J'], isTerminus: true,  isBusAdda: true, landmark: 'Main Bus Terminal' },
  { stopId: 'F02', name: 'Ballabhgarh',                  city: 'Faridabad', lat: 28.3411, lng: 77.3235, routeIds: ['ROUTE-J'],            landmark: 'Ballabhgarh Town' },
  { stopId: 'F03', name: 'NIT Faridabad',                city: 'Faridabad', lat: 28.3816, lng: 77.3126, routeIds: ['ROUTE-J'],            landmark: 'NIT Market' },
  { stopId: 'F04', name: 'Old Faridabad',                city: 'Faridabad', lat: 28.4314, lng: 77.3165, routeIds: ['ROUTE-J'] },
  { stopId: 'F05', name: 'Badarpur Border',              city: 'Delhi',     lat: 28.5019, lng: 77.3011, routeIds: ['ROUTE-J', 'ROUTE-B'], landmark: 'Delhi-Faridabad Border' },
  { stopId: 'F06', name: 'Sector 28 Faridabad',          city: 'Faridabad', lat: 28.4241, lng: 77.3220, routeIds: ['ROUTE-J'] },
  { stopId: 'F07', name: 'Mathura Road Faridabad',       city: 'Faridabad', lat: 28.3620, lng: 77.3100, routeIds: ['ROUTE-J'] },

  // ══════════════════════════════════════════════════════════════
  //  AGRA
  // ══════════════════════════════════════════════════════════════

  // ROUTE-K  (Agra Bus Stand → Taj Mahal Corridor — local)
  { stopId: 'A01', name: 'Agra Fort Bus Stand',        city: 'Agra',      lat: 27.1767, lng: 78.0081, routeIds: ['ROUTE-K'], isTerminus: true,  isBusAdda: true, landmark: 'UPSRTC Agra Bus Adda' },
  { stopId: 'A02', name: 'Agra Fort',                  city: 'Agra',      lat: 27.1795, lng: 78.0211, routeIds: ['ROUTE-K'],            landmark: 'Mughal Fort UNESCO Site' },
  { stopId: 'A03', name: 'Taj Mahal East Gate',        city: 'Agra',      lat: 27.1751, lng: 78.0421, routeIds: ['ROUTE-K'], isTerminus: true,  landmark: 'Taj Mahal' },
  { stopId: 'A04', name: 'Idgah Bus Terminal',         city: 'Agra',      lat: 27.1833, lng: 77.9980, routeIds: ['ROUTE-K', 'ROUTE-L'], isBusAdda: true, landmark: 'Idgah Bus Terminal' },
  { stopId: 'A05', name: 'Raja Ki Mandi',              city: 'Agra',      lat: 27.2084, lng: 77.9975, routeIds: ['ROUTE-K'],            landmark: 'Near Agra Railway Station' },
  { stopId: 'A06', name: 'Agra Cantt Railway Station', city: 'Agra',      lat: 27.1557, lng: 78.0117, routeIds: ['ROUTE-K'],            landmark: 'Agra Cantonment Station' },
  { stopId: 'A07', name: 'Sikandra',                   city: 'Agra',      lat: 27.2153, lng: 77.9571, routeIds: ['ROUTE-K'],            landmark: "Akbar's Tomb" },
  { stopId: 'A08', name: 'Fatehabad Road',             city: 'Agra',      lat: 27.1640, lng: 78.0302, routeIds: ['ROUTE-K'],            landmark: 'Hotel Strip' },

  // ══════════════════════════════════════════════════════════════
  //  MEERUT
  // ══════════════════════════════════════════════════════════════

  // ROUTE-L  (Meerut Bus Stand → Noida Pari Chowk — inter-city)
  { stopId: 'M01', name: 'Meerut Bus Stand',           city: 'Meerut',    lat: 28.9845, lng: 77.7064, routeIds: ['ROUTE-L'], isTerminus: true,  isBusAdda: true, landmark: 'UPSRTC Meerut Depot' },
  { stopId: 'M02', name: 'Meerut Cantt',               city: 'Meerut',    lat: 28.9785, lng: 77.6990, routeIds: ['ROUTE-L'],            landmark: 'Military Cantonment' },
  { stopId: 'M03', name: 'Hapur Road Crossing',        city: 'Meerut',    lat: 28.9411, lng: 77.7501, routeIds: ['ROUTE-L'] },
  { stopId: 'M04', name: 'Modipuram',                  city: 'Meerut',    lat: 29.0210, lng: 77.7147, routeIds: ['ROUTE-L'],            landmark: 'Sugar Mill Area' },
  { stopId: 'M05', name: 'Partapur',                   city: 'Meerut',    lat: 28.9980, lng: 77.7600, routeIds: ['ROUTE-L'] },
  { stopId: 'M06', name: 'Ghaziabad Crossing',         city: 'Ghaziabad', lat: 28.7780, lng: 77.4950, routeIds: ['ROUTE-L'] },

  // ══════════════════════════════════════════════════════════════
  //  ROUTE-H  (Anand Vihar → Noida — cross-city connector)
  // ══════════════════════════════════════════════════════════════
  { stopId: 'X01', name: 'Mayur Vihar Phase 1',        city: 'Delhi',     lat: 28.6083, lng: 77.2967, routeIds: ['ROUTE-H'] },
  { stopId: 'X02', name: 'Kondli',                     city: 'Delhi',     lat: 28.6060, lng: 77.3290, routeIds: ['ROUTE-H'] },
  { stopId: 'X03', name: 'DND Flyover Delhi Side',     city: 'Delhi',     lat: 28.5698, lng: 77.2940, routeIds: ['ROUTE-H'],            landmark: 'Delhi-Noida Direct Flyway' },
  { stopId: 'X04', name: 'DND Flyover Noida Side',     city: 'Noida',     lat: 28.5645, lng: 77.3042, routeIds: ['ROUTE-H'] },

];

// ─── BUSES ────────────────────────────────────────────────────────────────────
// 20 buses across 12 routes
const demoBuses = [

  // ── ROUTE-A buses ──
  {
    busId: 'BUS-001', routeId: 'ROUTE-A', driverId: 'DRV-101',
    registrationNumber: 'UP14 AT 7890', type: 'AC',
    lat: 28.6352, lng: 77.2245, speed: 32,
    seatsAvailable: 8, capacity: 40, status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    busId: 'BUS-002', routeId: 'ROUTE-A', driverId: 'DRV-102',
    registrationNumber: 'UP14 BT 1234', type: 'Non-AC',
    lat: 28.6420, lng: 77.2180, speed: 24,
    seatsAvailable: 22, capacity: 50, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-B buses ──
  {
    busId: 'BUS-003', routeId: 'ROUTE-B', driverId: 'DRV-103',
    registrationNumber: 'DL1P 5678', type: 'AC',
    lat: 28.6295, lng: 77.2310, speed: 18,
    seatsAvailable: 3, capacity: 35, status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    busId: 'BUS-004', routeId: 'ROUTE-B', driverId: 'DRV-104',
    registrationNumber: 'DL4C 9900', type: 'Electric',
    lat: 28.5800, lng: 77.2200, speed: 22,
    seatsAvailable: 18, capacity: 42, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-C buses ──
  {
    busId: 'BUS-005', routeId: 'ROUTE-C', driverId: 'DRV-105',
    registrationNumber: 'UP32 GH 4567', type: 'Non-AC',
    lat: 28.6510, lng: 77.2390, speed: 28,
    seatsAvailable: 15, capacity: 45, status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    busId: 'BUS-006', routeId: 'ROUTE-C', driverId: 'DRV-106',
    registrationNumber: 'DL8C 3312', type: 'AC',
    lat: 28.6640, lng: 77.2250, speed: 20,
    seatsAvailable: 30, capacity: 50, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-D buses ──
  {
    busId: 'BUS-007', routeId: 'ROUTE-D', driverId: 'DRV-107',
    registrationNumber: 'UP16 AB 1111', type: 'Non-AC',
    lat: 28.6300, lng: 77.2850, speed: 30,
    seatsAvailable: 10, capacity: 55, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-E buses ──
  {
    busId: 'BUS-008', routeId: 'ROUTE-E', driverId: 'DRV-108',
    registrationNumber: 'DL7CB 4455', type: 'AC',
    lat: 28.5400, lng: 77.2050, speed: 26,
    seatsAvailable: 5, capacity: 40, status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    busId: 'BUS-009', routeId: 'ROUTE-E', driverId: 'DRV-109',
    registrationNumber: 'DL2CD 7823', type: 'Electric',
    lat: 28.6900, lng: 77.0900, speed: 35,
    seatsAvailable: 28, capacity: 40, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-F (Noida) buses ──
  {
    busId: 'BUS-010', routeId: 'ROUTE-F', driverId: 'DRV-110',
    registrationNumber: 'UP16 CG 2020', type: 'AC',
    lat: 28.5750, lng: 77.3400, speed: 40,
    seatsAvailable: 12, capacity: 45, status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    busId: 'BUS-011', routeId: 'ROUTE-F', driverId: 'DRV-111',
    registrationNumber: 'UP16 DH 3399', type: 'Non-AC',
    lat: 28.5630, lng: 77.3600, speed: 33,
    seatsAvailable: 35, capacity: 50, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-G (Ghaziabad → Delhi) bus ──
  {
    busId: 'BUS-012', routeId: 'ROUTE-G', driverId: 'DRV-112',
    registrationNumber: 'UP14 GZ 5500', type: 'Non-AC',
    lat: 28.6600, lng: 77.4000, speed: 45,
    seatsAvailable: 6, capacity: 54, status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    busId: 'BUS-013', routeId: 'ROUTE-G', driverId: 'DRV-113',
    registrationNumber: 'UP14 HJ 8872', type: 'AC',
    lat: 28.6450, lng: 77.3600, speed: 38,
    seatsAvailable: 20, capacity: 45, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-H (Anand Vihar → Noida) bus ──
  {
    busId: 'BUS-014', routeId: 'ROUTE-H', driverId: 'DRV-114',
    registrationNumber: 'DL3CD 6601', type: 'AC',
    lat: 28.5900, lng: 77.3100, speed: 29,
    seatsAvailable: 14, capacity: 40, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-I (Delhi → Gurugram) bus ──
  {
    busId: 'BUS-015', routeId: 'ROUTE-I', driverId: 'DRV-115',
    registrationNumber: 'HR26 AJ 4433', type: 'AC',
    lat: 28.5200, lng: 77.1500, speed: 50,
    seatsAvailable: 9, capacity: 45, status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    busId: 'BUS-016', routeId: 'ROUTE-I', driverId: 'DRV-116',
    registrationNumber: 'HR51 BC 9911', type: 'Non-AC',
    lat: 28.4800, lng: 77.0800, speed: 44,
    seatsAvailable: 40, capacity: 54, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-J (Faridabad → Delhi) bus ──
  {
    busId: 'BUS-017', routeId: 'ROUTE-J', driverId: 'DRV-117',
    registrationNumber: 'HR29 AS 1122', type: 'Non-AC',
    lat: 28.4200, lng: 77.3150, speed: 42,
    seatsAvailable: 22, capacity: 52, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-K (Agra local) bus ──
  {
    busId: 'BUS-018', routeId: 'ROUTE-K', driverId: 'DRV-118',
    registrationNumber: 'UP80 AT 0077', type: 'Non-AC',
    lat: 27.1770, lng: 78.0150, speed: 20,
    seatsAvailable: 18, capacity: 45, status: 'active',
    lastUpdated: new Date().toISOString(),
  },

  // ── ROUTE-L (Meerut → Noida inter-city) bus ──
  {
    busId: 'BUS-019', routeId: 'ROUTE-L', driverId: 'DRV-119',
    registrationNumber: 'UP15 MB 3344', type: 'AC',
    lat: 28.9000, lng: 77.7200, speed: 65,
    seatsAvailable: 4, capacity: 40, status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    busId: 'BUS-020', routeId: 'ROUTE-L', driverId: 'DRV-120',
    registrationNumber: 'UP15 NC 6688', type: 'Non-AC',
    lat: 28.8500, lng: 77.6500, speed: 60,
    seatsAvailable: 30, capacity: 54, status: 'active',
    lastUpdated: new Date().toISOString(),
  },
];

// ─── SEARCH RESULTS ───────────────────────────────────────────────────────────
// Shape: matches routeService.findMatchingRoutes() output exactly.
// Covers a wide variety of search scenarios across all cities.
const demoSearchResults = [

  // ── Scenario 1: Rajiv Chowk → Connaught Place (ROUTE-A, AC) ──
  {
    busId: 'BUS-001',
    routeId: 'ROUTE-A',
    registrationNumber: 'UP14 AT 7890',
    type: 'AC',
    seatsAvailable: 8,
    capacity: 40,
    crowdLevel: 'yellow',
    occupancyPercent: 80,
    currentLocation: { lat: 28.6352, lng: 77.2245 },
    speed: 32,
    distanceToBus: 0.4,
    eta: { minutes: 3, label: '3 min', isLive: true },
    fare: { amount: 15, currency: 'INR', label: '₹15' },
    srcStop: { stopId: 'S11', name: 'Rajiv Chowk',     lat: 28.6328, lng: 77.2197 },
    dstStop: { stopId: 'S01', name: 'Connaught Place',  lat: 28.6315, lng: 77.2167 },
    numIntermediateStops: 0,
    routeDistance: 1.8,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 2: Rajiv Chowk → Connaught Place (ROUTE-A, Non-AC) ──
  {
    busId: 'BUS-002',
    routeId: 'ROUTE-A',
    registrationNumber: 'UP14 BT 1234',
    type: 'Non-AC',
    seatsAvailable: 22,
    capacity: 50,
    crowdLevel: 'green',
    occupancyPercent: 56,
    currentLocation: { lat: 28.6420, lng: 77.2180 },
    speed: 24,
    distanceToBus: 1.1,
    eta: { minutes: 7, label: '7 min', isLive: true },
    fare: { amount: 10, currency: 'INR', label: '₹10' },
    srcStop: { stopId: 'S11', name: 'Rajiv Chowk',     lat: 28.6328, lng: 77.2197 },
    dstStop: { stopId: 'S01', name: 'Connaught Place',  lat: 28.6315, lng: 77.2167 },
    numIntermediateStops: 0,
    routeDistance: 1.8,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 3: Connaught Place → AIIMS (ROUTE-B, packed) ──
  {
    busId: 'BUS-003',
    routeId: 'ROUTE-B',
    registrationNumber: 'DL1P 5678',
    type: 'AC',
    seatsAvailable: 3,
    capacity: 35,
    crowdLevel: 'red',
    occupancyPercent: 91,
    currentLocation: { lat: 28.6295, lng: 77.2310 },
    speed: 18,
    distanceToBus: 1.7,
    eta: { minutes: 12, label: '12 min', isLive: true },
    fare: { amount: 20, currency: 'INR', label: '₹20' },
    srcStop: { stopId: 'S01', name: 'Connaught Place',  lat: 28.6315, lng: 77.2167 },
    dstStop: { stopId: 'S08', name: 'AIIMS Gate',       lat: 28.5665, lng: 77.2100 },
    numIntermediateStops: 3,
    routeDistance: 6.8,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 4: Kashmere Gate ISBT → Chandni Chowk (ROUTE-C) ──
  {
    busId: 'BUS-005',
    routeId: 'ROUTE-C',
    registrationNumber: 'UP32 GH 4567',
    type: 'Non-AC',
    seatsAvailable: 15,
    capacity: 45,
    crowdLevel: 'green',
    occupancyPercent: 67,
    currentLocation: { lat: 28.6510, lng: 77.2390 },
    speed: 28,
    distanceToBus: 0.9,
    eta: { minutes: 5, label: '5 min', isLive: true },
    fare: { amount: 12, currency: 'INR', label: '₹12' },
    srcStop: { stopId: 'S09', name: 'Kashmere Gate ISBT', lat: 28.6672, lng: 77.2290 },
    dstStop: { stopId: 'S32', name: 'Chandni Chowk',      lat: 28.6506, lng: 77.2303 },
    numIntermediateStops: 1,
    routeDistance: 2.4,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 5: Anand Vihar ISBT → Noida Sector 18 (ROUTE-H) ──
  {
    busId: 'BUS-014',
    routeId: 'ROUTE-H',
    registrationNumber: 'DL3CD 6601',
    type: 'AC',
    seatsAvailable: 14,
    capacity: 40,
    crowdLevel: 'yellow',
    occupancyPercent: 65,
    currentLocation: { lat: 28.5900, lng: 77.3100 },
    speed: 29,
    distanceToBus: 2.1,
    eta: { minutes: 10, label: '10 min', isLive: true },
    fare: { amount: 25, currency: 'INR', label: '₹25' },
    srcStop: { stopId: 'S34', name: 'Anand Vihar ISBT',   lat: 28.6469, lng: 77.3152 },
    dstStop: { stopId: 'N01', name: 'Noida Sector 18',    lat: 28.5705, lng: 77.3219 },
    numIntermediateStops: 3,
    routeDistance: 9.2,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 6: Ghaziabad Bus Stand → Kashmere Gate (ROUTE-G, AC) ──
  {
    busId: 'BUS-013',
    routeId: 'ROUTE-G',
    registrationNumber: 'UP14 HJ 8872',
    type: 'AC',
    seatsAvailable: 20,
    capacity: 45,
    crowdLevel: 'green',
    occupancyPercent: 56,
    currentLocation: { lat: 28.6450, lng: 77.3600 },
    speed: 38,
    distanceToBus: 3.5,
    eta: { minutes: 18, label: '18 min', isLive: true },
    fare: { amount: 35, currency: 'INR', label: '₹35' },
    srcStop: { stopId: 'G01', name: 'Ghaziabad Bus Stand',  lat: 28.6692, lng: 77.4376 },
    dstStop: { stopId: 'S09', name: 'Kashmere Gate ISBT',   lat: 28.6672, lng: 77.2290 },
    numIntermediateStops: 4,
    routeDistance: 22.0,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 7: Gurugram Bus Stand → Delhi Dhaula Kuan (ROUTE-I) ──
  {
    busId: 'BUS-015',
    routeId: 'ROUTE-I',
    registrationNumber: 'HR26 AJ 4433',
    type: 'AC',
    seatsAvailable: 9,
    capacity: 45,
    crowdLevel: 'yellow',
    occupancyPercent: 80,
    currentLocation: { lat: 28.5200, lng: 77.1500 },
    speed: 50,
    distanceToBus: 5.0,
    eta: { minutes: 22, label: '22 min', isLive: true },
    fare: { amount: 50, currency: 'INR', label: '₹50' },
    srcStop: { stopId: 'GG06', name: 'Gurugram Bus Stand', lat: 28.4601, lng: 77.0265 },
    dstStop: { stopId: 'S31',  name: 'Dhaula Kuan',        lat: 28.5921, lng: 77.1521 },
    numIntermediateStops: 4,
    routeDistance: 30.5,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 8: Faridabad → Badarpur Border (ROUTE-J) ──
  {
    busId: 'BUS-017',
    routeId: 'ROUTE-J',
    registrationNumber: 'HR29 AS 1122',
    type: 'Non-AC',
    seatsAvailable: 22,
    capacity: 52,
    crowdLevel: 'green',
    occupancyPercent: 58,
    currentLocation: { lat: 28.4200, lng: 77.3150 },
    speed: 42,
    distanceToBus: 1.5,
    eta: { minutes: 8, label: '8 min', isLive: true },
    fare: { amount: 18, currency: 'INR', label: '₹18' },
    srcStop: { stopId: 'F01', name: 'Faridabad New Town Bus Stand', lat: 28.4089, lng: 77.3178 },
    dstStop: { stopId: 'F05', name: 'Badarpur Border',              lat: 28.5019, lng: 77.3011 },
    numIntermediateStops: 3,
    routeDistance: 11.5,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 9: Agra Fort Bus Stand → Taj Mahal (ROUTE-K) ──
  {
    busId: 'BUS-018',
    routeId: 'ROUTE-K',
    registrationNumber: 'UP80 AT 0077',
    type: 'Non-AC',
    seatsAvailable: 18,
    capacity: 45,
    crowdLevel: 'green',
    occupancyPercent: 60,
    currentLocation: { lat: 27.1770, lng: 78.0150 },
    speed: 20,
    distanceToBus: 0.6,
    eta: { minutes: 4, label: '4 min', isLive: true },
    fare: { amount: 10, currency: 'INR', label: '₹10' },
    srcStop: { stopId: 'A01', name: 'Agra Fort Bus Stand', lat: 27.1767, lng: 78.0081 },
    dstStop: { stopId: 'A03', name: 'Taj Mahal East Gate', lat: 27.1751, lng: 78.0421 },
    numIntermediateStops: 1,
    routeDistance: 3.4,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 10: Meerut Bus Stand → Noida Pari Chowk (ROUTE-L, inter-city) ──
  {
    busId: 'BUS-019',
    routeId: 'ROUTE-L',
    registrationNumber: 'UP15 MB 3344',
    type: 'AC',
    seatsAvailable: 4,
    capacity: 40,
    crowdLevel: 'red',
    occupancyPercent: 90,
    currentLocation: { lat: 28.9000, lng: 77.7200 },
    speed: 65,
    distanceToBus: 8.0,
    eta: { minutes: 35, label: '35 min', isLive: true },
    fare: { amount: 80, currency: 'INR', label: '₹80' },
    srcStop: { stopId: 'M01', name: 'Meerut Bus Stand',  lat: 28.9845, lng: 77.7064 },
    dstStop: { stopId: 'N05', name: 'Pari Chowk',        lat: 28.4756, lng: 77.5040 },
    numIntermediateStops: 5,
    routeDistance: 78.0,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 11: Noida Sector 62 → Film City (ROUTE-F) ──
  {
    busId: 'BUS-010',
    routeId: 'ROUTE-F',
    registrationNumber: 'UP16 CG 2020',
    type: 'AC',
    seatsAvailable: 12,
    capacity: 45,
    crowdLevel: 'yellow',
    occupancyPercent: 73,
    currentLocation: { lat: 28.5750, lng: 77.3400 },
    speed: 40,
    distanceToBus: 2.3,
    eta: { minutes: 9, label: '9 min', isLive: true },
    fare: { amount: 22, currency: 'INR', label: '₹22' },
    srcStop: { stopId: 'N02', name: 'Noida Sector 62', lat: 28.6273, lng: 77.3742 },
    dstStop: { stopId: 'N08', name: 'Film City',        lat: 28.5960, lng: 77.3520 },
    numIntermediateStops: 2,
    routeDistance: 7.1,
    lastUpdated: new Date().toISOString(),
  },

  // ── Scenario 12: Saket → Hauz Khas (ROUTE-E, Electric bus) ──
  {
    busId: 'BUS-009',
    routeId: 'ROUTE-E',
    registrationNumber: 'DL2CD 7823',
    type: 'Electric',
    seatsAvailable: 28,
    capacity: 40,
    crowdLevel: 'green',
    occupancyPercent: 30,
    currentLocation: { lat: 28.6900, lng: 77.0900 },
    speed: 35,
    distanceToBus: 0.7,
    eta: { minutes: 4, label: '4 min', isLive: true },
    fare: { amount: 10, currency: 'INR', label: '₹10' },
    srcStop: { stopId: 'S41', name: 'Saket',      lat: 28.5244, lng: 77.2090 },
    dstStop: { stopId: 'S43', name: 'Hauz Khas',  lat: 28.5494, lng: 77.2001 },
    numIntermediateStops: 1,
    routeDistance: 2.8,
    lastUpdated: new Date().toISOString(),
  },
];

// ─── ROUTE SEQUENCES ──────────────────────────────────────────────────────────
// Used by server.js → routeService.loadRouteSequences()
// Stop order defines direction of travel.
const demoRouteSequences = {
  // Delhi local
  'ROUTE-A': ['S11', 'S01', 'S02', 'S03', 'S04', 'S05'],
  'ROUTE-B': ['S01', 'S05', 'S06', 'S07', 'S30', 'S31', 'S08'],
  'ROUTE-C': ['S09', 'S10', 'S12', 'S33', 'S32', 'S03', 'S11'],
  'ROUTE-D': ['S34', 'S35', 'S39', 'S38', 'S36', 'S37', 'S40', 'S31', 'S08'],
  'ROUTE-E': ['S41', 'S42', 'S43', 'S44', 'S45', 'S46', 'S11', 'S47'],
  // Noida
  'ROUTE-F': ['N01', 'N07', 'N06', 'N03', 'N04', 'N08', 'N02', 'N05'],
  // Ghaziabad → Delhi
  'ROUTE-G': ['G01', 'G06', 'G07', 'G04', 'G05', 'G02', 'G08', 'G03', 'S35', 'S34', 'S09'],
  // Cross-city Delhi → Noida
  'ROUTE-H': ['S34', 'X01', 'X02', 'X03', 'X04', 'G08', 'N01'],
  // Delhi → Gurugram
  'ROUTE-I': ['S31', 'S46', 'S31', 'S08', 'GG07', 'GG01', 'GG02', 'GG04', 'GG05', 'GG03', 'GG06', 'GG08'],
  // Faridabad → Delhi
  'ROUTE-J': ['F01', 'F02', 'F07', 'F03', 'F06', 'F04', 'F05'],
  // Agra local
  'ROUTE-K': ['A01', 'A05', 'A07', 'A04', 'A02', 'A06', 'A08', 'A03'],
  // Meerut → Noida inter-city
  'ROUTE-L': ['M01', 'M04', 'M02', 'M05', 'M03', 'M06', 'G01', 'G08', 'N05'],
};

module.exports = {
  demoStops,
  demoBuses,
  demoSearchResults,
  demoRouteSequences,
  DEMO_OTP: '123456',
};