/**
 * PDF Assembly Library
 * 
 * Handles the complete PDF assembly workflow using pdf-lib:
 * 1. Fetches base documents from Google Drive
 * 2. Merges generated quote with base documents
 * 3. Adds product sheets (for video quotes)
 * 4. Adds commercial overlay
 * 5. Returns final assembled PDF
 * 
 * This replaces the assemblePdfWithLibrary functionality from script.js
 */

import { PDFDocument, StandardFonts, rgb, PDFName } from 'pdf-lib';
import { config } from './config';

// Commercial info interface
export interface CommercialInfo {
  name: string;
  phone: string;
  email: string;
}

// Assembly result interface
export interface AssemblyResult {
  blob: Blob;
  info: {
    baseDossier: string;
    productsFound: number;
    totalPages: number;
    overlayAdded: boolean;
  };
}

// Document fetch result
interface FetchedDocuments {
  base: ArrayBuffer;
  products?: Array<{ name: string; data: ArrayBuffer; fileId: string }>;
}

/**
 * Main PDF assembly function
 * 
 * @param pdfBlob - Generated quote PDF blob
 * @param quoteType - 'alarme' or 'video'
 * @param centralType - 'titane' or 'jablotron' (for alarm quotes)
 * @param products - Array of product names (for video quotes)
 * @param commercial - Commercial info
 * @param propertyType - Type of property (locaux, habitation, villa, commerce, entreprise)
 * @returns Assembled PDF blob and metadata
 */
export async function assemblePdf(
  pdfBlob: Blob,
  quoteType: 'alarme' | 'video',
  centralType: 'titane' | 'jablotron' | null,
  products: string[],
  commercial: CommercialInfo,
  propertyType: 'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise' = 'locaux'
): Promise<AssemblyResult> {
  console.log('🔧 Starting PDF assembly with pdf-lib...');
  console.log('📋 Assembly parameters:', {
    quoteType,
    centralType,
    productsCount: products.length,
    products
  });
  
  try {
    if (quoteType === 'alarme') {
      return await assembleAlarmPdf(pdfBlob, centralType || 'titane', commercial, propertyType);
    } else if (quoteType === 'video') {
      return await assembleVideoPdf(pdfBlob, products, commercial, propertyType);
    } else {
      console.log('⚠️ No assembly needed for this quote type, returning original PDF');
      return {
        blob: pdfBlob,
        info: {
          baseDossier: 'Original',
          productsFound: 0,
          totalPages: 1,
          overlayAdded: false
        }
      };
    }
  } catch (error) {
    console.error('❌ Error in PDF assembly:', error);
    // Return original PDF as fallback
    console.log('⚠️ Falling back to original PDF');
    return {
      blob: pdfBlob,
      info: {
        baseDossier: 'Original (Assembly Failed)',
        productsFound: 0,
        totalPages: 1,
        overlayAdded: false
      }
    };
  }
}

async function addPropertyTypeDocumentIfConfigured(
  pdfDoc: PDFDocument,
  propertyType: 'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise'
): Promise<void> {
  try {
    const fileId = config.google.drive.baseDocuments.propertyTypeDocs?.[propertyType] || '';
    if (!fileId) {
      console.log('ℹ️ No propertyType document configured for:', propertyType);
      return;
    }

    console.log('📥 Fetching propertyType document for:', propertyType, 'fileId:', fileId);
    const arrayBuffer = await fetchDocumentFromDrive(fileId);
    const propPdf = await PDFDocument.load(arrayBuffer);
    const propPages = await pdfDoc.copyPages(propPdf, propPdf.getPageIndices());
    propPages.forEach((p) => pdfDoc.addPage(p));
    console.log('✅ PropertyType document appended:', propertyType, `(${propPages.length} page(s))`);
  } catch (error) {
    console.warn('⚠️ Could not append propertyType document (non-critical):', error);
  }
}

/**
 * Assemble alarm PDF
 * 
 * Structure:
 * - Pages 1-5: Base document
 * - Page 6: Generated quote (inserted)
 * - Pages 7+: Remaining base document pages
 * - Commercial overlay on page 2
 */
