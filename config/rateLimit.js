/**
 * Configuration Rate Limiting - Protection anti brute-force.
 * Limite le nombre de requetes par IP.
 */

const rateLimit = require('express-rate-limit');

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
