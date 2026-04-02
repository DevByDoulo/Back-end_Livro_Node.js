/**
 * Tests pour les routes publiques des commerces et produits.
 */
const request = require('supertest');
const app = require('../server');

describe('Commerces et Produits (public)', () => {
  test('GET /api/commerces retourne la liste', async () => {
    const res = await request(app).get('/api/commerces');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.commerces).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  test('GET /api/commerces avec pagination', async () => {
    const res = await request(app).get('/api/commerces?page=1&limite=5');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limite).toBe(5);
  });

  test('GET /api/commerces/1 retourne le detail', async () => {
    const res = await request(app).get('/api/commerces/1');
    if (res.status === 200) {
      expect(res.body.data.nom).toBeDefined();
    } else {
      expect(res.status).toBe(404);
    }
  });

  test('GET /api/produits/commerce/1 retourne la liste', async () => {
    const res = await request(app).get('/api/produits/commerce/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.produits).toBeDefined();
  });
});
