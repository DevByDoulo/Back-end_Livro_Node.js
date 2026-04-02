/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Inscription et connexion des utilisateurs
 */
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authentification.controller');
const { validerInscription, validerConnexion } = require('../middlewares/validation.middleware');

/**
 * @swagger
 * /api/authentification/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: Cree un nouveau compte utilisateur avec les informations fournies
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       201:
 *         description: Inscription reussie
 *       400:
 *         description: Champs invalides
 *       409:
 *         description: Email deja utilise
 */
router.post('/register', validerInscription, register);

/**
 * @swagger
 * /api/authentification/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Authentifie l'utilisateur et retourne un token JWT
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Connexion reussie, retourne le token JWT
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post('/login', validerConnexion, login);

module.exports = router;
