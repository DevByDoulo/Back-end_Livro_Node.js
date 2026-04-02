/**
 * Middleware d'authentification et d'autorisation.
 * Verifie la validite du token JWT et controle les roles utilisateurs.
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verifie que le token JWT est present et valide dans l'en-tete Authorization.
 * Ajoute les informations de l'utilisateur (id, role) a req.user en cas de succes.
 * @param {Object} req - Objet requete Express
 * @param {Object} res - Objet reponse Express
 * @param {Function} next - Fonction next d'Express
 */
const authenticate = (req, res, next) => {
  // Extraction du token de l'en-tete Authorization (format: "Bearer <token>")
  const authHeader = req.headers.authorization;

  // Verifier que l'en-tete existe et commence par "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé. Token manquant.',
      data: null,
    });
  }

  // Extraire le token (sans le prefixe "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Verifier et decoder le token avec la cle secrete
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Stocker les informations decodees dans req.user pour les autres routes
    req.user = decoded;
    next();
  } catch (error) {
    // Gerer les differentes erreurs de verification du token
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré. Veuillez vous reconnecter.',
        data: null,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token invalide.',
      data: null,
    });
  }
};

/**
 * Creer un middleware d'autorisation base sur les roles.
 * Verifie que l'utilisateur authentifie possede un des roles autorises.
 * @param {...string} roles - Roles autorises (ex: 'client', 'commercant', 'livreur')
 * @returns {Function} Middleware Express
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Verifier que req.user existe et que le role de l'utilisateur est dans la liste autorisee
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit. Vous n\'avez pas les permissions nécessaires.',
        data: null,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };
