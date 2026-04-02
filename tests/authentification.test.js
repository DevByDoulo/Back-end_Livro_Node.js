/**
 * Tests pour l'authentification (inscription et connexion).
 */
const request = require('supertest');
const app = require('../server');

describe('Authentification', () => {
  const emailTest = `test_${Date.now()}@livro.com`;

  describe('POST /api/authentification/register', () => {
    test('Inscription reussie', async () => {
      const res = await request(app)
        .post('/api/authentification/register')
        .send({
          nom: 'Test',
          prenom: 'User',
          email: emailTest,
          mot_de_passe: '123456',
          telephone: '0600000000',
          role: 'client',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(emailTest);
    });

    test('Inscription avec email existant retourne 409', async () => {
      const res = await request(app)
        .post('/api/authentification/register')
        .send({
          nom: 'Test',
          prenom: 'User',
          email: emailTest,
          mot_de_passe: '123456',
          telephone: '0600000000',
          role: 'client',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('Inscription sans champs obligatoires retourne 400', async () => {
      const res = await request(app)
        .post('/api/authentification/register')
        .send({
          nom: 'Test',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Inscription avec email invalide retourne 400', async () => {
      const res = await request(app)
        .post('/api/authentification/register')
        .send({
          nom: 'Test',
          prenom: 'User',
          email: 'pas-un-email',
          mot_de_passe: '123456',
          telephone: '0600000000',
          role: 'client',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Inscription avec mot de passe trop court retourne 400', async () => {
      const res = await request(app)
        .post('/api/authentification/register')
        .send({
          nom: 'Test',
          prenom: 'User',
          email: 'short@test.com',
          mot_de_passe: '123',
          telephone: '0600000000',
          role: 'client',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/authentification/login', () => {
    test('Connexion reussie retourne un token', async () => {
      const res = await request(app)
        .post('/api/authentification/login')
        .send({
          email: emailTest,
          mot_de_passe: '123456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.utilisateur).toBeDefined();
      expect(res.body.data.utilisateur.mot_de_passe).toBeUndefined();
    });

    test('Connexion avec mauvais mot de passe retourne 401', async () => {
      const res = await request(app)
        .post('/api/authentification/login')
        .send({
          email: emailTest,
          mot_de_passe: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('Connexion avec email inexistant retourne 401', async () => {
      const res = await request(app)
        .post('/api/authentification/login')
        .send({
          email: 'inexistant@test.com',
          mot_de_passe: '123456',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('Connexion sans email retourne 400', async () => {
      const res = await request(app)
        .post('/api/authentification/login')
        .send({
          mot_de_passe: '123456',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
