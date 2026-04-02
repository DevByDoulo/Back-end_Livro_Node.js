/**
 * Model Commerce - Gestion des requetes SQL pour la table Commerce.
 * Gere les operations CRUD sur les commerces, avec jointures pour les informations du proprietaire.
 */

const pool = require('../config/db');

/**
 * Model Commerce - Objet contenant les fonctions de manipulation des commerces.
 */
const Commerce = {
  /**
   * Cree un nouveau commerce pour un utilisateur.
   * @param {Object} params - Parametres du commerce
   * @param {number} params.utilisateur_id - ID de l'utilisateur proprietaire (commercant)
   * @param {string} params.nom - Nom du commerce
   * @param {string} params.description - Description du commerce
   * @param {string} params.logo - URL du logo
   * @param {string} params.horaires - Horaires d'ouverture (format JSON ou texte)
   * @param {string} params.zone_livraison - Zone de livraison du commerce
   * @returns {number} ID du commerce cree
   */
  creer: async ({ utilisateur_id, nom, description, logo, horaires, zone_livraison }) => {
    const [result] = await pool.execute(
      'INSERT INTO Commerce (utilisateur_id, nom, description, logo, horaires, zone_livraison) VALUES (?, ?, ?, ?, ?, ?)',
      [utilisateur_id, nom, description || null, logo || null, horaires || null, zone_livraison]
    );
    return result.insertId;
  },

  /**
   * Recupere un commerce par son ID avec les informations du proprietaire.
   * @param {number} id - ID du commerce
   * @returns {Object|null} Le commerce trouve ou null
   */
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

  /**
   * Recupere tous les commerce d'un utilisateur (proprietaire).
   * @param {number} utilisateur_id - ID de l'utilisateur proprietaire
   * @returns {Array} Liste des commerces de l'utilisateur
   */
  trouverParUtilisateur: async (utilisateur_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Commerce WHERE utilisateur_id = ?',
      [utilisateur_id]
    );
    return rows;
  },

  /**
   * Liste tous les commerces actifs avec pagination et informations du proprietaire.
   * @param {number} offset - Offset pour la pagination SQL
   * @param {number} limite - Nombre de resultats a retourner
   * @returns {Array} Liste des commerces actifs
   */
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

  /**
   * Compte le nombre total de commerces actifs.
   * @returns {number} Nombre de commerces actifs
   */
  compter: async () => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM Commerce WHERE est_actif = TRUE'
    );
    return rows[0].total;
  },

  /**
   * Met a jour les informations d'un commerce.
   * @param {number} id - ID du commerce a mettre a jour
   * @param {Object} champs - Objet contenant les champs a mettre a jour
   * @returns {boolean} true si la mise a jour a reussi
   */
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

  /**
   * Supprime un commerce (suppression definitive).
   * @param {number} id - ID du commerce a supprimer
   * @returns {boolean} true si la suppression a reussi
   */
  supprimer: async (id) => {
    await pool.execute('DELETE FROM Commerce WHERE id = ?', [id]);
    return true;
  },

  /**
   * Verifie qu'un commerce appartient bien a un utilisateur donne.
   * @param {number} commerceId - ID du commerce
   * @param {number} utilisateurId - ID de l'utilisateur (proprietaire)
   * @returns {boolean} true si le commerce appartient a l'utilisateur
   */
  verifierProprietaire: async (commerceId, utilisateurId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Commerce WHERE id = ? AND utilisateur_id = ?',
      [commerceId, utilisateurId]
    );
    return rows.length > 0;
  },
};

module.exports = Commerce;
