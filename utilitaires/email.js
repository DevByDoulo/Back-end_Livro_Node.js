/**
 * Configuration Nodemailer - Envoi d'emails.
 * Utilise SMTP (Gmail, SendGrid, Mailgun, etc.)
 */

const nodemailer = require('nodemailer');
const logger = require('../config/logger');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const envoyerEmail = async ({ destinataire, sujet, contenu }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Livro" <noreply@livro.com>',
      to: destinataire,
      subject: sujet,
      html: contenu,
    });

    logger.info(`Email envoye a ${destinataire}: ${info.messageId}`);
    return true;
  } catch (erreur) {
    logger.error(`Erreur envoi email a ${destinataire}: ${erreur.message}`);
    return false;
  }
};

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

const emailStatutCommande = async (client, commande, nouveauStatut) => {
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
