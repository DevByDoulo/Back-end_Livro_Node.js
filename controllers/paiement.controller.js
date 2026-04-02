/**
 * Controller Paiement - Gestion des paiements lies aux commandes.
 */

const Paiement = require('../models/paiement.model');
const Commande = require('../models/commande.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { MOYENS_PAIEMENT, STATUTS_PAIEMENT } = require('../utilitaires/validation');

/**
 * POST /api/paiements
 * Creer un paiement pour une commande.
 */
const creerPaiement = async (req, res) => {
  try {
    const { commande_id, moyen, reference } = req.body;

    if (!commande_id || !moyen) {
      return reponseErreur(res, 400, 'Le commande_id et le moyen de paiement sont obligatoires.');
    }

    if (!MOYENS_PAIEMENT.includes(moyen)) {
      return reponseErreur(res, 400, `Moyen de paiement invalide. Options: ${MOYENS_PAIEMENT.join(', ')}.`);
    }

    const commande = await Commande.trouverParId(commande_id);
    if (!commande) {
      return reponseErreur(res, 404, 'Commande non trouvee.');
    }

    if (commande.client_id !== req.user.id) {
      return reponseErreur(res, 403, 'Vous ne pouvez pas payer cette commande.');
    }

    if (commande.paiement_id) {
      return reponseErreur(res, 400, 'Cette commande a deja un paiement associe.');
    }

    const paiementId = await Paiement.creer({
      montant: commande.montant_total,
      moyen,
      reference,
    });

    await Commande.mettreAJourPaiement(commande_id, paiementId);

    const paiement = await Paiement.trouverParId(paiementId);
    return reponseSucces(res, 201, 'Paiement cree avec succes.', paiement);
  } catch (erreur) {
    console.error('Erreur creerPaiement:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * PUT /api/paiements/:id/statut
 * Mettre a jour le statut d'un paiement (commercant ou webhook).
 */
const changerStatutPaiement = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;

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
 * GET /api/paiements/:id
 * Voir le detail d'un paiement.
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
