/**
 * usePdfAssembly Hook
 * 
 * React hook for PDF assembly functionality.
 * Handles assembling the generated quote with base documents and product sheets.
 * 
 * Replaces the assemblePdfWithLibrary functionality from script.js
 */

import { useState, useCallback } from 'react';
import { assemblePdf, CommercialInfo, AssemblyResult } from '@/lib/pdf-assembly';
import { ProductFetchRef } from '@/lib/product-collector';

interface AssemblePdfParams {
  pdfBlob: Blob;
  quoteType: 'alarme' | 'video' | 'fog' | 'visiophone';
  centralType: string | null;
  products: ProductFetchRef[];
  commercial: CommercialInfo;
  propertyType: string;
  addPoliceDoc?: boolean;
  /** Alarme only: the specific kit's "dossier complet" Drive file ID
   * (Kit_Base_Alarme's "ID Drive fiche technique" column) -- preferred
   * over the old 2-value Titane/Jablotron config when provided. */
  baseDocumentFileId?: string;
}

interface UsePdfAssemblyReturn {
  assemblePdf: (params: AssemblePdfParams) => Promise<AssemblyResult>;
  isAssembling: boolean;
  progress: string;
  error: string | null;
}

/**
 * Custom hook for PDF assembly
 * 
 * Features:
 * - Assembles generated quote with base documents
 * - Adds product sheets (for video quotes)
 * - Adds commercial overlay
 * - Provides progress feedback
 * - Handles errors gracefully
 */
export function usePdfAssembly(): UsePdfAssemblyReturn {
  const [isAssembling, setIsAssembling] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Main assembly function
   */
  const assemble = useCallback(async (params: AssemblePdfParams): Promise<AssemblyResult> => {
    const {
      pdfBlob,
      quoteType,
      centralType,
      products,
      commercial,
      propertyType,
      addPoliceDoc,
      baseDocumentFileId
    } = params;
    
    setIsAssembling(true);
    setError(null);
    setProgress('Mise en page de votre devis en cours...');
    
    try {
      console.log('🔧 Starting PDF assembly...');
      console.log('📋 Assembly parameters:', {
        quoteType,
        centralType,
        productsCount: products.length
      });
      
      setProgress('Récupération du document de base...');
      
      // Call the assembly function
      const result = await assemblePdf(
        pdfBlob,
        quoteType,
        centralType,
        products,
        commercial,
        propertyType,
        addPoliceDoc,
        baseDocumentFileId
      );
      
      setProgress('Mise en page terminée !');
      console.log('✅ PDF assembly completed:', result.info);
      
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ PDF assembly failed:', errorMessage);
      setError(errorMessage);
      
      // Return original PDF as fallback
      return {
        blob: pdfBlob,
        info: {
          baseDossier: 'Original (Assembly Failed)',
          productsFound: 0,
          totalPages: 1,
          overlayAdded: false
        }
      };
    } finally {
      setIsAssembling(false);
      // Clear progress after 3 seconds
      setTimeout(() => setProgress(''), 3000);
    }
  }, []);
  
  return {
    assemblePdf: assemble,
    isAssembling,
    progress,
    error
  };
}

