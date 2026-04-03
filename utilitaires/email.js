/**
 * Configuration Nodemailer - Envoi d'emails.
 * Utilise SMTP (Gmail, SendGrid, Mailgun, etc.)
 * Permet d'envoyer des emails transactionnels (bienvenue, notifications, etc.)
 */

const nodemailer = require('nodemailer');
const logger = require('../config/logger');
require('dotenv').config();

/**
 * Transporter Nodemailer configure avec les variables d'environnement.
 * - host: serveur SMTP (defaut: smtp.gmail.com)
 * - port: port SMTP (defaut: 587 pour non-securise)
 * - secure: false (pour le port 587, utilise TLS)
 * - auth: identifiants SMTP depuis les variables d'environnement
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envoie un email via le transporter configure.
 * @param {Object} params - Parametres de l'email
 * @param {string} params.destinataire - Adresse email du destinataire
 * @param {string} params.sujet - Sujet de l'email
 * @param {string} params.contenu - Contenu HTML de l'email
 * @returns {boolean} true si l'email a ete envoye avec succes, false sinon
 */
const envoyerEmail = async ({ destinataire, sujet, contenu }) => {
  console.log(`[EMAIL] >>> Sending to: ${destinataire}, subject: ${sujet}`);
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Livro" <noreply@livro.com>',
      to: destinataire,
      subject: sujet,
      html: contenu,
    });

    console.log(`[EMAIL] >>> Success! MessageId: ${info.messageId}`);
    logger.info(`Email envoye a ${destinataire}: ${info.messageId}`);
    return true;
  } catch (erreur) {
    console.log(`[EMAIL] >>> FAILED: ${erreur.message}`);
    logger.error(`Erreur envoi email a ${destinataire}: ${erreur.message}`);
    return false;
  }
};

/**
 * Envoie un email de bienvenue a un nouvel utilisateur.
 * Le contenu varie selon le role de l'utilisateur.
 * @param {Object} utilisateur - Utilisateur cree
 * @param {string} utilisateur.email - Email de l'utilisateur
 * @param {string} utilisateur.prenom - Prenom de l'utilisateur
 * @param {string} utilisateur.nom - Nom de l'utilisateur
 * @param {string} utilisateur.role - Role de l'utilisateur (client, commercant, livreur)
 * @returns {boolean} true si l'email a ete envoye, false sinon
 */
const emailBienvenue = async (utilisateur) => {
  const messagesParRole = {
    client: `
      <h2>Bienvenue ${utilisateur.prenom} !</h2>
      <p>Votre compte client a ete cree avec succes sur Livro.</p>
      <p>Vous pouvez maintenant :</p>
      <ul>
        <li>Parcourir les differents commerces partenaires</li>
        <li>Commander vos produits preferes</li>
        <li>Suivre vos livraisons en temps reel</li>
        <li>Donner votre avis sur les services</li>
      </ul>
      <p>Passez votre premiere commande des maintenant !</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
    commercant: `
      <h2>Bienvenue ${utilisateur.prenom} !</h2>
      <p>Votre compte commercant a ete cree avec succes sur Livro.</p>
      <p>Vous pouvez maintenant :</p>
      <ul>
        <li>Creer et gerer votre commerce</li>
        <li>Ajouter et modifier vos produits</li>
        <li>Recevoir et traiter les commandes clients</li>
        <li>Suivre vos performances et avis clients</li>
      </ul>
      <p>Commencez par creer votre premiere boutique !</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
    livreur: `
      <h2>Bienvenue ${utilisateur.prenom} !</h2>
      <p>Votre compte livreur a ete cree avec succes sur Livro.</p>
      <p>Vous pouvez maintenant :</p>
      <ul>
        <li>Consulter les livraisons disponibles</li>
        <li>Accepter et realizar les livraisons</li>
        <li>Mettre a jour votre position GPS</li>
        <li>Suivre votre historique de livraisons</li>
      </ul>
      <p>Commencez a accepter des livraisons !</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
  };

  const contenu = messagesParRole[utilisateur.role] || messagesParRole.client;

  return envoyerEmail({
    destinataire: utilisateur.email,
    sujet: `Bienvenue sur Livro, ${utilisateur.prenom} !`,
    contenu,
  });
};

/**
 * Notifie un commercant qu'il a recu une nouvelle commande.
 * @param {Object} commercant - Utilisateur commercant
 * @param {Object} commande - Commande creee
 * @returns {boolean} true si l'email a ete envoye, false sinon
 */
const emailNouvelleCommande = async (commercant, commande) => {
  return envoyerEmail({
    destinataire: commercant.email,
    sujet: `🛒 Nouvelle commande #${commande.id}`,
    contenu: `
      <h2>Nouvelle commande recue !</h2>
      <p>Bonjour ${commercant.prenom || 'Commercant'},</p>
      <p>Vous avez recu une nouvelle commande.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Commande #${commande.id}</strong></p>
        <p>Client: ${commande.client_nom || ''} ${commande.client_prenom || ''}</p>
        <p>Telephone: ${commande.client_telephone || 'Non disponible'}</p>
        <p>Adresse de livraison: ${commande.adresse_livraison || ''}, ${commande.ville || ''}</p>
        <hr>
        <p><strong>Montant total: ${commande.montant_total} FC</strong></p>
      </div>
      
      <p>Connectez-vous a votre tableau de bord pour accepter et preparer la commande.</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
  });
};

/**
 * Notifie un client du changement de statut de sa commande.
 * @param {Object} client - Utilisateur client
 * @param {Object} commande - Commande dont le statut a change
 * @param {string} nouveauStatut - Nouveau statut de la commande
 * @returns {boolean} true si l'email a ete envoye, false sinon
 */
const emailStatutCommande = async (client, commande, nouveauStatut) => {
  // Messages adaptes a chaque statut de commande
  const messages = {
    acceptee: {
      titre: 'Commande acceptee !',
      message: 'Votre commande a ete acceptee par le commercant. Elle va etre preparee rapidement.',
      emoji: '✅',
    },
    en_preparation: {
      titre: 'En preparation',
      message: 'Votre commande est en cours de preparation. Patience, presque prete !',
      emoji: '👨‍🍳',
    },
    en_livraison: {
      titre: 'En livraison',
      message: 'Votre commande est en cours de livraison. Suivez le livreur en temps reel !',
      emoji: '🚴',
    },
    livree: {
      titre: 'Commande livree',
      message: 'Votre commande a ete livree. Merci pour votre achat et a tres bientot !',
      emoji: '📦',
    },
    annulee: {
      titre: 'Commande annulee',
      message: 'Votre commande a ete annulee. Si vous avez un paiement, il sera rembourse sous 48h.',
      emoji: '❌',
    },
  };

  const { titre, message, emoji } = messages[nouveauStatut] || { titre: 'Mise a jour', message: `Statut: ${nouveauStatut}`, emoji: '📋' };

  return envoyerEmail({
    destinataire: client.email,
    sujet: `${emoji} Commande #${commande.id} - ${titre}`,
    contenu: `
      <h2>${titre}</h2>
      <p>Bonjour ${client.prenom || 'Client'},</p>
      <p>${message}</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Commande #${commande.id}</strong></p>
        <p>Commerce: ${commande.commerce_nom || ''}</p>
        <p>Montant: ${commande.montant_total} FC</p>
      </div>
      
      <p>Merci de votre confiance !</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
  });
};

/**
 * Envoie un email de recovery de mot de passe avec un code de verification.
 * @param {Object} utilisateur - Utilisateur qui demande la reinitialisation
 * @param {string} code - Code de verification a 6 chiffres
 * @returns {boolean} true si l'email a ete envoye, false sinon
 */
const emailRecuperationMotDePasse = async (utilisateur, code) => {
  return envoyerEmail({
    destinataire: utilisateur.email,
    sujet: 'Recuperation de mot de passe - Livro',
    contenu: `
      <h2>Reinitialisation de mot de passe</h2>
      <p>Bonjour ${utilisateur.prenom},</p>
      <p>Voici votre code de recuperation :</p>
      <h1 style="color: #4CAF50; letter-spacing: 5px;">${code}</h1>
      <p>Ce code expire dans 15 minutes.</p>
      <p>Si vous n'avez pas demande cette reinitialisation, ignorez cet email.</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
  });
};

