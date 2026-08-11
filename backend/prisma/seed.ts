import { PrismaClient, CustomerType, CustomerStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting Nexora ERP seed...');

  // ── Clear in dependency order ───────────────────────────────────────────────
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data.');

  const hash = await bcrypt.hash('password123', 10);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. USERS
  // ═══════════════════════════════════════════════════════════════════════════
  const admin = await prisma.user.create({
    data: { name: 'Arjun Mehta', email: 'admin@erp.com', password: hash, role: 'ADMIN' },
  });
  const salesMgr = await prisma.user.create({
    data: { name: 'Priya Khanna', email: 'sales@erp.com', password: hash, role: 'SALES' },
  });
  const salesExec = await prisma.user.create({
    data: { name: 'Karan Bhatia', email: 'karan@erp.com', password: hash, role: 'SALES' },
  });
  const warehouseUser = await prisma.user.create({
    data: { name: 'Deepak Yadav', email: 'warehouse@erp.com', password: hash, role: 'WAREHOUSE' },
  });
  const warehouseExec = await prisma.user.create({
    data: { name: 'Suresh Nair', email: 'suresh@erp.com', password: hash, role: 'WAREHOUSE' },
  });
  const accounts = await prisma.user.create({
    data: { name: 'Rekha Iyer', email: 'accounts@erp.com', password: hash, role: 'ACCOUNTS' },
  });
  const accountsExec = await prisma.user.create({
    data: { name: 'Sonal Vyas', email: 'sonal@erp.com', password: hash, role: 'ACCOUNTS' },
  });

  console.log('✅ 7 users created.');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CUSTOMERS (25 realistic Indian B2B customers)
  // ═══════════════════════════════════════════════════════════════════════════
  const customerRows = [
    // ── ACTIVE DISTRIBUTORS ──
    {
      name: 'Rohan Arora',
      businessName: 'Arora Tech Distributors',
      mobile: '9811223344',
      email: 'rohan@aroratech.in',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.ACTIVE,
      address: '14-B, Nehru Place, New Delhi – 110019',
      followUpDate: daysAgo(2),
      notes: 'High-volume electronics distributor. Handles NCR region. Prefer morning calls.',
    },
    {
      name: 'Mukesh Joshi',
      businessName: 'Joshi & Sons Distributions',
      mobile: '9922334455',
      email: 'mukesh@joshidist.com',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.ACTIVE,
      address: '7, Zaveri Bazaar, Mumbai – 400002',
      followUpDate: daysFromNow(4),
      notes: 'Specialises in office automation products. Monthly order cycle.',
    },
    {
      name: 'Sanjay Kapoor',
      businessName: 'Kapoor Enterprises',
      mobile: '9833445566',
      email: 'skapoor@kapoorenterprises.in',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.ACTIVE,
      address: '22, Linking Road, Bandra, Mumbai – 400050',
      followUpDate: null,
      notes: 'Reliable payment history. Runs a chain of B2B outlets.',
    },
    // ── ACTIVE WHOLESALE ──
    {
      name: 'Amit Patel',
      businessName: 'Patel Wholesale Electronics',
      mobile: '9876543211',
      email: 'amit@patelwholesale.in',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      address: '45, Lamington Road, Mumbai – 400007',
      followUpDate: daysFromNow(1),
      notes: 'Regular peripherals buyer. Weekly order. Very price-sensitive.',
    },
    {
      name: 'Vikram Singh',
      businessName: 'Shree Trading Company',
      mobile: '9876543213',
      email: 'vikram@shreetrading.in',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      address: '9, Sector 17, Chandigarh – 160017',
      followUpDate: new Date(), // today
      notes: 'Requires weekly shipments of cables and accessories.',
    },
    {
      name: 'Harshita Garg',
      businessName: 'Garg Systems Pvt Ltd',
      mobile: '9844556677',
      email: 'harshita@gargsystems.com',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      address: '102, Electronic City, Bengaluru – 560100',
      followUpDate: daysFromNow(7),
      notes: 'Focused on networking hardware. High ticket orders quarterly.',
    },
    {
      name: 'Ravi Shankar',
      businessName: 'Shankar Tech Supplies',
      mobile: '9755667788',
      email: 'ravi@shankartech.com',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      address: '33, Anna Salai, Chennai – 600002',
      followUpDate: null,
      notes: 'South India distribution partner.',
    },
    {
      name: 'Deepa Menon',
      businessName: 'Menon Office Solutions',
      mobile: '9944556677',
      email: 'deepa@menonofficeworks.in',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      address: '78, MG Road, Kochi – 682016',
      followUpDate: daysFromNow(3),
      notes: 'Interested in ergonomic furniture for corporate clients.',
    },
    // ── ACTIVE RETAIL ──
    {
      name: 'Pooja Sharma',
      businessName: 'Sharma Electronics',
      mobile: '9988776655',
      email: 'pooja@sharmaelec.in',
      customerType: CustomerType.RETAIL,
      status: CustomerStatus.ACTIVE,
      address: '56, Sarojini Nagar Market, New Delhi – 110023',
      followUpDate: null,
      notes: 'Walk-in retail customer. Primarily buys accessories.',
    },
    {
      name: 'Nitin Agarwal',
      businessName: 'Agarwal IT Store',
      mobile: '9833221100',
      email: 'nitin@agarwalit.in',
      customerType: CustomerType.RETAIL,
      status: CustomerStatus.ACTIVE,
      address: '11, Lajpat Nagar Part 2, New Delhi – 110024',
      followUpDate: daysAgo(1),
      notes: 'Small retail. Buys headphones and accessories frequently.',
    },
    {
      name: 'Kavita Reddy',
      businessName: 'Reddy Computer World',
      mobile: '9700112233',
      email: 'kavita@reddycomputers.com',
      customerType: CustomerType.RETAIL,
      status: CustomerStatus.ACTIVE,
      address: '44, Himayatnagar, Hyderabad – 500029',
      followUpDate: daysFromNow(5),
      notes: 'Consistent monthly buyer. Prefers branded peripherals.',
    },
    // ── LEADS ──
    {
      name: 'Neha Gupta',
      businessName: 'Metro Retail Solutions',
      mobile: '9876543212',
      email: 'contact@metroretail.com',
      customerType: CustomerType.RETAIL,
      status: CustomerStatus.LEAD,
      address: '7, Rajouri Garden, New Delhi – 110027',
      followUpDate: daysFromNow(3),
      notes: 'Interested in bulk monitors for new office setup. Send quotation.',
    },
    {
      name: 'Ashok Tiwari',
      businessName: 'Tiwari Business Machines',
      mobile: '9811009988',
      email: 'ashok.tiwari@tbm.in',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.LEAD,
      address: '18, Hazratganj, Lucknow – 226001',
      followUpDate: daysFromNow(2),
      notes: 'Looking for long-term wholesale partnership. High potential account.',
    },
    {
      name: 'Preeti Malhotra',
      businessName: 'Malhotra InfoSystems',
      mobile: '9912345678',
      email: 'preeti@malhotrainfosys.com',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.LEAD,
      address: '66, Pusa Road, New Delhi – 110005',
      followUpDate: daysFromNow(6),
      notes: 'Met at Convergence India Expo. Strong interest in storage products.',
    },
    {
      name: 'Sunil Banerjee',
      businessName: 'Banerjee Trading',
      mobile: '9831234567',
      email: 'sunil.b@banerjeetrading.in',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.LEAD,
      address: '9, Park Street, Kolkata – 700016',
      followUpDate: daysAgo(3),
      notes: 'Overdue follow-up. Interested in networking products.',
    },
    {
      name: 'Geeta Pillai',
      businessName: 'Pillai Office Depot',
      mobile: '9747112233',
      email: 'geeta@pillaidepot.com',
      customerType: CustomerType.RETAIL,
      status: CustomerStatus.LEAD,
      address: '23, Trivandrum Road, Kochi – 682020',
      followUpDate: daysAgo(5),
      notes: 'Overdue follow-up. Interested in ergonomic chairs and monitors.',
    },
    {
      name: 'Rajesh Pandey',
      businessName: 'Pandey Infra Tech',
      mobile: '9901122334',
      email: 'rajesh@pandeyinfra.in',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.LEAD,
      address: '14, Boring Road, Patna – 800001',
      followUpDate: daysFromNow(10),
      notes: 'New lead from website. Follow up with product catalogue.',
    },
    // ── INACTIVE ──
    {
      name: 'Anjali Desai',
      businessName: 'Sunrise Enterprises',
      mobile: '9876543214',
      email: 'info@sunriseent.com',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.INACTIVE,
      address: '55, CG Road, Ahmedabad – 380009',
      followUpDate: null,
      notes: 'Account paused until Q4 2026. Revisit in October.',
    },
    {
      name: 'Vikas Choudhary',
      businessName: 'Choudhary Electronics',
      mobile: '9822334455',
      email: 'vikas@choudharyelectronics.in',
      customerType: CustomerType.RETAIL,
      status: CustomerStatus.INACTIVE,
      address: '8, Sardar Patel Marg, Jaipur – 302001',
      followUpDate: null,
      notes: 'Business restructuring. On hold for 6 months.',
    },
    {
      name: 'Mohan Lal',
      businessName: 'Lal Brothers Wholesale',
      mobile: '9711234560',
      email: 'mohanlal@lalbrothers.com',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.INACTIVE,
      address: '3, Sector 22, Noida – 201301',
      followUpDate: null,
      notes: 'Lost account to competitor. May revisit if pricing improves.',
    },
  ];

  const customers = [];
  for (const c of customerRows) {
    const created = await prisma.customer.create({ data: c });
    customers.push(created);
  }

  console.log(`✅ ${customers.length} customers created.`);

  // Aliases for seed readability
  const [
    cArora,      // 0  DISTRIBUTOR ACTIVE
    cJoshi,      // 1  DISTRIBUTOR ACTIVE
    cKapoor,     // 2  DISTRIBUTOR ACTIVE
    cPatel,      // 3  WHOLESALE ACTIVE
    cShree,      // 4  WHOLESALE ACTIVE (today follow-up)
    cGarg,       // 5  WHOLESALE ACTIVE
    cShankar,    // 6  WHOLESALE ACTIVE
    cMenon,      // 7  WHOLESALE ACTIVE
    cSharma,     // 8  RETAIL ACTIVE
    cAgarwal,    // 9  RETAIL ACTIVE
    cReddy,      // 10 RETAIL ACTIVE
    // leads start at 11
  ] = customers;

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. PRODUCTS (22 products)
  //
  // STRATEGY:
  //   - We define finalStock (currentStock that goes into DB)
  //   - totalIN = initial audit + additional inbound deliveries
  //   - totalOUT = confirmed challan dispatches
  //   - finalStock must equal totalIN - totalOUT
  //
  // We plan challans first, compute deductions, then set finalStock accordingly.
  // ═══════════════════════════════════════════════════════════════════════════

  //
  // Planned confirmed challan OUT quantities per product (index-based):
  //  P0  GM-WM-001  Wireless Mouse        → 20+10+15 = 45  OUT
  //  P1  AM-KB-002  Mechanical Keyboard   → 10+5     = 15  OUT
  //  P2  UC-HB-003  USB-C Hub             → 6+4      = 10  OUT
  //  P3  HD-CB-004  HDMI Cable            → 30+20    = 50  OUT
  //  P4  MN-24-005  24" IPS Monitor       → 4+2      = 6   OUT
  //  P5  MN-27-006  27" Monitor           → 3        = 3   OUT
  //  P6  ST-1T-007  1TB NVMe SSD          → 0        = 0   OUT  (out-of-stock)
  //  P7  ST-512-008 512GB NVMe SSD        → 10       = 10  OUT
  //  P8  AU-NC-009  Headphones            → 5+5      = 10  OUT
  //  P9  OF-CH-010  Ergonomic Chair       → 2        = 2   OUT
  //  P10 WC-HD-011  HD Webcam             → 8        = 8   OUT
  //  P11 LS-AB-012  Laptop Stand          → 15       = 15  OUT
  //  P12 UD-UC-013  USB-C Dock            → 4        = 4   OUT
  //  P13 NW-RT-014  Wi-Fi Router          → 5        = 5   OUT
  //  P14 NW-SW-015  Network Switch        → 2        = 2   OUT
  //  P15 PC-BS-016  Business Laptop       → 2        = 2   OUT
  //  P16 ET-CB-017  Ethernet Cable        → 40       = 40  OUT
  //  P17 BC-SC-018  Barcode Scanner       → 3        = 3   OUT
  //  P18 EX-SD-019  External SSD 500GB    → 5        = 5   OUT
  //  P19 PR-CB-020  Power Strip           → 10       = 10  OUT
  //  P20 KV-CM-021  KVM Switch            → 0        = 0   OUT
  //  P21 SP-CR-022  Spike Guard/Surge     → 20       = 20  OUT
  //

  // finalStock = (initialAudit + additionalIN) - challanOUT
  // We design stocks to hit these final values:
  const productData = [
    // P0  Healthy
    { name: 'Nexgen Wireless Mouse', sku: 'GM-WM-001', category: 'Peripherals', unitPrice: 1200, currentStock: 95, minimumStock: 30, warehouseLocation: 'A-01' },
    // P1  Healthy (barely above min)
    { name: 'Alpha Mechanical Keyboard', sku: 'AM-KB-002', category: 'Peripherals', unitPrice: 4500, currentStock: 45, minimumStock: 20, warehouseLocation: 'A-02' },
    // P2  Low stock (below minimum)
    { name: 'USB-C Hub 7-in-1', sku: 'UC-HB-003', category: 'Accessories', unitPrice: 2800, currentStock: 8, minimumStock: 15, warehouseLocation: 'B-01' },
    // P3  Healthy
    { name: 'HDMI 2.1 Cable 2m', sku: 'HD-CB-004', category: 'Accessories', unitPrice: 450, currentStock: 320, minimumStock: 80, warehouseLocation: 'B-02' },
    // P4  Low stock
    { name: '24-inch IPS Monitor', sku: 'MN-24-005', category: 'Displays', unitPrice: 12500, currentStock: 6, minimumStock: 10, warehouseLocation: 'C-01' },
    // P5  Healthy
    { name: '27-inch QHD Monitor', sku: 'MN-27-006', category: 'Displays', unitPrice: 18500, currentStock: 22, minimumStock: 8, warehouseLocation: 'C-02' },
    // P6  Out of stock
    { name: '1TB NVMe SSD', sku: 'ST-1T-007', category: 'Storage', unitPrice: 6200, currentStock: 0, minimumStock: 20, warehouseLocation: 'D-01' },
    // P7  Healthy
    { name: '512GB NVMe SSD', sku: 'ST-512-008', category: 'Storage', unitPrice: 3800, currentStock: 40, minimumStock: 15, warehouseLocation: 'D-02' },
    // P8  Healthy
    { name: 'Noise Cancelling Headphones', sku: 'AU-NC-009', category: 'Audio', unitPrice: 8900, currentStock: 32, minimumStock: 12, warehouseLocation: 'A-03' },
    // P9  Low stock
    { name: 'Ergonomic Office Chair', sku: 'OF-CH-010', category: 'Furniture', unitPrice: 15000, currentStock: 4, minimumStock: 8, warehouseLocation: 'E-01' },
    // P10 Healthy
    { name: 'HD Webcam 1080p', sku: 'WC-HD-011', category: 'Peripherals', unitPrice: 3200, currentStock: 27, minimumStock: 10, warehouseLocation: 'A-04' },
    // P11 Healthy
    { name: 'Adjustable Laptop Stand', sku: 'LS-AB-012', category: 'Accessories', unitPrice: 1800, currentStock: 55, minimumStock: 20, warehouseLocation: 'B-03' },
    // P12 Low stock
    { name: 'USB-C Docking Station', sku: 'UD-UC-013', category: 'Accessories', unitPrice: 5500, currentStock: 6, minimumStock: 10, warehouseLocation: 'B-04' },
    // P13 Healthy
    { name: 'Dual-Band Wi-Fi Router', sku: 'NW-RT-014', category: 'Networking', unitPrice: 3600, currentStock: 28, minimumStock: 10, warehouseLocation: 'C-03' },
    // P14 Healthy
    { name: '8-Port Network Switch', sku: 'NW-SW-015', category: 'Networking', unitPrice: 2200, currentStock: 18, minimumStock: 8, warehouseLocation: 'C-04' },
    // P15 Low stock (high-value)
    { name: 'Business Laptop 14-inch', sku: 'PC-BS-016', category: 'Computing', unitPrice: 58000, currentStock: 5, minimumStock: 5, warehouseLocation: 'D-03' },
    // P16 Healthy (bulk commodity)
    { name: 'Cat6 Ethernet Cable 5m', sku: 'ET-CB-017', category: 'Accessories', unitPrice: 280, currentStock: 180, minimumStock: 60, warehouseLocation: 'B-05' },
    // P17 Healthy
    { name: 'Wireless Barcode Scanner', sku: 'BC-SC-018', category: 'Operations', unitPrice: 4800, currentStock: 12, minimumStock: 5, warehouseLocation: 'D-04' },
    // P18 Healthy
    { name: 'External SSD 500GB', sku: 'EX-SD-019', category: 'Storage', unitPrice: 5200, currentStock: 20, minimumStock: 8, warehouseLocation: 'D-05' },
    // P19 Healthy
    { name: '6-Outlet Power Strip', sku: 'PR-CB-020', category: 'Accessories', unitPrice: 850, currentStock: 75, minimumStock: 25, warehouseLocation: 'B-06' },
    // P20 Out of stock (2nd)
    { name: 'KVM Switch 4-Port', sku: 'KV-CM-021', category: 'Networking', unitPrice: 7200, currentStock: 0, minimumStock: 5, warehouseLocation: 'C-05' },
    // P21 Healthy
    { name: 'Surge Protector 8-Port', sku: 'SP-CR-022', category: 'Accessories', unitPrice: 1100, currentStock: 60, minimumStock: 20, warehouseLocation: 'B-07' },
  ];

  const products = [];
  for (const p of productData) {
    const created = await prisma.product.create({ data: p });
    products.push(created);
  }

  console.log(`✅ ${products.length} products created.`);

  // Aliases
  const [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21] = products;

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. STOCK MOVEMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // For each product:
  //   • Initial warehouse audit (all products, quantities = initialAudit)
  //   • Additional INbound deliveries from suppliers
  //   • Manual adjustments (OUT for damage, shrinkage)
  //   • Challan-related OUT movements are created below with each challan
  //
  // The math for each product:
  //   finalStock (in DB) = initialAudit + additionalIN - manualOUT - challanOUT
  //
  // We design the movements so the math holds.
  // ═══════════════════════════════════════════════════════════════════════════

  // Helper: create a stock movement with a specific date
  const movement = (
    productId: string,
    quantity: number,
    type: 'IN' | 'OUT',
    reason: string,
    createdById: string,
    daysBack: number = 0
  ) =>
    prisma.stockMovement.create({
      data: {
        productId,
        quantity,
        type,
        reason,
        createdBy: createdById,
        createdAt: daysAgo(daysBack),
      },
    });

  // ── P0: Wireless Mouse — finalStock=95 = 140 - 45(challan) ─────────────────
  await movement(p0.id, 140, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P1: Mechanical Keyboard — finalStock=45 = 60 - 15(challan) ─────────────
  await movement(p1.id, 60, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P2: USB-C Hub — finalStock=8 = 18 - 10(challan) ────────────────────────
  await movement(p2.id, 18, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P3: HDMI Cable — finalStock=320 = 370 - 50(challan) ────────────────────
  await movement(p3.id, 250, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  await movement(p3.id, 120, 'IN', 'Supplier delivery — Orient Cables', warehouseExec.id, 25);
  // ── P4: 24" Monitor — finalStock=6 = 12 - 6(challan) ───────────────────────
  await movement(p4.id, 12, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P5: 27" Monitor — finalStock=22 = 25 - 3(challan) ──────────────────────
  await movement(p5.id, 25, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P6: 1TB NVMe SSD — finalStock=0 = 30 - 25(manual shrink) - 5(damage) ──
  await movement(p6.id, 30, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  await movement(p6.id, 25, 'OUT', 'Stock sold — pre-system orders (legacy)', warehouseExec.id, 45);
  await movement(p6.id, 5, 'OUT', 'Damaged stock — static discharge incident', warehouseUser.id, 20);
  // ── P7: 512GB NVMe SSD — finalStock=40 = 50 - 10(challan) ─────────────────
  await movement(p7.id, 50, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P8: Headphones — finalStock=32 = 42 - 10(challan) ──────────────────────
  await movement(p8.id, 42, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P9: Ergonomic Chair — finalStock=4 = 6 - 2(challan) ────────────────────
  await movement(p9.id, 6, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P10: HD Webcam — finalStock=27 = 35 - 8(challan) ───────────────────────
  await movement(p10.id, 35, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P11: Laptop Stand — finalStock=55 = 70 - 15(challan) ───────────────────
  await movement(p11.id, 70, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P12: USB-C Dock — finalStock=6 = 10 - 4(challan) ───────────────────────
  await movement(p12.id, 10, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P13: Wi-Fi Router — finalStock=28 = 33 - 5(challan) ────────────────────
  await movement(p13.id, 33, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P14: Network Switch — finalStock=18 = 20 - 2(challan) ──────────────────
  await movement(p14.id, 20, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P15: Business Laptop — finalStock=5 = 7 - 2(challan) ───────────────────
  await movement(p15.id, 7, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P16: Ethernet Cable — finalStock=180 = 220 - 40(challan) ───────────────
  await movement(p16.id, 150, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  await movement(p16.id, 70, 'IN', 'Supplier delivery — NetPro Cables', warehouseExec.id, 20);
  // ── P17: Barcode Scanner — finalStock=12 = 15 - 3(challan) ─────────────────
  await movement(p17.id, 15, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P18: External SSD — finalStock=20 = 25 - 5(challan) ────────────────────
  await movement(p18.id, 25, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P19: Power Strip — finalStock=75 = 85 - 10(challan) ────────────────────
  await movement(p19.id, 85, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── P20: KVM Switch — finalStock=0 = 8 - 8 ─────────────────────────────────
  await movement(p20.id, 8, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  await movement(p20.id, 8, 'OUT', 'Stock transfer — returned to supplier (discontinued)', warehouseUser.id, 15);
  // ── P21: Surge Protector — finalStock=60 = 80 - 20(challan) ────────────────
  await movement(p21.id, 80, 'IN', 'Initial warehouse audit', warehouseUser.id, 60);
  // ── Additional inbound/adjustment movements for realism ────────────────────
  // Stock count adjustments and replenishments (no net change to final stock totals
  // as these were already factored into currentStock set above)
  // Just adding 2 more real movements for movement log richness:
  await movement(p11.id, 10, 'IN', 'Warehouse replenishment — laptop stands restocked', warehouseExec.id, 30);
  await movement(p11.id, 10, 'OUT', 'Stock adjustment — quantity correction after count', warehouseUser.id, 29);

  console.log('✅ Stock movements created.');

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CHALLANS
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Rules (from challan.service.ts):
  //   CONFIRMED → deduct currentStock + create OUT movement (done in service)
  //   But since we're seeding directly via Prisma, we do NOT call the service.
  //   Instead: we manually create the OUT movements + the challan with CONFIRMED status.
  //   The currentStock is already set in productData to reflect the post-deduction state.
  //
  // 12 CONFIRMED  + 4 DRAFT  + 3 CANCELLED = 19 challans
  // ═══════════════════════════════════════════════════════════════════════════

  const challanHelper = async (
    num: string,
    customerId: string,
    status: 'CONFIRMED' | 'DRAFT' | 'CANCELLED',
    createdById: string,
    items: { productId: string; name: string; sku: string; price: number; qty: number }[],
    daysBack: number
  ) => {
    const totalQty = items.reduce((s, i) => s + i.qty, 0);
    const c = await prisma.challan.create({
      data: {
        challanNumber: num,
        customerId,
        totalQuantity: totalQty,
        status,
        createdBy: createdById,
        createdAt: daysAgo(daysBack),
        updatedAt: daysAgo(daysBack),
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            productNameSnapshot: i.name,
            skuSnapshot: i.sku,
            unitPriceSnapshot: i.price,
            quantity: i.qty,
          })),
        },
      },
    });

    // Create OUT movements for CONFIRMED challans
    if (status === 'CONFIRMED') {
      for (const i of items) {
        await prisma.stockMovement.create({
          data: {
            productId: i.productId,
            quantity: i.qty,
            type: 'OUT',
            reason: `Challan ${num} confirmed`,
            createdBy: createdById,
            createdAt: daysAgo(daysBack),
          },
        });
      }
    }

    return c;
  };

  // ── CONFIRMED CHALLANS (12) ─────────────────────────────────────────────────

  // CH-2026-00001 | Arora Tech Distributors | 45 days ago
  await challanHelper('CH-2026-00001', cArora.id, 'CONFIRMED', salesMgr.id, [
    { productId: p0.id, name: p0.name, sku: p0.sku, price: p0.unitPrice, qty: 20 },
    { productId: p3.id, name: p3.name, sku: p3.sku, price: p3.unitPrice, qty: 30 },
  ], 45);

  // CH-2026-00002 | Patel Wholesale | 38 days ago
  await challanHelper('CH-2026-00002', cPatel.id, 'CONFIRMED', salesMgr.id, [
    { productId: p1.id, name: p1.name, sku: p1.sku, price: p1.unitPrice, qty: 10 },
    { productId: p2.id, name: p2.name, sku: p2.sku, price: p2.unitPrice, qty: 6 },
  ], 38);

  // CH-2026-00003 | Shree Trading | 32 days ago
  await challanHelper('CH-2026-00003', cShree.id, 'CONFIRMED', salesExec.id, [
    { productId: p3.id, name: p3.name, sku: p3.sku, price: p3.unitPrice, qty: 20 },
    { productId: p16.id, name: p16.name, sku: p16.sku, price: p16.unitPrice, qty: 40 },
  ], 32);

  // CH-2026-00004 | Garg Systems | 28 days ago
  await challanHelper('CH-2026-00004', cGarg.id, 'CONFIRMED', salesMgr.id, [
    { productId: p5.id, name: p5.name, sku: p5.sku, price: p5.unitPrice, qty: 3 },
    { productId: p13.id, name: p13.name, sku: p13.sku, price: p13.unitPrice, qty: 5 },
    { productId: p14.id, name: p14.name, sku: p14.sku, price: p14.unitPrice, qty: 2 },
  ], 28);

  // CH-2026-00005 | Joshi Distributions | 22 days ago
  await challanHelper('CH-2026-00005', cJoshi.id, 'CONFIRMED', salesMgr.id, [
    { productId: p0.id, name: p0.name, sku: p0.sku, price: p0.unitPrice, qty: 10 },
    { productId: p1.id, name: p1.name, sku: p1.sku, price: p1.unitPrice, qty: 5 },
    { productId: p11.id, name: p11.name, sku: p11.sku, price: p11.unitPrice, qty: 15 },
  ], 22);

  // CH-2026-00006 | Kapoor Enterprises | 18 days ago
  await challanHelper('CH-2026-00006', cKapoor.id, 'CONFIRMED', salesExec.id, [
    { productId: p8.id, name: p8.name, sku: p8.sku, price: p8.unitPrice, qty: 5 },
    { productId: p10.id, name: p10.name, sku: p10.sku, price: p10.unitPrice, qty: 8 },
    { productId: p19.id, name: p19.name, sku: p19.sku, price: p19.unitPrice, qty: 10 },
  ], 18);

  // CH-2026-00007 | Menon Office Solutions | 15 days ago
  await challanHelper('CH-2026-00007', cMenon.id, 'CONFIRMED', salesMgr.id, [
    { productId: p9.id, name: p9.name, sku: p9.sku, price: p9.unitPrice, qty: 2 },
    { productId: p12.id, name: p12.name, sku: p12.sku, price: p12.unitPrice, qty: 4 },
  ], 15);

  // CH-2026-00008 | Shankar Tech | 12 days ago
  await challanHelper('CH-2026-00008', cShankar.id, 'CONFIRMED', salesExec.id, [
    { productId: p0.id, name: p0.name, sku: p0.sku, price: p0.unitPrice, qty: 15 },
    { productId: p2.id, name: p2.name, sku: p2.sku, price: p2.unitPrice, qty: 4 },
  ], 12);

  // CH-2026-00009 | Agarwal IT Store | 9 days ago
  await challanHelper('CH-2026-00009', cAgarwal.id, 'CONFIRMED', salesMgr.id, [
    { productId: p8.id, name: p8.name, sku: p8.sku, price: p8.unitPrice, qty: 5 },
    { productId: p18.id, name: p18.name, sku: p18.sku, price: p18.unitPrice, qty: 5 },
  ], 9);

  // CH-2026-00010 | Reddy Computer World | 7 days ago
  await challanHelper('CH-2026-00010', cReddy.id, 'CONFIRMED', salesExec.id, [
    { productId: p4.id, name: p4.name, sku: p4.sku, price: p4.unitPrice, qty: 4 },
    { productId: p7.id, name: p7.name, sku: p7.sku, price: p7.unitPrice, qty: 10 },
  ], 7);

  // CH-2026-00011 | Arora Tech (2nd order) | 5 days ago
  await challanHelper('CH-2026-00011', cArora.id, 'CONFIRMED', salesMgr.id, [
    { productId: p15.id, name: p15.name, sku: p15.sku, price: p15.unitPrice, qty: 2 },
    { productId: p17.id, name: p17.name, sku: p17.sku, price: p17.unitPrice, qty: 3 },
  ], 5);

  // CH-2026-00012 | Patel Wholesale (2nd order) | 3 days ago
  await challanHelper('CH-2026-00012', cPatel.id, 'CONFIRMED', salesMgr.id, [
    { productId: p4.id, name: p4.name, sku: p4.sku, price: p4.unitPrice, qty: 2 },
    { productId: p21.id, name: p21.name, sku: p21.sku, price: p21.unitPrice, qty: 20 },
  ], 3);

  // ── DRAFT CHALLANS (4) ──────────────────────────────────────────────────────

  // CH-2026-00013 | Sharma Electronics | 2 days ago
  await challanHelper('CH-2026-00013', cSharma.id, 'DRAFT', salesExec.id, [
    { productId: p0.id, name: p0.name, sku: p0.sku, price: p0.unitPrice, qty: 15 },
    { productId: p3.id, name: p3.name, sku: p3.sku, price: p3.unitPrice, qty: 25 },
  ], 2);

  // CH-2026-00014 | Garg Systems (pending order) | yesterday
  await challanHelper('CH-2026-00014', cGarg.id, 'DRAFT', salesMgr.id, [
    { productId: p5.id, name: p5.name, sku: p5.sku, price: p5.unitPrice, qty: 4 },
    { productId: p10.id, name: p10.name, sku: p10.sku, price: p10.unitPrice, qty: 6 },
  ], 1);

  // CH-2026-00015 | Menon Office (new inquiry) | today
  await challanHelper('CH-2026-00015', cMenon.id, 'DRAFT', salesExec.id, [
    { productId: p11.id, name: p11.name, sku: p11.sku, price: p11.unitPrice, qty: 10 },
    { productId: p19.id, name: p19.name, sku: p19.sku, price: p19.unitPrice, qty: 15 },
  ], 0);

  // CH-2026-00016 | Joshi (pending quotation) | today
  await challanHelper('CH-2026-00016', cJoshi.id, 'DRAFT', salesMgr.id, [
    { productId: p13.id, name: p13.name, sku: p13.sku, price: p13.unitPrice, qty: 8 },
    { productId: p14.id, name: p14.name, sku: p14.sku, price: p14.unitPrice, qty: 4 },
  ], 0);

  // ── CANCELLED CHALLANS (3) ──────────────────────────────────────────────────

  // CH-2026-00017 | Kapoor (customer cancelled) | 20 days ago
  await challanHelper('CH-2026-00017', cKapoor.id, 'CANCELLED', salesExec.id, [
    { productId: p5.id, name: p5.name, sku: p5.sku, price: p5.unitPrice, qty: 2 },
  ], 20);

  // CH-2026-00018 | Sharma (product unavailable) | 14 days ago
  await challanHelper('CH-2026-00018', cSharma.id, 'CANCELLED', salesMgr.id, [
    { productId: p6.id, name: p6.name, sku: p6.sku, price: p6.unitPrice, qty: 5 },
  ], 14);

  // CH-2026-00019 | Shankar (pricing dispute) | 8 days ago
  await challanHelper('CH-2026-00019', cShankar.id, 'CANCELLED', salesExec.id, [
    { productId: p8.id, name: p8.name, sku: p8.sku, price: p8.unitPrice, qty: 3 },
  ], 8);

  console.log('✅ 19 challans created (12 confirmed, 4 draft, 3 cancelled).');

  // ── Final summary ──────────────────────────────────────────────────────────
  const userCount = await prisma.user.count();
  const customerCount = await prisma.customer.count();
  const productCount = await prisma.product.count();
  const movementCount = await prisma.stockMovement.count();
  const challanCount = await prisma.challan.count();
  const confirmedCount = await prisma.challan.count({ where: { status: 'CONFIRMED' } });
  const draftCount = await prisma.challan.count({ where: { status: 'DRAFT' } });
  const cancelledCount = await prisma.challan.count({ where: { status: 'CANCELLED' } });

  const lowStockProducts = await prisma.$queryRaw<any[]>`
    SELECT name FROM "Product" WHERE "currentStock" <= "minimumStock" AND "currentStock" > 0
  `;
  const outOfStockProducts = await prisma.$queryRaw<any[]>`
    SELECT name FROM "Product" WHERE "currentStock" = 0
  `;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  NEXORA ERP — SEED COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Users:            ${userCount}`);
  console.log(`  Customers:        ${customerCount}`);
  console.log(`  Products:         ${productCount}`);
  console.log(`  Stock Movements:  ${movementCount}`);
  console.log(`  Challans:         ${challanCount}`);
  console.log(`    Confirmed:      ${confirmedCount}`);
  console.log(`    Draft:          ${draftCount}`);
  console.log(`    Cancelled:      ${cancelledCount}`);
  console.log(`  Low Stock:        ${lowStockProducts.length} products`);
  console.log(`  Out of Stock:     ${outOfStockProducts.length} products`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
