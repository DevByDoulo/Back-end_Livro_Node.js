/**
 * @swagger
 * tags:
 *   name: Adresses
 *   description: Gestion des adresses utilisateur
 */
const express = require('express');
const router = express.Router();
const {
  listerAdresses,
  ajouterAdresse,
  modifierAdresse,
  supprimerAdresse,
} = require('../controllers/adresse.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Middleware: Toutes les routes de ce fichier necessitent une authentification.
 * Le middleware 'authenticate' verifie le token JWT et ajoute req.user.
 */
router.use(authenticate);

/**
 * @swagger
 * /api/adresses:
 *   get:
 *     summary: Lister ses adresses
 *     description: Retourne toutes les adresses de l'utilisateur connecte
 *     tags: [Adresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des adresses
 */
router.get('/', listerAdresses);

/**
 * @swagger
 * /api/adresses:
 *   post:
 *     summary: Ajouter une adresse
 *     description: Cree une nouvelle adresse pour l'utilisateur connecte
 *     tags: [Adresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [libelle, adresse, ville, quartier]
 *             properties:
 *               libelle: { type: string, example: "Domicile" }
 *               adresse: { type: string, example: "12 Rue de la Paix" }
 *               ville: { type: string, example: "Paris" }
 *               quartier: { type: string, example: "Centre" }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               est_principale: { type: boolean }
 *     responses:
 *       201:
 *         description: Adresse ajoutee
 */
router.post('/', ajouterAdresse);

/**
 * @swagger
 * /api/adresses/{id}:
 *   put:
 *     summary: Modifier une adresse
 *     description: Met a jour une adresse existante (si elle appartient a l'utilisateur)
 *     tags: [Adresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModifierAdresse'
 *     responses:
 *       200:
 *         description: Adresse mise a jour
 */
router.put('/:id', modifierAdresse);

/**
 * @swagger
 * /api/adresses/{id}:
 *   delete:
 *     summary: Supprimer une adresse
 *     description: Supprime une adresse (si elle appartient a l'utilisateur)
 *     tags: [Adresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Adresse supprimee
 */
router.delete('/:id', supprimerAdresse);

module.exports = router;
