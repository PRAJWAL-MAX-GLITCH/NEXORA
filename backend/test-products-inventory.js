/**
 * Product & Inventory API test using supertest (in-memory).
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

async function run() {
  const testSku = `WGT-${Date.now()}`;
  const adminToken     = await login('admin@erp.com');
  const warehouseToken = await login('warehouse@erp.com');
  const salesToken     = await login('sales@erp.com');
  const accountsToken  = await login('accounts@erp.com');

  // ─── PRODUCTS ────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════');
  console.log('  PRODUCT TESTS');
  console.log('══════════════════════════════════════');

  console.log('\n[1] POST /api/products — WAREHOUSE creates product\n');
  const p1 = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${warehouseToken}`)
    .send({ name: 'Widget A', sku: testSku, category: 'Widgets', unitPrice: 250, currentStock: 100, minimumStock: 20, warehouseLocation: 'B-01' });
  console.log(`[${p1.status}]`, JSON.stringify({ success: p1.body.success, sku: p1.body.data?.sku, stock: p1.body.data?.currentStock }));
  const productId = p1.body.data?.id;

  console.log('\n[2] POST /api/products — duplicate SKU → 409\n');
  const p2 = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Widget A Dupe', sku: testSku, category: 'Widgets', unitPrice: 100 });
  console.log(`[${p2.status}]`, JSON.stringify(p2.body));

  console.log('\n[3] POST /api/products — SALES blocked → 403\n');
  const p3 = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ name: 'Sneaky Product', sku: 'SNK-001', category: 'X', unitPrice: 10 });
  console.log(`[${p3.status}]`, JSON.stringify(p3.body));

  console.log('\n[4] GET /api/products — list with pagination\n');
  const pList = await request(app)
    .get('/api/products?page=1&limit=5')
    .set('Authorization', `Bearer ${accountsToken}`);
  console.log(`[${pList.status}] total=${pList.body.data?.pagination?.total} returned=${pList.body.data?.products?.length}`);

  console.log('\n[5] GET /api/products?search=Widget — search\n');
  const pSearch = await request(app)
    .get('/api/products?search=Widget')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${pSearch.status}] found=${pSearch.body.data?.pagination?.total}`);

  console.log('\n[6] GET /api/products/:id — get single\n');
  const pSingle = await request(app)
    .get(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${salesToken}`);
  console.log(`[${pSingle.status}]`, JSON.stringify({ name: pSingle.body.data?.name, sku: pSingle.body.data?.sku }));

  console.log('\n[7] PUT /api/products/:id — WAREHOUSE updates\n');
  const pUpdate = await request(app)
    .put(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${warehouseToken}`)
    .send({ unitPrice: 275, minimumStock: 25 });
  console.log(`[${pUpdate.status}]`, JSON.stringify({ unitPrice: pUpdate.body.data?.unitPrice, minimumStock: pUpdate.body.data?.minimumStock }));

  console.log('\n[8] Zod validation error — missing required fields → 400\n');
  const pBad = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: '', unitPrice: -5 });
  console.log(`[${pBad.status}]`, JSON.stringify(pBad.body));

  // ─── INVENTORY ────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════');
  console.log('  INVENTORY TESTS');
  console.log('══════════════════════════════════════');

  console.log('\n[9] POST /api/inventory/stock-in — WAREHOUSE adds stock\n');
  const si1 = await request(app)
    .post('/api/inventory/stock-in')
    .set('Authorization', `Bearer ${warehouseToken}`)
    .send({ productId, quantity: 50, reason: 'Restock from supplier' });
  console.log(`[${si1.status}]`, JSON.stringify({ newStock: si1.body.data?.product?.currentStock, movementType: si1.body.data?.movement?.type }));

  console.log('\n[10] POST /api/inventory/stock-out — SALES dispatches stock\n');
  const so1 = await request(app)
    .post('/api/inventory/stock-out')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ productId, quantity: 30, reason: 'Customer order #1001' });
  console.log(`[${so1.status}]`, JSON.stringify({ newStock: so1.body.data?.product?.currentStock, movementType: so1.body.data?.movement?.type }));

  console.log('\n[11] POST /api/inventory/stock-out — insufficient stock → 400\n');
  const soFail = await request(app)
    .post('/api/inventory/stock-out')
    .set('Authorization', `Bearer ${warehouseToken}`)
    .send({ productId, quantity: 99999, reason: 'Test over-dispatch' });
  console.log(`[${soFail.status}]`, JSON.stringify(soFail.body));

  console.log('\n[12] POST /api/inventory/stock-out — ACCOUNTS blocked → 403\n');
  const soBlocked = await request(app)
    .post('/api/inventory/stock-out')
    .set('Authorization', `Bearer ${accountsToken}`)
    .send({ productId, quantity: 1, reason: 'Should fail' });
  console.log(`[${soBlocked.status}]`, JSON.stringify(soBlocked.body));

  console.log('\n[13] GET /api/inventory/movements — paginated movement log\n');
  const moves = await request(app)
    .get('/api/inventory/movements?page=1&limit=10')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${moves.status}] total=${moves.body.data?.pagination?.total} movements`);
  if (moves.body.data?.movements?.length > 0) {
    const m = moves.body.data.movements[0];
    console.log(' latest:', JSON.stringify({ type: m.type, qty: m.quantity, product: m.product?.sku }));
  }

  console.log('\n[14] GET /api/inventory/movements?type=IN — filter by type\n');
  const movesIn = await request(app)
    .get('/api/inventory/movements?type=IN')
    .set('Authorization', `Bearer ${warehouseToken}`);
  console.log(`[${movesIn.status}] IN movements=${movesIn.body.data?.pagination?.total}`);

  console.log('\n[15] GET /api/inventory/low-stock — low stock alert\n');
  const lowStock = await request(app)
    .get('/api/inventory/low-stock')
    .set('Authorization', `Bearer ${warehouseToken}`);
  console.log(`[${lowStock.status}] low-stock products=${lowStock.body.data?.total}`);
  if (lowStock.body.data?.products?.length > 0) {
    const ls = lowStock.body.data.products[0];
    console.log(' example:', JSON.stringify({ name: ls.name, current: ls.currentStock, minimum: ls.minimumStock }));
  }

  console.log('\n[16] DELETE /api/products/:id — ADMIN deletes product\n');
  const pDel = await request(app)
    .delete(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${pDel.status}]`, JSON.stringify(pDel.body));

  console.log('\n[17] GET /api/products/:id — 404 after delete\n');
  const pNotFound = await request(app)
    .get(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${pNotFound.status}]`, JSON.stringify(pNotFound.body));

  console.log('\n✅ All product & inventory tests complete.\n');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
