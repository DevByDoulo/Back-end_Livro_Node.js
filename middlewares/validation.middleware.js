/**
 * Middleware de validation des donnees d'entree.
 * Valide les corps de requete avant d'atteindre le controleur.
 * Permet de verifier que les donnees requises sont presentes et correctement formatees.
 */

const { reponseErreur } = require('../utilitaires/reponse');
const { validerEmail, validerMotDePasse, ROLES_VALIDES } = require('../utilitaires/validation');

/**
 * Validation des donnees d'inscription.
 * Verifie la presence et le format des champs: nom, prenom, email, mot_de_passe, telephone, role.
 * @param {Object} req - Requete Express
 * @param {Object} res - Reponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validerInscription = (req, res, next) => {
  const { nom, prenom, email, mot_de_passe, telephone, role } = req.body;

  const erreurs = [];

  // Validation du nom (obligatoire, non vide)
  if (!nom || nom.trim().length === 0) erreurs.push('Le nom est obligatoire.');
  // Validation du prenom (obligatoire, non vide)
  if (!prenom || prenom.trim().length === 0) erreurs.push('Le prenom est obligatoire.');
  // Validation de l'email (obligatoire et format valide)
  if (!email) erreurs.push('L\'email est obligatoire.');
  else if (!validerEmail(email)) erreurs.push('Format d\'email invalide.');
  // Validation du mot de passe (obligatoire, minimum 6 caracteres)
  if (!mot_de_passe) erreurs.push('Le mot de passe est obligatoire.');
  else if (!validerMotDePasse(mot_de_passe)) erreurs.push('Le mot de passe doit contenir au moins 6 caracteres.');
  // Validation du role (si fourni, doit etre un role valide)
  if (role && !ROLES_VALIDES.includes(role)) erreurs.push(`Role invalide. Roles autorises: ${ROLES_VALIDES.join(', ')}.`);

  // Si des erreurs sont trouvees, retourner une reponse d'erreur
  if (erreurs.length > 0) {
    return reponseErreur(res, 400, erreurs.join(' '), null);
  }

  next();
};

/**
 * Validation des donnees de connexion.
 * Verifie la presence de l'email et du mot de passe.
 * @param {Object} req - Requete Express
 * @param {Object} res - Reponse Express
 * @param {Function} next - Fonction next d'Express
 */
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

/**
 * Validation des donnees d'un produit.
 * Verifie la presence et la validite du nom et du prix.
 * @param {Object} req - Requete Express
 * @param {Object} res - Reponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validerProduit = (req, res, next) => {
  const { nom, prix } = req.body;
  const erreurs = [];

  // Validation du nom (obligatoire, non vide)
  if (!nom || nom.trim().length === 0) erreurs.push('Le nom du produit est obligatoire.');
  // Validation du prix (obligatoire, nombre positif)
  if (prix === undefined || prix === null) erreurs.push('Le prix est obligatoire.');
  else if (isNaN(parseFloat(prix)) || parseFloat(prix) < 0) erreurs.push('Le prix doit etre un nombre positif.');

  if (erreurs.length > 0) {
    return reponseErreur(res, 400, erreurs.join(' '), null);
  }

  next();
};

/**
 * Validation des donnees d'une commande.
 * Verifie la presence et la validite du commerce_id, adresse_id et des produits.
 * @param {Object} req - Requete Express
 * @param {Object} res - Reponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validerCommande = (req, res, next) => {
  const { commerce_id, adresse_id, produits } = req.body;
  const erreurs = [];

  // Validation du commerce_id
  if (!commerce_id) erreurs.push('Le commerce_id est obligatoire.');
  // Validation de l'adresse_id
  if (!adresse_id) erreurs.push('L\'adresse_id est obligatoire.');
  // Validation des produits (tableau non vide)
  if (!produits || !Array.isArray(produits) || produits.length === 0) {
    erreurs.push('La liste des produits est obligatoire et ne doit pas etre vide.');
  } else {
    // Validation de chaque produit
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
