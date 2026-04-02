/**
 * Tests d'integration pour les routes publiques.
 * Verifie le bon fonctionnement des endpoints qui ne necessitent pas d'authentification.
 * Inclut la route racine et la gestion des erreurs 404.
 */

const request = require('supertest');
const app = require('../server');

/**
 * Suite de tests pour les routes publiques.
 */
describe('Routes publiques', () => {
  test('GET / - Retourne le message de bienvenue avec les informations de l\'API', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Bienvenue');
    expect(res.body.data.documentation).toContain('/api-docs');
  });

  test('GET /api/inexistant - Retourne 404 pour une route inexistante', async () => {
    const res = await request(app).get('/api/inexistant');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('non trouvee');
  });
});
