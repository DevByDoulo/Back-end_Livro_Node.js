/**
 * @swagger
 * tags:
 *   name: Commandes
 *   description: Gestion complete des commandes
 */
const express = require('express');
const router = express.Router();
const {
  creerCommande,
  mesCommandes,
  voirDetailCommande,
  changerStatut,
  commandesParCommerce,
} = require('../controllers/commande.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { validerCommande } = require('../middlewares/validation.middleware');

router.use(authenticate);

/**
 * @swagger
 * /api/commandes:
 *   post:
 *     summary: Creer une commande
 *     description: Le montant est calcule automatiquement par le systeme.
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreerCommande'
 *     responses:
 *       201:
 *         description: Commande creee
 *       400:
 *         description: Donnees invalides ou stock insuffisant
 */
router.post('/', authorizeRoles('client'), validerCommande, creerCommande);

/**
 * @swagger
 * /api/commandes/mes-commandes:
 *   get:
 *     summary: Lister ses commandes
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste des commandes
 */
router.get('/mes-commandes', authorizeRoles('client'), mesCommandes);

/**
 * @swagger
 * /api/commandes/commerce/{commerceId}:
 *   get:
 *     summary: Lister les commandes d'un commerce
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commerceId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: statut
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Commandes du commerce
 */
router.get('/commerce/:commerceId', authorizeRoles('commercant'), commandesParCommerce);

/**
 * @swagger
 * /api/commandes/{id}:
 *   get:
 *     summary: Voir le detail d'une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail de la commande
 *       404:
 *         description: Commande non trouvee
 */
router.get('/:id', voirDetailCommande);

/**
 * @swagger
 * /api/commandes/{id}/statut:
 *   put:
 *     summary: Changer le statut d'une commande
 *     tags: [Commandes]
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
 *                 enum: [en_attente, acceptee, en_preparation, en_livraison, livree, annulee]
 *     responses:
 *       200:
 *         description: Statut mis a jour
 */
router.put('/:id/statut', authorizeRoles('commercant'), changerStatut);

module.exports = router;
