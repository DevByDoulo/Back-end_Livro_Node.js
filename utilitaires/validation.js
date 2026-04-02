/**
 * Utilitaires de validation des donnees d'entree.
 * Contient des fonctions et des constantes pour valider les donnees utilisateur.
 */

// Expressions regulieres et constantes de validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES_VALIDES = ['client', 'commercant', 'livreur'];
const STATUTS_COMMANDE = ['en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree', 'annulee'];
const STATUTS_LIVRAISON = ['disponible', 'en_cours_recuperation', 'en_cours_livraison', 'livree'];
const STATUTS_PAIEMENT = ['en_attente', 'confirme', 'echoue', 'rembourse'];
const MOYENS_PAIEMENT = ['mobile_money', 'carte_bancaire', 'cash'];
const TYPES_AVIS = ['commerce', 'livreur'];

/**
 * Valide le format d'une adresse email.
 * @param {string} email - Adresse email a verifier
 * @returns {boolean} true si l'email est valide, false sinon
 */
const validerEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

/**
 * Valide la longueur du mot de passe (minimum 6 caracteres).
 * @param {string} mdp - Mot de passe a verifier
 * @returns {boolean} true si le mot de passe est assez long, false sinon
 */
const validerMotDePasse = (mdp) => {
  return mdp && mdp.length >= 6;
};

/**
 * Verifie si le role est autorise.
 * @param {string} role - Role a verifier
 * @returns {boolean} true si le role est dans la liste des roles valides
 */
const validerRole = (role) => {
  return ROLES_VALIDES.includes(role);
};

/**
 * Valide la note (doit etre un entier entre 1 et 5).
 * @param {number} note - Note a verifier
 * @returns {boolean} true si la note est valide (1-5), false sinon
 */
const validerNote = (note) => {
  const n = parseInt(note);
  return Number.isInteger(n) && n >= 1 && n <= 5;
};

/**
 * Verifie que tous les champs obligatoires sont presents dans le body.
 * @param {Array} champs - Liste des noms de champs obligatoires
 * @param {Object} body - Corps de la requete a verifier
 * @returns {Array} Liste des champs manquants
 */
const validerChampsObligatoires = (champs, body) => {
  const manquants = champs.filter((c) => !body[c]);
  return manquants;
};

module.exports = {
  ROLES_VALIDES,
  STATUTS_COMMANDE,
  STATUTS_LIVRAISON,
  STATUTS_PAIEMENT,
  MOYENS_PAIEMENT,
  TYPES_AVIS,
  validerEmail,
  validerMotDePasse,
  validerRole,
  validerNote,
  validerChampsObligatoires,
};
