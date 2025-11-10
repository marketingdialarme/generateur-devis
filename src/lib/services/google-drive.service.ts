/**
 * ============================================================================
 * GOOGLE DRIVE SERVICE
 * ============================================================================
 * 
 * Replaces Google Apps Script Drive functionality with Google Drive REST API
 * Supports both OAuth 2.0 (for personal Gmail) and Service Account authentication
 * ============================================================================
 */

import { google } from 'googleapis';
import { CONFIG } from '../config';
import { Readable } from 'stream'; 

// Initialize Google Drive client with OAuth or Service Account
function getDriveClient() {
  // Try OAuth first (for personal Gmail accounts)
  if (process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET && 
      process.env.GOOGLE_REFRESH_TOKEN) {
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000' // Redirect URI (not used for refresh token flow)
    );
    
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    
    return google.drive({ version: 'v3', auth: oauth2Client });
  }
  
  // Fallback to Service Account (for Google Workspace Shared Drives)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    
    return google.drive({ version: 'v3', auth });
  }
  
  throw new Error('No Google authentication configured. Set either OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) or Service Account (GOOGLE_SERVICE_ACCOUNT_JSON)');
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
      body: Readable.from(fileBuffer),  // Convert Buffer to Stream
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
    console.log(`\n🔍 [FOLDER] Starting folder lookup for: "${commercialName}"`);
    const drive = getDriveClient();
    const parentFolderId = CONFIG.google.drive.folders.devis;
    
    console.log(`📂 [FOLDER] Parent folder ID: ${parentFolderId}`);
    
    if (!parentFolderId) {
      throw new Error('DEVIS folder ID not configured');
    }
    
    // Escape single quotes in commercial name for Drive API query
    const escapedName = commercialName.replace(/'/g, "\\'");
    console.log(`🔤 [FOLDER] Escaped name: "${escapedName}"`);
    
    // Search for existing folder
    const query = `name='${escapedName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    console.log(`🔎 [FOLDER] Search query: ${query}`);
    
    const searchResponse = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    
    console.log(`📊 [FOLDER] Search results: ${searchResponse.data.files?.length || 0} folders found`);
    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      searchResponse.data.files.forEach((file, idx) => {
        console.log(`  ${idx + 1}. "${file.name}" (ID: ${file.id})`);
      });
    }
    
    // If folder exists, return its ID
    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      const folderId = searchResponse.data.files[0].id;
      if (!folderId) {
        throw new Error('Folder ID is undefined');
      }
      console.log(`✅ [FOLDER] Using existing folder: ${folderId}\n`);
      return folderId;
    }
    
    // Create new folder
    console.log(`📁 [FOLDER] No existing folder found. Creating new folder...`);
    console.log(`📝 [FOLDER] Folder name: "${commercialName}"`);
    console.log(`📝 [FOLDER] Parent ID: ${parentFolderId}`);
    
    const createResponse = await drive.files.create({
      requestBody: {
        name: commercialName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id, name',
    });
    
    const newFolderId = createResponse.data.id;
    const newFolderName = createResponse.data.name;
    
    if (!newFolderId) {
      throw new Error('Failed to create folder - no ID returned');
    }
    
    console.log(`✅ [FOLDER] Successfully created folder: "${newFolderName}" (ID: ${newFolderId})\n`);
    return newFolderId;
  } catch (error) {
    console.error(`\n❌ [FOLDER] Error for "${commercialName}":`, error);
    if (error instanceof Error) {
      console.error(`❌ [FOLDER] Error message: ${error.message}`);
      console.error(`❌ [FOLDER] Error stack:`, error.stack);
    }
    throw new Error(`Folder operation failed for "${commercialName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const techSheetsFolderId = CONFIG.google.drive.folders.techSheets;
    
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
    const techSheetsFolderId = CONFIG.google.drive.folders.techSheets;
    
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

/**
 * Google Drive Service Class
 * Provides a clean interface for all Drive operations
 */
class GoogleDriveService {
  /**
   * Upload a PDF to Google Drive
   */
  async uploadPDF(
    fileBuffer: Buffer,
    fileName: string,
    folderId: string
  ): Promise<{
    id: string;
    name: string;
    webViewLink: string;
    webContentLink: string;
  }> {
    return uploadFileToDrive(fileBuffer, fileName, 'application/pdf', folderId);
  }
  
  /**
   * Download a file from Google Drive by ID
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    return downloadFileFromDrive(fileId);
  }
  
  /**
   * Find and download a file by name in a folder
   */
  async findAndDownloadFile(folderId: string, fileName: string): Promise<Buffer | null> {
    try {
      const drive = getDriveClient();
      
      // Normalize search term
      const normalizedSearch = fileName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      // Search for files containing the file name
      const searchResponse = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/pdf'`,
        fields: 'files(id, name)',
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
          return await this.downloadFile(file.id);
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding file ${fileName}:`, error);
      return null;
    }
  }
  
  /**
   * Get or create a commercial folder
   */
  async getOrCreateCommercialFolder(commercialName: string): Promise<string> {
    return getOrCreateCommercialFolder(commercialName);
  }
  
  /**
   * Find product sheet
   */
  async findProductSheet(productName: string): Promise<{
    fileId: string;
    fileName: string;
    buffer: Buffer;
  } | null> {
    return findProductSheet(productName);
  }
  
  /**
   * Find accessories PDF
   */
  async findAccessoriesPdf(): Promise<{
    fileId: string;
    fileName: string;
    buffer: Buffer;
  } | null> {
    return findAccessoriesPdf();
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();

