/**
 * @swagger
 * tags:
 *   name: Avis
 *   description: Gestion des avis et notes sur les comercios et livreurs
 */
const express = require('express');
const router = express.Router();
const {
  ajouterAvis,
  listerAvis,
  supprimerAvis,
} = require('../controllers/avis.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/avis/{type}/{cibleId}:
 *   get:
 *     summary: Lister les avis d'un commerce ou livreur
 *     description: Retourne la liste des avis avec statistiques (note moyenne, nombre total)
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [commerce, livreur] }
 *       - in: path
 *         name: cibleId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste des avis
 */
router.get('/:type/:cibleId', listerAvis);

/**
 * Middleware: Les routes suivantes necessitent une authentification.
 */
router.use(authenticate);

/**
 * @swagger
 * /api/avis:
 *   post:
 *     summary: Ajouter un avis
 *     description: Ajoute un avis et une note (1-5) sur un commerce ou un livreur
 *     tags: [Avis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, cible_id, note]
 *             properties:
 *               type: { type: string, enum: [commerce, livreur] }
 *               cible_id: { type: integer }
 *               note: { type: integer, minimum: 1, maximum: 5 }
 *               commentaire: { type: string }
 *     responses:
 *       201:
 *         description: Avis ajoute
 */
router.post('/', authorizeRoles('client'), ajouterAvis);

/**
 * @swagger
 * /api/avis/{id}:
 *   delete:
 *     summary: Supprimer son avis
 *     description: Supprime un avis donne precedemment (reserve au client qui l'a cree)
 *     tags: [Avis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Avis supprime
 */
router.delete('/:id', authorizeRoles('client'), supprimerAvis);

module.exports = router;
