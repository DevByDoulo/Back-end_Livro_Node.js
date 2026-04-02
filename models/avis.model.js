/**
 * Model Avis - Gestion des requetes SQL pour la table Avis.
 */

const pool = require('../config/db');

const Avis = {
  creer: async ({ client_id, type, cible_id, note, commentaire }) => {
    const [result] = await pool.execute(
      'INSERT INTO Avis (client_id, type, cible_id, note, commentaire) VALUES (?, ?, ?, ?, ?)',
      [client_id, type, cible_id, note, commentaire || null]
    );
    return result.insertId;
  },

  listerParCible: async (type, cible_id, offset = 0, limite = 10) => {
    const [rows] = await pool.query(
      `SELECT a.*, u.nom AS client_nom, u.prenom AS client_prenom
       FROM Avis a
       JOIN Utilisateur u ON a.client_id = u.id
       WHERE a.type = ? AND a.cible_id = ?
       ORDER BY a.date_avis DESC
       LIMIT ? OFFSET ?`,
      [type, cible_id, Number(limite), Number(offset)]
    );
    return rows;
  },

  moyenneParCible: async (type, cible_id) => {
    const [rows] = await pool.execute(
      `SELECT AVG(note) AS moyenne, COUNT(*) AS total
       FROM Avis
       WHERE type = ? AND cible_id = ?`,
      [type, cible_id]
    );
    return {
      moyenne: rows[0].moyenne ? parseFloat(rows[0].moyenne).toFixed(1) : 0,
      total: rows[0].total,
    };
  },

  verifierDejaNote: async (client_id, type, cible_id) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Avis WHERE client_id = ? AND type = ? AND cible_id = ?',
      [client_id, type, cible_id]
    );
    return rows.length > 0;
  },

  supprimer: async (id, client_id) => {
    await pool.execute(
      'DELETE FROM Avis WHERE id = ? AND client_id = ?',
      [id, client_id]
    );
    return true;
  },
};

module.exports = Avis;
