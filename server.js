/**
 * Serveur principal de l'API Livro.
 * Point d'entree de l'application Express.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger/swagger.config');
const logger = require('./config/logger');
const { limiterGlobal, limiterAuth } = require('./config/rateLimit');
require('dotenv').config();

// Import des routes
const authentificationRoutes = require('./routes/authentification.routes');
const utilisateurRoutes = require('./routes/utilisateur.routes');
const commerceRoutes = require('./routes/commerce.routes');
const produitRoutes = require('./routes/produit.routes');
const commandeRoutes = require('./routes/commande.routes');
const paiementRoutes = require('./routes/paiement.routes');
const livraisonRoutes = require('./routes/livraison.routes');
const avisRoutes = require('./routes/avis.routes');
const adresseRoutes = require('./routes/adresse.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Securite - Helmet
app.use(helmet());

// CORS
app.use(cors());

// Parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging HTTP - Morgan (via Winston)
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Rate Limiting global
app.use(limiterGlobal);

// Swagger - Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route de bienvenue
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API Livro - Plateforme de livraison intelligente.',
    data: {
      version: '1.0.0',
      documentation: `http://localhost:${PORT}/api-docs`,
    },
  });
});

// Montage des routes avec rate limiting specifique pour l'auth
app.use('/api/authentification', limiterAuth, authentificationRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/commerces', commerceRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/livraisons', livraisonRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/adresses', adresseRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvee.',
    data: null,
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  logger.error(`Erreur non geree: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur.',
    data: null,
  });
});

app.listen(PORT, () => {
  logger.info(`Serveur Livro demarre sur le port ${PORT}`);
  logger.info(`Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
