/**
 * Model Utilisateur - Gestion des requetes SQL pour la table Utilisateur.
 * Utilise des requetes preparees pour eviter les injections SQL.
 */

const pool = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const Utilisateur = {
  creer: async ({ nom, prenom, email, mot_de_passe, telephone, role }) => {
    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
    const [result] = await pool.execute(
      'INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe, telephone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hash, telephone, role]
    );
    return result.insertId;
  },

  trouverParEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Utilisateur WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, telephone, role, date_inscription, est_actif FROM Utilisateur WHERE id = ?',
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
      `UPDATE Utilisateur SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return true;
  },

  desactiver: async (id) => {
    await pool.execute(
      'UPDATE Utilisateur SET est_actif = FALSE WHERE id = ?',
      [id]
    );
    return true;
  },

  verifierMotDePasse: async (motDePassePlain, motDePasseHash) => {
    return bcrypt.compare(motDePassePlain, motDePasseHash);
  },

  trouverLivreursDisponibles: async () => {
    const [rows] = await pool.execute(
      `SELECT id, nom, prenom, telephone FROM Utilisateur 
       WHERE role = 'livreur' AND est_actif = TRUE`
    );
    return rows;
  },
};

module.exports = Utilisateur;
