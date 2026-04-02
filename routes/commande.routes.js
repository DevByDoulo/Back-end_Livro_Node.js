/**
 * Routes Commande - Gestion complete des commandes.
 *
 * Exemples:
 * POST   /api/commandes                      - Creer une commande (client)
 * GET    /api/commandes/mes-commandes        - Mes commandes (client)
 * GET    /api/commandes/:id                  - Detail d'une commande
 * PUT    /api/commandes/:id/statut           - Changer le statut (commercant)
 * GET    /api/commandes/commerce/:commerceId - Commandes d'un commerce (commercant)
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

router.post('/', authorizeRoles('client'), validerCommande, creerCommande);
router.get('/mes-commandes', authorizeRoles('client'), mesCommandes);
router.get('/commerce/:commerceId', authorizeRoles('commercant'), commandesParCommerce);
router.get('/:id', voirDetailCommande);
router.put('/:id/statut', authorizeRoles('commercant'), changerStatut);

module.exports = router;