/**
 * Notifie l'utilisateur que son email a ete modifie.
 * @param {Object} utilisateur - Utilisateur affecte
 * @param {string} ancienEmail - Ancien email
 * @returns {boolean} true si l'email a ete envoye, false sinon
 */
const emailModificationEmail = async (utilisateur, ancienEmail) => {
  return envoyerEmail({
    destinataire: ancienEmail,
    sujet: '🔐 Modification de votre email - Livro',
    contenu: `
      <h2>Email modifie</h2>
      <p>Bonjour ${utilisateur.prenom},</p>
      <p>Votre adresse email a ete modifiee avec succes.</p>
      <p>Nouvel email: ${utilisateur.email}</p>
      <p>Si vous n'avez pas effectue cette modification, contactez immediatement le support.</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
  });
};

/**
 * Notifie l'utilisateur que son mot de passe a ete modifie.
 * @param {Object} utilisateur - Utilisateur affecte
 * @returns {boolean} true si l'email a ete envoye, false sinon
 */
const emailModificationMotDePasse = async (utilisateur) => {
  return envoyerEmail({
    destinataire: utilisateur.email,
    sujet: '🔐 Mot de passe modifie - Livro',
    contenu: `
      <h2>Mot de passe modifie</h2>
      <p>Bonjour ${utilisateur.prenom},</p>
      <p>Votre mot de passe a ete modifie avec succes.</p>
      <p>Si vous n'avez pas effectue cette modification, contactez immediatement le support pour securiser votre compte.</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
  });
};

/**
 * Notifie l'utilisateur que son compte a ete desactive.
 * @param {Object} utilisateur - Utilisateur affecte
 * @returns {boolean} true si l'email a ete envoye, false sinon
 */
const emailDesactivationCompte = async (utilisateur) => {
  return envoyerEmail({
    destinataire: utilisateur.email,
    sujet: '❌ Compte desactive - Livro',
    contenu: `
      <h2>Compte desactive</h2>
      <p>Bonjour ${utilisateur.prenom},</p>
      <p>Votre compte a ete desactive.</p>
      <p>Vos donnees sont conservees pendant 30 jours. Vous pouvez reactiver votre compte a tout moment en vous connectant.</p>
      <p>Si vous desirez supprimer definitivement vos donnees, contactez le support.</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
  });
};

module.exports = {
  envoyerEmail,
  emailBienvenue,
  emailNouvelleCommande,
  emailStatutCommande,
  emailRecuperationMotDePasse,
  emailModificationEmail,
  emailModificationMotDePasse,
  emailDesactivationCompte,
};
