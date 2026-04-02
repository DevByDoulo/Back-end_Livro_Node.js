/**
 * Controller Adresse - CRUD pour les adresses utilisateur.
 */

const Adresse = require('../models/adresse.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');

const listerAdresses = async (req, res) => {
  try {
    const adresses = await Adresse.trouverParUtilisateur(req.user.id);
    return reponseSucces(res, 200, 'Liste des adresses.', adresses);
  } catch (erreur) {
    console.error('Erreur listerAdresses:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

const ajouterAdresse = async (req, res) => {
  try {
    const { libelle, adresse, ville, quartier, latitude, longitude, est_principale } = req.body;

    if (!libelle || !adresse || !ville || !quartier) {
      return reponseErreur(res, 400, 'Les champs libelle, adresse, ville et quartier sont obligatoires.');
    }

    const id = await Adresse.creer({
      utilisateur_id: req.user.id,
      libelle,
      adresse,
      ville,
      quartier,
      latitude,
      longitude,
      est_principale,
    });

    const nouvelleAdresse = await Adresse.trouverParId(id);
    return reponseSucces(res, 201, 'Adresse ajoutee.', nouvelleAdresse);
  } catch (erreur) {
    console.error('Erreur ajouterAdresse:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

const modifierAdresse = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const estProprietaire = await Adresse.verifierProprietaire(id, req.user.id);

    if (!estProprietaire) {
      return reponseErreur(res, 403, 'Adresse non trouvee ou acces non autorise.');
    }

    const { libelle, adresse, ville, quartier, latitude, longitude, est_principale } = req.body;
    const champs = {};

    if (libelle) champs.libelle = libelle;
    if (adresse) champs.adresse = adresse;
    if (ville) champs.ville = ville;
    if (quartier) champs.quartier = quartier;
    if (latitude !== undefined) champs.latitude = latitude;
    if (longitude !== undefined) champs.longitude = longitude;
    if (est_principale !== undefined) champs.est_principale = est_principale;

    await Adresse.mettreAJour(id, champs);
    const maj = await Adresse.trouverParId(id);

    return reponseSucces(res, 200, 'Adresse mise a jour.', maj);
  } catch (erreur) {
    console.error('Erreur modifierAdresse:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

const supprimerAdresse = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const estProprietaire = await Adresse.verifierProprietaire(id, req.user.id);

    if (!estProprietaire) {
      return reponseErreur(res, 403, 'Adresse non trouvee ou acces non autorise.');
    }

    await Adresse.supprimer(id);
    return reponseSucces(res, 200, 'Adresse supprimee.');
  } catch (erreur) {
    console.error('Erreur supprimerAdresse:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = {
  listerAdresses,
  ajouterAdresse,
  modifierAdresse,
  supprimerAdresse,
};
