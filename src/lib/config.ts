/**
 * ============================================================================
 * CONFIGURATION CENTRALE - Générateur de Devis Dialarme
 * ============================================================================
 * 
 * Converted from Google Apps Script config.gs to TypeScript
 * This file centralizes all Drive IDs, email addresses, and parameters
 * used by the quote generator.
 * 
 * Environment variables are loaded from .env.local
 * ============================================================================
 */

export interface CommercialInfo {
  phone: string;
  email: string;
  folder?: string; // Optional folder ID for this commercial in Drive
}

export interface AppConfig {
  google: {
    drive: {
      folders: {
        devis: string;
        techSheets: string;
        productSheets: string;
        titane: string;
        jablotron: string;
        video: string;
      };
      baseDocuments: {
        alarmTitane: string;
        alarmJablotron: string;
        video: string;
        accessories: string;
      };
    };
  };
  email: {
    from: string;
    recipients: {
      internal: string;
    };
  };
  commercials: Record<string, CommercialInfo>;
  app: {
    name: string;
    version: string;
    timeoutMs: number;
  };
}

/**
 * Main configuration object
 * Values are loaded from environment variables
 */
export const config: AppConfig = {
  // ==========================================================================
  // GOOGLE DRIVE CONFIGURATION
  // ==========================================================================
  google: {
    drive: {
      folders: {
        /**
         * Main "Devis" folder - Contains subfolders per commercial
         */
        devis: process.env.GOOGLE_DRIVE_FOLDER_DEVIS || '',
        
        /**
         * "Technical Sheets" folder - Contains all product PDFs
         */
        techSheets: process.env.GOOGLE_DRIVE_FOLDER_TECH_SHEETS || '',
        
        /**
         * "Product Sheets" folder - Contains product specification PDFs
         */
        productSheets: process.env.GOOGLE_DRIVE_FOLDER_PRODUCT_SHEETS || process.env.GOOGLE_DRIVE_FOLDER_TECH_SHEETS || '',
        
        /**
         * Titane alarm quotes folder
         */
        titane: process.env.GOOGLE_DRIVE_FOLDER_TITANE || '',
        
        /**
         * Jablotron alarm quotes folder
         */
        jablotron: process.env.GOOGLE_DRIVE_FOLDER_JABLOTRON || '',
        
        /**
         * Video surveillance quotes folder
         */
        video: process.env.GOOGLE_DRIVE_FOLDER_VIDEO || '',
      },
      baseDocuments: {
        /**
         * Base template for Titane Alarm quotes
         * File ID: 12Ntu8bsVpO_CXdAOvL2V_AZcnGo6sA-S
         */
        alarmTitane: process.env.GOOGLE_DRIVE_FILE_ALARME_TITANE || '12Ntu8bsVpO_CXdAOvL2V_AZcnGo6sA-S',
        
        /**
         * Base template for Jablotron Alarm quotes
         * File ID: 1enFlLv9q681uGBSwdRu43r8Co2nWytFf
         */
        alarmJablotron: process.env.GOOGLE_DRIVE_FILE_ALARME_JABLOTRON || '1enFlLv9q681uGBSwdRu43r8Co2nWytFf',
        
        /**
         * Base template for Video surveillance quotes
         * File ID: 15daREPnmbS1T76DLUpUxBLWahWIyq_cn
         */
        video: process.env.GOOGLE_DRIVE_FILE_VIDEO || '15daREPnmbS1T76DLUpUxBLWahWIyq_cn',
        
        /**
         * Accessories sheet (ONDULEURS - COFFRET - SWITCH)
         */
        accessories: process.env.GOOGLE_DRIVE_FILE_ACCESSORIES || '',
      },
    },
  },
  
  // ==========================================================================
  // EMAIL CONFIGURATION
  // ==========================================================================
  email: {
    from: process.env.EMAIL_FROM || 'devis@dialarme.fr',
    recipients: {
      internal: process.env.EMAIL_INTERNAL || 'devis.dialarme@gmail.com',
    },
  },
  
  // ==========================================================================
  // COMMERCIALS INFORMATION
  // ==========================================================================
  commercials: {
    'Arnaud Bloch': {
      phone: '06 XX XX XX XX',
      email: 'arnaud.bloch@dialarme.fr',
    },
    'Benali Kodad': {
      phone: '06 XX XX XX XX',
      email: 'benali.kodad@dialarme.fr',
    },
    'Bryan Debrosse': {
      phone: '06 XX XX XX XX',
      email: 'bryan.debrosse@dialarme.fr',
    },
    'Cédric Boldron': {
      phone: '06 XX XX XX XX',
      email: 'cedric.boldron@dialarme.fr',
    },
    'Emin Comert': {
      phone: '06 XX XX XX XX',
      email: 'emin.comert@dialarme.fr',
    },
    'Gérald Clausen': {
      phone: '06 XX XX XX XX',
      email: 'gerald.clausen@dialarme.fr',
    },
    'Heythem Ziaya': {
      phone: '06 XX XX XX XX',
      email: 'heythem.ziaya@dialarme.fr',
    },
    'Iyed Baccouche': {
      phone: '06 XX XX XX XX',
      email: 'iyed.baccouche@dialarme.fr',
    },
    'Matys Goiot': {
      phone: '06 XX XX XX XX',
      email: 'matys.goiot@dialarme.fr',
    },
    'Mohamed Tartik': {
      phone: '06 XX XX XX XX',
      email: 'mohamed.tartik@dialarme.fr',
    },
    'Nassim Jaza': {
      phone: '06 XX XX XX XX',
      email: 'nassim.jaza@dialarme.fr',
    },
    'Nora Sassi': {
      phone: '06 XX XX XX XX',
      email: 'nora.sassi@dialarme.fr',
    },
    'Rodolphe De Vito': {
      phone: '06 XX XX XX XX',
      email: 'rodolphe.devito@dialarme.fr',
    },
    'Samir Ouhameni': {
      phone: '06 XX XX XX XX',
      email: 'samir.ouhameni@dialarme.fr',
    },
    'Thilan Curt': {
      phone: '06 XX XX XX XX',
      email: 'thilan.curt@dialarme.fr',
    },
    'Thomas Garcia': {
      phone: '06 XX XX XX XX',
      email: 'thomas.garcia@dialarme.fr',
    },
    'Wassim Tahiri': {
      phone: '06 XX XX XX XX',
      email: 'wassim.tahiri@dialarme.fr',
    },
  },
  
  // ==========================================================================
  // APPLICATION PARAMETERS
  // ==========================================================================
  app: {
    name: 'Générateur Dialarme',
    version: '2.0',
    timeoutMs: parseInt(process.env.PDF_TIMEOUT_MS || '30000', 10),
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get commercial information by name
 */
export function getCommercialInfo(commercialName: string): CommercialInfo | null {
  return config.commercials[commercialName] || null;
}

/**
 * Check if commercial exists in configuration
 */
export function commercialExists(commercialName: string): boolean {
  return commercialName in config.commercials;
}

/**
 * Get list of all commercials
 */
export function getAllCommercials(): string[] {
  return Object.keys(config.commercials);
}

/**
 * Validate configuration - ensure all required fields are present
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check folders
  if (!config.google.drive.folders.devis) {
    errors.push('GOOGLE_DRIVE_FOLDER_DEVIS is not configured');
  }
  if (!config.google.drive.folders.techSheets) {
    errors.push('GOOGLE_DRIVE_FOLDER_TECH_SHEETS is not configured');
  }
  if (!config.google.drive.folders.titane) {
    errors.push('GOOGLE_DRIVE_FOLDER_TITANE is not configured');
  }
  if (!config.google.drive.folders.jablotron) {
    errors.push('GOOGLE_DRIVE_FOLDER_JABLOTRON is not configured');
  }
  if (!config.google.drive.folders.video) {
    errors.push('GOOGLE_DRIVE_FOLDER_VIDEO is not configured');
  }
  
  // Check base documents
  if (!config.google.drive.baseDocuments.alarmTitane) {
    errors.push('GOOGLE_DRIVE_FILE_ALARME_TITANE is not configured');
  }
  if (!config.google.drive.baseDocuments.alarmJablotron) {
    errors.push('GOOGLE_DRIVE_FILE_ALARME_JABLOTRON is not configured');
  }
  if (!config.google.drive.baseDocuments.video) {
    errors.push('GOOGLE_DRIVE_FILE_VIDEO is not configured');
  }
  
  // Check email
  if (!config.email.from) {
    errors.push('EMAIL_FROM is not configured');
  }
  if (!config.email.recipients.internal) {
    errors.push('EMAIL_INTERNAL is not configured');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get template file ID based on quote type and central type
 */
export function getTemplateFileId(
  quoteType: 'alarme' | 'video',
  centralType?: 'titane' | 'jablotron'
): string | null {
  if (quoteType === 'alarme') {
    if (centralType === 'jablotron') {
      return config.google.drive.baseDocuments.alarmJablotron;
    }
    return config.google.drive.baseDocuments.alarmTitane;
  }
  
  if (quoteType === 'video') {
    return config.google.drive.baseDocuments.video;
  }
  
  return null;
}

/**
 * Get template name based on quote type and central type
 */
export function getTemplateName(
  quoteType: 'alarme' | 'video',
  centralType?: 'titane' | 'jablotron'
): string {
  if (quoteType === 'alarme') {
    if (centralType === 'jablotron') {
      return 'Devis_ALARME_JABLOTRON.pdf';
    }
    return 'Devis_ALARME_TITANE.pdf';
  }
  
  if (quoteType === 'video') {
    return 'Devis_VIDÉO.pdf';
  }
  
  return 'Unknown';
}

// Export legacy CONFIG for backward compatibility
export const CONFIG = config;
