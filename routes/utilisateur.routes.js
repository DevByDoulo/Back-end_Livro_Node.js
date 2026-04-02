/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion du profil utilisateur
 */
const express = require('express');
const router = express.Router();
const { getProfil, modifierProfil, desactiverCompte } = require('../controllers/utilisateur.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

/**
 * @swagger
 * /api/utilisateurs/profil:
 *   get:
 *     summary: Recuperer son profil
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil recupere
 *       401:
 *         description: Non authentifie
 */
router.get('/profil', getProfil);

/**
 * @swagger
 * /api/utilisateurs/profil:
 *   put:
 *     summary: Modifier son profil
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               telephone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis a jour
 *       401:
 *         description: Non authentifie
 */
router.put('/profil', modifierProfil);

/**
 * @swagger
 * /api/utilisateurs/profil:
 *   delete:
 *     summary: Desactiver son compte
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte desactive
 *       401:
 *         description: Non authentifie
 */
router.delete('/profil', desactiverCompte);

module.exports = router;
