/**
 * ============================================================================
 * CONFIGURATION CENTRALE - Générateur de Devis Dialarme
 * ============================================================================
 * 
 * Ce fichier centralise tous les identifiants Google Drive, emails et 
 * paramètres utilisés par le générateur de devis.
 * 
 * Comment trouver un ID Google Drive:
 * 1. Ouvrez le dossier/fichier dans Google Drive
 * 2. L'URL contient l'ID: https://drive.google.com/drive/folders/[ID_ICI]
 * 3. Copiez l'ID et remplacez les valeurs ci-dessous
 * 
 * ============================================================================
 */

const CONFIG = {
  
  // ==========================================================================
  // DOSSIERS PRINCIPAUX
  // ==========================================================================
  
  FOLDERS: {
    /**
     * Dossier principal "Devis" - Contient les sous-dossiers par commercial
     * URL: https://drive.google.com/drive/u/1/folders/1BoUAYoJa6uING8-GKZo-ZEPhqql_7SkX
     */
    DEVIS: '1BoUAYoJa6uING8-GKZo-ZEPhqql_7SkX',
    
    /**
     * Dossier "Fiches techniques" - Contient tous les PDFs produits
     * URL: https://drive.google.com/drive/u/1/folders/1d8TprEVWym_swFXaEaUZK90PShP5zcIs
     */
    TECH_SHEETS: '1d8TprEVWym_swFXaEaUZK90PShP5zcIs'
  },
  
  // ==========================================================================
  // FICHIERS MODÈLES DE BASE (Templates PDF)
  // ==========================================================================
  
  DOSSIERS: {
    /**
     * Modèle de base pour les devis Alarme Titane
     * Fichier: Devis_ALARME_TITANE.pdf
     */
    ALARME_TITANE: '1yQeOxjlzHIN6H0p_rAiVw5TQNLlggRit',
    
    /**
     * Modèle de base pour les devis Alarme Jablotron
     * Fichier: Devis_ALARME_JABLOTRON.pdf
     */
    ALARME_JABLOTRON: '1NsVNGcTTIGqZNzNZbPxHbBseaHF_WigS',
    
    /**
     * Modèle de base pour les devis Vidéosurveillance
     * Fichier: Devis_VIDÉO.pdf
     */
    VIDEO: '1_ZzXmMgL4ZFrzp4yAmMT1vG2T7gKqM6r'
  },
  
  // ==========================================================================
  // INFORMATIONS COMMERCIAUX
  // ==========================================================================
  
  COMMERCIAUX: {
    /**
     * Chaque commercial a:
     * - phone: Numéro de téléphone
     * - email: Adresse email
     * - folder: (Optionnel) ID du sous-dossier personnel dans "Devis"
     * 
     * Pour trouver le folder ID:
     * 1. Ouvrir le dossier "Devis"
     * 2. Ouvrir le sous-dossier du commercial
     * 3. Copier l'ID depuis l'URL
     */
    
    'Anabelle': {
      phone: '06 XX XX XX XX',
      email: 'anabelle@dialarme.fr',
      folder: 'ID_TO_REPLACE' // ID du dossier "Devis/Anabelle"
    },
    
    'Test Commercial': {
      phone: '06 00 00 00 00',
      email: 'test@dialarme.fr',
      folder: 'ID_TO_REPLACE' // ID du dossier "Devis/Test Commercial"
    },
    
    'Arnaud Bloch': {
      phone: '06 XX XX XX XX',
      email: 'arnaud.bloch@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Yann Mamet': {
      phone: '06 XX XX XX XX',
      email: 'yann.mamet@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Maxime Legrand': {
      phone: '06 XX XX XX XX',
      email: 'maxime.legrand@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Gérald Guenard': {
      phone: '06 XX XX XX XX',
      email: 'gerald.guenard@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'François Ribeiro': {
      phone: '06 XX XX XX XX',
      email: 'francois.ribeiro@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Thomas Lefevre': {
      phone: '06 XX XX XX XX',
      email: 'thomas.lefevre@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Nicolas Dub': {
      phone: '06 XX XX XX XX',
      email: 'nicolas.dub@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Julien Auge': {
      phone: '06 XX XX XX XX',
      email: 'julien.auge@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Guillaume Marmey': {
      phone: '06 XX XX XX XX',
      email: 'guillaume.marmey@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Dylan Morel': {
      phone: '06 XX XX XX XX',
      email: 'dylan.morel@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Baptiste Laude': {
      phone: '06 XX XX XX XX',
      email: 'baptiste.laude@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Clement Faivre': {
      phone: '06 XX XX XX XX',
      email: 'clement.faivre@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Alexis Delamare': {
      phone: '06 XX XX XX XX',
      email: 'alexis.delamare@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Clement Sorel': {
      phone: '06 XX XX XX XX',
      email: 'clement.sorel@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    },
    
    'Laurent Rochard': {
      phone: '06 XX XX XX XX',
      email: 'laurent.rochard@dialarme.fr',
      folder: 'ID_TO_REPLACE'
    }
  },
  
  // ==========================================================================
  // PARAMÈTRES GÉNÉRAUX
  // ==========================================================================
  
  EMAIL: {
    /**
     * Email de destination pour tous les devis
     */
    DESTINATION: 'devis.dialarme@gmail.com',
    
    /**
     * Expéditeur (email du compte qui exécute le script)
     */
    FROM: 'devis.dialarme@gmail.com'
  },
  
  /**
   * Paramètres de l'application
   */
  APP: {
    NAME: 'Générateur Dialarme',
    VERSION: '2.0',
    TIMEOUT_MS: 30000 // 30 secondes
  }
};

// ============================================================================
// FONCTIONS HELPER
// ============================================================================

/**
 * Fonction de test pour vérifier que la configuration se charge correctement
 * 
 * Pour tester:
 * 1. Sélectionner "testConfigAccess" dans la liste des fonctions
 * 2. Cliquer sur "Exécuter"
 * 3. Vérifier les logs (Affichage → Logs)
 */
function testConfigAccess() {
  Logger.log('=== TEST DE CONFIGURATION ===');
  Logger.log('');
  
  Logger.log('📁 Dossiers principaux:');
  Logger.log('  - Devis: ' + CONFIG.FOLDERS.DEVIS);
  Logger.log('  - Fiches techniques: ' + CONFIG.FOLDERS.TECH_SHEETS);
  Logger.log('');
  
  Logger.log('📄 Modèles de base:');
  Logger.log('  - Alarme Titane: ' + CONFIG.DOSSIERS.ALARME_TITANE);
  Logger.log('  - Alarme Jablotron: ' + CONFIG.DOSSIERS.ALARME_JABLOTRON);
  Logger.log('  - Vidéo: ' + CONFIG.DOSSIERS.VIDEO);
  Logger.log('');
  
  Logger.log('👥 Nombre de commerciaux configurés: ' + Object.keys(CONFIG.COMMERCIAUX).length);
  Logger.log('');
  
  Logger.log('📧 Email de destination: ' + CONFIG.EMAIL.DESTINATION);
  Logger.log('');
  
  Logger.log('✅ Configuration chargée avec succès!');
  
  // Test d'accès à un dossier Drive
  try {
    const mainFolder = DriveApp.getFolderById(CONFIG.FOLDERS.DEVIS);
    Logger.log('✅ Accès au dossier "Devis" confirmé: ' + mainFolder.getName());
  } catch (error) {
    Logger.log('❌ Erreur d\'accès au dossier "Devis": ' + error.message);
  }
  
  try {
    const techFolder = DriveApp.getFolderById(CONFIG.FOLDERS.TECH_SHEETS);
    Logger.log('✅ Accès au dossier "Fiches techniques" confirmé: ' + techFolder.getName());
  } catch (error) {
    Logger.log('❌ Erreur d\'accès au dossier "Fiches techniques": ' + error.message);
  }
  
  Logger.log('');
  Logger.log('=== FIN DU TEST ===');
}

/**
 * Récupère les informations d'un commercial
 * 
 * @param {string} commercialName - Nom du commercial
 * @returns {Object|null} Informations du commercial ou null si non trouvé
 */
function getCommercialInfo(commercialName) {
  return CONFIG.COMMERCIAUX[commercialName] || null;
}

/**
 * Vérifie si un commercial existe dans la configuration
 * 
 * @param {string} commercialName - Nom du commercial
 * @returns {boolean} True si le commercial existe
 */
function commercialExists(commercialName) {
  return CONFIG.COMMERCIAUX.hasOwnProperty(commercialName);
}

/**
 * Récupère la liste de tous les commerciaux
 * 
 * @returns {Array<string>} Liste des noms de commerciaux
 */
function getAllCommercials() {
  return Object.keys(CONFIG.COMMERCIAUX);
}

