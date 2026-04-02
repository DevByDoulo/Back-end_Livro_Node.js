/**
 * Controller Utilisateur - Gestion du profil utilisateur.
 */

const Utilisateur = require('../models/utilisateur.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');

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

const modifierProfil = async (req, res) => {
  try {
    const { nom, prenom, telephone } = req.body;
    const champs = {};

    if (nom) champs.nom = nom;
    if (prenom) champs.prenom = prenom;
    if (telephone) champs.telephone = telephone;

    if (Object.keys(champs).length === 0) {
      return reponseErreur(res, 400, 'Aucun champ a mettre a jour.');
    }

    await Utilisateur.mettreAJour(req.user.id, champs);
    const utilisateur = await Utilisateur.trouverParId(req.user.id);

    return reponseSucces(res, 200, 'Profil mis a jour.', utilisateur);
  } catch (erreur) {
    console.error('Erreur modifierProfil:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

const desactiverCompte = async (req, res) => {
  try {
    await Utilisateur.desactiver(req.user.id);
    return reponseSucces(res, 200, 'Compte desactive avec succes.');
  } catch (erreur) {
    console.error('Erreur desactiverCompte:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = { getProfil, modifierProfil, desactiverCompte };
