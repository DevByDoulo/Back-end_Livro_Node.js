/**
 * Controller Livraison - Gestion des livraisons.
 * Assignation de livreurs, suivi de statut et position GPS.
 * Permet aux livreurs de consulter et gerer leurs livraisons.
 */

const Livraison = require('../models/livraison.model');
const Commande = require('../models/commande.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { getPagination, getPaginationMeta } = require('../utilitaires/pagination');
const { STATUTS_LIVRAISON } = require('../utilitaires/validation');

/**
 * Liste les livraisons disponibles pour les livreurs.
 * GET /api/livraisons/disponibles
 * @param {Object} req.query - { page, limite }
 * @param {Object} res - Reponse Express
 */
const listerDisponibles = async (req, res) => {
  try {
    const { page, limite, offset } = getPagination(req.query);
    const livraisons = await Livraison.listerDisponibles(offset, limite);
    const total = await Livraison.compterDisponibles();

    return reponseSucces(res, 200, 'Livraisons disponibles.', {
      livraisons,
      pagination: getPaginationMeta(total, page, limite),
    });
  } catch (erreur) {
    console.error('Erreur listerDisponibles:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Un livreur accepte une livraison.
 * PUT /api/livraisons/:id/accepter
 * @param {number} req.params.id - ID de la livraison
 * @param {Object} req.user.id - ID du livreur connecte
 * @param {Object} res - Reponse Express
 */
const accepterLivraison = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const livraison = await Livraison.trouverParId(id);

    // Verifier que la livraison existe
    if (!livraison) {
      return reponseErreur(res, 404, 'Livraison non trouvee.');
    }

    // Verifier que la livraison n'a pas deja ete assignee
    if (livraison.livreur_id) {
      return reponseErreur(res, 400, 'Cette livraison a deja ete prise en charge.');
    }

    // Assigner le livreur et mettre a jour le statut
    await Livraison.assignerLivreur(id, req.user.id);
    await Commande.mettreAJourStatut(livraison.commande_id, 'en_preparation');

    const maj = await Livraison.trouverParId(id);
    return reponseSucces(res, 200, 'Livraison acceptee.', maj);
  } catch (erreur) {
    console.error('Erreur accepterLivraison:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Change le statut d'une livraison.
 * PUT /api/livraisons/:id/statut
 * @param {number} req.params.id - ID de la livraison
 * @param {Object} req.body - { statut }
 * @param {Object} req.user.id - ID du livreur connecte
 * @param {Object} res - Reponse Express
 */
const changerStatutLivraison = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;

    // Validation du statut
    if (!STATUTS_LIVRAISON.includes(statut)) {
      return reponseErreur(res, 400, `Statut invalide. Options: ${STATUTS_LIVRAISON.join(', ')}.`);
    }

    const livraison = await Livraison.trouverParId(id);
    if (!livraison) {
      return reponseErreur(res, 404, 'Livraison non trouvee.');
    }

    // Verifier que le livreur est bien assignee a cette livraison
    if (livraison.livreur_id !== req.user.id) {
      return reponseErreur(res, 403, 'Vous ne pouvez pas modifier cette livraison.');
    }

    // Mettre a jour le statut de la livraison
    await Livraison.mettreAJourStatut(id, statut);

    // Mettre a jour le statut de la commande associee en fonction du statut de la livraison
    if (statut === 'en_cours_livraison') {
      await Commande.mettreAJourStatut(livraison.commande_id, 'en_livraison');
    } else if (statut === 'livree') {
      await Commande.mettreAJourStatut(livraison.commande_id, 'livree');
    }

    const maj = await Livraison.trouverParId(id);
    return reponseSucces(res, 200, `Statut de livraison mis a jour: ${statut}.`, maj);
  } catch (erreur) {
    console.error('Erreur changerStatutLivraison:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Met a jour la position GPS du livreur en cours de livraison.
 * PUT /api/livraisons/:id/position
 * @param {number} req.params.id - ID de la livraison
 * @param {Object} req.body - { latitude, longitude }
 * @param {Object} req.user.id - ID du livreur connecte
 * @param {Object} res - Reponse Express
 */
const mettreAJourPosition = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { latitude, longitude } = req.body;

    // Validation des coordonnees
    if (latitude === undefined || longitude === undefined) {
      return reponseErreur(res, 400, 'Latitude et longitude sont obligatoires.');
    }

    const livraison = await Livraison.trouverParId(id);
    if (!livraison) {
      return reponseErreur(res, 404, 'Livraison non trouvee.');
    }

    // Verifier que le livreur est bien assignee a cette livraison
    if (livraison.livreur_id !== req.user.id) {
      return reponseErreur(res, 403, 'Acces non autorise.');
    }

    await Livraison.mettreAJourPosition(id, latitude, longitude);
    return reponseSucces(res, 200, 'Position mise a jour.');
  } catch (erreur) {
    console.error('Erreur mettreAJourPosition:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Liste les livraisons du livreur connecte.
 * GET /api/livraisons/mes-livraisons
 * @param {Object} req - Requete Express avec user.id defini par le middleware auth
 * @param {Object} req.query - { page, limite }
 * @param {Object} res - Reponse Express
 */
const mesLivraisons = async (req, res) => {
  try {
    const { page, limite, offset } = getPagination(req.query);
    const livraisons = await Livraison.listerParLivreur(req.user.id, offset, limite);

    return reponseSucces(res, 200, 'Vos livraisons.', {
      livraisons,
      pagination: getPaginationMeta(livraisons.length, page, limite),
    });
  } catch (erreur) {
    console.error('Erreur mesLivraisons:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = {
  listerDisponibles,
  accepterLivraison,
  changerStatutLivraison,
  mettreAJourPosition,
  mesLivraisons,
};
