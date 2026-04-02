/**
 * Routes Authentification - Inscription et Connexion.
 */
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authentification.controller');
const { validerInscription, validerConnexion } = require('../middlewares/validation.middleware');

router.post('/register', validerInscription, register);
router.post('/login', validerConnexion, login);

module.exports = router;
