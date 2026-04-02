/**
 * @swagger
 * tags:
 *   name: Produits
 *   description: CRUD des produits d'un commerce
 */
const express = require('express');
const router = express.Router();
const {
  ajouterProduit,
  listerProduitsCommerce,
  modifierProduit,
  supprimerProduit,
} = require('../controllers/produit.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { validerProduit } = require('../middlewares/validation.middleware');

/**
 * @swagger
 * /api/produits/commerce/{commerceId}:
 *   get:
 *     summary: Lister les produits d'un commerce
 *     description: Retourne la liste des produits avec options de filtrage et pagination
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: commerceId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: disponible
 *         schema: { type: boolean }
 *       - in: query
 *         name: recherche
 *         schema: { type: string }
 *       - in: query
 *         name: prix_min
 *         schema: { type: number }
 *       - in: query
 *         name: prix_max
 *         schema: { type: number }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste des produits
 */
router.get('/commerce/:commerceId', listerProduitsCommerce);

/**
 * Middleware: Les routes suivantes necessitent une authentification.
 */
router.use(authenticate);

/**
 * @swagger
 * /api/produits/commerce/{commerceId}:
 *   post:
 *     summary: Ajouter un produit
 *     description: Ajoute un nouveau produit a un commerce (reserve aux commercants)
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commerceId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prix]
 *             properties:
 *               nom: { type: string, example: "Pizza Margherita" }
 *               description: { type: string }
 *               prix: { type: number, example: 12.5 }
 *               stock: { type: integer, example: 50 }
 *               image: { type: string }
 *     responses:
 *       201:
 *         description: Produit ajoute
 */
router.post('/commerce/:commerceId', authorizeRoles('commercant'), validerProduit, ajouterProduit);

/**
 * @swagger
 * /api/produits/{id}:
 *   put:
 *     summary: Modifier un produit
 *     description: Met a jour un produit (reserve au proprietaire du commerce)
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Produit mis a jour
 */
router.put('/:id', authorizeRoles('commercant'), modifierProduit);

/**
 * @swagger
 * /api/produits/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     description: Supprime definitivement un produit (reserve au proprietaire du commerce)
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Produit supprime
 */
router.delete('/:id', authorizeRoles('commercant'), supprimerProduit);

module.exports = router;
