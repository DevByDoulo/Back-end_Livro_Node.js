/**
 * Controller Adresse - CRUD pour les adresses utilisateur.
 * Gere la creation, lecture, mise a jour et suppression des adresses.
 * Toutes les operations sont protegees et nécessitent une authentification.
 */

const Adresse = require('../models/adresse.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');

/**
 * Liste toutes les adresses de l'utilisateur connecte.
 * GET /api/adresses
 * @param {Object} req - Requete Express avec user.id defini par le middleware auth
 * @param {Object} res - Reponse Express
 */
const listerAdresses = async (req, res) => {
  try {
    // Recuperation des adresses pour l'utilisateur authentifie
    const adresses = await Adresse.trouverParUtilisateur(req.user.id);
    return reponseSucces(res, 200, 'Liste des adresses.', adresses);
  } catch (erreur) {
    console.error('Erreur listerAdresses:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Ajoute une nouvelle adresse pour l'utilisateur connecte.
 * POST /api/adresses
 * @param {Object} req.body - { libelle, adresse, ville, quartier, latitude, longitude, est_principale }
 * @param {Object} res - Reponse Express
 */
const ajouterAdresse = async (req, res) => {
  try {
    // Extraction des donnees du corps de la requete
    const { libelle, adresse, ville, quartier, latitude, longitude, est_principale } = req.body;

    // Validation des champs obligatoires
    if (!libelle || !adresse || !ville || !quartier) {
      return reponseErreur(res, 400, 'Les champs libelle, adresse, ville et quartier sont obligatoires.');
    }

    // Creation de l'adresse dans la base de donnees
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

    // Recuperation de l'adresse creee pour la retourner
    const nouvelleAdresse = await Adresse.trouverParId(id);
    return reponseSucces(res, 201, 'Adresse ajoutee.', nouvelleAdresse);
  } catch (erreur) {
    console.error('Erreur ajouterAdresse:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Modifie une adresse existante (appartenant a l'utilisateur connecte).
 * PUT /api/adresses/:id
 * @param {number} req.params.id - ID de l'adresse a modifier
 * @param {Object} req.body - Champs a mettre a jour
 * @param {Object} res - Reponse Express
 */
const modifierAdresse = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verification que l'adresse appartient bien a l'utilisateur
    const estProprietaire = await Adresse.verifierProprietaire(id, req.user.id);
    if (!estProprietaire) {
      return reponseErreur(res, 403, 'Adresse non trouvee ou acces non autorise.');
    }

    // Extraction des champs a mettre a jour
    const { libelle, adresse, ville, quartier, latitude, longitude, est_principale } = req.body;
    const champs = {};

    // Construction dynamique de l'objet de mise a jour
    if (libelle) champs.libelle = libelle;
    if (adresse) champs.adresse = adresse;
    if (ville) champs.ville = ville;
    if (quartier) champs.quartier = quartier;
    if (latitude !== undefined) champs.latitude = latitude;
    if (longitude !== undefined) champs.longitude = longitude;
    if (est_principale !== undefined) champs.est_principale = est_principale;

    // Mise a jour dans la base de donnees
    await Adresse.mettreAJour(id, champs);

    // Recuperation de l'adresse mise a jour
    const maj = await Adresse.trouverParId(id);
    return reponseSucces(res, 200, 'Adresse mise a jour.', maj);
  } catch (erreur) {
    console.error('Erreur modifierAdresse:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Supprime une adresse (appartenant a l'utilisateur connecte).
 * DELETE /api/adresses/:id
 * @param {number} req.params.id - ID de l'adresse a supprimer
 * @param {Object} res - Reponse Express
 */
const supprimerAdresse = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verification que l'adresse appartient bien a l'utilisateur
    const estProprietaire = await Adresse.verifierProprietaire(id, req.user.id);
    if (!estProprietaire) {
      return reponseErreur(res, 403, 'Adresse non trouvee ou acces non autorise.');
    }

    // Suppression de l'adresse
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