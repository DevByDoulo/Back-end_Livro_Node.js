/**
 * Model Adresse - Gestion des requetes SQL pour la table Adresse.
 * Encapsule toutes les operations de base de donnees relatives aux adresses utilisateurs.
 */

const pool = require('../config/db');

/**
 * Model Adresse - Objet contenant les fonctions de manipulation des adresses.
 */
const Adresse = {
  /**
   * Cree une nouvelle adresse pour un utilisateur.
   * Si est_principale est true,先将其他地址设为非主要，然后再创建新地址。
   * @param {Object} params - Parametres de l'adresse
   * @param {number} params.utilisateur_id - ID de l'utilisateur proprietaire
   * @param {string} params.libelle - Libelle de l'adresse (ex: "Domicile", "Bureau")
   * @param {string} params.adresse - Adresse complete
   * @param {string} params.ville - Ville
   * @param {string} params.quartier - Quartier
   * @param {number} params.latitude - Latitude (optionnel)
   * @param {number} params.longitude - Longitude (optionnel)
   * @param {boolean} params.est_principale - Indique si c'est l'adresse principale
   * @returns {number} ID de l'adresse creee
   */
  creer: async ({ utilisateur_id, libelle, adresse, ville, quartier, latitude, longitude, est_principale }) => {
    // Si cette adresse doit etre principale, d'abord mettre toutes les autres en non-principale
    if (est_principale) {
      await pool.execute(
        'UPDATE Adresse SET est_principale = FALSE WHERE utilisateur_id = ?',
        [utilisateur_id]
      );
    }

    // Inserer la nouvelle adresse
    const [result] = await pool.execute(
      'INSERT INTO Adresse (utilisateur_id, libelle, adresse, ville, quartier, latitude, longitude, est_principale) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [utilisateur_id, libelle, adresse, ville, quartier, latitude || null, longitude || null, est_principale || false]
    );
    return result.insertId;
  },

  /**
   * Recupere toutes les adresses d'un utilisateur, triees par adresse principale en premier.
   * @param {number} utilisateur_id - ID de l'utilisateur
   * @returns {Array} Liste des adresses de l'utilisateur
   */
  trouverParUtilisateur: async (utilisateur_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Adresse WHERE utilisateur_id = ? ORDER BY est_principale DESC',
      [utilisateur_id]
    );
    return rows;
  },

  /**
   * Recupere une adresse par son ID.
   * @param {number} id - ID de l'adresse
   * @returns {Object|null} L'adresse trouvee ou null si elle n'existe pas
   */
  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Adresse WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Met a jour les champs d'une adresse.
   * @param {number} id - ID de l'adresse a mettre a jour
   * @param {Object} champs - Objet contenant les champs a mettre a jour
   * @returns {boolean} true si la mise a jour a reussi
   */
  mettreAJour: async (id, champs) => {
    const keys = Object.keys(champs);
    if (keys.length === 0) return false;

    // Construire dynamiquement la clause SET (ex: "libelle = ?, adresse = ?")
    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => champs[k]);

    await pool.execute(
      `UPDATE Adresse SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return true;
  },

  /**
   * Supprime une adresse par son ID.
   * @param {number} id - ID de l'adresse a supprimer
   * @returns {boolean} true si la suppression a reussi
   */
  supprimer: async (id) => {
    await pool.execute('DELETE FROM Adresse WHERE id = ?', [id]);
    return true;
  },

  /**
   * Verifie qu'une adresse appartient bien a un utilisateur donne.
   * Utilise pour la protection des routes (authorization).
   * @param {number} adresseId - ID de l'adresse
   * @param {number} utilisateurId - ID de l'utilisateur
   * @returns {boolean} true si l'adresse appartient a l'utilisateur
   */
  verifierProprietaire: async (adresseId, utilisateurId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Adresse WHERE id = ? AND utilisateur_id = ?',
      [adresseId, utilisateurId]
    );
    return rows.length > 0;
  },
};

module.exports = Adresse;
