/**
 * ============================================================================
 * PDF GENERATION SERVICE
 * ============================================================================
 * 
 * Replaces jsPDF/pdf-lib client-side generation with server-side pdf-lib
 * Handles PDF creation, merging, and overlay generation
 * ============================================================================
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getTemplateFileId, getCommercialInfo } from '../config';
import { downloadFileFromDrive, findProductSheet, findAccessoriesPdf } from './google-drive.service';

export interface QuoteData {
  clientName: string;
  commercial: string;
  quoteType: 'alarme' | 'video';
  centralType?: 'titane' | 'jablotron';
  products: string[];
  includeAccessories?: boolean;
  addCommercialOverlay?: boolean;
}

export interface PdfGenerationResult {
  pdfBuffer: Buffer;
  fileName: string;
  assemblyInfo: {
    baseDossier: string;
    productsFound: number;
    productsRequested: number;
    totalPages: number;
    overlayAdded: boolean;
  };
}

/**
 * Generate complete PDF quote with base template and product sheets
 */
export async function generateCompletePdf(
  quoteData: QuoteData,
  quotePdfBuffer: Buffer
): Promise<PdfGenerationResult> {
  try {
    console.log('📦 Starting PDF assembly...');
    
    const pdfsToMerge: Buffer[] = [];
    const assemblyInfo = {
      baseDossier: 'None',
      productsFound: 0,
      productsRequested: quoteData.products.length,
      totalPages: 0,
      overlayAdded: false,
    };
    
    // 1. Get base template (Alarme Titane/Jablotron or Video)
    console.log(`📁 Fetching base template: ${quoteData.quoteType} (${quoteData.centralType || 'N/A'})`);
    const templateFileId = getTemplateFileId(quoteData.quoteType, quoteData.centralType);
    
    if (templateFileId) {
      try {
        const baseTemplate = await downloadFileFromDrive(templateFileId);
        pdfsToMerge.push(baseTemplate);
        assemblyInfo.baseDossier = `${quoteData.quoteType.toUpperCase()}_${(quoteData.centralType || 'TITANE').toUpperCase()}`;
        console.log(`✅ Base template added: ${assemblyInfo.baseDossier}`);
      } catch (error) {
        console.error('⚠️ Failed to fetch base template:', error);
      }
    }
    
    // 2. Add the generated quote PDF
    console.log('📄 Adding generated quote PDF');
    pdfsToMerge.push(quotePdfBuffer);
    
    // 3. Add commercial overlay if requested
    if (quoteData.addCommercialOverlay && quoteData.commercial) {
      console.log('📝 Creating commercial overlay...');
      try {
        const overlayPdf = await createCommercialOverlayPdf(quoteData.commercial);
        if (overlayPdf) {
          pdfsToMerge.push(overlayPdf);
          assemblyInfo.overlayAdded = true;
          console.log('✅ Commercial overlay added');
        }
      } catch (error) {
        console.error('⚠️ Failed to create overlay:', error);
      }
    }
    
    // 4. Add product sheets (only for video quotes, not for alarm)
    const isAlarm = quoteData.quoteType === 'alarme';
    const isVideo = quoteData.quoteType === 'video';
    
    if (isAlarm) {
      console.log('🚨 Alarm quote - skipping product sheets');
      assemblyInfo.productsRequested = 0;
    } else if (isVideo && quoteData.products.length > 0) {
      console.log(`🔍 Searching for ${quoteData.products.length} product sheets...`);
      
      // Use Set to deduplicate
      const foundProducts = new Map<string, Buffer>();
      
      for (let i = 0; i < quoteData.products.length; i++) {
        const productName = quoteData.products[i];
        console.log(`  [${i + 1}/${quoteData.products.length}] Searching: ${productName}`);
        
        try {
          const productSheet = await findProductSheet(productName);
          
          if (productSheet) {
            // Check for duplicates
            if (!foundProducts.has(productSheet.fileName)) {
              foundProducts.set(productSheet.fileName, productSheet.buffer);
              assemblyInfo.productsFound++;
              console.log(`  ✅ Found: ${productSheet.fileName}`);
            } else {
              console.log(`  ⚠️ Duplicate ignored: ${productSheet.fileName}`);
            }
          } else {
            console.log(`  ⚠️ Not found: ${productName}`);
          }
        } catch (error) {
          console.error(`  ❌ Error: ${productName}`, error);
        }
      }
      
      // Add all unique products
      foundProducts.forEach((buffer) => {
        pdfsToMerge.push(buffer);
      });
      
      console.log(`📊 Products found: ${assemblyInfo.productsFound}/${quoteData.products.length}`);
      
      // 5. Add accessories PDF if requested
      if (quoteData.includeAccessories) {
        console.log('🔌 Searching for accessories PDF...');
        try {
          const accessoriesPdf = await findAccessoriesPdf();
          if (accessoriesPdf) {
            pdfsToMerge.push(accessoriesPdf.buffer);
            console.log(`✅ Accessories added: ${accessoriesPdf.fileName}`);
          } else {
            console.log('ℹ️ No accessories PDF found (optional)');
          }
        } catch (error) {
          console.error('⚠️ Error fetching accessories:', error);
        }
      }
    }
    
    // 6. Merge all PDFs
    console.log(`🔨 Merging ${pdfsToMerge.length} PDFs...`);
    const mergedPdf = await mergePdfBuffers(pdfsToMerge);
    
    // Count total pages
    const pdfDoc = await PDFDocument.load(mergedPdf);
    assemblyInfo.totalPages = pdfDoc.getPageCount();
    
    console.log(`✅ PDF assembly complete: ${assemblyInfo.totalPages} pages`);
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `Devis_${quoteData.clientName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
    
    return {
      pdfBuffer: mergedPdf,
      fileName,
      assemblyInfo,
    };
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Merge multiple PDF buffers into one
 */
async function mergePdfBuffers(buffers: Buffer[]): Promise<Buffer> {
  if (buffers.length === 0) {
    throw new Error('No PDFs to merge');
  }
  
  if (buffers.length === 1) {
    return buffers[0];
  }
  
  const mergedPdf = await PDFDocument.create();
  
  for (const buffer of buffers) {
    try {
      const pdf = await PDFDocument.load(buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    } catch (error) {
      console.error('Error merging PDF:', error);
      // Continue with other PDFs
    }
  }
  
  return Buffer.from(await mergedPdf.save());
}

/**
 * Create commercial overlay PDF with contact information
 */
async function createCommercialOverlayPdf(commercialName: string): Promise<Buffer | null> {
  try {
    const commercialInfo = getCommercialInfo(commercialName);
    
    if (!commercialInfo) {
      console.warn(`Commercial not found: ${commercialName}`);
      return null;
    }
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // Draw border
    page.drawRectangle({
      x: 50,
      y: height - 350,
      width: width - 100,
      height: 250,
      borderColor: rgb(0, 0.4, 0.8),
      borderWidth: 2,
    });
    
    // Title
    page.drawText('INFORMATIONS COMMERCIAL', {
      x: width / 2 - 150,
      y: height - 120,
      size: 20,
      font: fontBold,
      color: rgb(0, 0.4, 0.8),
    });
    
    // Draw horizontal line
    page.drawLine({
      start: { x: 70, y: height - 140 },
      end: { x: width - 70, y: height - 140 },
      thickness: 2,
      color: rgb(0, 0.4, 0.8),
    });
    
    // Information
    const infoY = height - 180;
    const lineHeight = 30;
    
    page.drawText(`📅 Date: ${currentDate}`, {
      x: 80,
      y: infoY,
      size: 14,
      font: font,
    });
    
    page.drawText(`👤 Commercial: ${commercialName}`, {
      x: 80,
      y: infoY - lineHeight,
      size: 14,
      font: font,
    });
    
    page.drawText(`📞 Téléphone: ${commercialInfo.phone}`, {
      x: 80,
      y: infoY - lineHeight * 2,
      size: 14,
      font: font,
    });
    
    page.drawText(`📧 Email: ${commercialInfo.email}`, {
      x: 80,
      y: infoY - lineHeight * 3,
      size: 14,
      font: font,
    });
    
    // Footer
    page.drawText('Document généré automatiquement - Dialarme', {
      x: width / 2 - 140,
      y: height - 320,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    return Buffer.from(await pdfDoc.save());
  } catch (error) {
    console.error('Error creating overlay PDF:', error);
    return null;
  }
}

/**
 * Create a simple quote PDF from quote data
 * This is a placeholder - you can expand this to create detailed quotes
 */
export async function createQuotePdf(quoteData: QuoteData): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    
    // Title
    page.drawText('DEVIS DIALARME', {
      x: width / 2 - 80,
      y: height - 50,
      size: 24,
      font: fontBold,
      color: rgb(0, 0.4, 0.8),
    });
    
    // Client info
    let currentY = height - 100;
    const lineHeight = 25;
    
    page.drawText(`Client: ${quoteData.clientName}`, {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });
    
    currentY -= lineHeight;
    page.drawText(`Commercial: ${quoteData.commercial}`, {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });
    
    currentY -= lineHeight;
    page.drawText(`Type: ${quoteData.quoteType.toUpperCase()}`, {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });
    
    currentY -= lineHeight;
    page.drawText(`Date: ${new Date().toLocaleDateString('fr-FR')}`, {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });
    
    // Products
    if (quoteData.products.length > 0) {
      currentY -= lineHeight * 2;
      page.drawText('Produits:', {
        x: 50,
        y: currentY,
        size: 14,
        font: fontBold,
      });
      
      currentY -= lineHeight;
      quoteData.products.forEach((product, index) => {
        page.drawText(`${index + 1}. ${product}`, {
          x: 70,
          y: currentY,
          size: 12,
          font: font,
        });
        currentY -= lineHeight;
      });
    }
    
    return Buffer.from(await pdfDoc.save());
  } catch (error) {
    console.error('Error creating quote PDF:', error);
    throw new Error(`Quote PDF creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

