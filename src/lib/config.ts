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
  folders: {
    devis: string;
    techSheets: string;
  };
  templates: {
    alarmeTitane: string;
    alarmeJablotron: string;
    video: string;
  };
  commercials: Record<string, CommercialInfo>;
  email: {
    from: string;
    destination: string;
  };
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
export const CONFIG: AppConfig = {
  // ==========================================================================
  // MAIN FOLDERS
  // ==========================================================================
  folders: {
    /**
     * Main "Devis" folder - Contains subfolders per commercial
     */
    devis: process.env.DRIVE_FOLDER_DEVIS || '',
    
    /**
     * "Technical Sheets" folder - Contains all product PDFs (COMPRESSED)
     */
    techSheets: process.env.DRIVE_FOLDER_TECH_SHEETS || '',
  },
  
  // ==========================================================================
  // BASE TEMPLATE FILES (PDF Templates)
  // ==========================================================================
  templates: {
    /**
     * Base template for Titane Alarm quotes (COMPRESSED)
     */
    alarmeTitane: process.env.DRIVE_FILE_ALARME_TITANE || '',
    
    /**
     * Base template for Jablotron Alarm quotes (COMPRESSED)
     */
    alarmeJablotron: process.env.DRIVE_FILE_ALARME_JABLOTRON || '',
    
    /**
     * Base template for Video surveillance quotes (COMPRESSED)
     */
    video: process.env.DRIVE_FILE_VIDEO || '',
  },
  
  // ==========================================================================
  // COMMERCIALS INFORMATION
  // ==========================================================================
  commercials: {
    'Anabelle': {
      phone: '06 XX XX XX XX',
      email: 'anabelle@dialarme.fr',
      folder: undefined, // Set in Drive if needed
    },
    'Test Commercial': {
      phone: '06 00 00 00 00',
      email: 'test@dialarme.fr',
      folder: undefined,
    },
    'Arnaud Bloch': {
      phone: '06 XX XX XX XX',
      email: 'arnaud.bloch@dialarme.fr',
      folder: undefined,
    },
    'Yann Mamet': {
      phone: '06 XX XX XX XX',
      email: 'yann.mamet@dialarme.fr',
      folder: undefined,
    },
    'Maxime Legrand': {
      phone: '06 XX XX XX XX',
      email: 'maxime.legrand@dialarme.fr',
      folder: undefined,
    },
    'Gérald Guenard': {
      phone: '06 XX XX XX XX',
      email: 'gerald.guenard@dialarme.fr',
      folder: undefined,
    },
    'François Ribeiro': {
      phone: '06 XX XX XX XX',
      email: 'francois.ribeiro@dialarme.fr',
      folder: undefined,
    },
    'Thomas Lefevre': {
      phone: '06 XX XX XX XX',
      email: 'thomas.lefevre@dialarme.fr',
      folder: undefined,
    },
    'Nicolas Dub': {
      phone: '06 XX XX XX XX',
      email: 'nicolas.dub@dialarme.fr',
      folder: undefined,
    },
    'Julien Auge': {
      phone: '06 XX XX XX XX',
      email: 'julien.auge@dialarme.fr',
      folder: undefined,
    },
    'Guillaume Marmey': {
      phone: '06 XX XX XX XX',
      email: 'guillaume.marmey@dialarme.fr',
      folder: undefined,
    },
    'Dylan Morel': {
      phone: '06 XX XX XX XX',
      email: 'dylan.morel@dialarme.fr',
      folder: undefined,
    },
    'Baptiste Laude': {
      phone: '06 XX XX XX XX',
      email: 'baptiste.laude@dialarme.fr',
      folder: undefined,
    },
    'Clement Faivre': {
      phone: '06 XX XX XX XX',
      email: 'clement.faivre@dialarme.fr',
      folder: undefined,
    },
    'Alexis Delamare': {
      phone: '06 XX XX XX XX',
      email: 'alexis.delamare@dialarme.fr',
      folder: undefined,
    },
    'Clement Sorel': {
      phone: '06 XX XX XX XX',
      email: 'clement.sorel@dialarme.fr',
      folder: undefined,
    },
    'Laurent Rochard': {
      phone: '06 XX XX XX XX',
      email: 'laurent.rochard@dialarme.fr',
      folder: undefined,
    },
  },
  
  // ==========================================================================
  // GENERAL PARAMETERS
  // ==========================================================================
  email: {
    from: process.env.EMAIL_FROM || 'devis@dialarme.fr',
    destination: process.env.EMAIL_DESTINATION || 'devis.dialarme@gmail.com',
  },
  
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
  return CONFIG.commercials[commercialName] || null;
}

/**
 * Check if commercial exists in configuration
 */
export function commercialExists(commercialName: string): boolean {
  return commercialName in CONFIG.commercials;
}

/**
 * Get list of all commercials
 */
export function getAllCommercials(): string[] {
  return Object.keys(CONFIG.commercials);
}

/**
 * Validate configuration - ensure all required fields are present
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check folders
  if (!CONFIG.folders.devis) {
    errors.push('DRIVE_FOLDER_DEVIS is not configured');
  }
  if (!CONFIG.folders.techSheets) {
    errors.push('DRIVE_FOLDER_TECH_SHEETS is not configured');
  }
  
  // Check templates
  if (!CONFIG.templates.alarmeTitane) {
    errors.push('DRIVE_FILE_ALARME_TITANE is not configured');
  }
  if (!CONFIG.templates.alarmeJablotron) {
    errors.push('DRIVE_FILE_ALARME_JABLOTRON is not configured');
  }
  if (!CONFIG.templates.video) {
    errors.push('DRIVE_FILE_VIDEO is not configured');
  }
  
  // Check email
  if (!CONFIG.email.from) {
    errors.push('EMAIL_FROM is not configured');
  }
  if (!CONFIG.email.destination) {
    errors.push('EMAIL_DESTINATION is not configured');
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
      return CONFIG.templates.alarmeJablotron;
    }
    return CONFIG.templates.alarmeTitane;
  }
  
  if (quoteType === 'video') {
    return CONFIG.templates.video;
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

