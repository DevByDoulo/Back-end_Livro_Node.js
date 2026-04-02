/**
 * Configuration Swagger - Documentation API.
 * Genere automatiquement la documentation a partir des commentaires JSDoc.
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Livro - Documentation',
      version: '1.0.0',
      description: 'API REST pour la plateforme de livraison intelligente Livro.',
      contact: {
        name: 'Equipe Livro',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ReponseSucces: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation reussie.' },
            data: { type: 'object' },
          },
        },
        ReponseErreur: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Erreur.' },
            data: { type: 'object', nullable: true },
          },
        },
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
        Login: {
          type: 'object',
          required: ['email', 'mot_de_passe'],
          properties: {
            email: { type: 'string', example: 'john@test.com' },
            mot_de_passe: { type: 'string', example: '123456' },
          },
        },
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
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
