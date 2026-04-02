/**
 * Model Avis - Gestion des requetes SQL pour la table Avis.
 * Gere les avis et notes des clients sur les commerces et livreurs.
 */

const pool = require('../config/db');

/**
 * Model Avis - Objet contenant les fonctions de manipulation des avis.
 */
const Avis = {
  /**
   * Cree un nouvel avis.
   * @param {Object} params - Parametres de l'avis
   * @param {number} params.client_id - ID du client qui donne l'avis
   * @param {string} params.type - Type de cible (commerce ou livreur)
   * @param {number} params.cible_id - ID de la cible (commerce ou livreur)
   * @param {number} params.note - Note (1-5)
   * @param {string} params.commentaire - Commentaire optionnel
   * @returns {number} ID de l'avis cree
   */
  creer: async ({ client_id, type, cible_id, note, commentaire }) => {
    const [result] = await pool.execute(
      'INSERT INTO Avis (client_id, type, cible_id, note, commentaire) VALUES (?, ?, ?, ?, ?)',
      [client_id, type, cible_id, note, commentaire || null]
    );
    return result.insertId;
  },

  /**
   * Liste les avis pour une cible donnee (commerce ou livreur) avec pagination.
   * @param {string} type - Type de cible (commerce ou livreur)
   * @param {number} cible_id - ID de la cible
   * @param {number} offset - Offset pour la pagination
   * @param {number} limite - Nombre de resultats
   * @returns {Array} Liste des avis avec informations du client
   */
  listerParCible: async (type, cible_id, offset = 0, limite = 10) => {
    const [rows] = await pool.query(
      `SELECT a.*, u.nom AS client_nom, u.prenom AS client_prenom
       FROM Avis a
       JOIN Utilisateur u ON a.client_id = u.id
       WHERE a.type = ? AND a.cible_id = ?
       ORDER BY a.date_avis DESC
       LIMIT ? OFFSET ?`,
      [type, cible_id, Number(limite), Number(offset)]
    );
    return rows;
  },

  /**
   * Calcule la moyenne des notes et le nombre total d'avis pour une cible.
   * @param {string} type - Type de cible (commerce ou livreur)
   * @param {number} cible_id - ID de la cible
   * @returns {Object} { moyenne: string, total: number }
   */
  moyenneParCible: async (type, cible_id) => {
    const [rows] = await pool.execute(
      `SELECT AVG(note) AS moyenne, COUNT(*) AS total
       FROM Avis
       WHERE type = ? AND cible_id = ?`,
      [type, cible_id]
    );
    return {
      moyenne: rows[0].moyenne ? parseFloat(rows[0].moyenne).toFixed(1) : 0,
      total: rows[0].total,
    };
  },

  /**
   * Verifie si un client a deja laisse un avis sur une cible donnee.
   * @param {number} client_id - ID du client
   * @param {string} type - Type de cible
   * @param {number} cible_id - ID de la cible
   * @returns {boolean} true si un avis existe deja
   */
  verifierDejaNote: async (client_id, type, cible_id) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Avis WHERE client_id = ? AND type = ? AND cible_id = ?',
      [client_id, type, cible_id]
    );
    return rows.length > 0;
  },

  /**
   * Supprime un avis (uniquement par le client qui l'a cree).
   * @param {number} id - ID de l'avis
   * @param {number} client_id - ID du client proprietaire de l'avis
   * @returns {boolean} true si la suppression a reussi
   */
  supprimer: async (id, client_id) => {
    await pool.execute(
      'DELETE FROM Avis WHERE id = ? AND client_id = ?',
      [id, client_id]
    );
    return true;
  },
};

module.exports = Avis;
