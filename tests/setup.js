/**
 * Configuration Jest pour les tests d'integration.
 * Exporte l'application Express sans le listen pour les tests.
 * Permet de tester les routes HTTP sans demarrer le serveur sur un port.
 */

const app = require('../server');

module.exports = app;
