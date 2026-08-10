/**
 * Challan API full test suite (supertest, in-memory).
 * Covers all 3 business logic scenarios plus CRUD and authorization.
 */
const request = require('supertest');
process.env.SKIP_LISTEN = 'true';
const { app } = require('./dist/server.js');

async function login(email) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });
  return res.body.data?.token;
}

// Helper: create a product with specified stock
async function createProduct(token, name, stock, minStock = 5) {
  const sku = `TST-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, sku, category: 'Test', unitPrice: 100, currentStock: stock, minimumStock: minStock, warehouseLocation: 'X-01' });
  return res.body.data;
}

// Helper: get product stock
async function getStock(token, productId) {
  const res = await request(app)
    .get(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${token}`);
  return res.body.data?.currentStock;
}

// Helper: get movement count for product
async function getOutMovements(token, productId) {
  const res = await request(app)
    .get(`/api/inventory/movements?productId=${productId}&type=OUT`)
    .set('Authorization', `Bearer ${token}`);
  return res.body.data?.pagination?.total ?? 0;
}

async function run() {
  const adminToken     = await login('admin@erp.com');
  const salesToken     = await login('sales@erp.com');
  const warehouseToken = await login('warehouse@erp.com');
  const accountsToken  = await login('accounts@erp.com');

  // Get a seeded customer
  const custRes = await request(app)
    .get('/api/customers?limit=1')
    .set('Authorization', `Bearer ${adminToken}`);
  const customerId = custRes.body.data?.customers?.[0]?.id;

  console.log('\n══════════════════════════════════════════════════');
  console.log('  CHALLAN CRUD TESTS');
  console.log('══════════════════════════════════════════════════');

  // Create two products for CRUD tests
  const pA = await createProduct(adminToken, 'Alpha Product', 100, 10);
  const pB = await createProduct(adminToken, 'Beta Product', 80, 10);

  console.log(`\n[1] POST /api/challans — SALES creates challan (DRAFT)\n`);
  const c1 = await request(app)
    .post('/api/challans')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ customerId, items: [{ productId: pA.id, quantity: 5 }, { productId: pB.id, quantity: 3 }] });
  console.log(`[${c1.status}]`, JSON.stringify({
    success: c1.body.success,
    challanNumber: c1.body.data?.challanNumber,
    status: c1.body.data?.status,
    totalQty: c1.body.data?.totalQuantity,
    items: c1.body.data?.items?.length,
  }));
  const challanId = c1.body.data?.id;
  const challanNumber = c1.body.data?.challanNumber;

  console.log(`\n[2] POST /api/challans — sequential challan number (CH-YYYY-NNNNN)\n`);
  const c2 = await request(app)
    .post('/api/challans')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ customerId, items: [{ productId: pA.id, quantity: 2 }] });
  console.log(`[${c2.status}] challanNumber=${c2.body.data?.challanNumber}`);
  const challanId2 = c2.body.data?.id;

  console.log(`\n[3] GET /api/challans — paginated list\n`);
  const listRes = await request(app)
    .get('/api/challans?page=1&limit=5')
    .set('Authorization', `Bearer ${accountsToken}`);
  console.log(`[${listRes.status}] total=${listRes.body.data?.pagination?.total}`);

  console.log(`\n[4] GET /api/challans?status=DRAFT — filter by status\n`);
  const draftList = await request(app)
    .get('/api/challans?status=DRAFT')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${draftList.status}] DRAFT challans=${draftList.body.data?.pagination?.total}`);

  console.log(`\n[5] GET /api/challans/:id — get single with snapshot data\n`);
  const single = await request(app)
    .get(`/api/challans/${challanId}`)
    .set('Authorization', `Bearer ${salesToken}`);
  const firstItem = single.body.data?.items?.[0];
  console.log(`[${single.status}]`, JSON.stringify({
    challanNumber: single.body.data?.challanNumber,
    customer: single.body.data?.customer?.name,
    snapshot_name: firstItem?.productNameSnapshot,
    snapshot_sku: firstItem?.skuSnapshot,
    snapshot_price: firstItem?.unitPriceSnapshot,
  }));

  console.log(`\n[6] PUT /api/challans/:id — update DRAFT challan items\n`);
  const pC = await createProduct(adminToken, 'Gamma Product', 50, 5);
  const update = await request(app)
    .put(`/api/challans/${challanId}`)
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ items: [{ productId: pA.id, quantity: 10 }, { productId: pC.id, quantity: 4 }] });
  console.log(`[${update.status}]`, JSON.stringify({ status: update.body.data?.status, items: update.body.data?.items?.length }));

  console.log(`\n[7] WAREHOUSE blocked from creating challan → 403\n`);
  const blocked = await request(app)
    .post('/api/challans')
    .set('Authorization', `Bearer ${warehouseToken}`)
    .send({ customerId, items: [{ productId: pA.id, quantity: 1 }] });
  console.log(`[${blocked.status}]`, JSON.stringify(blocked.body));

  console.log(`\n[8] Zod validation — no items → 400\n`);
  const zodFail = await request(app)
    .post('/api/challans')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ customerId, items: [] });
  console.log(`[${zodFail.status}]`, JSON.stringify(zodFail.body));

  console.log(`\n[9] Invalid customer ID → 404\n`);
  const badCust = await request(app)
    .post('/api/challans')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ customerId: '00000000-0000-0000-0000-000000000000', items: [{ productId: pA.id, quantity: 1 }] });
  console.log(`[${badCust.status}]`, JSON.stringify(badCust.body));

  console.log('\n══════════════════════════════════════════════════');
  console.log('  SCENARIO 1: Sufficient Stock — Confirm Success');
  console.log('  Stock=50, Request=5 → Stock becomes 45');
  console.log('══════════════════════════════════════════════════');

  const pScen1 = await createProduct(adminToken, 'Scenario1 Product', 50, 5);
  const stockBefore1 = await getStock(adminToken, pScen1.id);
  const outBefore1 = await getOutMovements(adminToken, pScen1.id);

  const sc1Challan = await request(app)
    .post('/api/challans')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ customerId, items: [{ productId: pScen1.id, quantity: 5 }] });
  const sc1Id = sc1Challan.body.data?.id;

  const sc1Confirm = await request(app)
    .post(`/api/challans/${sc1Id}/confirm`)
    .set('Authorization', `Bearer ${warehouseToken}`);

  const stockAfter1 = await getStock(adminToken, pScen1.id);
  const outAfter1 = await getOutMovements(adminToken, pScen1.id);

  console.log(`\n  Challan status : ${sc1Confirm.body.data?.status}`);
  console.log(`  Stock before   : ${stockBefore1}`);
  console.log(`  Stock after    : ${stockAfter1}`);
  console.log(`  OUT movements  : ${outBefore1} → ${outAfter1}`);
  console.log(`  [${sc1Confirm.status}] PASS=${sc1Confirm.status === 200 && stockAfter1 === 45 && outAfter1 === outBefore1 + 1 ? '✅' : '❌'}`);

  console.log('\n══════════════════════════════════════════════════');
  console.log('  SCENARIO 2: Insufficient Stock — Must Fail');
  console.log('  Stock=3, Request=10 → Reject, stock stays 3');
  console.log('══════════════════════════════════════════════════');

  const pScen2 = await createProduct(adminToken, 'Scenario2 Product', 3, 1);
  const stockBefore2 = await getStock(adminToken, pScen2.id);
  const outBefore2 = await getOutMovements(adminToken, pScen2.id);

  const sc2Challan = await request(app)
    .post('/api/challans')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ customerId, items: [{ productId: pScen2.id, quantity: 10 }] });
  const sc2Id = sc2Challan.body.data?.id;

  const sc2Confirm = await request(app)
    .post(`/api/challans/${sc2Id}/confirm`)
    .set('Authorization', `Bearer ${warehouseToken}`);

  // Re-fetch challan — must still be DRAFT
  const sc2Refetch = await request(app)
    .get(`/api/challans/${sc2Id}`)
    .set('Authorization', `Bearer ${adminToken}`);

  const stockAfter2 = await getStock(adminToken, pScen2.id);
  const outAfter2 = await getOutMovements(adminToken, pScen2.id);

  console.log(`\n  Confirm status : ${sc2Confirm.status} (expect 400)`);
  console.log(`  Error message  : ${sc2Confirm.body.message}`);
  console.log(`  Challan status : ${sc2Refetch.body.data?.status} (expect DRAFT)`);
  console.log(`  Stock before   : ${stockBefore2}`);
  console.log(`  Stock after    : ${stockAfter2} (must be unchanged)`);
  console.log(`  OUT movements  : ${outBefore2} → ${outAfter2} (must be unchanged)`);
  console.log(`  PASS=${sc2Confirm.status === 400 && sc2Refetch.body.data?.status === 'DRAFT' && stockAfter2 === stockBefore2 && outAfter2 === outBefore2 ? '✅' : '❌'}`);

  console.log('\n══════════════════════════════════════════════════');
  console.log('  SCENARIO 3: Multi-product — One fails → Full Rollback');
  console.log('══════════════════════════════════════════════════');

  const pOk  = await createProduct(adminToken, 'Scenario3-OK Product',  100, 5);
  const pFail = await createProduct(adminToken, 'Scenario3-Fail Product', 2, 1);
  const stockOkBefore   = await getStock(adminToken, pOk.id);
  const stockFailBefore = await getStock(adminToken, pFail.id);
  const outOkBefore     = await getOutMovements(adminToken, pOk.id);
  const outFailBefore   = await getOutMovements(adminToken, pFail.id);

  // Challan requests 10 from pOk (✅ has 100) AND 50 from pFail (❌ has only 2)
  const sc3Challan = await request(app)
    .post('/api/challans')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ customerId, items: [{ productId: pOk.id, quantity: 10 }, { productId: pFail.id, quantity: 50 }] });
  const sc3Id = sc3Challan.body.data?.id;

  const sc3Confirm = await request(app)
    .post(`/api/challans/${sc3Id}/confirm`)
    .set('Authorization', `Bearer ${warehouseToken}`);

  const sc3Refetch = await request(app)
    .get(`/api/challans/${sc3Id}`)
    .set('Authorization', `Bearer ${adminToken}`);

  const stockOkAfter   = await getStock(adminToken, pOk.id);
  const stockFailAfter = await getStock(adminToken, pFail.id);
  const outOkAfter     = await getOutMovements(adminToken, pOk.id);
  const outFailAfter   = await getOutMovements(adminToken, pFail.id);

  console.log(`\n  Confirm status    : ${sc3Confirm.status} (expect 400)`);
  console.log(`  Error message     : ${sc3Confirm.body.message}`);
  console.log(`  Challan status    : ${sc3Refetch.body.data?.status} (expect DRAFT)`);
  console.log(`  OK product stock  : ${stockOkBefore} → ${stockOkAfter} (must be unchanged)`);
  console.log(`  Fail product stock: ${stockFailBefore} → ${stockFailAfter} (must be unchanged)`);
  console.log(`  OK OUT movements  : ${outOkBefore} → ${outOkAfter} (must be unchanged)`);
  console.log(`  Fail OUT movements: ${outFailBefore} → ${outFailAfter} (must be unchanged)`);
  const sc3Pass = sc3Confirm.status === 400
    && sc3Refetch.body.data?.status === 'DRAFT'
    && stockOkAfter === stockOkBefore
    && stockFailAfter === stockFailBefore
    && outOkAfter === outOkBefore
    && outFailAfter === outFailBefore;
  console.log(`  PASS=${sc3Pass ? '✅' : '❌'}`);

  console.log('\n══════════════════════════════════════════════════');
  console.log('  EDGE CASE TESTS');
  console.log('══════════════════════════════════════════════════');

  console.log(`\n[E1] Confirm already-confirmed challan → 400\n`);
  const e1 = await request(app)
    .post(`/api/challans/${sc1Id}/confirm`)
    .set('Authorization', `Bearer ${warehouseToken}`);
  console.log(`[${e1.status}]`, JSON.stringify(e1.body));

  console.log(`\n[E2] Cancel already-cancelled challan → 400\n`);
  // First cancel
  await request(app).post(`/api/challans/${sc2Id}/cancel`).set('Authorization', `Bearer ${salesToken}`);
  const e2 = await request(app)
    .post(`/api/challans/${sc2Id}/cancel`)
    .set('Authorization', `Bearer ${salesToken}`);
  console.log(`[${e2.status}]`, JSON.stringify(e2.body));

  console.log(`\n[E3] Cancel confirmed challan → 400\n`);
  const e3 = await request(app)
    .post(`/api/challans/${sc1Id}/cancel`)
    .set('Authorization', `Bearer ${salesToken}`);
  console.log(`[${e3.status}]`, JSON.stringify(e3.body));

  console.log(`\n[E4] Edit a CONFIRMED challan → 400\n`);
  const e4 = await request(app)
    .put(`/api/challans/${sc1Id}`)
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ items: [{ productId: pA.id, quantity: 1 }] });
  console.log(`[${e4.status}]`, JSON.stringify(e4.body));

  console.log(`\n[E5] GET /api/challans?search=CH-${new Date().getFullYear()} — search\n`);
  const e5 = await request(app)
    .get(`/api/challans?search=CH-${new Date().getFullYear()}`)
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${e5.status}] found=${e5.body.data?.pagination?.total}`);

  console.log('\n✅ All challan tests complete.\n');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
