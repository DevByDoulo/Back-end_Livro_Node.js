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

/**
 * Middleware: Toutes les routes de ce fichier necessitent une authentification.
 */
router.use(authenticate);

/**
 * @swagger
 * /api/utilisateurs/profil:
 *   get:
 *     summary: Recuperer son profil
 *     description: Retourne les informations du profil de l'utilisateur connecte
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
 *     description: Met a jour les informations du profil (nom, prenom, telephone)
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
 *     description: Desactive le compte de l'utilisateur (soft delete)
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
