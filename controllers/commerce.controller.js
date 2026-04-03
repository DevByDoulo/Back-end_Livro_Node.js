/**
 * Controller Commerce - CRUD complet pour les commerces.
 * Gere la creation, lecture, mise a jour et suppression des commerce.
 */

const Commerce = require('../models/commerce.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { getPagination, getPaginationMeta } = require('../utilitaires/pagination');

/**
 * Cree un nouveau commerce pour l'utilisateur connecte.
 * POST /api/commerces
 * @param {Object} req.body - { nom, description, logo, horaires, zone_livraison }
 * @param {Object} req.user.id - ID de l'utilisateur (commercant) defini par le middleware auth
 * @param {Object} res - Reponse Express
 */
const creerCommerce = async (req, res) => {
  try {
    const { nom, description, logo, horaires, zone_livraison } = req.body;

    // Validation des champs obligatoires
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

/**
 * Liste tous les commerces actifs avec pagination.
 * GET /api/commerces
 * @param {Object} req.query - { page, limite }
 * @param {Object} res - Reponse Express
 */
const listerCommerces = async (req, res) => {
  try {
    const { page, limite, offset } = getPagination(req.query);
    const comercios = await Commerce.lister(offset, limite);
    const total = await Commerce.compter();

    return reponseSucces(res, 200, 'Liste des comercios.', {
      comercios,
      pagination: getPaginationMeta(total, page, limite),
    });
  } catch (erreur) {
    console.error('Erreur listerCommerces:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Retourne les details d'un commerce specifique.
 * GET /api/commerces/:id
 * @param {number} req.params.id - ID du commerce
 * @param {Object} res - Reponse Express
 */
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

/**
 * Met a jour un commerce (uniquement par le proprietaire).
 * PUT /api/commerces/:id
 * @param {number} req.params.id - ID du commerce
 * @param {Object} req.body - { nom, description, logo, horaires, zone_livraison, est_actif }
 * @param {Object} req.user.id - ID de l'utilisateur connecte
 * @param {Object} res - Reponse Express
 */
const modifierCommerce = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const commerce = await Commerce.trouverParId(id);

    // Verifier que le commerce existe
    if (!commerce) {
      return reponseErreur(res, 404, 'Commerce non trouve.');
    }

    // Verifier que l'utilisateur est le proprietaire
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
    const maj = await Commerce.trouverParId(id);

    return reponseSucces(res, 200, 'Commerce mis a jour.', maj);
  } catch (erreur) {
    console.error('Erreur modifierCommerce:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Supprime un commerce (uniquement par le proprietaire).
 * DELETE /api/commerces/:id
 * @param {number} req.params.id - ID du commerce
 * @param {Object} req.user.id - ID de l'utilisateur connecte
 * @param {Object} res - Reponse Express
 */
const supprimerCommerce = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const commerce = await Commerce.trouverParId(id);

    // Verifier que le commerce existe
    if (!commerce) {
      return reponseErreur(res, 404, 'Commerce non trouve.');
    }

    // Verifier que l'utilisateur est le proprietaire
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
