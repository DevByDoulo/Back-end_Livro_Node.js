/**
 * Routes Produit - CRUD des produits d'un commerce.
 *
 * Exemples:
 * GET    /api/produits/commerce/:commerceId         - Lister les produits
 * GET    /api/produits/commerce/:commerceId?disponible=true&recherche=pizza&prix_min=100
 * POST   /api/produits/commerce/:commerceId         - Ajouter un produit (commercant)
 * PUT    /api/produits/:id                          - Modifier un produit (commercant)
 * DELETE /api/produits/:id                          - Supprimer un produit (commercant)
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

router.get('/commerce/:commerceId', listerProduitsCommerce);

router.use(authenticate);

router.post('/commerce/:commerceId', authorizeRoles('commercant'), validerProduit, ajouterProduit);
router.put('/:id', authorizeRoles('commercant'), modifierProduit);
router.delete('/:id', authorizeRoles('commercant'), supprimerProduit);

module.exports = router;
