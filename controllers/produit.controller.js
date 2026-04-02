/**
 * Controller Produit - CRUD pour les produits d'un commerce.
 * Gere l'ajout, la modification et la suppression des produits par les commercants.
 */

const Produit = require('../models/produit.model');
const Commerce = require('../models/commerce.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { getPagination, getPaginationMeta } = require('../utilitaires/pagination');

/**
 * Ajoute un nouveau produit a un commerce.
 * POST /api/produits/commerce/:commerceId
 * @param {number} req.params.commerceId - ID du commerce
 * @param {Object} req.body - { nom, description, prix, stock, image }
 * @param {Object} req.user.id - ID de l'utilisateur (commercant)
 * @param {Object} res - Reponse Express
 */
const ajouterProduit = async (req, res) => {
  try {
    const commerce_id = parseInt(req.params.commerceId);
    const { nom, description, prix, stock, image } = req.body;

    // Validation des champs obligatoires
    if (!nom || prix === undefined) {
      return reponseErreur(res, 400, 'Le nom et le prix sont obligatoires.');
    }

    // Verifier que l'utilisateur est proprietaire du commerce
    const estProprietaire = await Commerce.verifierProprietaire(commerce_id, req.user.id);
    if (!estProprietaire) {
      return reponseErreur(res, 403, 'Vous ne pouvez pas ajouter de produits a ce commerce.');
    }

    const id = await Produit.creer({ commerce_id, nom, description, prix, stock, image });
    const produit = await Produit.trouverParId(id);

    return reponseSucces(res, 201, 'Produit ajoute avec succes.', produit);
  } catch (erreur) {
    console.error('Erreur ajouterProduit:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Liste les produits d'un commerce avec filtres et pagination.
 * GET /api/produits/commerce/:commerceId
 * @param {number} req.params.commerceId - ID du commerce
 * @param {Object} req.query - { page, limite, disponible, recherche, prix_min, prix_max }
 * @param {Object} res - Reponse Express
 */
const listerProduitsCommerce = async (req, res) => {
  try {
    const commerce_id = parseInt(req.params.commerceId);
    const { page, limite, offset } = getPagination(req.query);

    // Construction des filtres a partir des query params
    const filtres = {};
    if (req.query.disponible !== undefined) {
      filtres.est_disponible = req.query.disponible === 'true';
    }
    if (req.query.recherche) {
      filtres.recherche = req.query.recherche;
    }
    if (req.query.prix_min) {
      filtres.prix_min = parseFloat(req.query.prix_min);
    }
    if (req.query.prix_max) {
      filtres.prix_max = parseFloat(req.query.prix_max);
    }

    const produits = await Produit.listerParCommerce(commerce_id, offset, limite, filtres);
    const total = await Produit.compterParCommerce(commerce_id, filtres);

    return reponseSucces(res, 200, 'Liste des produits.', {
      produits,
      pagination: getPaginationMeta(total, page, limite),
    });
  } catch (erreur) {
    console.error('Erreur listerProduitsCommerce:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Met a jour un produit (uniquement par le proprietaire du commerce).
 * PUT /api/produits/:id
 * @param {number} req.params.id - ID du produit
 * @param {Object} req.body - { nom, description, prix, stock, est_disponible, image }
 * @param {Object} req.user.id - ID de l'utilisateur connecte
 * @param {Object} res - Reponse Express
 */
const modifierProduit = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const produit = await Produit.trouverParId(id);

    // Verifier que le produit existe
    if (!produit) {
      return reponseErreur(res, 404, 'Produit non trouve.');
    }

    // Verifier que l'utilisateur est proprietaire du commerce
    const estProprietaire = await Commerce.verifierProprietaire(produit.commerce_id, req.user.id);
    if (!estProprietaire) {
      return reponseErreur(res, 403, 'Vous ne pouvez pas modifier ce produit.');
    }

    // Construction dynamique des champs a mettre a jour
    const { nom, description, prix, stock, est_disponible, image } = req.body;
    const champs = {};
    if (nom) champs.nom = nom;
    if (description !== undefined) champs.description = description;
    if (prix !== undefined) champs.prix = prix;
    if (stock !== undefined) champs.stock = stock;
    if (est_disponible !== undefined) champs.est_disponible = est_disponible;
    if (image !== undefined) champs.image = image;

    await Produit.mettreAJour(id, champs);
    const mis = await Produit.trouverParId(id);

    return reponseSucces(res, 200, 'Produit mis a jour.', mis);
  } catch (erreur) {
    console.error('Erreur modifierProduit:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Supprime un produit (uniquement par le proprietaire du commerce).
 * DELETE /api/produits/:id
 * @param {number} req.params.id - ID du produit
 * @param {Object} req.user.id - ID de l'utilisateur connecte
 * @param {Object} res - Reponse Express
 */
const supprimerProduit = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const produit = await Produit.trouverParId(id);

    // Verifier que le produit existe
    if (!produit) {
      return reponseErreur(res, 404, 'Produit non trouve.');
    }

    // Verifier que l'utilisateur est proprietaire du commerce
    const estProprietaire = await Commerce.verifierProprietaire(produit.commerce_id, req.user.id);
    if (!estProprietaire) {
      return reponseErreur(res, 403, 'Vous ne pouvez pas supprimer ce produit.');
    }

    await Produit.supprimer(id);
    return reponseSucces(res, 200, 'Produit supprime.');
  } catch (erreur) {
    console.error('Erreur supprimerProduit:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = {
  ajouterProduit,
  listerProduitsCommerce,
  modifierProduit,
  supprimerProduit,
};
