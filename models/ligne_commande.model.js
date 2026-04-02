/**
 * Model LigneCommande - Gestion des requetes SQL pour la table LigneCommande.
 * Represente un produit individuel dans une commande.
 */

const pool = require('../config/db');

const LigneCommande = {
  creer: async (connection, { commande_id, produit_id, quantite, prix_unitaire, sous_total }) => {
    const [result] = await connection.execute(
      'INSERT INTO LigneCommande (commande_id, produit_id, quantite, prix_unitaire, sous_total) VALUES (?, ?, ?, ?, ?)',
      [commande_id, produit_id, quantite, prix_unitaire, sous_total]
    );
    return result.insertId;
  },

  listerParCommande: async (commande_id) => {
    const [rows] = await pool.execute(
      `SELECT lc.*, p.nom AS produit_nom, p.image AS produit_image
       FROM LigneCommande lc
       JOIN Produit p ON lc.produit_id = p.id
       WHERE lc.commande_id = ?`,
      [commande_id]
    );
    return rows;
  },

  supprimerParCommande: async (commande_id) => {
    await pool.execute(
      'DELETE FROM LigneCommande WHERE commande_id = ?',
      [commande_id]
    );
    return true;
  },
};

module.exports = LigneCommande;
