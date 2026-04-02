/**
 * Controller Avis - Gestion des avis sur les commerces et livreurs.
 */

const Avis = require('../models/avis.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { getPagination, getPaginationMeta } = require('../utilitaires/pagination');
const { TYPES_AVIS, validerNote } = require('../utilitaires/validation');

/**
 * POST /api/avis
 * Ajouter un avis sur un commerce ou un livreur.
 */
const ajouterAvis = async (req, res) => {
  try {
    const { type, cible_id, note, commentaire } = req.body;

    if (!type || !cible_id || note === undefined) {
      return reponseErreur(res, 400, 'Le type, cible_id et note sont obligatoires.');
    }

    if (!TYPES_AVIS.includes(type)) {
      return reponseErreur(res, 400, `Type invalide. Options: ${TYPES_AVIS.join(', ')}.`);
    }

    if (!validerNote(note)) {
      return reponseErreur(res, 400, 'La note doit etre un entier entre 1 et 5.');
    }

    const dejaNote = await Avis.verifierDejaNote(req.user.id, type, cible_id);
    if (dejaNote) {
      return reponseErreur(res, 400, 'Vous avez deja laisse un avis sur cette cible.');
    }

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
