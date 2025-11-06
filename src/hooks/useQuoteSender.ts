/**
 * useQuoteSender Hook
 * 
 * React hook for sending quotes (PDF + email + Drive upload).
 * Handles the complete workflow with progress feedback and error handling.
 * 
 * Replaces the sendToEmailAndDrive function from script.js
 */

import { useState, useCallback } from 'react';

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
   * Send quote via API with retry logic
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
      
      // Convert PDF to base64
      setProgress('Converting PDF...');
      const base64 = await blobToBase64(pdfBlob);
      console.log(`📄 PDF size: ${base64.length} bytes`);
      
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
      // Video quotes are larger (product sheets + accessories) - need more time
      const timeoutMs = type === 'video' ? 240000 : 120000; // 240s for video, 120s for alarm
      console.log(`⏱️ Timeout: ${timeoutMs / 1000}s (${type})`);
      
      // Send via API
      setProgress('Uploading to Drive and sending email...');
      const result = await sendViaAPI(payload, 2, timeoutMs);
      
      setProgress('Quote sent successfully!');
      console.log('✅ Complete:', result);
      
      return result;
      
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
  }, [blobToBase64, detectDevice, sendViaAPI]);
  
  return {
    sendQuote,
    isSending,
    progress,
    error
  };
}

