/**
 * Utilitaire de reponse standardisee pour l'API Livro.
 * Toutes les reponses JSON respectent le format { success, message, data }.
 * Permet de garantir une structure coherente pour toutes les reponses de l'API.
 */

/**
 * Envoie une reponse JSON de succes.
 * @param {Object} res - Objet reponse Express
 * @param {number} statusCode - Code de statut HTTP (200, 201, etc.)
 * @param {string} message - Message de succes
 * @param {*} data - Donnees a retourner (optionnel, null par defaut)
 * @returns {Object} Reponse JSON
 */
const reponseSucces = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Envoie une reponse JSON d'erreur.
 * @param {Object} res - Objet reponse Express
 * @param {number} statusCode - Code de statut HTTP d'erreur (400, 401, 404, 500, etc.)
 * @param {string} message - Message d'erreur
 * @param {*} data - Donnees supplementaires (optionnel, null par defaut)
 * @returns {Object} Reponse JSON
 */
const reponseErreur = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};

module.exports = { reponseSucces, reponseErreur };
