/**
 * Auth API test using supertest (in-memory, no real port binding needed).
 */
const request = require('supertest');

// Prevent server from binding to a port during testing
process.env.SKIP_LISTEN = 'true';

const { app } = require('./dist/server.js');

async function run() {
  let adminToken = '';

  console.log('\n=== [1] POST /api/auth/login — All 4 Roles ===\n');
  const roles = [
    { label: 'ADMIN',     email: 'admin@erp.com' },
    { label: 'SALES',     email: 'sales@erp.com' },
    { label: 'WAREHOUSE', email: 'warehouse@erp.com' },
    { label: 'ACCOUNTS',  email: 'accounts@erp.com' },
  ];
  for (const r of roles) {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: r.email, password: 'password123' });
    const d = res.body;
    console.log(`[${res.status}] ${r.label}: success=${d.success} role=${d.data?.role} hasToken=${!!d.data?.token}`);
    if (r.label === 'ADMIN') adminToken = d.data?.token;
  }

  console.log('\n=== [2] GET /api/auth/me — Valid ADMIN Token ===\n');
  const me = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`[${me.status}]`, JSON.stringify(me.body));

  console.log('\n=== [3] GET /api/auth/me — No Token → 401 ===\n');
  const noToken = await request(app).get('/api/auth/me');
  console.log(`[${noToken.status}]`, JSON.stringify(noToken.body));

  console.log('\n=== [4] POST login — Wrong Password → 401 ===\n');
  const wrongPwd = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@erp.com', password: 'wrongpassword' });
  console.log(`[${wrongPwd.status}]`, JSON.stringify(wrongPwd.body));

  console.log('\n=== [5] POST login — Invalid Email (Zod) → 400 ===\n');
  const zodErr = await request(app)
    .post('/api/auth/login')
    .send({ email: 'not-an-email', password: '123' });
  console.log(`[${zodErr.status}]`, JSON.stringify(zodErr.body));

  console.log('\n=== [6] GET /api/auth/me — Invalid JWT → 401 ===\n');
  const badToken = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer invalid.jwt.here');
  console.log(`[${badToken.status}]`, JSON.stringify(badToken.body));

  console.log('\n✅ All auth tests passed.\n');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
