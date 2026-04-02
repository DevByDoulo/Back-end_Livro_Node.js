/**
 * Tests d'integration pour les routes publiques des comercios et produits.
 * Ces routes ne necessitent pas d'authentification.
 * Verifie la consultation des comercios et produits sans etre connecte.
 */

const request = require('supertest');
const app = require('../server');

/**
 * Suite de tests pour les routes publiques des comercios et produits.
 */
describe('Commerces et Produits (public)', () => {
  test('GET /api/commerces - Retourne la liste des comercios actifs', async () => {
    const res = await request(app).get('/api/commerces');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.commerces).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  test('GET /api/commerces avec pagination - Retourne le bon nombre de resultats', async () => {
    const res = await request(app).get('/api/commerces?page=1&limite=5');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limite).toBe(5);
  });

  test('GET /api/commerces/:id - Retourne le detail d\'un commerce', async () => {
    const res = await request(app).get('/api/commerces/1');
    if (res.status === 200) {
      expect(res.body.data.nom).toBeDefined();
    } else {
      expect(res.status).toBe(404);
    }
  });

  test('GET /api/produits/commerce/:id - Retourne les produits d\'un commerce', async () => {
    const res = await request(app).get('/api/produits/commerce/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.produits).toBeDefined();
  });
});