async function assembleAlarmPdf(
  pdfBlob: Blob,
  centralType: 'titane' | 'jablotron',
  commercial: CommercialInfo,
  propertyType: 'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise'
): Promise<AssemblyResult> {
  console.log('🚨 Assembling alarm PDF with central type:', centralType);
  
  try {
    // 1. Fetch base document
    console.log('📥 Fetching base document...');
    const baseDocumentId = centralType === 'jablotron'
      ? config.google.drive.baseDocuments.alarmJablotron
      : config.google.drive.baseDocuments.alarmTitane;
    
    const baseArrayBuffer = await fetchDocumentFromDrive(baseDocumentId);
    console.log('✅ Base document fetched:', baseArrayBuffer.byteLength, 'bytes');
    
    // 2. Load base document
    const basePdf = await PDFDocument.load(baseArrayBuffer);
    const basePageCount = basePdf.getPageCount();
    console.log('✅ Base document loaded:', basePageCount, 'pages');
    
    // 3. Load generated quote
    const quotePdf = await PDFDocument.load(await pdfBlob.arrayBuffer());
    const quotePageCount = quotePdf.getPageCount();
    console.log('✅ Generated quote loaded:', quotePageCount, 'page(s)');
    
    // 4. Create new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // 5. Add pages 1-5 from base document
    for (let i = 0; i < 5 && i < basePageCount; i++) {
      const [copiedPage] = await pdfDoc.copyPages(basePdf, [i]);
      pdfDoc.addPage(copiedPage);
    }
    console.log('✅ Base document pages 1-5 added');
    
    // 6. INSERT generated quote as NEW page 6
    const [quotePage] = await pdfDoc.copyPages(quotePdf, [0]);
    pdfDoc.addPage(quotePage);
    console.log('✅ Generated quote inserted as page 6');

    // 6b. Append property-type specific document (if configured)
    await addPropertyTypeDocumentIfConfigured(pdfDoc, propertyType);
    
    // 7. Add remaining pages from base document
    if (basePageCount > 5) {
      for (let i = 5; i < basePageCount; i++) {
        const [copiedPage] = await pdfDoc.copyPages(basePdf, [i]);
        pdfDoc.addPage(copiedPage);
      }
      console.log(`✅ Base document pages 6-${basePageCount} added (now pages 7-${basePageCount + 1})`);
    }
    
    console.log('📊 Total pages in final document:', pdfDoc.getPageCount());
    console.log(`   - Base document pages: 1-5, 7-${basePageCount + 1}`);
    console.log('   - Generated quote: page 6');
    
    // 8. Add commercial overlay to page 2 (index 1)
    await addCommercialOverlay(pdfDoc, commercial, 1);
    
    // 9. Add property type text on page 2 (index 1) per client feedback
    await addPropertyTypeOverlay(pdfDoc, propertyType, 1);
    
    // 9. Generate final PDF with compression
    const mergedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false
    });
    const mergedPdfBlob = new Blob([Buffer.from(mergedPdfBytes)], { type: 'application/pdf' });
    
    const totalPages = pdfDoc.getPageCount();
    const baseDossierName = centralType === 'jablotron'
      ? 'Devis_ALARME_JABLOTRON.pdf'
      : 'Devis_ALARME_TITANE.pdf';
    
    console.log('✅ Alarm PDF assembly completed');
    console.log('📄 Final PDF size:', mergedPdfBlob.size, 'bytes');
    console.log('📄 Final page count:', totalPages, 'pages');
    
    return {
      blob: mergedPdfBlob,
      info: {
        baseDossier: baseDossierName,
        productsFound: 0, // Alarm doesn't include product sheets
        totalPages,
        overlayAdded: true
      }
    };
  } catch (error) {
    console.error('❌ Error assembling alarm PDF:', error);
    throw error;
  }
}

/**
 * Assemble video PDF
 * 
 * Structure:
 * - Pages 1-5: Base document
 * - Page 6: Generated quote
 * - Pages 7+: Product sheets
 * - Last pages: Accessories sheet
 * - Remaining base document pages
 * - Commercial overlay on page 2
 */
