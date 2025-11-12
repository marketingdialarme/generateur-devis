/**
 * useQuoteSender Hook
 * 
 * React hook for sending quotes (PDF + email + Drive upload).
 * Handles the complete workflow with progress feedback and error handling.
 * 
 * Replaces the sendToEmailAndDrive function from script.js
 */

import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';

interface SendQuoteParams {
  pdfBlob: Blob;
  filename: string;
  commercial: string;
  clientName: string;
  type: 'alarme' | 'video';
  centralType?: 'titane' | 'jablotron';
  products: string[];
  assemblyInfo?: {
    baseDossier: string;
    productsFound: number;
    totalPages: number;
  };
}

interface SendQuoteResult {
  success: boolean;
  message: string;
  driveLink?: string;
  driveId?: string;
  emailSent?: boolean;
  logged?: boolean;
  error?: string;
}

interface UseQuoteSenderReturn {
  sendQuote: (params: SendQuoteParams) => Promise<SendQuoteResult>;
  isSending: boolean;
  progress: string;
  error: string | null;
}

/**
 * Custom hook for sending quotes
 * 
 * Features:
 * - Converts PDF blob to base64
 * - Sends to API with retry logic
 * - Provides progress feedback
 * - Handles errors gracefully
 * - iOS/Safari compatible
 */
export function useQuoteSender(): UseQuoteSenderReturn {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Convert Blob to base64 string
   */
  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      
      reader.onerror = (error) => {
        reject(new Error('Failed to read PDF file: ' + error));
      };
      
      reader.readAsDataURL(blob);
    });
  }, []);
  
  /**
   * Detect device/browser for optimal sending strategy
   */
  const detectDevice = useCallback(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isDesktop = !isMobile && !isIOS;
    
    return { isIOS, isSafari, isMobile, isDesktop, userAgent };
  }, []);
  
  /**
   * Upload large PDF to Vercel Blob (bypasses 4.5 MB limit)
   */
  const uploadToBlob = useCallback(async (
    pdfBlob: Blob,
    filename: string
  ): Promise<string> => {
    console.log('📤 Uploading to Vercel Blob...');
    setProgress('Uploading PDF to cloud storage...');
    
    const formData = new FormData();
    formData.append('file', pdfBlob, filename);
    formData.append('filename', filename);
    
    const response = await fetch('/api/blob-upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Blob upload failed: HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.blobUrl) {
      throw new Error(result.error || 'Blob upload failed');
    }
    
    console.log('✅ Blob upload successful:', result.blobUrl);
    return result.blobUrl;
  }, []);
  
  /**
   * Send quote metadata after blob upload
   */
  const sendQuoteMetadata = useCallback(async (
    blobUrl: string,
    filename: string,
    commercial: string,
    clientName: string,
    type: 'alarme' | 'video',
    centralType: 'titane' | 'jablotron' | undefined,
    products: string[],
    assemblyInfo?: {
      baseDossier: string;
      productsFound: number;
      totalPages: number;
    }
  ): Promise<SendQuoteResult> => {
    setProgress('Processing and sending email...');
    
    const response = await fetch('/api/send-quote-lightweight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blobUrl,
        filename,
        commercial,
        clientName,
        type,
        centralType,
        produits: products,
        frontendAssemblyInfo: assemblyInfo
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: result.success,
      message: result.message,
      driveLink: result.driveLink,
      driveId: result.driveFileId,
      emailSent: result.emailSent,
      logged: result.logged
    };
  }, []);
  
  /**
   * Send quote via API with retry logic (legacy method for small files)
   */
  const sendViaAPI = useCallback(async (
    payload: any,
    maxRetries: number = 2,
    timeoutMs: number = 120000
  ): Promise<SendQuoteResult> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
        setProgress(`Sending quote (attempt ${attempt}/${maxRetries})...`);
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
          const response = await fetch('/api/send-quote', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }
          
          const result: SendQuoteResult = await response.json();
          
          if (result.success) {
            console.log('✅ Quote sent successfully');
            return result;
          } else {
            throw new Error(result.error || 'Unknown error');
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeoutMs / 1000}s`);
          }
          
          throw fetchError;
        }
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(
            `Failed to send quote after ${maxRetries} attempts: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        setProgress(`Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Failed to send quote');
  }, []);
  
  /**
   * Main send quote function
   */
  const sendQuote = useCallback(async (params: SendQuoteParams): Promise<SendQuoteResult> => {
    const {
      pdfBlob,
      filename,
      commercial,
      clientName,
      type,
      centralType,
      products,
      assemblyInfo
    } = params;
    
    setIsSending(true);
    setError(null);
    setProgress('Preparing PDF...');
    
    try {
      // Detect device
      const device = detectDevice();
      console.log('📱 Device detection:', device);
      
      // Check PDF size
      const pdfSizeMB = pdfBlob.size / 1024 / 1024;
      console.log(`📄 PDF size: ${pdfSizeMB.toFixed(2)} MB (${pdfBlob.size} bytes)`);
      
      // Use direct upload for files > 3MB to avoid body size limits
      // (3MB blob → ~4MB base64 → safe margin below Vercel's 4.5MB JSON limit)
      const useDirectUpload = pdfSizeMB > 3;
      
      if (useDirectUpload) {
        console.log('🚀 Using direct upload method (file > 3MB)');
        
        // Phase 1: Upload PDF to Vercel Blob (bypasses 4.5 MB limit)
        const blobUrl = await uploadToBlob(pdfBlob, filename);
        
        // Phase 2: Process (upload to Drive, send email, log to DB)
        const result = await sendQuoteMetadata(
          blobUrl,
          filename,
          commercial,
          clientName,
          type,
          centralType,
          products,
          assemblyInfo
        );
        
        setProgress('Quote sent successfully!');
        console.log('✅ Complete (blob upload):', result);
        
        return result;
      } else {
        console.log('📤 Using standard upload method (file < 3MB)');
        
        // Convert PDF to base64
        setProgress('Converting PDF...');
        const base64 = await blobToBase64(pdfBlob);
        console.log(`📄 Base64 size: ${base64.length} bytes`);
        
        // Prepare payload
        const payload = {
          pdfBase64: base64,
          filename,
          commercial,
          clientName,
          type,
          centralType,
          produits: products,
          addCommercialOverlay: false,
          mergedByFrontend: true,
          frontendAssemblyInfo: assemblyInfo,
          timestamp: new Date().toISOString()
        };
        
        console.log('📦 Payload:', {
          filename,
          commercial,
          clientName,
          type,
          centralType,
          productsCount: products.length,
          pdfSize: base64.length
        });
        
        if (assemblyInfo) {
          console.log('📋 Assembly info:', assemblyInfo);
        }
        
        // Determine timeout based on quote type
        const timeoutMs = type === 'video' ? 240000 : 120000;
        console.log(`⏱️ Timeout: ${timeoutMs / 1000}s (${type})`);
        
        // Send via API
        setProgress('Uploading to Drive and sending email...');
        const result = await sendViaAPI(payload, 2, timeoutMs);
        
        setProgress('Quote sent successfully!');
        console.log('✅ Complete:', result);
        
        return result;
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Send quote failed:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        message: 'Failed to send quote',
        error: errorMessage
      };
    } finally {
      setIsSending(false);
      // Clear progress after 3 seconds
      setTimeout(() => setProgress(''), 3000);
    }
  }, [blobToBase64, detectDevice, uploadToBlob, sendQuoteMetadata, sendViaAPI]);
  
  return {
    sendQuote,
    isSending,
    progress,
    error
  };
}

