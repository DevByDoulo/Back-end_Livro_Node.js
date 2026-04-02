/**
 * Routes Paiement - Gestion des paiements.
 *
 * Exemples:
 * POST   /api/paiements          - Creer un paiement (client)
 * GET    /api/paiements/:id      - Detail du paiement
 * PUT    /api/paiements/:id/statut - Changer le statut (commercant)
 */
const express = require('express');
const router = express.Router();
const {
  creerPaiement,
  changerStatutPaiement,
  voirDetailPaiement,
} = require('../controllers/paiement.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/', authorizeRoles('client'), creerPaiement);
router.get('/:id', voirDetailPaiement);
router.put('/:id/statut', authorizeRoles('commercant'), changerStatutPaiement);

module.exports = router;
