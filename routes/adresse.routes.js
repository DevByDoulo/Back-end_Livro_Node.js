/**
 * Routes Adresse - Gestion des adresses utilisateur.
 *
 * Exemples:
 * GET    /api/adresses       - Mes adresses
 * POST   /api/adresses       - Ajouter une adresse
 * PUT    /api/adresses/:id   - Modifier une adresse
 * DELETE /api/adresses/:id   - Supprimer une adresse
 */
const express = require('express');
const router = express.Router();
const {
  listerAdresses,
  ajouterAdresse,
  modifierAdresse,
  supprimerAdresse,
} = require('../controllers/adresse.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', listerAdresses);
router.post('/', ajouterAdresse);
router.put('/:id', modifierAdresse);
router.delete('/:id', supprimerAdresse);

module.exports = router;
