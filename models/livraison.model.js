/**
 * Model Livraison - Gestion des requetes SQL pour la table Livraison.
 * Gere le suivi des livraisons, l'assignation des livreurs et le tracking GPS.
 */

const pool = require('../config/db');

/**
 * Model Livraison - Objet contenant les fonctions de manipulation des livraisons.
 */
const Livraison = {
  /**
   * Cree une nouvelle livraison pour une commande.
   * @param {Object} params - Parametres de la livraison
   * @param {number} params.commande_id - ID de la commande associee
   * @param {number} params.livreur_id - ID du livreur (optionnel, peut etre null si non assignee)
   * @param {string} params.statut - Statut initial de la livraison (defaut: 'disponible')
   * @returns {number} ID de la livraison creee
   */
  creer: async ({ commande_id, livreur_id, statut }) => {
    const [result] = await pool.execute(
      'INSERT INTO Livraison (commande_id, livreur_id, statut, date_debut) VALUES (?, ?, ?, NOW())',
      [commande_id, livreur_id || null, statut || 'disponible']
    );
    return result.insertId;
  },

  /**
   * Recupere la livraison associee a une commande.
   * @param {number} commande_id - ID de la commande
   * @returns {Object|null} La livraison trouvee ou null
   */
  trouverParCommande: async (commande_id) => {
    const [rows] = await pool.execute(
      `SELECT l.*, u.nom AS livreur_nom, u.prenom AS livreur_prenom, u.telephone AS livreur_telephone
       FROM Livraison l
       LEFT JOIN Utilisateur u ON l.livreur_id = u.id
       WHERE l.commande_id = ?`,
      [commande_id]
    );
    return rows[0] || null;
  },

  /**
   * Recupere une livraison par son ID.
   * @param {number} id - ID de la livraison
   * @returns {Object|null} La livraison trouvee ou null
   */
  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      `SELECT l.*, u.nom AS livreur_nom, u.prenom AS livreur_prenom
       FROM Livraison l
       LEFT JOIN Utilisateur u ON l.livreur_id = u.id
       WHERE l.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Liste les livraisons disponibles (non assignees et en attente).
   * @param {number} offset - Offset pour la pagination
   * @param {number} limite - Nombre de resultats
   * @returns {Array} Liste des livraisons disponibles
   */
  listerDisponibles: async (offset = 0, limite = 10) => {
    const [rows] = await pool.query(
      `SELECT l.*, co.montant_total, c.nom AS commerce_nom, c.zone_livraison,
              a.adresse AS adresse_livraison, a.ville, a.quartier
       FROM Livraison l
       JOIN Commande co ON l.commande_id = co.id
       JOIN Commerce c ON co.commerce_id = c.id
       JOIN Adresse a ON co.adresse_id = a.id
       WHERE l.statut = 'disponible' AND l.livreur_id IS NULL
       ORDER BY l.date_debut ASC
       LIMIT ? OFFSET ?`,
      [Number(limite), Number(offset)]
    );
    return rows;
  },

  /**
   * Liste les livraisons d'un livreur specifique.
   * @param {number} livreur_id - ID du livreur
   * @param {number} offset - Offset pour la pagination
   * @param {number} limite - Nombre de resultats
   * @returns {Array} Liste des livraisons du livreur
   */
  listerParLivreur: async (livreur_id, offset = 0, limite = 10) => {
    const [rows] = await pool.query(
      `SELECT l.*, co.montant_total, co.statut AS statut_commande,
              c.nom AS commerce_nom, a.adresse AS adresse_livraison
       FROM Livraison l
       JOIN Commande co ON l.commande_id = co.id
       JOIN Commerce c ON co.commerce_id = c.id
       JOIN Adresse a ON co.adresse_id = a.id
       WHERE l.livreur_id = ?
       ORDER BY l.date_debut DESC
       LIMIT ? OFFSET ?`,
      [livreur_id, Number(limite), Number(offset)]
    );
    return rows;
  },

  /**
   * Assigne un livreur a une livraison et met a jour le statut.
   * @param {number} id - ID de la livraison
   * @param {number} livreur_id - ID du livreur assignee
   * @returns {boolean} true si l'assignation a reussi
   */
  assignerLivreur: async (id, livreur_id) => {
    await pool.execute(
      'UPDATE Livraison SET livreur_id = ?, statut = ? WHERE id = ?',
      [livreur_id, 'en_cours_recuperation', id]
    );
    return true;
  },

  /**
   * Met a jour le statut d'une livraison.
   * Si le statut est 'livree', definit egalement la date de fin.
   * @param {number} id - ID de la livraison
   * @param {string} statut - Nouveau statut
   * @returns {boolean} true si la mise a jour a reussi
   */
  mettreAJourStatut: async (id, statut) => {
    // Si la livraison est terminee, enregistrer la date de fin
    if (statut === 'livree') {
      await pool.execute(
        'UPDATE Livraison SET statut = ?, date_fin = NOW() WHERE id = ?',
        [statut, id]
      );
    } else {
      await pool.execute(
        'UPDATE Livraison SET statut = ? WHERE id = ?',
        [statut, id]
      );
    }
    return true;
  },

  /**
   * Met a jour la position GPS du livreur en cours de livraison.
   * @param {number} id - ID de la livraison
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {boolean} true si la mise a jour a reussi
   */
  mettreAJourPosition: async (id, lat, lng) => {
    await pool.execute(
      'UPDATE Livraison SET position_lat = ?, position_lng = ? WHERE id = ?',
      [lat, lng, id]
    );
    return true;
  },

  /**
   * Compte le nombre de livraisons disponibles (non assignees).
   * @returns {number} Nombre de livraisons disponibles
   */
  compterDisponibles: async () => {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM Livraison WHERE statut = 'disponible' AND livreur_id IS NULL"
    );
    return rows[0].total;
  },
};

module.exports = Livraison;
