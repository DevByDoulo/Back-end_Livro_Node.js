/**
 * Model Commande - Gestion des requetes SQL pour la table Commande.
 * Inclut la gestion des transactions pour l'insertion atomique.
 */

const pool = require('../config/db');

const Commande = {
  creer: async ({ client_id, commerce_id, adresse_id, montant_total, frais_livraison }) => {
    const [result] = await pool.execute(
      `INSERT INTO Commande (client_id, commerce_id, adresse_id, montant_total, frais_livraison)
       VALUES (?, ?, ?, ?, ?)`,
      [client_id, commerce_id, adresse_id, montant_total, frais_livraison || 0]
    );
    return result.insertId;
  },

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

  listerParCommerce: async (commerce_id, offset = 0, limite = 10, statut = null) => {
    let query = `SELECT co.*, u.nom AS client_nom, u.prenom AS client_prenom
                 FROM Commande co
                 JOIN Utilisateur u ON co.client_id = u.id
                 WHERE co.commerce_id = ?`;
    const params = [commerce_id];

    if (statut) {
      query += ' AND co.statut = ?';
      params.push(statut);
    }

    query += ' ORDER BY co.date_commande DESC LIMIT ? OFFSET ?';
    params.push(Number(limite), Number(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

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

  mettreAJourStatut: async (id, statut) => {
    const champs = { statut };
    if (statut === 'livree') {
      champs.date_livraison = new Date();
    }

    await pool.execute(
      'UPDATE Commande SET statut = ?, date_livraison = ? WHERE id = ?',
      [statut, champs.date_livraison || null, id]
    );
    return true;
  },

  mettreAJourPaiement: async (commandeId, paiementId) => {
    await pool.execute(
      'UPDATE Commande SET paiement_id = ? WHERE id = ?',
      [paiementId, commandeId]
    );
    return true;
  },

  compterParClient: async (client_id) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM Commande WHERE client_id = ?',
      [client_id]
    );
    return rows[0].total;
  },

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

  verifierAppartenance: async (commandeId, clientId) => {
    const [rows] = await pool.execute(
      'SELECT id FROM Commande WHERE id = ? AND client_id = ?',
      [commandeId, clientId]
    );
    return rows.length > 0;
  },

  demarrerTransaction: async () => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
  },

  validerTransaction: async (connection) => {
    await connection.commit();
    connection.release();
  },

  annulerTransaction: async (connection) => {
    await connection.rollback();
    connection.release();
  },
};

module.exports = Commande;
