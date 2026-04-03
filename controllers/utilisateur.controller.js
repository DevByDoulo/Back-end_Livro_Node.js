/**
 * Controller Utilisateur - Gestion du profil utilisateur.
 * Gere les operations liees au profil de l'utilisateur authentifie.
 */

const Utilisateur = require('../models/utilisateur.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const logger = require('../config/logger');
const { emailModificationEmail, emailModificationMotDePasse, emailDesactivationCompte } = require('../utilitaires/email');

/**
 * Recupere le profil de l'utilisateur connecte.
 * GET /api/utilisateurs/profil
 * @param {Object} req - Requete Express avec user.id defini par le middleware auth
 * @param {Object} res - Reponse Express
 */
const getProfil = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.trouverParId(req.user.id);
    if (!utilisateur) {
      return reponseErreur(res, 404, 'Utilisateur non trouve.');
    }
    return reponseSucces(res, 200, 'Profil recupere.', utilisateur);
  } catch (erreur) {
    console.error('Erreur getProfil:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Met a jour le profil de l'utilisateur connecte.
 * PUT /api/utilisateurs/profil
 * @param {Object} req.body - { nom, prenom, telephone, email, mot_de_passe }
 * @param {Object} res - Reponse Express
 */
const modifierProfil = async (req, res) => {
  try {
    const { nom, prenom, telephone, email, mot_de_passe } = req.body;
    
    // Recuperer l'utilisateur actuel pour verifier les changements
    const utilisateurActuel = await Utilisateur.trouverParId(req.user.id);
    
    const champs = {};
    const notifications = [];

    // Mise a jour du nom
    if (nom) champs.nom = nom;

    // Mise a jour du prenom
    if (prenom) champs.prenom = prenom;

    // Mise a jour du telephone
    if (telephone) champs.telephone = telephone;

    // Mise a jour de l'email (envoyer notification a l'ancien email)
    if (email && email !== utilisateurActuel.email) {
      champs.email = email;
      notifications.push({
        type: 'email',
        fn: () => emailModificationEmail(utilisateurActuel, utilisateurActuel.email)
      });
    }

    // Mise a jour du mot de passe (envoyer notification)
    if (mot_de_passe) {
      champs.mot_de_passe = await Utilisateur.hasherMotDePasse(mot_de_passe);
      notifications.push({
        type: 'mot_de_passe',
        fn: () => emailModificationMotDePasse(utilisateurActuel)
      });
    }

    // Verifier qu'au moins un champ est a mettre a jour
    if (Object.keys(champs).length === 0) {
      return reponseErreur(res, 400, 'Aucun champ a mettre a jour.');
    }

    await Utilisateur.mettreAJour(req.user.id, champs);
    const utilisateur = await Utilisateur.trouverParId(req.user.id);

    // Envoyer les notifications (de facon asynchrone)
    for (const notification of notifications) {
      notification.fn().catch((err) => 
        logger.error(`Erreur envoi notification: ${err.message}`)
      );
    }

    return reponseSucces(res, 200, 'Profil mis a jour.', utilisateur);
  } catch (erreur) {
    console.error('Erreur modifierProfil:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Desactive le compte de l'utilisateur connecte (soft delete).
 * DELETE /api/utilisateurs/profil
 * @param {Object} req - Requete Express avec user.id defini par le middleware auth
 * @param {Object} res - Reponse Express
 */
const desactiverCompte = async (req, res) => {
  try {
    // Recuperer l'utilisateur avant desactivation pour l'email
    const utilisateur = await Utilisateur.trouverParId(req.user.id);
    
    await Utilisateur.desactiver(req.user.id);
    
    // Envoyer email de confirmation (de facon asynchrone)
    if (utilisateur) {
      emailDesactivationCompte(utilisateur).catch((err) =>
        logger.error(`Erreur envoi email desactivation: ${err.message}`)
      );
    }
    
    return reponseSucces(res, 200, 'Compte desactive avec succes.');
  } catch (erreur) {
    console.error('Erreur desactiverCompte:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = { getProfil, modifierProfil, desactiverCompte };
