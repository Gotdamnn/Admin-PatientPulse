
// Sample test for server.js
const request = require('supertest');
const app = require('../app'); // Adjust path if needed
let pool;
try {
  pool = require('../server').pool;
} catch (err) {
  // If pool is not available, skip cleanup
}

describe('GET /', () => {
  it('should redirect to /login (302)', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});

afterAll(async () => {
  if (pool && typeof pool.end === 'function') {
    await pool.end();
  }
});
