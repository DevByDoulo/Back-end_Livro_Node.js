/**
 * Controller Commerce - CRUD complet pour les commerces.
 */

const Commerce = require('../models/commerce.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { getPagination, getPaginationMeta } = require('../utilitaires/pagination');

const creerCommerce = async (req, res) => {
  try {
    const { nom, description, logo, horaires, zone_livraison } = req.body;

    if (!nom || !zone_livraison) {
      return reponseErreur(res, 400, 'Le nom et la zone de livraison sont obligatoires.');
    }

    const id = await Commerce.creer({
      utilisateur_id: req.user.id,
      nom,
      description,
      logo,
      horaires,
      zone_livraison,
    });

    const commerce = await Commerce.trouverParId(id);
    return reponseSucces(res, 201, 'Commerce cree avec succes.', commerce);
  } catch (erreur) {
    console.error('Erreur creerCommerce:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

const listerCommerces = async (req, res) => {
  try {
    const { page, limite, offset } = getPagination(req.query);
    const commerces = await Commerce.lister(offset, limite);
    const total = await Commerce.compter();

    return reponseSucces(res, 200, 'Liste des commerces.', {
      commerces,
      pagination: getPaginationMeta(total, page, limite),
    });
  } catch (erreur) {
    console.error('Erreur listerCommerces:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

const voirDetail = async (req, res) => {
  try {
    const commerce = await Commerce.trouverParId(parseInt(req.params.id));
    if (!commerce) {
      return reponseErreur(res, 404, 'Commerce non trouve.');
    }
    return reponseSucces(res, 200, 'Detail du commerce.', commerce);
  } catch (erreur) {
    console.error('Erreur voirDetail:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

const modifierCommerce = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const commerce = await Commerce.trouverParId(id);

    if (!commerce) {
      return reponseErreur(res, 404, 'Commerce non trouve.');
    }

    if (commerce.utilisateur_id !== req.user.id) {
      return reponseErreur(res, 403, 'Vous ne pouvez pas modifier ce commerce.');
    }

    const { nom, description, logo, horaires, zone_livraison, est_actif } = req.body;
    const champs = {};
    if (nom) champs.nom = nom;
    if (description !== undefined) champs.description = description;
    if (logo !== undefined) champs.logo = logo;
    if (horaires !== undefined) champs.horaires = horaires;
    if (zone_livraison) champs.zone_livraison = zone_livraison;
    if (est_actif !== undefined) champs.est_actif = est_actif;

    await Commerce.mettreAJour(id, champs);
    const mis = await Commerce.trouverParId(id);

    return reponseSucces(res, 200, 'Commerce mis a jour.', mis);
  } catch (erreur) {
    console.error('Erreur modifierCommerce:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

const supprimerCommerce = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const commerce = await Commerce.trouverParId(id);

    if (!commerce) {
      return reponseErreur(res, 404, 'Commerce non trouve.');
    }

    if (commerce.utilisateur_id !== req.user.id) {
      return reponseErreur(res, 403, 'Vous ne pouvez pas supprimer ce commerce.');
    }

    await Commerce.supprimer(id);
    return reponseSucces(res, 200, 'Commerce supprime.');
  } catch (erreur) {
    console.error('Erreur supprimerCommerce:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = {
  creerCommerce,
  listerCommerces,
  voirDetail,
  modifierCommerce,
  supprimerCommerce,
};