async function assembleVideoPdf(
  pdfBlob: Blob,
  products: string[],
  commercial: CommercialInfo,
  propertyType: 'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise'
): Promise<AssemblyResult> {
  console.log('📹 Assembling video PDF with', products.length, 'products');
  
  try {
    // 1. Fetch all documents
    console.log('📥 Fetching documents...');
    const documents = await fetchVideoDocuments(products);
    
    // 2. Load base document
    const basePdf = await PDFDocument.load(documents.base);
    const basePageCount = basePdf.getPageCount();
    console.log('✅ Base document loaded:', basePageCount, 'pages');
    
    // 3. Create new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // 4. Add pages 1-5 from base document
    for (let i = 0; i < 5 && i < basePageCount; i++) {
      const [copiedPage] = await pdfDoc.copyPages(basePdf, [i]);
      pdfDoc.addPage(copiedPage);
    }
    console.log('✅ Base document pages 1-5 added');
    
    // 5. Add generated quote as page 6
    const quotePdf = await PDFDocument.load(await pdfBlob.arrayBuffer());
    const quotePages = await pdfDoc.copyPages(quotePdf, quotePdf.getPageIndices());
    quotePages.forEach(page => pdfDoc.addPage(page));
    console.log('✅ Generated quote inserted as page 6');

    // 5b. Append property-type specific document (if configured)
    await addPropertyTypeDocumentIfConfigured(pdfDoc, propertyType);
    
    // 6. Add product sheets (deduplicated by sheet name to avoid duplicate sheets)
    // Now that product-collector applies mapping, each product name in the array
    // should already be a unique sheet name
    let productSheetsAdded = 0;
    const addedSheetNames = new Set<string>();
    
    if (documents.products) {
      for (const product of documents.products) {
        if (product.data && product.name) {
          try {
            // Skip if we've already added this sheet (by name)
            // This prevents duplicates when multiple products map to same sheet
            if (addedSheetNames.has(product.name)) {
              console.log('⏭️ Skipping duplicate sheet:', product.name, '(already added)');
              continue;
            }
            
            const productPdf = await PDFDocument.load(product.data);
            const productPages = await pdfDoc.copyPages(productPdf, productPdf.getPageIndices());
            productPages.forEach(page => pdfDoc.addPage(page));
            console.log('✅ Product sheet added:', product.name);
            productSheetsAdded++;
            addedSheetNames.add(product.name);
          } catch (error) {
            console.warn('⚠️ Could not add product sheet for:', product.name, error);
          }
        } else {
          console.warn('⚠️ Product sheet not found:', product.name);
        }
      }
    }
    console.log('📊 Product sheets added:', productSheetsAdded, '/', products.length);
    
    // 7. Accessories sheet is NO LONGER ADDED automatically
    // The accessories sheet mapping now handles this:
    // - Switch POE, Coffret NVR, Onduleur map to "ONDULEUR - Coffret NVR 4P - Coffret NVR 8P - SWITCH POE"
    // - That sheet is fetched as a regular product sheet if those products are present
    // - NVR products do NOT trigger accessories sheet (they have individual sheets)
    console.log('ℹ️ Accessories sheet handling now via product mapping (not automatic addition)');
    
    // Remove old accessories logic completely - it's handled by product mapping now
    
    // 8. Add remaining pages from base document
    if (basePageCount > 5) {
      for (let i = 5; i < basePageCount; i++) {
        const [copiedPage] = await pdfDoc.copyPages(basePdf, [i]);
        pdfDoc.addPage(copiedPage);
      }
      console.log(`✅ Base document pages 6-${basePageCount} added`);
    }
    
    // 9. Add commercial overlay to page 2 (index 1)
    await addCommercialOverlay(pdfDoc, commercial, 1);
    
    // 10. Add property type text on page 2 (index 1) per client feedback
    await addPropertyTypeOverlay(pdfDoc, propertyType, 1);
    
    console.log('📊 Total pages in final document:', pdfDoc.getPageCount());
    
    // 10. Generate final PDF with compression
    const mergedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false
    });
    const mergedPdfBlob = new Blob([Buffer.from(mergedPdfBytes)], { type: 'application/pdf' });
    
    const totalPages = pdfDoc.getPageCount();
    
    console.log('✅ Video PDF assembly completed');
    console.log('📄 Final PDF size:', mergedPdfBlob.size, 'bytes');
    console.log('📄 Final page count:', totalPages, 'pages');
    
    return {
      blob: mergedPdfBlob,
      info: {
        baseDossier: 'Devis_VIDÉO.pdf',
        productsFound: productSheetsAdded,
        totalPages,
        overlayAdded: true
      }
    };
  } catch (error) {
    console.error('❌ Error assembling video PDF:', error);
    throw error;
  }
}

