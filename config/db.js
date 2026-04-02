/**
 * Configuration de la connexion a la base de donnees MySQL.
 * Utilise un pool de connexions pour optimiser les performances.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Pool de connexions MySQL.
 * Permet de reutiliser les connexions pour eviter d'ouvrir une nouvelle connexion a chaque requete.
 * - waitForConnections: attend qu'une connexion soit disponible si le pool est plein.
 * - connectionLimit: nombre maximum de connexions simultanees (10 par defaut).
 * - queueLimit: nombre maximum de requetes en attente (0 = illimite).
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
