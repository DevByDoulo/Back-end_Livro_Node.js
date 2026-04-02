/**
 * Configuration Rate Limiting - Protection anti brute-force.
 * Limite le nombre de requetes par IP pour eviter les abus et attaques.
 * Utilise express-rate-limit pour limiter les requetes HTTP.
 */

const rateLimit = require('express-rate-limit');

/**
 * Limiter global - applique a toutes les routes.
 * - windowMs: fenetre de temps (15 minutes)
 * - max: nombre maximum de requetes par IP dans cette fenetre (100)
 */
const limiterGlobal = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Trop de requetes. Reessayez dans 15 minutes.',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiter specifique pour l'authentification.
 * Plus restrictif pour eviter les attaques par force brute sur les formulaires de connexion.
 * - windowMs: fenetre de temps (15 minutes)
 * - max: nombre maximum de tentatives par IP (10)
 */
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Reessayez dans 15 minutes.',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limiterGlobal, limiterAuth };
