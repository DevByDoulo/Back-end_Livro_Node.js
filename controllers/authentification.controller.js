/**
 * Controller Authentification - Inscription et Connexion.
 * Gere la creation de comptes et l'authentification JWT.
 * Ce controller est le point d'entree pour l'enregistrement et la connexion des utilisateurs.
 */

const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateur.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
const { emailBienvenue } = require('../utilitaires/email');
const logger = require('../config/logger');
require('dotenv').config();

/**
 * Inscription d'un nouvel utilisateur.
 * POST /api/authentification/register
 * @param {Object} req.body - { nom, prenom, email, mot_de_passe, telephone, role }
 * @param {Object} res - Reponse Express
 */
const register = async (req, res) => {
  try {
    // Extraction des donnees du corps de la requete
    const { nom, prenom, email, mot_de_passe, telephone, role } = req.body;

    // Verifier si un utilisateur avec cet email existe deja
    const existant = await Utilisateur.trouverParEmail(email);
    if (existant) {
      return reponseErreur(res, 409, 'Cet email est deja utilise.');
    }

    // Creer le nouvel utilisateur dans la base de donnees
    const userRole = role || 'client';
    const id = await Utilisateur.creer({
      nom,
      prenom,
      email,
      mot_de_passe,
      telephone,
      role: userRole,
    });

    // Envoyer un email de bienvenue personnalise selon le role
    emailBienvenue({ email, prenom, nom, role: userRole }).catch((err) =>
      logger.error(`Erreur envoi email bienvenue: ${err.message}`)
    );

    // Retourner les informations de l'utilisateur cree (sans le mot de passe)
    return reponseSucces(res, 201, 'Inscription reussie.', {
      id,
      nom,
      prenom,
      email,
      role: userRole,
    });
  } catch (erreur) {
    console.error('Erreur register:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

/**
 * Connexion d'un utilisateur existant.
 * Generation d'un token JWT en cas de succes.
 * POST /api/authentification/login
 * @param {Object} req.body - { email, mot_de_passe }
 * @param {Object} res - Reponse Express
 */
const login = async (req, res) => {
  try {
    // Extraction des identifiants
    const { email, mot_de_passe } = req.body;

    // Rechercher l'utilisateur par email
    const utilisateur = await Utilisateur.trouverParEmail(email);
    if (!utilisateur) {
      return reponseErreur(res, 401, 'Email ou mot de passe incorrect.');
    }

    // Verifier si le compte est actif
    if (!utilisateur.est_actif) {
      return reponseErreur(res, 403, 'Compte desactive. Contactez un administrateur.');
    }

    // Verifier le mot de passe
    const motDePasseValide = await Utilisateur.verifierMotDePasse(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return reponseErreur(res, 401, 'Email ou mot de passe incorrect.');
    }

    // Generer un token JWT contenant l'ID et le role de l'utilisateur
    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Creer un objet utilisateur sans le mot de passe pour la reponse
    const { mot_de_passe: _, ...utilisateurSansMdp } = utilisateur;

    // Retourner le token et les informations utilisateur
    return reponseSucces(res, 200, 'Connexion reussie.', {
      token,
      utilisateur: utilisateurSansMdp,
    });
  } catch (erreur) {
    console.error('Erreur login:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

module.exports = { register, login };
