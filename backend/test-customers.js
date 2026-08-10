/**
 * Customer API test using supertest (in-memory).
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
  const adminToken     = await login('admin@erp.com');
  const salesToken     = await login('sales@erp.com');
  const warehouseToken = await login('warehouse@erp.com');
  const accountsToken  = await login('accounts@erp.com');

  console.log('\n=== [1] POST /api/customers — SALES creates customer ===\n');
  const c1 = await request(app)
    .post('/api/customers')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({
      name: 'Test Customer A',
      mobile: '9876543210',
      email: 'testa@example.com',
      businessName: 'Alpha Corp',
      customerType: 'WHOLESALE',
      status: 'ACTIVE',
      notes: 'VIP client',
    });
  console.log(`[${c1.status}]`, JSON.stringify({ success: c1.body.success, name: c1.body.data?.name, type: c1.body.data?.customerType }));
  const customerId = c1.body.data?.id;

  console.log('\n=== [2] POST /api/customers — WAREHOUSE blocked → 403 ===\n');
  const c2 = await request(app)
    .post('/api/customers')
    .set('Authorization', `Bearer ${warehouseToken}`)
    .send({ name: 'Should Fail', mobile: '1234567890' });
  console.log(`[${c2.status}]`, JSON.stringify(c2.body));

  console.log('\n=== [3] GET /api/customers — list with pagination (all roles) ===\n');
  const list = await request(app)
    .get('/api/customers?page=1&limit=5')
    .set('Authorization', `Bearer ${accountsToken}`);
  console.log(`[${list.status}] total=${list.body.data?.pagination?.total} page=${list.body.data?.pagination?.page} limit=${list.body.data?.pagination?.limit}`);

  console.log('\n=== [4] GET /api/customers — search by name ===\n');
  const search = await request(app)
    .get('/api/customers?search=Customer')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${search.status}] found=${search.body.data?.pagination?.total}`);

  console.log('\n=== [5] GET /api/customers — filter by status=ACTIVE ===\n');
  const filtered = await request(app)
    .get('/api/customers?status=ACTIVE')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${filtered.status}] ACTIVE customers=${filtered.body.data?.pagination?.total}`);

  console.log('\n=== [6] GET /api/customers — filter by customerType=WHOLESALE ===\n');
  const byType = await request(app)
    .get('/api/customers?customerType=WHOLESALE')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${byType.status}] WHOLESALE customers=${byType.body.data?.pagination?.total}`);

  console.log('\n=== [7] GET /api/customers/:id — get single customer ===\n');
  const single = await request(app)
    .get(`/api/customers/${customerId}`)
    .set('Authorization', `Bearer ${salesToken}`);
  console.log(`[${single.status}]`, JSON.stringify({ name: single.body.data?.name, status: single.body.data?.status }));

  console.log('\n=== [8] PUT /api/customers/:id — SALES updates customer ===\n');
  const updated = await request(app)
    .put(`/api/customers/${customerId}`)
    .set('Authorization', `Bearer ${salesToken}`)
    .send({ status: 'INACTIVE', notes: 'Closed deal' });
  console.log(`[${updated.status}]`, JSON.stringify({ status: updated.body.data?.status, notes: updated.body.data?.notes }));

  console.log('\n=== [9] DELETE /api/customers/:id — SALES blocked → 403 ===\n');
  const delBySales = await request(app)
    .delete(`/api/customers/${customerId}`)
    .set('Authorization', `Bearer ${salesToken}`);
  console.log(`[${delBySales.status}]`, JSON.stringify(delBySales.body));

  console.log('\n=== [10] DELETE /api/customers/:id — ADMIN deletes ===\n');
  const deleted = await request(app)
    .delete(`/api/customers/${customerId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${deleted.status}]`, JSON.stringify(deleted.body));

  console.log('\n=== [11] GET /api/customers/:id — 404 after delete ===\n');
  const notFound = await request(app)
    .get(`/api/customers/${customerId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${notFound.status}]`, JSON.stringify(notFound.body));

  console.log('\n=== [12] POST /api/customers — Zod validation → 400 ===\n');
  const zodFail = await request(app)
    .post('/api/customers')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: '', mobile: '123', email: 'bad-email' });
  console.log(`[${zodFail.status}]`, JSON.stringify(zodFail.body));

  console.log('\n=== [13] GET /api/customers — no token → 401 ===\n');
  const noAuth = await request(app).get('/api/customers');
  console.log(`[${noAuth.status}]`, JSON.stringify(noAuth.body));

  console.log('\n✅ All customer tests complete.\n');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
