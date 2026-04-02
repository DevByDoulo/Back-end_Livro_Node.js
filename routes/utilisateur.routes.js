/**
 * Routes Utilisateur - Gestion du profil.
 */
const express = require('express');
const router = express.Router();
const { getProfil, modifierProfil, desactiverCompte } = require('../controllers/utilisateur.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/profil', getProfil);
router.put('/profil', modifierProfil);
router.delete('/profil', desactiverCompte);

module.exports = router;
