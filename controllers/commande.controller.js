/**
 * Controller Commande - Gestion complete des commandes.
 * Cree une commande avec ses lignes dans une transaction SQL atomique.
 */

const Commande = require('../models/commande.model');
const LigneCommande = require('../models/ligne_commande.model');
const Produit = require('../models/produit.model');
const Livraison = require('../models/livraison.model');
const Adresse = require('../models/adresse.model');
const Commerce = require('../models/commerce.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { getPagination, getPaginationMeta } = require('../utilitaires/pagination');
const pool = require('../config/db');

const FRAIS_LIVRAISON = 500;

/**
 * POST /api/commandes
 * Cree une commande avec ses lignes, calcule les totaux et cree la livraison.
 */
const creerCommande = async (req, res) => {
  let connection;

  try {
    const { commerce_id, adresse_id, produits, frais_livraison } = req.body;

    // Verification de l'adresse
    const adresse = await Adresse.trouverParId(adresse_id);
    if (!adresse || adresse.utilisateur_id !== req.user.id) {
      return reponseErreur(res, 400, 'Adresse invalide ou non trouvee.');
    }

    // Verification du commerce
    const commerce = await Commerce.trouverParId(commerce_id);
    if (!commerce || !commerce.est_actif) {
      return reponseErreur(res, 400, 'Commerce invalide ou inactif.');
    }

    // Demarrage de la transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let montant_total = 0;
    const lignes = [];

    for (const item of produits) {
      const [produitRows] = await connection.execute(
        'SELECT id, nom, prix, stock, est_disponible FROM Produit WHERE id = ?',
        [item.produit_id]
      );

      const produit = produitRows[0];
      if (!produit) {
        await connection.rollback();
        connection.release();
        return reponseErreur(res, 400, `Produit ID ${item.produit_id} non trouve.`);
      }

      if (!produit.est_disponible) {
        await connection.rollback();
        connection.release();
        return reponseErreur(res, 400, `Le produit "${produit.nom}" n'est pas disponible.`);
      }

      if (produit.stock < item.quantite) {
        await connection.rollback();
        connection.release();
        return reponseErreur(res, 400, `Stock insuffisant pour "${produit.nom}". Stock: ${produit.stock}, demande: ${item.quantite}.`);
      }

      const sous_total = parseFloat(produit.prix) * item.quantite;
      montant_total += sous_total;

      lignes.push({
        produit_id: item.produit_id,
        quantite: item.quantite,
        prix_unitaire: produit.prix,
        sous_total,
      });
    }

    const livraisonFrais = frais_livraison !== undefined ? frais_livraison : FRAIS_LIVRAISON;
    const totalFinal = montant_total + livraisonFrais;

    // Insertion de la commande
    const [cmdResult] = await connection.execute(
      `INSERT INTO Commande (client_id, commerce_id, adresse_id, montant_total, frais_livraison, statut)
       VALUES (?, ?, ?, ?, ?, 'en_attente')`,
      [req.user.id, commerce_id, adresse_id, totalFinal, livraisonFrais]
    );
    const commandeId = cmdResult.insertId;

    // Insertion des lignes de commande et decrementation du stock
    for (const ligne of lignes) {
      await connection.execute(
        'INSERT INTO LigneCommande (commande_id, produit_id, quantite, prix_unitaire, sous_total) VALUES (?, ?, ?, ?, ?)',
        [commandeId, ligne.produit_id, ligne.quantite, ligne.prix_unitaire, ligne.sous_total]
      );

      await connection.execute(
        'UPDATE Produit SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [ligne.quantite, ligne.produit_id, ligne.quantite]
      );
    }

    // Creation automatique de la livraison
    await connection.execute(
      'INSERT INTO Livraison (commande_id, statut, date_debut) VALUES (?, ?, NOW())',
      [commandeId, 'disponible']
    );

    // Validation de la transaction
    await connection.commit();
    connection.release();

    // Recuperation de la commande complete
    const commande = await Commande.trouverParId(commandeId);
    const lignesCommande = await LigneCommande.listerParCommande(commandeId);

    return reponseSucces(res, 201, 'Commande creee avec succes.', {
      commande,
      lignes: lignesCommande,
    });
  } catch (erreur) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Erreur creerCommande:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * GET /api/commandes/mes-commandes
 * Liste les commandes du client connecte.
 */
const mesCommandes = async (req, res) => {
  try {
    const { page, limite, offset } = getPagination(req.query);
    const commandes = await Commande.listerParClient(req.user.id, offset, limite);
    const total = await Commande.compterParClient(req.user.id);

    return reponseSucces(res, 200, 'Vos commandes.', {
      commandes,
      pagination: getPaginationMeta(total, page, limite),
    });
  } catch (erreur) {
    console.error('Erreur mesCommandes:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * GET /api/commandes/:id
 * Voir le detail d'une commande avec ses lignes.
 */
const voirDetailCommande = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const commande = await Commande.trouverParId(id);

    if (!commande) {
      return reponseErreur(res, 404, 'Commande non trouvee.');
    }

    // Verifier que l'utilisateur a le droit de voir cette commande
    if (req.user.role === 'client' && commande.client_id !== req.user.id) {
      return reponseErreur(res, 403, 'Acces non autorise a cette commande.');
    }

    const lignes = await LigneCommande.listerParCommande(id);
    const livraison = await Livraison.trouverParCommande(id);

    return reponseSucces(res, 200, 'Detail de la commande.', {
      commande,
      lignes,
      livraison,
    });
  } catch (erreur) {
    console.error('Erreur voirDetailCommande:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * PUT /api/commandes/:id/statut
 * Changer le statut d'une commande (commercant).
 */
const changerStatut = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;

    const statutsValides = ['en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree', 'annulee'];
    if (!statutsValides.includes(statut)) {
      return reponseErreur(res, 400, `Statut invalide. Statuts valides: ${statutsValides.join(', ')}.`);
    }

    const commande = await Commande.trouverParId(id);
    if (!commande) {
      return reponseErreur(res, 404, 'Commande non trouvee.');
    }

    await Commande.mettreAJourStatut(id, statut);

    // Si annulee, liberer les stocks
    if (statut === 'annulee') {
      const lignes = await LigneCommande.listerParCommande(id);
      for (const ligne of lignes) {
        await Produit.mettreAJour(ligne.produit_id, { stock: undefined }); // pas de remise auto
        // La remise de stock se fait manuellement ou via un trigger
      }
    }

    const maj = await Commande.trouverParId(id);
    return reponseSucces(res, 200, `Statut mis a jour: ${statut}.`, maj);
  } catch (erreur) {
    console.error('Erreur changerStatut:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * GET /api/commandes/commerce/:commerceId
 * Lister les commandes d'un commerce (commercant).
 */
const commandesParCommerce = async (req, res) => {
  try {
    const commerce_id = parseInt(req.params.commerceId);
    const { page, limite, offset } = getPagination(req.query);
    const statut = req.query.statut || null;

    const estProprietaire = await Commerce.verifierProprietaire(commerce_id, req.user.id);
    if (!estProprietaire) {
      return reponseErreur(res, 403, 'Acces non autorise.');
    }

    const commandes = await Commande.listerParCommerce(commerce_id, offset, limite, statut);
    const total = await Commande.compterParCommerce(commerce_id, statut);

    return reponseSucces(res, 200, 'Commandes du commerce.', {
      commandes,
      pagination: getPaginationMeta(total, page, limite),
    });
  } catch (erreur) {
    console.error('Erreur commandesParCommerce:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = {
  creerCommande,
  mesCommandes,
  voirDetailCommande,
  changerStatut,
  commandesParCommerce,
};
