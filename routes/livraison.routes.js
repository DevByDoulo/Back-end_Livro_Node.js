/**
 * @swagger
 * tags:
 *   name: Livraisons
 *   description: Gestion des livraisons et suivi GPS - Assignation et tracking des livreurs
 */
const express = require('express');
const router = express.Router();
const {
  listerDisponibles,
  accepterLivraison,
  changerStatutLivraison,
  mettreAJourPosition,
  mesLivraisons,
} = require('../controllers/livraison.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

/**
 * Middleware: Toutes les routes de ce fichier necessitent une authentification.
 */
router.use(authenticate);

/**
 * @swagger
 * /api/livraisons/disponibles:
 *   get:
 *     summary: Lister les livraisons disponibles
 *     description: Retourne les livraisons en attente qui peuvent etre acceptees par les livreurs
 *     tags: [Livraisons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Livraisons disponibles
 */
router.get('/disponibles', authorizeRoles('livreur'), listerDisponibles);

/**
 * @swagger
 * /api/livraisons/mes-livraisons:
 *   get:
 *     summary: Lister ses livraisons
 *     description: Retourne la liste des livraisons acceptees par le livreur connecte
 *     tags: [Livraisons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mes livraisons
 */
router.get('/mes-livraisons', authorizeRoles('livreur'), mesLivraisons);

/**
 * @swagger
 * /api/livraisons/{id}/accepter:
 *   put:
 *     summary: Accepter une livraison
 *     description: Permet a un livreur d'accepter une livraison disponible
 *     tags: [Livraisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Livraison acceptee
 */
router.put('/:id/accepter', authorizeRoles('livreur'), accepterLivraison);

/**
 * @swagger
 * /api/livraisons/{id}/statut:
 *   put:
 *     summary: Changer le statut d'une livraison
 *     description: Met a jour le statut de la livraison (recuperation, en cours, livree)
 *     tags: [Livraisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [statut]
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [disponible, en_cours_recuperation, en_cours_livraison, livree]
 *     responses:
 *       200:
 *         description: Statut mis a jour
 */
router.put('/:id/statut', authorizeRoles('livreur'), changerStatutLivraison);

/**
 * @swagger
 * /api/livraisons/{id}/position:
 *   put:
 *     summary: Mettre a jour la position GPS
 *     description: Permet au livreur de mettre a jour sa position pendant une livraison
 *     tags: [Livraisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude]
 *             properties:
 *               latitude: { type: number, example: 48.8566 }
 *               longitude: { type: number, example: 2.3522 }
 *     responses:
 *       200:
 *         description: Position mise a jour
 */
router.put('/:id/position', authorizeRoles('livreur'), mettreAJourPosition);

module.exports = router;
