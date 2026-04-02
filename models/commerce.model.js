/**
 * Model Commerce - Gestion des requetes SQL pour la table Commerce.
 */

const pool = require('../config/db');

const Commerce = {
  creer: async ({ utilisateur_id, nom, description, logo, horaires, zone_livraison }) => {
    const [result] = await pool.execute(
      'INSERT INTO Commerce (utilisateur_id, nom, description, logo, horaires, zone_livraison) VALUES (?, ?, ?, ?, ?, ?)',
      [utilisateur_id, nom, description || null, logo || null, horaires || null, zone_livraison]
    );
    return result.insertId;
  },

  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      `SELECT c.*, u.nom AS proprietaire_nom, u.prenom AS proprietaire_prenom, u.telephone AS proprietaire_telephone
       FROM Commerce c
       JOIN Utilisateur u ON c.utilisateur_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  trouverParUtilisateur: async (utilisateur_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Commerce WHERE utilisateur_id = ?',
      [utilisateur_id]
    );
    return rows;
  },

  lister: async (offset = 0, limite = 10) => {
    const [rows] = await pool.query(
      `SELECT c.*, u.nom AS proprietaire_nom, u.prenom AS proprietaire_prenom
       FROM Commerce c
       JOIN Utilisateur u ON c.utilisateur_id = u.id
       WHERE c.est_actif = TRUE
       ORDER BY c.date_creation DESC
       LIMIT ? OFFSET ?`,
      [Number(limite), Number(offset)]
    );
    return rows;
  },

  compter: async () => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM Commerce WHERE est_actif = TRUE'
    );
    return rows[0].total;
  },

  mettreAJour: async (id, champs) => {
    const keys = Object.keys(champs);
    if (keys.length === 0) return false;

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => champs[k]);

    await pool.execute(
      `UPDATE Commerce SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return true;
  },

  supprimer: async (id) => {
    await pool.execute('DELETE FROM Commerce WHERE id = ?', [id]);
    return true;
  },

  verifierProprietaire: async (commerceId, utilisateurId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Commerce WHERE id = ? AND utilisateur_id = ?',
      [commerceId, utilisateurId]
    );
    return rows.length > 0;
  },
};

module.exports = Commerce;
