/**
 * Configuration Swagger - Documentation API.
 * Genere automatiquement la documentation a partir des commentaires JSDoc dans les fichiers de routes.
 * Accessible via /api-docs une fois le serveur demarre.
 */

const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Options de configuration pour swagger-jsdoc.
 * Definit les metadonnees de l'API et les schemas de donnees reutilisables.
 */
const options = {
  definition: {
    // Version de la specification OpenAPI (3.0.0 est la plus recente)
    openapi: '3.0.0',
    info: {
      title: 'API Livro - Documentation',
      version: '1.0.0',
      description: 'API REST pour la plateforme de livraison intelligente Livro.',
      contact: {
        name: 'Equipe Livro',
      },
    },
    // Serveurs disponibles pour tester l'API
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur local',
      },
    ],
    // Composants reutilisables (schemas, security schemes)
    components: {
      // Definition du scheme d'authentification JWT
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      // Schemas de donnees pour les reponses et demandes
      schemas: {
        // Schema de reponse standard pour les succes
        ReponseSucces: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation reussie.' },
            data: { type: 'object' },
          },
        },
        // Schema de reponse standard pour les erreurs
        ReponseErreur: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Erreur.' },
            data: { type: 'object', nullable: true },
          },
        },
        // Schema pour l'utilisateur
        Utilisateur: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nom: { type: 'string', example: 'Doe' },
            prenom: { type: 'string', example: 'John' },
            email: { type: 'string', example: 'john@test.com' },
            telephone: { type: 'string', example: '0600000001' },
            role: { type: 'string', enum: ['client', 'commercant', 'livreur'] },
            est_actif: { type: 'boolean' },
          },
        },
        // Schema pour le commerce
        Commerce: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            utilisateur_id: { type: 'integer' },
            nom: { type: 'string', example: 'Pizza Express' },
            description: { type: 'string' },
            zone_livraison: { type: 'string' },
            est_actif: { type: 'boolean' },
          },
        },
        // Schema pour le produit
        Produit: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            commerce_id: { type: 'integer' },
            nom: { type: 'string', example: 'Pizza Margherita' },
            description: { type: 'string' },
            prix: { type: 'number', example: 12.5 },
            stock: { type: 'integer' },
            est_disponible: { type: 'boolean' },
          },
        },
        // Schema pour la commande
        Commande: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            client_id: { type: 'integer' },
            commerce_id: { type: 'integer' },
            statut: { type: 'string', enum: ['en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree', 'annulee'] },
            montant_total: { type: 'number' },
            frais_livraison: { type: 'number' },
          },
        },
        // Schema pour la connexion
        Login: {
          type: 'object',
          required: ['email', 'mot_de_passe'],
          properties: {
            email: { type: 'string', example: 'john@test.com' },
            mot_de_passe: { type: 'string', example: '123456' },
          },
        },
        // Schema pour l'inscription
        Register: {
          type: 'object',
          required: ['nom', 'prenom', 'email', 'mot_de_passe', 'telephone', 'role'],
          properties: {
            nom: { type: 'string', example: 'Doe' },
            prenom: { type: 'string', example: 'John' },
            email: { type: 'string', example: 'john@test.com' },
            mot_de_passe: { type: 'string', example: '123456' },
            telephone: { type: 'string', example: '0600000001' },
            role: { type: 'string', enum: ['client', 'commercant', 'livreur'] },
          },
        },
        // Schema pour la creation de commande
        CreerCommande: {
          type: 'object',
          required: ['commerce_id', 'adresse_id', 'produits'],
          properties: {
            commerce_id: { type: 'integer', example: 1 },
            adresse_id: { type: 'integer', example: 1 },
            frais_livraison: { type: 'number', example: 500 },
            produits: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  produit_id: { type: 'integer', example: 1 },
                  quantite: { type: 'integer', example: 2 },
                },
              },
            },
          },
        },
        // Schema pour la modification d'adresse
        ModifierAdresse: {
          type: 'object',
          properties: {
            libelle: { type: 'string', example: 'Bureau' },
            adresse: { type: 'string', example: '45 Avenue Mohammed V' },
            ville: { type: 'string', example: 'Dakar' },
            quartier: { type: 'string', example: 'Fann' },
            latitude: { type: 'number', example: 14.6928 },
            longitude: { type: 'number', example: -17.4467 },
            est_principale: { type: 'boolean', example: false },
          },
        },
      },
    },
  },
  // Chemins des fichiers a analyser pour generer la documentation (fichiers de routes)
  apis: ['./routes/**/*.js'],
};

/**
 * Generation de la specification Swagger a partir des options.
 */
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
