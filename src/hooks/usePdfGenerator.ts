/**
 * ============================================================================
 * USE PDF GENERATOR HOOK
 * ============================================================================
 * 
 * React hook for generating PDFs with proper loading states
 */

import { useState, useCallback } from 'react';
import type { jsPDF } from 'jspdf';
import {
  generateQuotePDF,
  generateQuoteNumber,
  generateFilename,
  type PDFGenerationOptions
} from '@/lib/pdf-generator';

export interface UsePdfGeneratorResult {
  generatePDF: (options: PDFGenerationOptions) => Promise<{
    blob: Blob;
    filename: string;
    quoteNumber: string;
  }>;
  isGenerating: boolean;
  error: string | null;
}

export function usePdfGenerator(): UsePdfGeneratorResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = useCallback(async (options: PDFGenerationOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Check if jsPDF is available
      if (typeof window === 'undefined' || !window.jspdf || !window.jspdf.jsPDF) {
        throw new Error('jsPDF library not loaded');
      }

      // Validate required fields
      if (!options.clientName || !options.commercial) {
        throw new Error('Client name and commercial are required');
      }

      // Generate PDF
      const blob = await generateQuotePDF(options, window.jspdf.jsPDF);
      const quoteNumber = generateQuoteNumber();
      const filename = generateFilename(quoteNumber, options.clientName);

      setIsGenerating(false);

      return {
        blob,
        filename,
        quoteNumber
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsGenerating(false);
      throw err;
    }
  }, []);

  return {
    generatePDF,
    isGenerating,
    error
  };
}

// Type augmentation for window.jspdf
declare global {
  interface Window {
    jspdf?: {
      jsPDF: typeof jsPDF;
    };
  }
}

