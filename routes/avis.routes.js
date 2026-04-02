/**
 * Routes Avis - Gestion des avis.
 *
 * Exemples:
 * POST   /api/avis                     - Ajouter un avis (client)
 * GET    /api/avis/:type/:cibleId      - Lister les avis d'un commerce ou livreur
 * DELETE /api/avis/:id                 - Supprimer son avis (client)
 */
const express = require('express');
const router = express.Router();
const {
  ajouterAvis,
  listerAvis,
  supprimerAvis,
} = require('../controllers/avis.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/:type/:cibleId', listerAvis);

router.use(authenticate);

router.post('/', authorizeRoles('client'), ajouterAvis);
router.delete('/:id', authorizeRoles('client'), supprimerAvis);

module.exports = router;
