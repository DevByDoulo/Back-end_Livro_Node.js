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
 * @param {Object} utilisateur - Utilisateur cree
 * @param {string} utilisateur.email - Email de l'utilisateur
 * @param {string} utilisateur.prenom - Prenom de l'utilisateur
 * @param {string} utilisateur.nom - Nom de l'utilisateur
 * @returns {boolean} true si l'email a ete envoye, false sinon
 */
const emailBienvenue = async (utilisateur) => {
  return envoyerEmail({
    destinataire: utilisateur.email,
    sujet: 'Bienvenue sur Livro !',
    contenu: `
      <h2>Bienvenue ${utilisateur.prenom} ${utilisateur.nom} !</h2>
      <p>Votre compte a ete cree avec succes sur Livro.</p>
      <p>Vous pouvez desormais passer des commandes et suivre vos livraisons.</p>
      <p>Cordialement,<br>L'equipe Livro</p>
    `,
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
    sujet: `Nouvelle commande #${commande.id}`,
    contenu: `
      <h2>Nouvelle commande recue !</h2>
      <p><strong>Commande #${commande.id}</strong></p>
      <p>Montant total : ${commande.montant_total} FCFA</p>
      <p>Connectez-vous a votre tableau de bord pour accepter la commande.</p>
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
    acceptee: 'Votre commande a ete acceptee par le commercant.',
    en_preparation: 'Votre commande est en cours de preparation.',
    en_livraison: 'Votre commande est en cours de livraison.',
    livree: 'Votre commande a ete livree. Merci pour votre achat !',
    annulee: 'Votre commande a ete annulee.',
  };

  return envoyerEmail({
    destinataire: client.email,
    sujet: `Commande #${commande.id} - ${nouveauStatut}`,
    contenu: `
      <h2>Mise a jour de votre commande</h2>
      <p><strong>Commande #${commande.id}</strong></p>
      <p>${messages[nouveauStatut] || `Statut: ${nouveauStatut}`}</p>
      <p>Montant : ${commande.montant_total} FCFA</p>
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

module.exports = {
  envoyerEmail,
  emailBienvenue,
  emailNouvelleCommande,
  emailStatutCommande,
  emailRecuperationMotDePasse,
};
