/**
 * Controller Paiement - Gestion des paiements lies aux commandes.
 * Gere la creation et le suivi des paiements pour les commandes clients.
 */

const Paiement = require('../models/paiement.model');
const Commande = require('../models/commande.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { MOYENS_PAIEMENT, STATUTS_PAIEMENT } = require('../utilitaires/validation');

/**
 * Cree un paiement pour une commande.
 * POST /api/paiements
 * @param {Object} req.body - { commande_id, moyen, reference }
 * @param {Object} req.user.id - ID du client defini par le middleware auth
 * @param {Object} res - Reponse Express
 */
const creerPaiement = async (req, res) => {
  try {
    const { commande_id, moyen, reference } = req.body;

    // Validation des champs obligatoires
    if (!commande_id || !moyen) {
      return reponseErreur(res, 400, 'Le commande_id et le moyen de paiement sont obligatoires.');
    }

    // Validation du moyen de paiement
    if (!MOYENS_PAIEMENT.includes(moyen)) {
      return reponseErreur(res, 400, `Moyen de paiement invalide. Options: ${MOYENS_PAIEMENT.join(', ')}.`);
    }

    // Verification de la commande
    const commande = await Commande.trouverParId(commande_id);
    if (!commande) {
      return reponseErreur(res, 404, 'Commande non trouvee.');
    }

    // Verification que le client est bien le proprietaire de la commande
    if (commande.client_id !== req.user.id) {
      return reponseErreur(res, 403, 'Vous ne pouvez pas payer cette commande.');
    }

    // Verification qu'un paiement n'existe pas deja pour cette commande
    if (commande.paiement_id) {
      return reponseErreur(res, 400, 'Cette commande a deja un paiement associe.');
    }

    // Creation du paiement avec le montant total de la commande
    const paiementId = await Paiement.creer({
      montant: commande.montant_total,
      moyen,
      reference,
    });

    // Association du paiement a la commande
    await Commande.mettreAJourPaiement(commande_id, paiementId);

    const paiement = await Paiement.trouverParId(paiementId);
    return reponseSucces(res, 201, 'Paiement cree avec succes.', paiement);
  } catch (erreur) {
    console.error('Erreur creerPaiement:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Met a jour le statut d'un paiement (commercant ou webhook).
 * PUT /api/paiements/:id/statut
 * @param {number} req.params.id - ID du paiement
 * @param {Object} req.body - { statut }
 * @param {Object} res - Reponse Express
 */
const changerStatutPaiement = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;

    // Validation du statut
    if (!STATUTS_PAIEMENT.includes(statut)) {
      return reponseErreur(res, 400, `Statut invalide. Options: ${STATUTS_PAIEMENT.join(', ')}.`);
    }

    const paiement = await Paiement.trouverParId(id);
    if (!paiement) {
      return reponseErreur(res, 404, 'Paiement non trouve.');
    }

    await Paiement.mettreAJourStatut(id, statut);

    const mis = await Paiement.trouverParId(id);
    return reponseSucces(res, 200, `Statut du paiement mis a jour: ${statut}.`, mis);
  } catch (erreur) {
    console.error('Erreur changerStatutPaiement:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Voir le detail d'un paiement.
 * GET /api/paiements/:id
 * @param {number} req.params.id - ID du paiement
 * @param {Object} res - Reponse Express
 */
const voirDetailPaiement = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const paiement = await Paiement.trouverParId(id);

    if (!paiement) {
      return reponseErreur(res, 404, 'Paiement non trouve.');
    }

    return reponseSucces(res, 200, 'Detail du paiement.', paiement);
  } catch (erreur) {
    console.error('Erreur voirDetailPaiement:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = {
  creerPaiement,
  changerStatutPaiement,
  voirDetailPaiement,
};
