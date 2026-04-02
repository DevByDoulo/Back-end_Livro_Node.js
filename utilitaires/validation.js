/**
 * Utilitaires de validation des donnees d'entree.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES_VALIDES = ['client', 'commercant', 'livreur'];
const STATUTS_COMMANDE = ['en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree', 'annulee'];
const STATUTS_LIVRAISON = ['disponible', 'en_cours_recuperation', 'en_cours_livraison', 'livree'];
const STATUTS_PAIEMENT = ['en_attente', 'confirme', 'echoue', 'rembourse'];
const MOYENS_PAIEMENT = ['mobile_money', 'carte_bancaire', 'cash'];
const TYPES_AVIS = ['commerce', 'livreur'];

const validerEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

const validerMotDePasse = (mdp) => {
  return mdp && mdp.length >= 6;
};

const validerRole = (role) => {
  return ROLES_VALIDES.includes(role);
};

const validerNote = (note) => {
  const n = parseInt(note);
  return Number.isInteger(n) && n >= 1 && n <= 5;
};

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
