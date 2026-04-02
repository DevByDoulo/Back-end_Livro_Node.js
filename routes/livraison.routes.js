/**
 * Routes Livraison - Gestion des livraisons.
 *
 * Exemples:
 * GET    /api/livraisons/disponibles      - Livraisons disponibles (livreur)
 * GET    /api/livraisons/mes-livraisons   - Mes livraisons (livreur)
 * PUT    /api/livraisons/:id/accepter     - Accepter une livraison (livreur)
 * PUT    /api/livraisons/:id/statut       - Changer statut (livreur)
 * PUT    /api/livraisons/:id/position     - Mettre a jour GPS (livreur)
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

router.get('/disponibles', authorizeRoles('livreur'), listerDisponibles);
router.get('/mes-livraisons', authorizeRoles('livreur'), mesLivraisons);
router.put('/:id/accepter', authorizeRoles('livreur'), accepterLivraison);
router.put('/:id/statut', authorizeRoles('livreur'), changerStatutLivraison);
router.put('/:id/position', authorizeRoles('livreur'), mettreAJourPosition);

module.exports = router;