/**
 * Add commercial overlay to a specific page
 * 
 * Adds:
 * - Date on "Le" line
 * - Commercial info in yellow box (bottom-right)
 */
async function addCommercialOverlay(
  pdfDoc: PDFDocument,
  commercial: CommercialInfo,
  pageIndex: number
): Promise<void> {
  console.log('📝 Adding commercial overlay to page', pageIndex + 1);
  
  try {
    // Get the target page
    const pages = pdfDoc.getPages();
    if (pageIndex >= pages.length) {
      console.warn('⚠️ Page index out of range:', pageIndex);
      return;
    }
    
    const page = pages[pageIndex];
    const { width, height } = page.getSize();
    
    // Remove annotations/form fields that block text (Titane has white rectangles on page 2)
    try {
      const annots = page.node.get(PDFName.of('Annots'));
      if (annots) {
        page.node.delete(PDFName.of('Annots'));
        console.log('✅ Removed page annotations (fixes Titane white rectangle issue)');
      } else {
        console.log('ℹ️ No annotations to remove (Jablotron is clean)');
      }
    } catch (annotError) {
      console.warn('⚠️ Could not remove annotations:', annotError);
      // Non-critical, continue anyway
    }
    
    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // 1. ADD DATE (On same line as "Carouge. le")
    const currentDate = new Date().toLocaleDateString('fr-CH');
    const dateText = currentDate;
    const dateFontSize = 11;
    const dateX = width - 139; // Moved left 6px more
    const dateY = height - 155; // Aligned with "Carouge. le"
    
    page.drawText(dateText, {
      x: dateX,
      y: dateY,
      size: dateFontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
    
    console.log('✅ Date added on "Le" line:', dateText);
    
    // 2. ADD TEXT INSIDE EXISTING YELLOW BOX (Bottom-right)
    const boxStartX = width - 185; // Moved more to the right
    const boxStartY = 110; // Moved up 30px more
    
    const textPadding = 8;
    const lineHeight = 15;
    let textY = boxStartY + 58; // Start from top of the yellow box area
    
    // Commercial name (bold)
    page.drawText(commercial.name, {
      x: boxStartX + textPadding,
      y: textY,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    
    textY -= lineHeight;
    
    // Phone
    page.drawText(`Tel: ${commercial.phone}`, {
      x: boxStartX + textPadding,
      y: textY,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
    
    textY -= lineHeight;
    
    // Email
    page.drawText(commercial.email, {
      x: boxStartX + textPadding,
      y: textY,
      size: 8,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
    
    console.log('✅ Commercial info added inside existing yellow box on page', pageIndex + 1);
    console.log('   - Name:', commercial.name);
    console.log('   - Phone:', commercial.phone);
    console.log('   - Email:', commercial.email);
  } catch (error) {
    console.error('❌ Error adding commercial overlay:', error);
    // Non-critical, don't throw
  }
}

/**
 * Add property type text to intro paragraph
 * 
 * Adds text after "votre devis vidéo concernant la sécurité" on first page:
 * - de vos locaux
 * - de votre habitation
 * - de votre villa
 * - de votre commerce
 * - de votre entreprise
 */
async function addPropertyTypeOverlay(
  pdfDoc: PDFDocument,
  propertyType: 'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise',
  pageIndex: number
): Promise<void> {
  console.log('📝 Adding property type overlay to page', pageIndex + 1, ':', propertyType);
  
  try {
    const pages = pdfDoc.getPages();
    if (pageIndex >= pages.length) {
      console.warn('⚠️ Page index out of range:', pageIndex);
      return;
    }
    
    const page = pages[pageIndex];
    const { width, height } = page.getSize();
    
    // Load font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Map property types to French text
    const propertyTextMap = {
      locaux: 'de vos locaux',
      habitation: 'de votre habitation',
      villa: 'de votre villa',
      commerce: 'de votre commerce',
      entreprise: 'de votre entreprise'
    };
    
    const propertyText = propertyTextMap[propertyType];
    
    // Position the text after "concernant la sécurité" on page 1
    // The intro paragraph is typically around y=620-640 from bottom
    // Adjust these coordinates based on your actual PDF layout
    const textX = 285; // Adjust X position to align after "sécurité"
    const textY = height - 220; // Adjust Y from top (595 height - 220 = 375 from bottom)
    const fontSize = 11;
    
    page.drawText(propertyText, {
      x: textX,
      y: textY,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
    
    console.log('✅ Property type added:', propertyText, `at (${textX}, ${textY})`);
  } catch (error) {
    console.error('❌ Error adding property type overlay:', error);
    // Non-critical, don't throw
  }
}

/**
 * Fetch a document from Google Drive by file ID
 */
async function fetchDocumentFromDrive(fileId: string): Promise<ArrayBuffer> {
  console.log('📥 Fetching document from Drive:', fileId);
  
  try {
    const response = await fetch(`/api/drive-fetch?fileId=${fileId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('✅ Document fetched:', arrayBuffer.byteLength, 'bytes');
    
    return arrayBuffer;
  } catch (error) {
    console.error('❌ Error fetching document from Drive:', error);
    throw error;
  }
}

/**
 * Fetch all documents needed for video quote assembly
 * Optimized: Fetches all documents in parallel for maximum speed
 */
async function fetchVideoDocuments(products: string[]): Promise<FetchedDocuments> {
  console.log('📥 Fetching video documents in parallel...');
  
  try {
    const baseDocumentId = config.google.drive.baseDocuments.video;
    
    // Fetch all documents in parallel for maximum speed
    const [base, productResults] = await Promise.all([
      // Fetch base document
      fetchDocumentFromDrive(baseDocumentId),
      
      // Fetch all product sheets in parallel
      // Note: Accessories sheet (Switch POE, Coffret NVR, etc.) is now fetched as a regular product sheet
      // through the product mapping system, not as a separate accessories fetch
      Promise.all(
        products.map(async (productName) => {
          try {
            console.log(`📦 Fetching product sheet: ${productName}`);
            const response = await fetch(`/api/drive-fetch-product?productName=${encodeURIComponent(productName)}`);
            
            if (response.ok) {
              // Check if response includes metadata (fileId)
              const contentType = response.headers.get('content-type');
              const fileId = response.headers.get('x-file-id') || productName; // Fallback to productName if no header
              
              const data = await response.arrayBuffer();
              console.log(`✅ Fetched: ${productName} (fileId: ${fileId})`);
              return { name: productName, data, fileId };
            } else {
              console.warn(`⚠️ Not found: ${productName}`);
              return null;
            }
          } catch (error) {
            console.warn(`⚠️ Error fetching ${productName}:`, error);
            return null;
          }
        })
      )
    ]);
    
    // Filter out null results from product fetches
    const validProducts = productResults.filter(
      (result): result is { name: string; data: ArrayBuffer; fileId: string } => result !== null
    );
    
    console.log('✅ All documents fetched:', {
      base: (base.byteLength / 1024 / 1024).toFixed(2) + ' MB',
      products: validProducts.length + '/' + products.length
    });
    
    return {
      base,
      products: validProducts
    };
  } catch (error) {
    console.error('❌ Error fetching video documents:', error);
    throw error;
  }
}

