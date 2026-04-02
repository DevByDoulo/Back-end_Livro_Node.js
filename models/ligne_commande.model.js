/**
 * Model LigneCommande - Gestion des requetes SQL pour la table LigneCommande.
 * Represente un produit individuel dans une commande.
 * Utilise une connexion passede pour les transactions (creation dans une transaction SQL).
 */

const pool = require('../config/db');

/**
 * Model LigneCommande - Objet contenant les fonctions de manipulation des lignes de commande.
 */
const LigneCommande = {
  /**
   * Cree une nouvelle ligne de commande dans une transaction.
   * @param {Object} connection - Connection MySQL avec transaction debutee
   * @param {Object} params - Parametres de la ligne
   * @param {number} params.commande_id - ID de la commande parente
   * @param {number} params.produit_id - ID du produit commande
   * @param {number} params.quantite - Quantite commandee
   * @param {number} params.prix_unitaire - Prix unitaire au moment de la commande
   * @param {number} params.sous_total - Quantite * prix_unitaire
   * @returns {number} ID de la ligne creee
   */
  creer: async (connection, { commande_id, produit_id, quantite, prix_unitaire, sous_total }) => {
    const [result] = await connection.execute(
      'INSERT INTO LigneCommande (commande_id, produit_id, quantite, prix_unitaire, sous_total) VALUES (?, ?, ?, ?, ?)',
      [commande_id, produit_id, quantite, prix_unitaire, sous_total]
    );
    return result.insertId;
  },

  /**
   * Liste toutes les lignes d'une commande avec les informations des produits.
   * @param {number} commande_id - ID de la commande
   * @returns {Array} Liste des lignes avec nom et image du produit
   */
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

  /**
   * Supprime toutes les lignes d'une commande (lors de l'annulation par exemple).
   * @param {number} commande_id - ID de la commande
   * @returns {boolean} true si la suppression a reussi
   */
  supprimerParCommande: async (commande_id) => {
    await pool.execute(
      'DELETE FROM LigneCommande WHERE commande_id = ?',
      [commande_id]
    );
    return true;
  },
};

module.exports = LigneCommande;
