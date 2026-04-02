/**
 * @swagger
 * tags:
 *   name: Commerces
 *   description: CRUD des commerces
 */
const express = require('express');
const router = express.Router();
const {
  creerCommerce,
  listerCommerces,
  voirDetail,
  modifierCommerce,
  supprimerCommerce,
} = require('../controllers/commerce.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/commerces:
 *   get:
 *     summary: Lister tous les commerces
 *     tags: [Commerces]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste des commerces
 */
router.get('/', listerCommerces);

/**
 * @swagger
 * /api/commerces/{id}:
 *   get:
 *     summary: Voir le detail d'un commerce
 *     tags: [Commerces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail du commerce
 *       404:
 *         description: Commerce non trouve
 */
router.get('/:id', voirDetail);

router.use(authenticate);

/**
 * @swagger
 * /api/commerces:
 *   post:
 *     summary: Creer un commerce
 *     tags: [Commerces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, zone_livraison]
 *             properties:
 *               nom: { type: string, example: "Pizza Express" }
 *               description: { type: string }
 *               logo: { type: string }
 *               horaires: { type: string }
 *               zone_livraison: { type: string, example: "Paris Centre" }
 *     responses:
 *       201:
 *         description: Commerce cree
 *       403:
 *         description: Role non autorise
 */
router.post('/', authorizeRoles('commercant'), creerCommerce);

/**
 * @swagger
 * /api/commerces/{id}:
 *   put:
 *     summary: Modifier son commerce
 *     tags: [Commerces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Commerce mis a jour
 *       403:
 *         description: Non proprietaire
 */
router.put('/:id', authorizeRoles('commercant'), modifierCommerce);

/**
 * @swagger
 * /api/commerces/{id}:
 *   delete:
 *     summary: Supprimer son commerce
 *     tags: [Commerces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Commerce supprime
 *       403:
 *         description: Non proprietaire
 */
router.delete('/:id', authorizeRoles('commercant'), supprimerCommerce);

module.exports = router;
