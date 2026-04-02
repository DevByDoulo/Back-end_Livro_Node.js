/**
 * Utilitaire de reponse standardisee pour l'API Livro.
 * Toutes les reponses JSON respectent le format { success, message, data }.
 */

const reponseSucces = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const reponseErreur = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};

module.exports = { reponseSucces, reponseErreur };
