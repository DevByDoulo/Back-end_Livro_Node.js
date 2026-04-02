/**
 * Model Commande - Gestion des requetes SQL pour la table Commande.
 * Inclut la gestion des transactions pour l'insertion atomique.
 * Gere le cycle de vie complet des commandes (creation, lecture, mise a jour).
 */

const pool = require('../config/db');

/**
 * Model Commande - Objet contenant les fonctions de manipulation des commandes.
 */
const Commande = {
  /**
   * Cree une nouvelle commande.
   * @param {Object} params - Parametres de la commande
   * @param {number} params.client_id - ID du client qui passe la commande
   * @param {number} params.commerce_id - ID du commerce concerne
   * @param {number} params.adresse_id - ID de l'adresse de livraison
   * @param {number} params.montant_total - Montant total (produits + livraison)
   * @param {number} params.frais_livraison - Frais de livraison
   * @returns {number} ID de la commande creee
   */
  creer: async ({ client_id, commerce_id, adresse_id, montant_total, frais_livraison }) => {
    const [result] = await pool.execute(
      `INSERT INTO Commande (client_id, commerce_id, adresse_id, montant_total, frais_livraison)
       VALUES (?, ?, ?, ?, ?)`,
      [client_id, commerce_id, adresse_id, montant_total, frais_livraison || 0]
    );
    return result.insertId;
  },

  /**
   * Recupere une commande par son ID avec les details du client, commerce et adresse.
   * @param {number} id - ID de la commande
   * @returns {Object|null} La commande trouvee ou null
   */
  trouverParId: async (id) => {
    const [rows] = await pool.execute(
      `SELECT co.*,
              u.nom AS client_nom, u.prenom AS client_prenom, u.telephone AS client_telephone,
              c.nom AS commerce_nom,
              a.adresse AS adresse_livraison, a.ville, a.quartier
       FROM Commande co
       JOIN Utilisateur u ON co.client_id = u.id
       JOIN Commerce c ON co.commerce_id = c.id
       JOIN Adresse a ON co.adresse_id = a.id
       WHERE co.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Liste les commandes d'un client avec pagination.
   * @param {number} client_id - ID du client
   * @param {number} offset - Offset pour la pagination
   * @param {number} limite - Nombre de resultats
   * @returns {Array} Liste des commandes du client
   */
  listerParClient: async (client_id, offset = 0, limite = 10) => {
    const [rows] = await pool.query(
      `SELECT co.*, c.nom AS commerce_nom
       FROM Commande co
       JOIN Commerce c ON co.commerce_id = c.id
       WHERE co.client_id = ?
       ORDER BY co.date_commande DESC
       LIMIT ? OFFSET ?`,
      [client_id, Number(limite), Number(offset)]
    );
    return rows;
  },

  /**
   * Liste les commandes d'un commerce avec option de filtre par statut.
   * @param {number} commerce_id - ID du commerce
   * @param {number} offset - Offset pour la pagination
   * @param {number} limite - Nombre de resultats
   * @param {string|null} statut - Filtre optionnel par statut
   * @returns {Array} Liste des commandes du commerce
   */
  listerParCommerce: async (commerce_id, offset = 0, limite = 10, statut = null) => {
    let query = `SELECT co.*, u.nom AS client_nom, u.prenom AS client_prenom
                 FROM Commande co
                 JOIN Utilisateur u ON co.client_id = u.id
                 WHERE co.commerce_id = ?`;
    const params = [commerce_id];

    // Ajouter le filtre de statut si specifie
    if (statut) {
      query += ' AND co.statut = ?';
      params.push(statut);
    }

    // Tri par date et pagination
    query += ' ORDER BY co.date_commande DESC LIMIT ? OFFSET ?';
    params.push(Number(limite), Number(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

  /**
   * Liste les commandes assignees a un livreur.
   * @param {number} livreur_id - ID du livreur
   * @param {number} offset - Offset pour la pagination
   * @param {number} limite - Nombre de resultats
   * @returns {Array} Liste des commandes du livreur
   */
  listerParLivreur: async (livreur_id, offset = 0, limite = 10) => {
    const [rows] = await pool.query(
      `SELECT co.*, c.nom AS commerce_nom, l.statut AS statut_livraison
       FROM Livraison l
       JOIN Commande co ON l.commande_id = co.id
       JOIN Commerce c ON co.commerce_id = c.id
       WHERE l.livreur_id = ?
       ORDER BY co.date_commande DESC
       LIMIT ? OFFSET ?`,
      [livreur_id, Number(limite), Number(offset)]
    );
    return rows;
  },

  /**
   * Met a jour le statut d'une commande.
   * Si le statut est 'livree', definit egalement la date de livraison.
   * @param {number} id - ID de la commande
   * @param {string} statut - Nouveau statut
   * @returns {boolean} true si la mise a jour a reussi
   */
  mettreAJourStatut: async (id, statut) => {
    const champs = { statut };
    // Definir la date de livraison si le statut est 'livree'
    if (statut === 'livree') {
      champs.date_livraison = new Date();
    }

    await pool.execute(
      'UPDATE Commande SET statut = ?, date_livraison = ? WHERE id = ?',
      [statut, champs.date_livraison || null, id]
    );
    return true;
  },

  /**
   * Lie un paiement a une commande.
   * @param {number} commandeId - ID de la commande
   * @param {number} paiementId - ID du paiement
   * @returns {boolean} true si la mise a jour a reussi
   */
  mettreAJourPaiement: async (commandeId, paiementId) => {
    await pool.execute(
      'UPDATE Commande SET paiement_id = ? WHERE id = ?',
      [paiementId, commandeId]
    );
    return true;
  },

  /**
   * Compte le nombre de commandes d'un client.
   * @param {number} client_id - ID du client
   * @returns {number} Nombre de commandes
   */
  compterParClient: async (client_id) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM Commande WHERE client_id = ?',
      [client_id]
    );
    return rows[0].total;
  },

  /**
   * Compte le nombre de commandes d'un commerce, eventuellement filtrees par statut.
   * @param {number} commerce_id - ID du commerce
   * @param {string|null} statut - Filtre optionnel par statut
   * @returns {number} Nombre de commandes
   */
  compterParCommerce: async (commerce_id, statut = null) => {
    let query = 'SELECT COUNT(*) AS total FROM Commande WHERE commerce_id = ?';
    const params = [commerce_id];

    if (statut) {
      query += ' AND statut = ?';
      params.push(statut);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },

  /**
   * Verifie qu'une commande appartient bien a un client donne.
   * @param {number} commandeId - ID de la commande
   * @param {number} clientId - ID du client
   * @returns {boolean} true si la commande appartient au client
   */
  verifierAppartenance: async (commandeId, clientId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Commande WHERE id = ? AND client_id = ?',
      [commandeId, clientId]
    );
    return rows.length > 0;
  },

  /**
   * Demarre une transaction SQL.
   * Utilise pour les operations atomiques (ex: creation de commande + lignes).
   * @returns {Object} Connection avec transaction debutee
   */
  demarrerTransaction: async () => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
  },

  /**
   * Valide une transaction SQL (commit).
   * @param {Object} connection - Connection a valider
   * @returns {void}
   */
  validerTransaction: async (connection) => {
    await connection.commit();
    connection.release();
  },

  /**
   * Annule une transaction SQL (rollback).
   * @param {Object} connection - Connection a annuler
   * @returns {void}
   */
  annulerTransaction: async (connection) => {
    await connection.rollback();
    connection.release();
  },
};

module.exports = Commande;
