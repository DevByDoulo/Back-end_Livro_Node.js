/**
 * Model Utilisateur - Gestion des requetes SQL pour la table Utilisateur.
 * Utilise des requetes preparees pour eviter les injections SQL.
 * Gere l'inscription, l'authentification et la gestion des profils utilisateurs.
 */

const pool = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Nombre de tours de hashing pour bcrypt (10 = bon compromis securite/performance).
 */
const SALT_ROUNDS = 10;

/**
 * Model Utilisateur - Objet contenant les fonctions de manipulation des utilisateurs.
 */
const Utilisateur = {
  /**
   * Cree un nouvel utilisateur avec un mot de passe hache.
   * @param {Object} params - Parametres de l'utilisateur
   * @param {string} params.nom - Nom de famille
   * @param {string} params.prenom - Prenom
   * @param {string} params.email - Adresse email (unique)
   * @param {string} params.mot_de_passe - Mot de passe en clair (sera hache)
   * @param {string} params.telephone - Numero de telephone
   * @param {string} params.role - Role (client, commercant, livreur)
   * @returns {number} ID de l'utilisateur cree
   */
  creer: async ({ nom, prenom, email, mot_de_passe, telephone, role }) => {
    // Hasher le mot de passe avec bcrypt avant de le stocker
    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
    const [result] = await pool.execute(
      'INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe, telephone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hash, telephone, role]
    );
    return result.insertId;
  },

  /**
   * Recherche un utilisateur par son adresse email.
   * @param {string} email - Adresse email a rechercher
   * @returns {Object|null} L'utilisateur trouve ou null
   */
  trouverParEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Utilisateur WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Recherche un utilisateur par son ID.
   * Ne retourne pas le mot de passe pour des raisons de securite.
   * @param {number} id - ID de l'utilisateur
   * @returns {Object|null} L'utilisateur trouve ou null
   */
  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, telephone, role, date_inscription, est_actif FROM Utilisateur WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Met a jour les informations d'un utilisateur.
   * @param {number} id - ID de l'utilisateur a mettre a jour
   * @param {Object} champs - Objet contenant les champs a mettre a jour
   * @returns {boolean} true si la mise a jour a reussi
   */
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

  /**
   * Desactive un compte utilisateur (soft delete).
   * @param {number} id - ID de l'utilisateur a desactiver
   * @returns {boolean} true si la desactivation a reussi
   */
  desactiver: async (id) => {
    await pool.execute(
      'UPDATE Utilisateur SET est_actif = FALSE WHERE id = ?',
      [id]
    );
    return true;
  },

  /**
   * Verifie si un mot de passe en clair correspond au hash stocke.
   * @param {string} motDePassePlain - Mot de passe en clair a verifier
   * @param {string} motDePasseHash - Hash du mot de passe stocke en base
   * @returns {boolean} true si les mots de passe correspondent
   */
  verifierMotDePasse: async (motDePassePlain, motDePasseHash) => {
    return bcrypt.compare(motDePassePlain, motDePasseHash);
  },

  /**
   * Hashe un mot de passe pour le stocker en base.
   * @param {string} motDePasse - Mot de passe en clair a hasher
   * @returns {string} Le hash du mot de passe
   */
  hasherMotDePasse: async (motDePasse) => {
    return bcrypt.hash(motDePasse, SALT_ROUNDS);
  },

  /**
   * Recupere la liste des livreurs disponibles (actifs).
   * @returns {Array} Liste des livreurs disponibles
   */
  trouverLivreursDisponibles: async () => {
    const [rows] = await pool.execute(
      `SELECT id, nom, prenom, telephone FROM Utilisateur 
       WHERE role = 'livreur' AND est_actif = TRUE`
    );
    return rows;
  },
};

module.exports = Utilisateur;
