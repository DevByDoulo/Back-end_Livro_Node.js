/**
 * Routes Commerce - CRUD des commerces.
 *
 * Exemples:
 * GET    /api/commerces              - Lister tous les commerces
 * GET    /api/commerces/:id          - Detail d'un commerce
 * POST   /api/commerces              - Creer un commerce (commercant)
 * PUT    /api/commerces/:id          - Modifier son commerce (commercant)
 * DELETE /api/commerces/:id          - Supprimer son commerce (commercant)
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

router.get('/', listerCommerces);
router.get('/:id', voirDetail);

router.use(authenticate);

router.post('/', authorizeRoles('commercant'), creerCommerce);
router.put('/:id', authorizeRoles('commercant'), modifierCommerce);
router.delete('/:id', authorizeRoles('commercant'), supprimerCommerce);

module.exports = router;
