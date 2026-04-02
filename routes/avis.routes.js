/**
 * @swagger
 * tags:
 *   name: Avis
 *   description: Gestion des avis sur les commerces et livreurs
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

router.use(authenticate);

/**
 * @swagger
 * /api/avis:
 *   post:
 *     summary: Ajouter un avis
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
