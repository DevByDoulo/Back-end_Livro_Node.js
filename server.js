/**
 * Serveur principal de l'API Livro.
 * Point d'entree de l'application Express.
 * Configure les middlewares, les routes et demarre le serveur HTTP.
 */

// Import des modules necessaires
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger/swagger.config');
const logger = require('./config/logger');
const { limiterGlobal, limiterAuth } = require('./config/rateLimit');
require('dotenv').config();

// Import des routes de l'API
const authentificationRoutes = require('./routes/authentification.routes');
const utilisateurRoutes = require('./routes/utilisateur.routes');
const commerceRoutes = require('./routes/commerce.routes');
const produitRoutes = require('./routes/produit.routes');
const commandeRoutes = require('./routes/commande.routes');
const paiementRoutes = require('./routes/paiement.routes');
const livraisonRoutes = require('./routes/livraison.routes');
const avisRoutes = require('./routes/avis.routes');
const adresseRoutes = require('./routes/adresse.routes');

// Creation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CONFIGURATION DES MIDDLEWARES
// ============================================

// Securite - Helmet (protege contre les vulnarabilites HTTP courantes)
app.use(helmet());

// CORS - Autorise les requetes cross-origin
app.use(cors());

// Parsing du body des requetes JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging HTTP - Morgan (integre avec Winston pour logger les requetes HTTP)
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Rate Limiting global - Protection contre les abus
app.use(limiterGlobal);

// ============================================
// CONFIGURATION DE LA DOCUMENTATION SWAGGER
// ============================================

// Swagger - Documentation API interactive
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// ROUTES PUBLICS
// ============================================

// Route de bienvenue - Racine de l'API
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

// ============================================
// MONTAGE DES ROUTES API
// ============================================

// Routes d'authentification avec rate limiting specifique
app.use('/api/authentification', limiterAuth, authentificationRoutes);

// Routes des autres ressources (authentifiees par defaut dans chaque fichier de routes)
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/commerces', commerceRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/livraisons', livraisonRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/adresses', adresseRoutes);

// ============================================
// GESTION DES ERREURS
// ============================================

// Route 404 - Route non trouvee
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvee.',
    data: null,
  });
});

// Gestionnaire d'erreurs global - Capture les erreurs non gerees
app.use((err, req, res, next) => {
  logger.error(`Erreur non geree: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur.',
    data: null,
  });
});

// ============================================
// DEMARRAGE DU SERVEUR
// ============================================

app.listen(PORT, () => {
  logger.info(`Serveur Livro demarre sur le port ${PORT}`);
  logger.info(`Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
