/**
 * Tests d'integration pour la protection des routes.
 * Verifie que les routes protegees rejectent les requetes sans token JWT valide.
 * Ces tests s'assurent que l'authentification est correctement enforcee.
 */

const request = require('supertest');
const app = require('../server');

/**
 * Suite de tests pour les routes protegees.
 */
describe('Routes protegees', () => {
  test('GET /api/utilisateurs/profil sans token - retourne 401 (non autorise)', async () => {
    const res = await request(app).get('/api/utilisateurs/profil');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/commerces sans token - retourne 401 (non autorise)', async () => {
    const res = await request(app)
      .post('/api/commerces')
      .send({ nom: 'Test', zone_livraison: 'Paris' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/commandes sans token - retourne 401 (non autorise)', async () => {
    const res = await request(app)
      .post('/api/commandes')
      .send({ commerce_id: 1, adresse_id: 1, produits: [] });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Token invalide - retourne 401 (non autorise)', async () => {
    const res = await request(app)
      .get('/api/utilisateurs/profil')
      .set('Authorization', 'Bearer token_invalide');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
