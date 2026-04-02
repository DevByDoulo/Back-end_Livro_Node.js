/**
 * Utilitaire de pagination.
 * Extrait page et limite depuis les query params et retourne l'offset SQL.
 * Facilite la gestion de la pagination pour les endpoints qui retournent des listes.
 */

/**
 * Extrait les parametres de pagination depuis la query string.
 * @param {Object} query - Objet query d'Express (req.query)
 * @returns {Object} { page, limite, offset } - Parametres de pagination
 */
const getPagination = (query) => {
  // Parser la page (defaut: 1, minimum: 1)
  const page = Math.max(1, parseInt(query.page) || 1);
  // Parser la limite (defaut: 10, min: 1, max: 100)
  const limite = Math.min(100, Math.max(1, parseInt(query.limite) || 10));
  // Calculer l'offset pour la requete SQL (page - 1) * limite
  const offset = (page - 1) * limite;

  return { page, limite, offset };
};

/**
 * Genere les metadonnees de pagination.
 * @param {number} total - Nombre total d'elements
 * @param {number} page - Page actuelle
 * @param {number} limite - Nombre d'elements par page
 * @returns {Object} { total, page, limite, totalPages }
 */
const getPaginationMeta = (total, page, limite) => {
  return {
    total,
    page,
    limite,
    totalPages: Math.ceil(total / limite),
  };
};

module.exports = { getPagination, getPaginationMeta };
