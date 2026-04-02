/**
 * Controller Commande - Gestion complete des commandes.
 * Cree une commande avec ses lignes dans une transaction SQL atomique.
 * Gere le cycle de vie complet d'une commande (creation, consultation, changement de statut).
 */

const Commande = require('../models/commande.model');
const LigneCommande = require('../models/ligne_commande.model');
const Produit = require('../models/produit.model');
const Livraison = require('../models/livraison.model');
const Adresse = require('../models/adresse.model');
const Commerce = require('../models/commerce.model');
const Utilisateur = require('../models/utilisateur.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { getPagination, getPaginationMeta } = require('../utilitaires/pagination');
const { emailNouvelleCommande, emailStatutCommande } = require('../utilitaires/email');
const logger = require('../config/logger');
const pool = require('../config/db');

/**
 * Frais de livraison par defaut (500fcfa).
 */
const FRAIS_LIVRAISON = 500;

/**
 * Cree une commande avec ses lignes, calcule les totaux et cree la livraison.
 * POST /api/commandes
 * @param {Object} req.body - { commerce_id, adresse_id, produits, frais_livraison }
 * @param {Object} req.user.id - ID du client defini par le middleware auth
 * @param {Object} res - Reponse Express
 */
const creerCommande = async (req, res) => {
  let connection;

  try {
    // Extraction des donnees du corps de la requete
    const { commerce_id, adresse_id, produits, frais_livraison } = req.body;

    // Verification de l'adresse de livraison
    const adresse = await Adresse.trouverParId(adresse_id);
    if (!adresse || adresse.utilisateur_id !== req.user.id) {
      return reponseErreur(res, 400, 'Adresse invalide ou non trouvee.');
    }

    // Verification du commerce
    const commerce = await Commerce.trouverParId(commerce_id);
    if (!commerce || !commerce.est_actif) {
      return reponseErreur(res, 400, 'Commerce invalide ou inactif.');
    }

    // Demarrage de la transaction pour garantir l'atomicite de l'operation
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let montant_total = 0;
    const lignes = [];

    // Traitement de chaque produit commande
    for (const item of produits) {
      // Verifier que le produit existe et est disponible
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

      // Verifier que le produit est disponible
      if (!produit.est_disponible) {
        await connection.rollback();
        connection.release();
        return reponseErreur(res, 400, `Le produit "${produit.nom}" n'est pas disponible.`);
      }

      // Verifier le stock disponible
      if (produit.stock < item.quantite) {
        await connection.rollback();
        connection.release();
        return reponseErreur(res, 400, `Stock insuffisant pour "${produit.nom}". Stock: ${produit.stock}, demande: ${item.quantite}.`);
      }

      // Calcul du sous-total pour ce produit
      const sous_total = parseFloat(produit.prix) * item.quantite;
      montant_total += sous_total;

      // Stocker les informations pour l'insertion later
      lignes.push({
        produit_id: item.produit_id,
        quantite: item.quantite,
        prix_unitaire: produit.prix,
        sous_total,
      });
    }

    // Calcul du total avec les frais de livraison
    const livraisonFrais = frais_livraison !== undefined ? frais_livraison : FRAIS_LIVRAISON;
    const totalFinal = montant_total + livraisonFrais;

    // Insertion de la commande dans la base de donnees
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

      // Decrementation du stock
      await connection.execute(
        'UPDATE Produit SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [ligne.quantite, ligne.produit_id, ligne.quantite]
      );
    }

    // Creation automatique de la livraison (statut: disponible pour les livreurs)
    await connection.execute(
      'INSERT INTO Livraison (commande_id, statut, date_debut) VALUES (?, ?, NOW())',
      [commandeId, 'disponible']
    );

    // Validation de la transaction (commit)
    await connection.commit();
    connection.release();

    // Recuperation de la commande complete pour la reponse
    const commande = await Commande.trouverParId(commandeId);
    const lignesCommande = await LigneCommande.listerParCommande(commandeId);

    // Envoi email au commercant (async, fire and forget)
    const commercant = await Utilisateur.trouverParId(commerce.utilisateur_id);
    if (commercant) {
      emailNouvelleCommande(commercant, commande).catch((err) =>
        logger.error(`Erreur envoi email nouvelle commande: ${err.message}`)
      );
    }

    // Retourner la commande creee avec ses lignes
    return reponseSucces(res, 201, 'Commande creee avec succes.', {
      commande,
      lignes: lignesCommande,
    });
  } catch (erreur) {
    // Rollback en cas d'erreur pour annuler toutes les operations
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Erreur creerCommande:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Liste les commandes du client connecte.
 * GET /api/commandes/mes-commandes
 * @param {Object} req - Requete Express avec user.id defini par le middleware auth
 * @param {Object} req.query - { page, limite }
 * @param {Object} res - Reponse Express
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
 * Voir le detail d'une commande avec ses lignes.
 * GET /api/commandes/:id
 * @param {number} req.params.id - ID de la commande
 * @param {Object} req.user - Utilisateur connecte (contient id et role)
 * @param {Object} res - Reponse Express
 */
const voirDetailCommande = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const commande = await Commande.trouverParId(id);

    if (!commande) {
      return reponseErreur(res, 404, 'Commande non trouvee.');
    }

    // Verifier que l'utilisateur a le droit de voir cette commande
    // (soit le client lui-meme, soit le commercant du commerce, soit un livreur)
    if (req.user.role === 'client' && commande.client_id !== req.user.id) {
      return reponseErreur(res, 403, 'Acces non autorise a cette commande.');
    }

    // Recuperer les lignes de commande et la livraison associee
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
 * Changer le statut d'une commande (commercant uniquement).
 * PUT /api/commandes/:id/statut
 * @param {number} req.params.id - ID de la commande
 * @param {Object} req.body - { statut }
 * @param {Object} res - Reponse Express
 */
const changerStatut = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;

    // Liste des statuts valides pour une commande
    const statutsValides = ['en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree', 'annulee'];
    if (!statutsValides.includes(statut)) {
      return reponseErreur(res, 400, `Statut invalide. Statuts valides: ${statutsValides.join(', ')}.`);
    }

    const commande = await Commande.trouverParId(id);
    if (!commande) {
      return reponseErreur(res, 404, 'Commande non trouvee.');
    }

    // Mise a jour du statut
    await Commande.mettreAJourStatut(id, statut);

    // Si la commande est annulee, liberer les stocks (implementation a definir selon besoins)
    if (statut === 'annulee') {
      const lignes = await LigneCommande.listerParCommande(id);
      for (const ligne of lignes) {
        // La remise de stock se fait manuellement ou via un trigger SQL
        await Produit.mettreAJour(ligne.produit_id, { stock: undefined });
      }
    }

    const maj = await Commande.trouverParId(id);

    // Envoi email au client (fire and forget)
    const client = await Utilisateur.trouverParId(commande.client_id);
    if (client) {
      emailStatutCommande(client, maj, statut).catch((err) =>
        logger.error(`Erreur envoi email statut commande: ${err.message}`)
      );
    }

    return reponseSucces(res, 200, `Statut mis a jour: ${statut}.`, maj);
  } catch (erreur) {
    console.error('Erreur changerStatut:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Lister les commandes d'un commerce (commercant).
 * GET /api/commandes/commerce/:commerceId
 * @param {number} req.params.commerceId - ID du commerce
 * @param {Object} req.query - { page, limite, statut }
 * @param {Object} req.user.id - ID du commercant connecte
 * @param {Object} res - Reponse Express
 */
const commandesParCommerce = async (req, res) => {
  try {
    const commerce_id = parseInt(req.params.commerceId);
    const { page, limite, offset } = getPagination(req.query);
    const statut = req.query.statut || null;

    // Verifier que l'utilisateur est le proprietaire du commerce
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
