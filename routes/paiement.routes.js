/**
 * @swagger
 * tags:
 *   name: Paiements
 *   description: Gestion des paiements - Creation et suivi des transactions
 */
const express = require('express');
const router = express.Router();
const {
  creerPaiement,
  changerStatutPaiement,
  voirDetailPaiement,
} = require('../controllers/paiement.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

/**
 * Middleware: Toutes les routes de ce fichier necessitent une authentification.
 */
router.use(authenticate);

/**
 * @swagger
 * /api/paiements:
 *   post:
 *     summary: Creer un paiement pour une commande
 *     description: Initialise un paiement pour une commande existante
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [commande_id, moyen]
 *             properties:
 *               commande_id: { type: integer }
 *               moyen: { type: string, enum: [mobile_money, carte_bancaire, cash] }
 *               reference: { type: string }
 *     responses:
 *       201:
 *         description: Paiement cree
 */
router.post('/', authorizeRoles('client'), creerPaiement);

/**
 * @swagger
 * /api/paiements/{id}:
 *   get:
 *     summary: Voir le detail d'un paiement
 *     description: Retourne les informations completes d'un paiement
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail du paiement
 */
router.get('/:id', voirDetailPaiement);

/**
 * @swagger
 * /api/paiements/{id}/statut:
 *   put:
 *     summary: Changer le statut d'un paiement
 *     description: Met a jour le statut du paiement (reserve au commercant)
 *     tags: [Paiements]
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
 *                 enum: [en_attente, confirme, echoue, rembourse]
 *     responses:
 *       200:
 *         description: Statut mis a jour
 */
router.put('/:id/statut', authorizeRoles('commercant'), changerStatutPaiement);

module.exports = router;
