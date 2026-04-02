/**
 * Middleware de validation des donnees d'entree.
 * Valide les corps de requete avant d'atteindre le contrôleur.
 */

const { reponseErreur } = require('../utilitaires/reponse');
const { validerEmail, validerMotDePasse, ROLES_VALIDES } = require('../utilitaires/validation');

const validerInscription = (req, res, next) => {
  const { nom, prenom, email, mot_de_passe, telephone, role } = req.body;

  const erreurs = [];

  if (!nom || nom.trim().length === 0) erreurs.push('Le nom est obligatoire.');
  if (!prenom || prenom.trim().length === 0) erreurs.push('Le prenom est obligatoire.');
  if (!email) erreurs.push('L\'email est obligatoire.');
  else if (!validerEmail(email)) erreurs.push('Format d\'email invalide.');
  if (!mot_de_passe) erreurs.push('Le mot de passe est obligatoire.');
  else if (!validerMotDePasse(mot_de_passe)) erreurs.push('Le mot de passe doit contenir au moins 6 caracteres.');
  if (role && !ROLES_VALIDES.includes(role)) erreurs.push(`Role invalide. Roles autorises: ${ROLES_VALIDES.join(', ')}.`);

  if (erreurs.length > 0) {
    return reponseErreur(res, 400, erreurs.join(' '), null);
  }

  next();
};

const validerConnexion = (req, res, next) => {
  const { email, mot_de_passe } = req.body;
  const erreurs = [];

  if (!email) erreurs.push('L\'email est obligatoire.');
  if (!mot_de_passe) erreurs.push('Le mot de passe est obligatoire.');

  if (erreurs.length > 0) {
    return reponseErreur(res, 400, erreurs.join(' '), null);
  }

  next();
};

const validerProduit = (req, res, next) => {
  const { nom, prix } = req.body;
  const erreurs = [];

  if (!nom || nom.trim().length === 0) erreurs.push('Le nom du produit est obligatoire.');
  if (prix === undefined || prix === null) erreurs.push('Le prix est obligatoire.');
  else if (isNaN(parseFloat(prix)) || parseFloat(prix) < 0) erreurs.push('Le prix doit etre un nombre positif.');

  if (erreurs.length > 0) {
    return reponseErreur(res, 400, erreurs.join(' '), null);
  }

  next();
};

const validerCommande = (req, res, next) => {
  const { commerce_id, adresse_id, produits } = req.body;
  const erreurs = [];

  if (!commerce_id) erreurs.push('Le commerce_id est obligatoire.');
  if (!adresse_id) erreurs.push('L\'adresse_id est obligatoire.');
  if (!produits || !Array.isArray(produits) || produits.length === 0) {
    erreurs.push('La liste des produits est obligatoire et ne doit pas etre vide.');
  } else {
    produits.forEach((p, i) => {
      if (!p.produit_id) erreurs.push(`Produit[${i}]: produit_id est obligatoire.`);
      if (!p.quantite || p.quantite < 1) erreurs.push(`Produit[${i}]: quantite doit etre >= 1.`);
    });
  }

  if (erreurs.length > 0) {
    return reponseErreur(res, 400, erreurs.join(' '), null);
  }

  next();
};

module.exports = {
  validerInscription,
  validerConnexion,
  validerProduit,
  validerCommande,
};
