/**
 * Model Produit - Gestion des requetes SQL pour la table Produit.
 * Gere les operations CRUD sur les produits avec systeme de filtres et pagination.
 */

const pool = require('../config/db');

/**
 * Model Produit - Objet contenant les fonctions de manipulation des produits.
 */
const Produit = {
  /**
   * Cree un nouveau produit pour un commerce.
   * @param {Object} params - Parametres du produit
   * @param {number} params.commerce_id - ID du commerce proprietaire
   * @param {string} params.nom - Nom du produit
   * @param {string} params.description - Description du produit
   * @param {number} params.prix - Prix du produit
   * @param {number} params.stock - Quantite en stock (defaut: 0)
   * @param {string} params.image - URL de l'image du produit
   * @returns {number} ID du produit cree
   */
  creer: async ({ commerce_id, nom, description, prix, stock, image }) => {
    const [result] = await pool.execute(
      'INSERT INTO Produit (commerce_id, nom, description, prix, stock, image) VALUES (?, ?, ?, ?, ?, ?)',
      [commerce_id, nom, description || null, prix, stock || 0, image || null]
    );
    return result.insertId;
  },

  /**
   * Recupere un produit par son ID.
   * @param {number} id - ID du produit
   * @returns {Object|null} Le produit trouve ou null
   */
  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Produit WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Liste les produits d'un commerce avec filtres et pagination.
   * @param {number} commerce_id - ID du commerce
   * @param {number} offset - Offset pour la pagination
   * @param {number} limite - Nombre de resultats
   * @param {Object} filtres - Filtres optionnels (est_disponible, recherche, prix_min, prix_max)
   * @returns {Array} Liste des produits filtres
   */
  listerParCommerce: async (commerce_id, offset = 0, limite = 10, filtres = {}) => {
    let query = 'SELECT * FROM Produit WHERE commerce_id = ?';
    const params = [commerce_id];

    // Filtre: produits disponibles uniquement
    if (filtres.est_disponible !== undefined) {
      query += ' AND est_disponible = ?';
      params.push(filtres.est_disponible);
    }

    // Filtre: recherche par nom ou description
    if (filtres.recherche) {
      query += ' AND (nom LIKE ? OR description LIKE ?)';
      params.push(`%${filtres.recherche}%`, `%${filtres.recherche}%`);
    }

    // Filtre: prix minimum
    if (filtres.prix_min !== undefined) {
      query += ' AND prix >= ?';
      params.push(filtres.prix_min);
    }

    // Filtre: prix maximum
    if (filtres.prix_max !== undefined) {
      query += ' AND prix <= ?';
      params.push(filtres.prix_max);
    }

    // Tri par date d'ajout (plus recents en premier) et pagination
    query += ' ORDER BY date_ajout DESC LIMIT ? OFFSET ?';
    params.push(Number(limite), Number(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

  /**
   * Compte le nombre de produits d'un commerce avec les memes filtres.
   * @param {number} commerce_id - ID du commerce
   * @param {Object} filtres - Filtres optionnels
   * @returns {number} Nombre de produits correspondants
   */
  compterParCommerce: async (commerce_id, filtres = {}) => {
    let query = 'SELECT COUNT(*) AS total FROM Produit WHERE commerce_id = ?';
    const params = [commerce_id];

    if (filtres.est_disponible !== undefined) {
      query += ' AND est_disponible = ?';
      params.push(filtres.est_disponible);
    }

    if (filtres.recherche) {
      query += ' AND (nom LIKE ? OR description LIKE ?)';
      params.push(`%${filtres.recherche}%`, `%${filtres.recherche}%`);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },

  /**
   * Met a jour les informations d'un produit.
   * @param {number} id - ID du produit a mettre a jour
   * @param {Object} champs - Objet contenant les champs a mettre a jour
   * @returns {boolean} true si la mise a jour a reussi
   */
  mettreAJour: async (id, champs) => {
    const keys = Object.keys(champs);
    if (keys.length === 0) return false;

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => champs[k]);

    await pool.execute(
      `UPDATE Produit SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return true;
  },

  /**
   * Supprime un produit par son ID.
   * @param {number} id - ID du produit a supprimer
   * @returns {boolean} true si la suppression a reussi
   */
  supprimer: async (id) => {
    await pool.execute('DELETE FROM Produit WHERE id = ?', [id]);
    return true;
  },

  /**
   * Verifie qu'un produit appartient bien a un commerce donne.
   * @param {number} produitId - ID du produit
   * @param {number} commerceId - ID du commerce
   * @returns {boolean} true si le produit appartient au commerce
   */
  verifierAppartenance: async (produitId, commerceId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Produit WHERE id = ? AND commerce_id = ?',
      [produitId, commerceId]
    );
    return rows.length > 0;
  },

  /**
   * Decremente le stock d'un produit apres une commande.
   * @param {number} produitId - ID du produit
   * @param {number} quantite - Quantite a decrementer
   * @returns {void}
   */
  decrementerStock: async (produitId, quantite) => {
    await pool.execute(
      'UPDATE Produit SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantite, produitId, quantite]
    );
  },
};

module.exports = Produit;
