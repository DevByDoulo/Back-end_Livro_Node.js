/**
 * Model Produit - Gestion des requetes SQL pour la table Produit.
 */

const pool = require('../config/db');

const Produit = {
  creer: async ({ commerce_id, nom, description, prix, stock, image }) => {
    const [result] = await pool.execute(
      'INSERT INTO Produit (commerce_id, nom, description, prix, stock, image) VALUES (?, ?, ?, ?, ?, ?)',
      [commerce_id, nom, description || null, prix, stock || 0, image || null]
    );
    return result.insertId;
  },

  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Produit WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  listerParCommerce: async (commerce_id, offset = 0, limite = 10, filtres = {}) => {
    let query = 'SELECT * FROM Produit WHERE commerce_id = ?';
    const params = [commerce_id];

    if (filtres.est_disponible !== undefined) {
      query += ' AND est_disponible = ?';
      params.push(filtres.est_disponible);
    }

    if (filtres.recherche) {
      query += ' AND (nom LIKE ? OR description LIKE ?)';
      params.push(`%${filtres.recherche}%`, `%${filtres.recherche}%`);
    }

    if (filtres.prix_min !== undefined) {
      query += ' AND prix >= ?';
      params.push(filtres.prix_min);
    }

    if (filtres.prix_max !== undefined) {
      query += ' AND prix <= ?';
      params.push(filtres.prix_max);
    }

    query += ' ORDER BY date_ajout DESC LIMIT ? OFFSET ?';
    params.push(Number(limite), Number(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

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

  supprimer: async (id) => {
    await pool.execute('DELETE FROM Produit WHERE id = ?', [id]);
    return true;
  },

  verifierAppartenance: async (produitId, commerceId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Produit WHERE id = ? AND commerce_id = ?',
      [produitId, commerceId]
    );
    return rows.length > 0;
  },

  decrementerStock: async (produitId, quantite) => {
    await pool.execute(
      'UPDATE Produit SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantite, produitId, quantite]
    );
  },
};

module.exports = Produit;
