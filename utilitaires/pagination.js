/**
 * Utilitaire de pagination.
 * Extrait page et limite depuis les query params et retourne l'offset SQL.
 */

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limite = Math.min(100, Math.max(1, parseInt(query.limite) || 10));
  const offset = (page - 1) * limite;

  return { page, limite, offset };
};

const getPaginationMeta = (total, page, limite) => {
  return {
    total,
    page,
    limite,
    totalPages: Math.ceil(total / limite),
  };
};

module.exports = { getPagination, getPaginationMeta };
