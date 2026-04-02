/**
 * Controller Authentification - Inscription et Connexion.
 * Gere la creation de comptes et l'authentification JWT.
 */

const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateur.model');
const { reponseSucces, reponseErreur } = require('../utilitaires/reponse');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, telephone, role } = req.body;

    const existant = await Utilisateur.trouverParEmail(email);
    if (existant) {
      return reponseErreur(res, 409, 'Cet email est deja utilise.');
    }

    const id = await Utilisateur.creer({
      nom,
      prenom,
      email,
      mot_de_passe,
      telephone,
      role: role || 'client',
    });

    return reponseSucces(res, 201, 'Inscription reussie.', {
      id,
      nom,
      prenom,
      email,
      role: role || 'client',
    });
  } catch (erreur) {
    console.error('Erreur register:', erreur.message);
    return reponseErreur(res, 500, 'Erreur interne du serveur.');
  }
};

const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.trouverParEmail(email);
    if (!utilisateur) {
      return reponseErreur(res, 401, 'Email ou mot de passe incorrect.');
    }

    if (!utilisateur.est_actif) {
      return reponseErreur(res, 403, 'Compte desactive. Contactez un administrateur.');
    }

    const motDePasseValide = await Utilisateur.verifierMotDePasse(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return reponseErreur(res, 401, 'Email ou mot de passe incorrect.');
    }

    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const { mot_de_passe: _, ...utilisateurSansMdp } = utilisateur;

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
