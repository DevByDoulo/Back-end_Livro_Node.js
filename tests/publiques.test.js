/**
 * Tests pour les routes publiques (sans authentification).
 */
const request = require('supertest');
const app = require('../server');

describe('Routes publiques', () => {
  test('GET / retourne le message de bienvenue', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Bienvenue');
    expect(res.body.data.documentation).toContain('/api-docs');
  });

  test('Route inexistante retourne 404', async () => {
    const res = await request(app).get('/api/inexistant');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('non trouvee');
  });
});
