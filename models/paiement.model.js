/**
 * Model Paiement - Gestion des requetes SQL pour la table Paiement.
 * Gere les operations liees aux paiements des commandes.
 */

const pool = require('../config/db');

/**
 * Model Paiement - Objet contenant les fonctions de manipulation des paiements.
 */
const Paiement = {
  /**
   * Cree un nouveau paiement.
   * @param {Object} params - Parametres du paiement
   * @param {number} params.montant - Montant du paiement
   * @param {string} params.moyen - Moyen de paiement (mobile_money, carte_bancaire, cash)
   * @param {string} params.reference - Reference optionnelle du paiement
   * @returns {number} ID du paiement cree
   */
  creer: async ({ montant, moyen, reference }) => {
    const [result] = await pool.execute(
      'INSERT INTO Paiement (montant, moyen, reference) VALUES (?, ?, ?)',
      [montant, moyen, reference || null]
    );
    return result.insertId;
  },

  /**
   * Recupere un paiement par son ID.
   * @param {number} id - ID du paiement
   * @returns {Object|null} Le paiement trouve ou null
   */
  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Paiement WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Met a jour le statut d'un paiement.
   * @param {number} id - ID du paiement
   * @param {string} statut - Nouveau statut (en_attente, confirme, echoue, rembourse)
   * @returns {boolean} true si la mise a jour a reussi
   */
  mettreAJourStatut: async (id, statut) => {
    await pool.execute(
      'UPDATE Paiement SET statut = ? WHERE id = ?',
      [statut, id]
    );
    return true;
  },

  /**
   * Recupere le paiement associe a une commande.
   * @param {number} commandeId - ID de la commande
   * @returns {Array} Liste des paiements associes (normalement un seul)
   */
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
