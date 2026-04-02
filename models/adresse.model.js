/**
 * Model Adresse - Gestion des requetes SQL pour la table Adresse.
 */

const pool = require('../config/db');

const Adresse = {
  creer: async ({ utilisateur_id, libelle, adresse, ville, quartier, latitude, longitude, est_principale }) => {
    if (est_principale) {
      await pool.execute(
        'UPDATE Adresse SET est_principale = FALSE WHERE utilisateur_id = ?',
        [utilisateur_id]
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO Adresse (utilisateur_id, libelle, adresse, ville, quartier, latitude, longitude, est_principale) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [utilisateur_id, libelle, adresse, ville, quartier, latitude || null, longitude || null, est_principale || false]
    );
    return result.insertId;
  },

  trouverParUtilisateur: async (utilisateur_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Adresse WHERE utilisateur_id = ? ORDER BY est_principale DESC',
      [utilisateur_id]
    );
    return rows;
  },

  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Adresse WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  mettreAJour: async (id, champs) => {
    const keys = Object.keys(champs);
    if (keys.length === 0) return false;

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => champs[k]);

    await pool.execute(
      `UPDATE Adresse SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return true;
  },

  supprimer: async (id) => {
    await pool.execute('DELETE FROM Adresse WHERE id = ?', [id]);
    return true;
  },

  verifierProprietaire: async (adresseId, utilisateurId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Adresse WHERE id = ? AND utilisateur_id = ?',
      [adresseId, utilisateurId]
    );
    return rows.length > 0;
  },
};

module.exports = Adresse;
