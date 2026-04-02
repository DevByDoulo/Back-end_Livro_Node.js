/**
 * Configuration Winston - Systeme de logging.
 * Logge dans la console et dans des fichiers pour le debugging et le suivi en production.
 */

const winston = require('winston');
const path = require('path');

/**
 * Repertoire de stockage des fichiers de log (a la racine du projet).
 */
const logDir = path.join(__dirname, '..', 'logs');

/**
 * Configuration du logger Winston.
 * - level: niveau de log minimal (info par defaut)
 * - format: combine timestamp, erreurs et format JSON
 * - transports: destination des logs (fichiers)
 */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Fichier pour les erreurs uniquement
    new winston.transports.File({
      filename: path.join(logDir, 'erreur.log'),
      level: 'error',
    }),
    // Fichier pour tous les logs combines
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

// En mode development, ajouter aussi la sortie console coloree
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

module.exports = logger;
