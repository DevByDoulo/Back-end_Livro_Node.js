/**
 * Controller Avis - Gestion des avis sur les commerces et livreurs.
 * Permet aux clients de donner des notes et commentaires apres une commande.
 */

const Avis = require('../models/avis.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { getPagination, getPaginationMeta } = require('../utilitaires/pagination');
const { TYPES_AVIS, validerNote } = require('../utilitaires/validation');

/**
 * Ajoute un avis sur un commerce ou un livreur.
 * POST /api/avis
 * @param {Object} req.body - { type, cible_id, note, commentaire }
 * @param {Object} req.user.id - ID du client defini par le middleware auth
 * @param {Object} res - Reponse Express
 */
const ajouterAvis = async (req, res) => {
  try {
    const { type, cible_id, note, commentaire } = req.body;

    // Validation des champs obligatoires
    if (!type || !cible_id || note === undefined) {
      return reponseErreur(res, 400, 'Le type, cible_id et note sont obligatoires.');
    }

    // Validation du type d'avis
    if (!TYPES_AVIS.includes(type)) {
      return reponseErreur(res, 400, `Type invalide. Options: ${TYPES_AVIS.join(', ')}.`);
    }

    // Validation de la note (doit etre un entier entre 1 et 5)
    if (!validerNote(note)) {
      return reponseErreur(res, 400, 'La note doit etre un entier entre 1 et 5.');
    }

    // Verification que le client n'a pas deja donne un avis sur cette cible
    const dejaNote = await Avis.verifierDejaNote(req.user.id, type, cible_id);
    if (dejaNote) {
      return reponseErreur(res, 400, 'Vous avez deja laisse un avis sur cette cible.');
    }

    // Creation de l'avis
    const id = await Avis.creer({
      client_id: req.user.id,
      type,
      cible_id,
      note,
      commentaire,
    });

    return reponseSucces(res, 201, 'Avis ajoute avec succes.', { id });
  } catch (erreur) {
    console.error('Erreur ajouterAvis:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Liste les avis d'un commerce ou d'un livreur avec statistiques.
 * GET /api/avis/:type/:cibleId
 * @param {string} req.params.type - Type de cible (commerce ou livreur)
 * @param {number} req.params.cibleId - ID de la cible
 * @param {Object} req.query - { page, limite }
 * @param {Object} res - Reponse Express
 */
const listerAvis = async (req, res) => {
  try {
    const { type, cibleId } = req.params;

    // Validation du type
    if (!TYPES_AVIS.includes(type)) {
      return reponseErreur(res, 400, 'Type invalide.');
    }

    const { page, limite, offset } = getPagination(req.query);
    const avis = await Avis.listerParCible(type, parseInt(cibleId), offset, limite);
    const stats = await Avis.moyenneParCible(type, parseInt(cibleId));

    return reponseSucces(res, 200, 'Liste des avis.', {
      avis,
      statistiques: stats,
      pagination: getPaginationMeta(stats.total, page, limite),
    });
  } catch (erreur) {
    console.error('Erreur listerAvis:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Supprime son propre avis.
 * DELETE /api/avis/:id
 * @param {number} req.params.id - ID de l'avis a supprimer
 * @param {Object} req.user.id - ID du client connecte
 * @param {Object} res - Reponse Express
 */
const supprimerAvis = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await Avis.supprimer(id, req.user.id);
    return reponseSucces(res, 200, 'Avis supprime.');
  } catch (erreur) {
    console.error('Erreur supprimerAvis:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = {
  ajouterAvis,
  listerAvis,
  supprimerAvis,
};

/**
 * GET /api/avis/:type/:cibleId
 * Lister les avis d'un commerce ou d'un livreur.
 */
const listerAvis = async (req, res) => {
  try {
    const { type, cibleId } = req.params;

    if (!TYPES_AVIS.includes(type)) {
      return reponseErreur(res, 400, 'Type invalide.');
    }

    const { page, limite, offset } = getPagination(req.query);
    const avis = await Avis.listerParCible(type, parseInt(cibleId), offset, limite);
    const stats = await Avis.moyenneParCible(type, parseInt(cibleId));

    return reponseSucces(res, 200, 'Liste des avis.', {
      avis,
      statistiques: stats,
      pagination: getPaginationMeta(stats.total, page, limite),
    });
  } catch (erreur) {
    console.error('Erreur listerAvis:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * DELETE /api/avis/:id
 * Supprimer son propre avis.
 */
const supprimerAvis = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await Avis.supprimer(id, req.user.id);
    return reponseSucces(res, 200, 'Avis supprime.');
  } catch (erreur) {
    console.error('Erreur supprimerAvis:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = {
  ajouterAvis,
  listerAvis,
  supprimerAvis,
};
