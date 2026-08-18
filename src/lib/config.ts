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
  /** PDF rendering configuration. */
  pdf: {
    /**
     * Position of the "de vos locaux / habitation / villa / ..." overlay
     * on the assembled PDF (page 2). Tunable via env so the client can
     * realign without code changes when the Drive base template moves.
     */
    propertyTypeOverlay: {
      x: number;
      yFromTop: number;
      fontSize: number;
    };
  };
  google: {
    drive: {
      folders: {
        devis: string;
        techSheets: string;
        productSheets: string;
        titane: string;
        jablotron: string;
        video: string;
        xto?: string;
      };
      baseDocuments: {
        alarmTitane: string;
        alarmJablotron: string;
        video: string;
        /** Optional base template for Brouillard quotes. Empty string → standalone PDF. */
        fog?: string;
        /** Optional base template for Visiophone quotes. Empty string → standalone PDF. */
        visiophone?: string;
        accessories: string;
        propertyTypeDocs?: Partial<Record<'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise', string>>;
        /** Document appended to alarm quotes when "Intervention de la police" is selected. */
        policeDoc?: string;
        /** Direct Drive file IDs for camera fiches techniques, keyed on catalog product name. */
        cameraSheetIds?: Record<string, string>;
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
  // PDF RENDERING CONFIGURATION
  // ==========================================================================
  pdf: {
    /**
     * "de vos locaux / habitation / villa / ..." overlay on page 2.
     *
     * Page 2 of every base template has the sentence:
     *   "votre devis [TYPE] concernant la sécurité"
     * which wraps to two lines. The second line ends with a "sécurité"
     * token at the left margin. The overlay must land RIGHT AFTER that
     * final word, at the same baseline.
     *
     * Measured (PDF coords, A4 595x842) against the live prod templates:
     *   alarm Titane/Jablotron  → "la sécurité" ends ~x=121
     *   fog                     → " sécurité"   ends ~x=113
     *   visiophone              → "sécurité"    ends ~x=110
     *   baseline y ≈ 527  →  yFromTop = 842 - 527 ≈ 315
     *
     * x=126 clears the longest case (alarm) by ~4pt and leaves a slightly
     * wider gap on the others. Override via env if a future base shifts.
     */
    propertyTypeOverlay: {
      x: Number(process.env.PDF_PROPERTY_TYPE_X) || 126,
      yFromTop: Number(process.env.PDF_PROPERTY_TYPE_Y) || 315,
      fontSize: Number(process.env.PDF_PROPERTY_TYPE_FONT_SIZE) || 11,
    },
  },

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

        /**
         * XTO alarm quotes folder (optional; used when XTO kit is selected)
         */
        xto: process.env.GOOGLE_DRIVE_FOLDER_XTO || process.env.GOOGLE_DRIVE_FOLDER_DEVIS_XTO || '',
      },
      baseDocuments: {
        /**
         * Base template for Titane Alarm quotes (file ID provided by client 2026-05-29).
         *
         * The previous default `12Ntu8bsVpO_CXdAOvL2V_AZcnGo6sA-S` pointed at
         * the older dossier the client said was wrong. The new ID below points
         * at the updated dossier. Requires the file to be shared with the
         * OAuth account `devis.dialarme@gmail.com`; otherwise `/api/drive-fetch`
         * returns 500 and the assembled PDF falls back to the standalone quote.
         */
        alarmTitane: process.env.GOOGLE_DRIVE_FILE_ALARME_TITANE || '1Dscba9DsFZviqGCRux2TXInreek8CqnD',

        /**
         * Base template for Jablotron Alarm quotes (file ID provided by client 2026-05-29).
         * Same sharing requirement as alarmTitane above.
         */
        alarmJablotron: process.env.GOOGLE_DRIVE_FILE_ALARME_JABLOTRON || '1xAA0dRnhaiUYau-x1H5Yr4DQrk24FZiO',

        /**
         * Base template for Video surveillance quotes.
         *
         * Note (2026-05-29): both the prior ID `15daREPnmbS1T76DLUpUxBLWahWIyq_cn`
         * AND the client's refreshed ID `1zbuCpITKYE7JAWQ__RH6MaKbNRr40II6`
         * 404 for the OAuth account. Camera quotes silently ship without
         * the base dossier until the client re-shares one of these.
         */
        video: process.env.GOOGLE_DRIVE_FILE_VIDEO || '1zbuCpITKYE7JAWQ__RH6MaKbNRr40II6',

        /**
         * Base template for Brouillard (fog) quotes.
         * File ID provided by client 2026-05-29.
         */
        fog: process.env.GOOGLE_DRIVE_FILE_FOG || '1mXvbIiTYZZyV5Pmqw22rIS4zguAyZtaq',

        /**
         * Base template for Visiophone (interphone) quotes.
         * File ID provided by client 2026-05-29.
         */
        visiophone: process.env.GOOGLE_DRIVE_FILE_VISIOPHONE || '10GvZ8ctB7EBZxED9jILegbRZ3Fom4WiV',
        
        /**
         * Accessories sheet (ONDULEURS - COFFRET - SWITCH)
         */
        accessories: process.env.GOOGLE_DRIVE_FILE_ACCESSORIES || '',

        /**
         * Optional documents to append based on selected "Type de bien"
         * (If a fileId is empty, no document will be added.)
         */
        propertyTypeDocs: {
          locaux: process.env.GOOGLE_DRIVE_FILE_PROPERTY_LOCAUX || '',
          habitation: process.env.GOOGLE_DRIVE_FILE_PROPERTY_HABITATION || '',
          villa: process.env.GOOGLE_DRIVE_FILE_PROPERTY_VILLA || '',
          commerce: process.env.GOOGLE_DRIVE_FILE_PROPERTY_COMMERCE || '',
          entreprise: process.env.GOOGLE_DRIVE_FILE_PROPERTY_ENTREPRISE || '',
        },

        /**
         * Document appended when "Intervention de la police" option is selected.
         * Set GOOGLE_DRIVE_FILE_POLICE to the Drive file ID once provided.
         */
        policeDoc: process.env.GOOGLE_DRIVE_FILE_POLICE || '',

        /**
         * Direct Drive file IDs for camera fiches techniques (provided by client 2026-05-29).
         * Keyed on the catalog product name (must match CATALOG_CAMERA_MATERIAL).
         * Preferred over name-based folder search to avoid silent mismatches.
         */
        cameraSheetIds: {
          'Bullet Mini': process.env.GOOGLE_DRIVE_FILE_BULLET_MINI || '1tZpgVA4_ZeJb6CcVMzslT7evHqZ_oLfJ',
          'Dôme Mini': process.env.GOOGLE_DRIVE_FILE_DOME_MINI || '1mpYHRAkb31VWqZIdqriE5VDdkQcqBxlo',
          'Dôme Antivandale': process.env.GOOGLE_DRIVE_FILE_DOME_ANTIVANDALE || '1211TvE9FlDEfBB5aO4ViO0zXRvSBB3C-',
          'Dôme Night': process.env.GOOGLE_DRIVE_FILE_DOME_NIGHT || '1WOojaD7vljXd38a3BkC53bfHCUbn7boy',
          'Bullet XL Varifocale': process.env.GOOGLE_DRIVE_FILE_BULLET_XL_VARIFOCALE || '1cG0zZBem_5bqWuN-i8hK3czIPxnCc2a3',
          'Dôme XL Varifocale': process.env.GOOGLE_DRIVE_FILE_DOME_XL_VARIFOCALE || '1HoKl7Ca51GF-09bRr3kyePVPqkjp_3Ib',
          'Bullet Zoom x23 PTZ': process.env.GOOGLE_DRIVE_FILE_BULLET_ZOOM_PTZ || '1j-vLOoHeWal9zrlvLBPumzjmbF0fxp6h',
          'Mini Solar 4G + P. Solaire': process.env.GOOGLE_DRIVE_FILE_MINI_SOLAR || '1u_o8wUtYFqJjRpVqFQGUgoysMMZK1Lp6',
        } as Record<string, string>,
      },
    },
  },
  
  // ==========================================================================
  // EMAIL CONFIGURATION
  // ==========================================================================
  email: {
    from: process.env.EMAIL_FROM || 'devis@dialarme.ch',
    recipients: {
      internal: process.env.EMAIL_INTERNAL || 'devis.dialarme@gmail.com',
    },
  },
  
  // ==========================================================================
  // COMMERCIALS INFORMATION
  // ==========================================================================
  // Populated live from the "Conseiller" tab of the Google Sheet
  // (GOOGLE_SHEETS_ID) via setCommercials() below — see
  // src/lib/services/google-sheets.service.ts and /api/commercials.
  // Starts empty on purpose: no static fallback, so a sheet-fetch failure
  // is visible (empty dropdown) instead of silently serving stale names.
  commercials: {},
  
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
 * Replace the in-memory commercials directory (e.g. with data fetched
 * live from the "Conseiller" Google Sheet via /api/commercials). Mutates
 * config.commercials in place so getAllCommercials()/getCommercialInfo()
 * pick up the new data without needing to be called again.
 */
export function setCommercials(data: Record<string, CommercialInfo>): void {
  for (const key of Object.keys(config.commercials)) {
    delete config.commercials[key];
  }
  Object.assign(config.commercials, data);
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
