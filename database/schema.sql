CREATE DATABASE IF NOT EXISTS livro_db;
USE livro_db;

DROP TABLE IF EXISTS Avis;
DROP TABLE IF EXISTS LigneCommande;
DROP TABLE IF EXISTS Livraison;
DROP TABLE IF EXISTS Commande;
DROP TABLE IF EXISTS Paiement;
DROP TABLE IF EXISTS Produit;
DROP TABLE IF EXISTS Adresse;
DROP TABLE IF EXISTS Commerce;
DROP TABLE IF EXISTS Utilisateur;

CREATE TABLE Utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    role ENUM('client', 'commercant', 'livreur') NOT NULL,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    est_actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE Commerce (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    nom VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    logo VARCHAR(255),
    horaires VARCHAR(255),
    zone_livraison VARCHAR(255) NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE Adresse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    quartier VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    est_principale BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE Produit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commerce_id INT NOT NULL,
    nom VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    prix DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    est_disponible BOOLEAN DEFAULT TRUE,
    image VARCHAR(255),
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commerce_id) REFERENCES Commerce(id) ON DELETE CASCADE
);

CREATE TABLE Paiement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    montant DECIMAL(10,2) NOT NULL,
    moyen ENUM('mobile_money', 'carte_bancaire', 'cash') NOT NULL,
    statut ENUM('en_attente', 'confirme', 'echoue', 'rembourse') DEFAULT 'en_attente',
    date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
    reference VARCHAR(100)
);

CREATE TABLE Commande (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    commerce_id INT NOT NULL,
    paiement_id INT,
    adresse_id INT NOT NULL,
    statut ENUM('en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree', 'annulee') DEFAULT 'en_attente',
    montant_total DECIMAL(10,2) NOT NULL,
    frais_livraison DECIMAL(10,2) DEFAULT 0,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_livraison DATETIME,
    FOREIGN KEY (client_id) REFERENCES Utilisateur(id),
    FOREIGN KEY (commerce_id) REFERENCES Commerce(id),
    FOREIGN KEY (paiement_id) REFERENCES Paiement(id),
    FOREIGN KEY (adresse_id) REFERENCES Adresse(id)
);

CREATE TABLE LigneCommande (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    sous_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (commande_id) REFERENCES Commande(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES Produit(id)
);

CREATE TABLE Livraison (
    id INT AUTO_INCREMENT PRIMARY KEY,
    livreur_id INT,
    commande_id INT UNIQUE,
    statut ENUM('disponible', 'en_cours_recuperation', 'en_cours_livraison', 'livree') DEFAULT 'disponible',
    position_lat DECIMAL(10,8),
    position_lng DECIMAL(11,8),
    date_debut DATETIME,
    date_fin DATETIME,
    FOREIGN KEY (livreur_id) REFERENCES Utilisateur(id),
    FOREIGN KEY (commande_id) REFERENCES Commande(id) ON DELETE CASCADE
);

CREATE TABLE Avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    type ENUM('commerce', 'livreur') NOT NULL,
    cible_id INT NOT NULL,
    note INT NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire VARCHAR(500),
    date_avis DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Utilisateur(id)
);
