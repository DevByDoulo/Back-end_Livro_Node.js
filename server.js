/**
 * Serveur principal de l'API Livro.
 * Point d'entrée de l'application Express.
 */
const express = require('express');
const cors = require('cors');
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

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de bienvenue
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API Livro - Plateforme de livraison intelligente.',
    data: {
      version: '1.0.0',
      endpoints: [
        'POST   /api/authentification/register',
        'POST   /api/authentification/login',
        'GET    /api/utilisateurs/profil',
        'PUT    /api/utilisateurs/profil',
        'DELETE /api/utilisateurs/profil',
        'GET    /api/commerces',
        'GET    /api/commerces/:id',
        'POST   /api/commerces',
        'PUT    /api/commerces/:id',
        'DELETE /api/commerces/:id',
        'GET    /api/produits/commerce/:commerceId',
        'POST   /api/produits/commerce/:commerceId',
        'PUT    /api/produits/:id',
        'DELETE /api/produits/:id',
        'POST   /api/commandes',
        'GET    /api/commandes/mes-commandes',
        'GET    /api/commandes/:id',
        'PUT    /api/commandes/:id/statut',
        'POST   /api/paiements',
        'GET    /api/paiements/:id',
        'PUT    /api/paiements/:id/statut',
        'GET    /api/livraisons/disponibles',
        'PUT    /api/livraisons/:id/accepter',
        'PUT    /api/livraisons/:id/statut',
        'PUT    /api/livraisons/:id/position',
        'POST   /api/avis',
        'GET    /api/avis/:type/:cibleId',
        'DELETE /api/avis/:id',
        'GET    /api/adresses',
        'POST   /api/adresses',
        'PUT    /api/adresses/:id',
        'DELETE /api/adresses/:id',
      ],
    },
  });
});

// Montage des routes
app.use('/api/authentification', authentificationRoutes);
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
  console.error('Erreur non geree:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur.',
    data: null,
  });
});

app.listen(PORT, () => {
  console.log(`Serveur Livro demarre sur le port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

module.exports = app;
