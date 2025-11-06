/**
 * ============================================================================
 * GOOGLE DRIVE SERVICE
 * ============================================================================
 * 
 * Replaces Google Apps Script Drive functionality with Google Drive REST API
 * Uses service account authentication for serverless operation
 * ============================================================================
 */

import { google } from 'googleapis';
import { CONFIG } from '../config';

// Initialize Google Drive client with service account
function getDriveClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');
  }
  
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  
  return google.drive({ version: 'v3', auth });
}

/**
 * Upload a file to Google Drive
 */
export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId: string
): Promise<{
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}> {
  try {
    const drive = getDriveClient();
    
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    
    const media = {
      mimeType,
      body: Buffer.from(fileBuffer),
    };
    
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });
    
    const file = response.data;
    
    if (!file.id || !file.name) {
      throw new Error('Failed to create file in Drive');
    }
    
    return {
      id: file.id,
      name: file.name,
      webViewLink: file.webViewLink || '',
      webContentLink: file.webContentLink || '',
    };
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw new Error(`Drive upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get or create a folder for a commercial
 */
export async function getOrCreateCommercialFolder(commercialName: string): Promise<string> {
  try {
    const drive = getDriveClient();
    const parentFolderId = CONFIG.folders.devis;
    
    if (!parentFolderId) {
      throw new Error('DEVIS folder ID not configured');
    }
    
    // Search for existing folder
    const searchResponse = await drive.files.list({
      q: `name='${commercialName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    
    // If folder exists, return its ID
    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      const folderId = searchResponse.data.files[0].id;
      if (!folderId) {
        throw new Error('Folder ID is undefined');
      }
      return folderId;
    }
    
    // Create new folder
    const createResponse = await drive.files.create({
      requestBody: {
        name: commercialName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id',
    });
    
    const newFolderId = createResponse.data.id;
    if (!newFolderId) {
      throw new Error('Failed to create folder');
    }
    
    return newFolderId;
  } catch (error) {
    console.error('Error getting/creating folder:', error);
    throw new Error(`Folder operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download a file from Google Drive by ID
 */
export async function downloadFileFromDrive(fileId: string): Promise<Buffer> {
  try {
    const drive = getDriveClient();
    
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      { responseType: 'arraybuffer' }
    );
    
    return Buffer.from(response.data as ArrayBuffer);
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error);
    throw new Error(`Drive download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for product sheets in the technical sheets folder
 */
export async function findProductSheet(productName: string): Promise<{
  fileId: string;
  fileName: string;
  buffer: Buffer;
} | null> {
  try {
    const drive = getDriveClient();
    const techSheetsFolderId = CONFIG.folders.techSheets;
    
    if (!techSheetsFolderId) {
      throw new Error('TECH_SHEETS folder ID not configured');
    }
    
    // Normalize search term (remove accents, lowercase)
    const normalizedSearch = productName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    // Search for files containing the product name
    const searchResponse = await drive.files.list({
      q: `'${techSheetsFolderId}' in parents and trashed=false and mimeType='application/pdf'`,
      fields: 'files(id, name, size)',
      spaces: 'drive',
    });
    
    const files = searchResponse.data.files || [];
    
    // Find best match
    for (const file of files) {
      if (!file.name || !file.id) continue;
      
      const normalizedFileName = file.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      if (
        normalizedFileName.includes(normalizedSearch) ||
        normalizedSearch.includes(normalizedFileName.replace('.pdf', '').replace(' - compressed', ''))
      ) {
        // Download the file
        const buffer = await downloadFileFromDrive(file.id);
        
        return {
          fileId: file.id,
          fileName: file.name,
          buffer,
        };
      }
    }
    
    // If no exact match, try partial match with keywords
    const searchWords = normalizedSearch.split(/[\s\-_]+/).filter(w => w.length > 2);
    
    for (const file of files) {
      if (!file.name || !file.id) continue;
      
      const normalizedFileName = file.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      let matchCount = 0;
      for (const word of searchWords) {
        if (normalizedFileName.includes(word)) {
          matchCount++;
        }
      }
      
      if (matchCount >= Math.min(2, searchWords.length)) {
        const buffer = await downloadFileFromDrive(file.id);
        
        return {
          fileId: file.id,
          fileName: file.name,
          buffer,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding product sheet for ${productName}:`, error);
    return null;
  }
}

/**
 * Find accessories PDF (ONDULEURS - COFFRET - SWITCH)
 */
export async function findAccessoriesPdf(): Promise<{
  fileId: string;
  fileName: string;
  buffer: Buffer;
} | null> {
  try {
    const drive = getDriveClient();
    const techSheetsFolderId = CONFIG.folders.techSheets;
    
    if (!techSheetsFolderId) {
      throw new Error('TECH_SHEETS folder ID not configured');
    }
    
    // Search for accessories file
    const searchResponse = await drive.files.list({
      q: `'${techSheetsFolderId}' in parents and trashed=false and mimeType='application/pdf' and (name contains 'ONDULEURS' or name contains 'COFFRET' or name contains 'SWITCH')`,
      fields: 'files(id, name)',
      spaces: 'drive',
      orderBy: 'name',
    });
    
    const files = searchResponse.data.files || [];
    
    // Find file with at least 2 keywords
    const keywords = ['onduleur', 'coffret', 'switch'];
    
    for (const file of files) {
      if (!file.name || !file.id) continue;
      
      const normalizedName = file.name.toLowerCase();
      let keywordMatches = 0;
      
      for (const keyword of keywords) {
        if (normalizedName.includes(keyword)) {
          keywordMatches++;
        }
      }
      
      if (keywordMatches >= 2) {
        const buffer = await downloadFileFromDrive(file.id);
        
        return {
          fileId: file.id,
          fileName: file.name,
          buffer,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding accessories PDF:', error);
    return null;
  }
}

