/**
 * Model Paiement - Gestion des requetes SQL pour la table Paiement.
 */

const pool = require('../config/db');

const Paiement = {
  creer: async ({ montant, moyen, reference }) => {
    const [result] = await pool.execute(
      'INSERT INTO Paiement (montant, moyen, reference) VALUES (?, ?, ?)',
      [montant, moyen, reference || null]
    );
    return result.insertId;
  },

  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Paiement WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  mettreAJourStatut: async (id, statut) => {
    await pool.execute(
      'UPDATE Paiement SET statut = ? WHERE id = ?',
      [statut, id]
    );
    return true;
  },

  listerParCommande: async (commandeId) => {
    const [rows] = await pool.execute(
      `SELECT p.* FROM Paiement p
       JOIN Commande c ON c.paiement_id = p.id
       WHERE c.id = ?`,
      [commandeId]
    );
    return rows;
  },
};

module.exports = Paiement;
