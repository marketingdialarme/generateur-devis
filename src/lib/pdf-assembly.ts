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
  quoteType: 'alarme' | 'video' | 'fog' | 'visiophone',
  centralType: 'titane' | 'jablotron' | null,
  products: string[],
  commercial: CommercialInfo,
  propertyType: 'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise' = 'locaux',
  addPoliceDoc: boolean = false
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
      return await assembleAlarmPdf(pdfBlob, centralType || 'titane', commercial, propertyType, addPoliceDoc);
    } else if (quoteType === 'video') {
      return await assembleVideoPdf(pdfBlob, products, commercial, propertyType);
    } else if (quoteType === 'fog') {
      const id = config.google.drive.baseDocuments.fog;
      if (!id) {
        console.warn('⚠️ No fog base template configured (GOOGLE_DRIVE_FILE_FOG). Shipping standalone PDF.');
        return { blob: pdfBlob, info: { baseDossier: 'Standalone (no fog template)', productsFound: 0, totalPages: 1, overlayAdded: false } };
      }
      return await assembleSimplePdf(pdfBlob, id, commercial, propertyType, 'Devis_BROUILLARD.pdf');
    } else if (quoteType === 'visiophone') {
      const id = config.google.drive.baseDocuments.visiophone;
      if (!id) {
        console.warn('⚠️ No visiophone base template configured (GOOGLE_DRIVE_FILE_VISIOPHONE). Shipping standalone PDF.');
        return { blob: pdfBlob, info: { baseDossier: 'Standalone (no visiophone template)', productsFound: 0, totalPages: 1, overlayAdded: false } };
      }
      // The current visiophone base template has a leftover "vidéo" word on page 2
      // (carry-over from when it was copied from the video template). The mask
      // option below paints over it with a matching "visiophone" replacement so
      // the client doesn't see a camera-typed dossier on a visiophone quote.
      return await assembleSimplePdf(pdfBlob, id, commercial, propertyType, 'Devis_VISIOPHONE.pdf', { maskVideoWord: true });
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
 * Append the police-intervention document when the option is selected.
 * Set GOOGLE_DRIVE_FILE_POLICE to the Drive file ID once the client provides it.
 */
async function addPoliceDocumentIfConfigured(pdfDoc: PDFDocument): Promise<void> {
  try {
    const fileId = config.google.drive.baseDocuments.policeDoc || '';
    if (!fileId) {
      console.log('ℹ️ Police-intervention selected but no document configured (set GOOGLE_DRIVE_FILE_POLICE)');
      return;
    }
    console.log('📥 Fetching police-intervention document, fileId:', fileId);
    const arrayBuffer = await fetchDocumentFromDrive(fileId);
    const policePdf = await PDFDocument.load(arrayBuffer);
    const pages = await pdfDoc.copyPages(policePdf, policePdf.getPageIndices());
    pages.forEach((p) => pdfDoc.addPage(p));
    console.log('✅ Police-intervention document appended', `(${pages.length} page(s))`);
  } catch (error) {
    console.warn('⚠️ Could not append police document (non-critical):', error);
  }
}

/**
 * Assemble alarm PDF
 * 
/**
 * Generic assembly used by Brouillard + Visiophone quotes.
 *
 * Pulls the base template from Drive, inserts the generated quote page as
 * page 6 (same layout as Alarm / Video), appends property-type doc when
 * configured, then layers the commercial + property-type overlays on page 2.
 * No product-sheets, no central-type branching.
 */
async function assembleSimplePdf(
  pdfBlob: Blob,
  baseFileId: string,
  commercial: CommercialInfo,
  propertyType: 'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise',
  dossierName: string,
  opts: { maskVideoWord?: boolean } = {},
): Promise<AssemblyResult> {
  console.log('📄 assembleSimplePdf —', dossierName, 'base:', baseFileId);
  const baseBuf = await fetchDocumentFromDrive(baseFileId);
  const basePdf = await PDFDocument.load(baseBuf);
  const basePages = basePdf.getPageCount();
  const quotePdf = await PDFDocument.load(await pdfBlob.arrayBuffer());
  const pdfDoc = await PDFDocument.create();

  // Pages 1..5 of the base template
  for (let i = 0; i < 5 && i < basePages; i++) {
    const [p] = await pdfDoc.copyPages(basePdf, [i]);
    pdfDoc.addPage(p);
  }
  // Generated quote page
  const [qp] = await pdfDoc.copyPages(quotePdf, [0]);
  pdfDoc.addPage(qp);
  // Optional property-type document
  await addPropertyTypeDocumentIfConfigured(pdfDoc, propertyType);
  // Remaining base pages
  if (basePages > 5) {
    for (let i = 5; i < basePages; i++) {
      const [p] = await pdfDoc.copyPages(basePdf, [i]);
      pdfDoc.addPage(p);
    }
  }
  // Overlays on page 2 (index 1)
  await addCommercialOverlay(pdfDoc, commercial, 1);
  if (opts.maskVideoWord) await maskVideoWordOnPage2(pdfDoc, 1);
  await addPropertyTypeOverlay(pdfDoc, propertyType, 1);

  const bytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
  return {
    blob: new Blob([Buffer.from(bytes)], { type: 'application/pdf' }),
    info: {
      baseDossier: dossierName,
      productsFound: 0,
      totalPages: pdfDoc.getPageCount(),
      overlayAdded: true,
    },
  };
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
  propertyType: 'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise',
  addPoliceDoc: boolean = false
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

    // 6c. Append police-intervention document when the option is selected
    if (addPoliceDoc) await addPoliceDocumentIfConfigured(pdfDoc);

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
    
    // Position is env-configurable so it can be retuned without code changes
    // when the Drive base template is updated. See config.ts > pdf.propertyTypeOverlay
    // (PDF_PROPERTY_TYPE_X, PDF_PROPERTY_TYPE_Y, PDF_PROPERTY_TYPE_FONT_SIZE).
    const overlay = config.pdf.propertyTypeOverlay;
    const textX = overlay.x;
    const textY = height - overlay.yFromTop;
    const fontSize = overlay.fontSize;
    
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
 * Mask the leftover "vidéo" word on page 2 of the visiophone base template.
 *
 * The current Drive base template (file id `10GvZ8...`) was copied from the
 * video template and the body text on page 2 still reads
 * "votre devis vidéo concernant la sécurité". This paints a white rectangle
 * over the "vidéo" word so the visiophone dossier doesn't read as a camera
 * quote. Coordinates measured against the live base (A4 595x842,
 * x≈426, baseline y≈542, width≈26, height≈11).
 *
 * Remove this once the client updates the visiophone base PDF in Drive
 * to either drop "vidéo" or replace it with the visiophone wording.
 */
async function maskVideoWordOnPage2(pdfDoc: PDFDocument, pageIndex: number): Promise<void> {
  try {
    const pages = pdfDoc.getPages();
    if (pageIndex >= pages.length) return;
    const page = pages[pageIndex];
    // White rectangle covering the "vidéo" word at its measured position.
    page.drawRectangle({
      x: 423,
      y: 538,
      width: 32,
      height: 14,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });
    console.log('✅ Masked "vidéo" word on visiophone page 2');
  } catch (error) {
    console.warn('⚠️ Could not mask "vidéo" word (non-critical):', error);
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

