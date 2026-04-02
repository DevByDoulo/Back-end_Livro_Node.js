/**
 * @swagger
 * tags:
 *   name: Livraisons
 *   description: Gestion des livraisons et suivi GPS
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

router.use(authenticate);

/**
 * @swagger
 * /api/livraisons/disponibles:
 *   get:
 *     summary: Lister les livraisons disponibles
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
