/**
 * Model Livraison - Gestion des requetes SQL pour la table Livraison.
 */

const pool = require('../config/db');

const Livraison = {
  creer: async ({ commande_id, livreur_id, statut }) => {
    const [result] = await pool.execute(
      'INSERT INTO Livraison (commande_id, livreur_id, statut, date_debut) VALUES (?, ?, ?, NOW())',
      [commande_id, livreur_id || null, statut || 'disponible']
    );
    return result.insertId;
  },

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

  assignerLivreur: async (id, livreur_id) => {
    await pool.execute(
      'UPDATE Livraison SET livreur_id = ?, statut = ? WHERE id = ?',
      [livreur_id, 'en_cours_recuperation', id]
    );
    return true;
  },

  mettreAJourStatut: async (id, statut) => {
    const champs = { statut };
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

  mettreAJourPosition: async (id, lat, lng) => {
    await pool.execute(
      'UPDATE Livraison SET position_lat = ?, position_lng = ? WHERE id = ?',
      [lat, lng, id]
    );
    return true;
  },

  compterDisponibles: async () => {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM Livraison WHERE statut = 'disponible' AND livreur_id IS NULL"
    );
    return rows[0].total;
  },
};

module.exports = Livraison;
