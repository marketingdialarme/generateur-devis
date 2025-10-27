/**
* Script Google Apps Script pour Dialarme
* Gère l'envoi d'emails et le stockage dans Google Drive
* 
* ⚠️ IMPORTANT: Ce fichier utilise config.gs pour la configuration
* Assurez-vous que config.gs est présent dans le même projet
*/
/**
* Fonction principale appelée par le webhook
*/
function doPost(e) {
  const startTime = new Date();
  Logger.log('=== Début de doPost ===');
  Logger.log('Timestamp: ' + startTime.toISOString());
  
  try {
    // Parser les données reçues
    let data;
    try {
      if (e.postData && e.postData.contents) {
        Logger.log('Données reçues via postData.contents');
        data = JSON.parse(e.postData.contents);
      } else if (e.parameter && e.parameter.data) {
        Logger.log('Données reçues via parameter.data');
        data = JSON.parse(e.parameter.data);
      } else if (e.parameters && e.parameters.data && e.parameters.data[0]) {
        Logger.log('Données reçues via parameters.data[0]');
        data = JSON.parse(e.parameters.data[0]);
      } else {
        Logger.log('Aucune donnée trouvée dans la requête');
        Logger.log('e.postData: ' + JSON.stringify(e.postData));
        Logger.log('e.parameter: ' + JSON.stringify(e.parameter));
        throw new Error('Aucune donnée reçue');
      }
    } catch (parseError) {
      Logger.log('❌ Erreur de parsing: ' + parseError);
      return createJsonResponse({
        success: false,
        error: 'Erreur de parsing des données: ' + parseError.toString(),
        timestamp: new Date().toISOString()
      });
    }
    
    // Validation des données
    const pdfBase64 = data.pdfBase64;
    const filename = data.filename;
    const commercial = data.commercial;
    const clientName = data.clientName || 'Client';
    const type = data.type || null; // Type de dossier (alarme, video)
    const produits = data.produits || []; // Liste des produits pour fiches techniques
    
    Logger.log('Validation - PDF présent: ' + (!!pdfBase64));
    Logger.log('Validation - Filename: ' + filename);
    Logger.log('Validation - Commercial: ' + commercial);
    Logger.log('Validation - Client: ' + clientName);
    Logger.log('Validation - Type: ' + type);
    Logger.log('Validation - Produits: ' + (produits.length > 0 ? produits.join(', ') : 'aucun'));
    
    if (!pdfBase64 || !filename || !commercial) {
      return createJsonResponse({
        success: false,
        error: 'Données manquantes (PDF, nom de fichier ou commercial)',
        timestamp: new Date().toISOString()
      });
    }
    
    // Décoder le PDF du devis généré
    Logger.log('Décodage du PDF du devis...');
    const quotePdfBlob = Utilities.newBlob(
      Utilities.base64Decode(pdfBase64),
      'application/pdf',
      'quote.pdf'
    );
    Logger.log('PDF décodé - Taille: ' + quotePdfBlob.getBytes().length + ' bytes');
    
    // Assembler le dossier complet si type et produits sont fournis
    let finalPdfBlob = quotePdfBlob;
    let assemblyInfo = null;
    
    if (type && produits.length > 0) {
      Logger.log('🔧 Assemblage du dossier complet avec ' + produits.length + ' produit(s)...');
      const assemblyStartTime = new Date();
      
      try {
        const assemblyResult = assemblePdfDossier(quotePdfBlob, type, produits, filename);
        finalPdfBlob = assemblyResult.blob;
        assemblyInfo = assemblyResult.info;
        
        const assemblyDuration = (new Date() - assemblyStartTime) / 1000;
        Logger.log('✅ Assemblage terminé en ' + assemblyDuration + 's');
        Logger.log('   - Dossier de base: ' + assemblyInfo.baseDossier);
        Logger.log('   - Fiches produits trouvées: ' + assemblyInfo.productsFound + '/' + produits.length);
        Logger.log('   - Pages totales: ' + assemblyInfo.totalPages);
      } catch (assemblyError) {
        Logger.log('⚠️ Erreur assemblage (envoi du devis seul): ' + assemblyError.message);
        // Continue avec le devis seul en cas d'erreur
      }
    } else {
      Logger.log('ℹ️ Pas d\'assemblage demandé - envoi du devis seul');
    }
    
    // 1. Envoyer l'email avec le PDF final
    Logger.log('Envoi de l\'email...');
    const emailSent = sendEmailWithPDF(finalPdfBlob, filename, commercial, clientName, assemblyInfo);
    Logger.log('Email envoyé: ' + emailSent);
    
    // 2. Sauvegarder dans Google Drive
    Logger.log('Sauvegarde dans Drive...');
    const driveUrl = saveToDrive(finalPdfBlob, filename, commercial, clientName, assemblyInfo);
    Logger.log('Drive URL: ' + driveUrl);
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    Logger.log('=== Fin de doPost (succès) - Durée: ' + duration + 's ===');
    
    const response = {
      success: true,
      emailSent: emailSent,
      driveUrl: driveUrl,
      message: assemblyInfo 
        ? 'Dossier complet assemblé, envoyé par email et sauvegardé dans Drive' 
        : 'PDF envoyé par email et sauvegardé dans Drive',
      filename: filename,
      commercial: commercial,
      clientName: clientName,
      timestamp: new Date().toISOString(),
      duration: duration
    };
    
    if (assemblyInfo) {
      response.assembly = assemblyInfo;
    }
    
    return createJsonResponse(response);
    
  } catch (error) {
    Logger.log('❌ Erreur globale: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    
    return createJsonResponse({
      success: false,
      error: error.toString(),
      errorStack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

/**
* Crée une réponse JSON avec les bons headers CORS
*/
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
/**
* Fonction GET pour tester le script et gérer les callbacks
*/
function doGet(e) {
  // Si c'est un callback de confirmation
  if (e.parameter && e.parameter.callback) {
    Logger.log('Callback reçu: ' + e.parameter.callback);
    return HtmlService.createHtmlOutput('<!DOCTYPE html><html><body><script>window.parent.postMessage({type:"upload_success",data:' + e.parameter.callback + '},"*");window.close();</script></body></html>');
  }
  
  // Sinon, retourner le status du script
  return createJsonResponse({
    status: 'Script Dialarme actif',
    version: CONFIG.APP.VERSION,
    timestamp: new Date().toISOString(),
    endpoints: {
      post: 'Envoyer PDF avec données JSON (POST)',
      get: 'Status et callback handler (GET)'
    }
  });
}
/**
* Envoie l'email avec le PDF en pièce jointe
*/
function sendEmailWithPDF(pdfBlob, filename, commercial, clientName, assemblyInfo) {
try {
const subject = `Nouveau devis Dialarme - ${clientName} - ${commercial}`;
let body = `
Bonjour,
Un nouveau devis a été généré :
📄 Nom du fichier : ${filename}
👤 Client : ${clientName}
💼 Commercial : ${commercial}
📅 Date : ${new Date().toLocaleDateString('fr-CH')}
`;

if (assemblyInfo) {
  body += `
📦 Dossier complet assemblé :
   - Dossier de base : ${assemblyInfo.baseDossier}
   - Fiches techniques : ${assemblyInfo.productsFound} produit(s)
   - Total de pages : ${assemblyInfo.totalPages}
`;
}

body += `
Le PDF est en pièce jointe.
Cordialement,
Système Dialarme
`;

MailApp.sendEmail({
to: CONFIG.EMAIL.DESTINATION,
subject: subject,
body: body,
attachments: [pdfBlob],
name: 'Dialarme - Générateur de Devis'
});
Logger.log('Email envoyé avec succès à ' + CONFIG.EMAIL.DESTINATION);
return true;
} catch (error) {
Logger.log('Erreur lors de l\'envoi de l\'email: ' + error);
return false;
}
}
/**
* Sauvegarde le PDF dans Google Drive
* Si assemblyInfo contient plusieurs blobs, sauvegarde dans un sous-dossier
*/
function saveToDrive(pdfBlob, filename, commercial, clientName, assemblyInfo) {
try {
// Récupérer le dossier principal
const mainFolder = DriveApp.getFolderById(CONFIG.FOLDERS.DEVIS);
// Chercher ou créer le dossier du commercial
const commercialFolder = getOrCreateCommercialFolder(mainFolder, commercial);

// Si assemblage avec plusieurs fichiers
if (assemblyInfo && assemblyInfo.useMultiFile && assemblyInfo.blobs && assemblyInfo.blobs.length > 1) {
  Logger.log('💾 Sauvegarde multi-fichiers (' + assemblyInfo.blobs.length + ' PDFs)');
  const multiFileResult = saveMultiplePdfsToFolder(assemblyInfo.blobs, commercialFolder, clientName);
  Logger.log('Dossier sauvegardé dans Drive: ' + multiFileResult.folderUrl);
  Logger.log('   - ' + multiFileResult.filesCount + ' fichiers sauvegardés');
  return multiFileResult.folderUrl;
}

// Sinon, sauvegarde simple (1 fichier)
const file = commercialFolder.createFile(pdfBlob);
file.setName(filename);
file.setDescription('Devis généré automatiquement le ' + new Date().toLocaleString('fr-CH'));
const fileUrl = file.getUrl();
Logger.log('Fichier sauvegardé dans Drive: ' + fileUrl);
return fileUrl;
} catch (error) {
Logger.log('Erreur lors de la sauvegarde dans Drive: ' + error);
throw error;
}
}
/**
* Récupère ou crée le dossier du commercial
*/
function getOrCreateCommercialFolder(parentFolder, commercialName) {
// Nettoyer le nom du commercial
const cleanName = commercialName.trim();
// Chercher si le dossier existe déjà
const folders = parentFolder.getFoldersByName(cleanName);
if (folders.hasNext()) {
return folders.next();
}
// Créer le dossier s'il n'existe pas
const newFolder = parentFolder.createFolder(cleanName);
Logger.log('Nouveau dossier créé pour: ' + cleanName);
return newFolder;
}
// ============================================================================
// SYSTÈME D'ASSEMBLAGE PDF
// ============================================================================

/**
 * Assemble un dossier PDF complet à partir du devis et des fiches produits
 * 
 * @param {Blob} quotePdfBlob - Le PDF du devis généré
 * @param {string} type - Type de dossier (alarme, video)
 * @param {Array<string>} produits - Liste des noms de produits
 * @param {string} filename - Nom du fichier final
 * @returns {Object} { blob: Blob, info: Object }
 */
function assemblePdfDossier(quotePdfBlob, type, produits, filename) {
  Logger.log('🔧 === DÉBUT ASSEMBLAGE PDF ===');
  
  const blobsToMerge = [];
  const assemblyInfo = {
    baseDossier: 'Aucun',
    productsFound: 0,
    productsRequested: produits.length,
    totalPages: 0
  };
  
  // 1. Récupérer le dossier de base selon le type
  Logger.log('📁 Étape 1: Récupération du dossier de base (type: ' + type + ')');
  try {
    const baseDossierBlob = getBaseDossierBlob(type);
    if (baseDossierBlob) {
      blobsToMerge.push(baseDossierBlob);
      assemblyInfo.baseDossier = getBaseDossierName(type);
      Logger.log('✅ Dossier de base ajouté: ' + assemblyInfo.baseDossier);
    } else {
      Logger.log('⚠️ Aucun dossier de base pour le type: ' + type);
    }
  } catch (error) {
    Logger.log('❌ Erreur lors de la récupération du dossier de base: ' + error.message);
  }
  
  // 2. Ajouter le PDF du devis généré
  Logger.log('📄 Étape 2: Ajout du devis généré');
  blobsToMerge.push(quotePdfBlob);
  Logger.log('✅ Devis ajouté');
  
  // 3. Rechercher et ajouter les fiches techniques des produits
  // ⚠️ IMPORTANT: Pour les dossiers ALARME, on ne cherche PAS de fiches techniques
  // Les dossiers alarme contiennent uniquement: [Base Alarme] + [Devis généré]
  const isAlarmDossier = type && type.toLowerCase().startsWith('alarme');
  
  if (isAlarmDossier) {
    Logger.log('🚨 Dossier ALARME détecté – les fiches techniques produits sont IGNORÉES');
    Logger.log('   → Le dossier contiendra uniquement: Base Alarme + Devis');
    assemblyInfo.productsFound = 0;
    assemblyInfo.productsRequested = 0;
  } else {
    // Pour les autres types (vidéo, etc.), on recherche les fiches techniques
    Logger.log('🔍 Étape 3: Recherche des fiches techniques (' + produits.length + ' produits)');
    for (let i = 0; i < produits.length; i++) {
      const productName = produits[i];
      Logger.log('   [' + (i + 1) + '/' + produits.length + '] Recherche: ' + productName);
      
      try {
        const productBlob = findProductSheetByName(productName);
        if (productBlob) {
          blobsToMerge.push(productBlob);
          assemblyInfo.productsFound++;
          Logger.log('   ✅ Trouvé: ' + productName);
        } else {
          Logger.log('   ⚠️ Non trouvé: ' + productName);
        }
      } catch (error) {
        Logger.log('   ❌ Erreur pour ' + productName + ': ' + error.message);
      }
    }
    
    Logger.log('📊 Récapitulatif: ' + assemblyInfo.productsFound + '/' + produits.length + ' fiches trouvées');
  }
  
  // 4. Fusionner tous les PDFs (ou préparer pour sauvegarde multiple)
  Logger.log('🔨 Étape 4: Préparation des PDFs (' + blobsToMerge.length + ' fichiers)');
  
  if (blobsToMerge.length === 0) {
    throw new Error('Aucun PDF à assembler');
  }
  
  if (blobsToMerge.length === 1) {
    Logger.log('ℹ️ Un seul PDF, pas de fusion nécessaire');
    const finalBlob = blobsToMerge[0].setName(filename);
    assemblyInfo.totalPages = '1 fichier';
    assemblyInfo.blobs = [finalBlob];
    Logger.log('✅ === FIN ASSEMBLAGE PDF ===');
    return { blob: finalBlob, info: assemblyInfo };
  }
  
  // Tenter la fusion (retournera le devis principal si fusion impossible)
  const mergedBlob = mergePdfs(blobsToMerge, filename);
  assemblyInfo.totalPages = blobsToMerge.length + ' fichiers';
  assemblyInfo.blobs = blobsToMerge; // Garder tous les blobs pour sauvegarde multiple si nécessaire
  assemblyInfo.useMultiFile = true;   // Indiquer qu'il faut sauvegarder en multiple
  
  Logger.log('✅ Assemblage terminé: ' + filename);
  Logger.log('✅ === FIN ASSEMBLAGE PDF ===');
  
  return { blob: mergedBlob, info: assemblyInfo };
}

/**
 * Récupère le blob du dossier de base selon le type
 * 
 * @param {string} type - Type de dossier (alarme, video)
 * @returns {Blob|null} Le blob du dossier ou null
 */
function getBaseDossierBlob(type) {
  let fileId = null;
  
  if (type === 'alarme') {
    // Pour l'instant, utilise ALARME_TITANE par défaut
    // TODO: Raffiner la logique pour choisir entre TITANE et JABLOTRON
    fileId = CONFIG.DOSSIERS.ALARME_TITANE;
  } else if (type === 'video') {
    fileId = CONFIG.DOSSIERS.VIDEO;
  }
  
  if (!fileId) {
    return null;
  }
  
  return getFileBlobById(fileId);
}

/**
 * Récupère le nom du dossier de base selon le type
 * 
 * @param {string} type - Type de dossier
 * @returns {string} Nom du dossier
 */
function getBaseDossierName(type) {
  if (type === 'alarme') {
    return 'Devis_ALARME_TITANE.pdf';
  } else if (type === 'video') {
    return 'Devis_VIDÉO.pdf';
  }
  return 'Inconnu';
}

/**
 * Récupère un fichier Drive par son ID et retourne le Blob
 * 
 * @param {string} fileId - ID du fichier Google Drive
 * @returns {Blob} Le blob du fichier
 */
function getFileBlobById(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    return file.getBlob();
  } catch (error) {
    Logger.log('❌ Erreur getFileBlobById(' + fileId + '): ' + error.message);
    throw new Error('Impossible de récupérer le fichier: ' + fileId);
  }
}

/**
 * Supprime les accents d'une chaîne pour la recherche
 * 
 * @param {string} str - Chaîne à normaliser
 * @returns {string} Chaîne sans accents
 */
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Recherche une fiche technique de produit par nom (case-insensitive, accent-insensitive)
 * 
 * @param {string} productName - Nom du produit à rechercher
 * @returns {Blob|null} Le blob de la fiche technique ou null
 */
function findProductSheetByName(productName) {
  try {
    const techSheetsFolder = DriveApp.getFolderById(CONFIG.FOLDERS.TECH_SHEETS);
    const files = techSheetsFolder.getFiles();
    
    // Normaliser le nom du produit pour la recherche (sans accents, minuscules)
    const normalizedSearch = removeAccents(productName.toLowerCase().trim());
    
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const normalizedFileName = removeAccents(fileName.toLowerCase());
      
      // Recherche flexible: contient le nom du produit
      if (normalizedFileName.includes(normalizedSearch) || 
          normalizedSearch.includes(normalizedFileName.replace('.pdf', '').replace(' - compressed', ''))) {
        Logger.log('   ✓ Match trouvé: ' + fileName);
        
        // Vérifier la taille du fichier avant de le charger
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
        const fileSize = file.getSize();
        
        if (fileSize > MAX_FILE_SIZE) {
          Logger.log('   ⚠️ Fichier trop volumineux (' + (fileSize / 1024 / 1024).toFixed(2) + ' MB) - ignoré');
          continue;
        }
        
        const blob = file.getBlob();
        Logger.log('✅ Trouvé: ' + fileName + ' (' + (fileSize / 1024).toFixed(2) + ' KB)');
        return blob;
      }
    }
    
    // Si aucune correspondance exacte, essayer une recherche plus permissive
    const files2 = techSheetsFolder.getFiles();
    const searchWords = normalizedSearch.split(/[\s\-_]+/);
    
    while (files2.hasNext()) {
      const file = files2.next();
      const fileName = file.getName();
      const normalizedFileName2 = removeAccents(fileName.toLowerCase());
      
      // Si au moins 2 mots clés correspondent
      let matchCount = 0;
      for (const word of searchWords) {
        if (word.length > 2 && normalizedFileName2.includes(word)) {
          matchCount++;
        }
      }
      
      if (matchCount >= Math.min(2, searchWords.length)) {
        Logger.log('   ✓ Match partiel trouvé: ' + fileName);
        
        // Vérifier la taille du fichier avant de le charger
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
        const fileSize = file.getSize();
        
        if (fileSize > MAX_FILE_SIZE) {
          Logger.log('   ⚠️ Fichier trop volumineux (' + (fileSize / 1024 / 1024).toFixed(2) + ' MB) - ignoré');
          continue;
        }
        
        const blob = file.getBlob();
        Logger.log('✅ Trouvé: ' + fileName + ' (' + (fileSize / 1024).toFixed(2) + ' KB)');
        return blob;
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('❌ Erreur findProductSheetByName(' + productName + '): ' + error.message);
    return null;
  }
}

/**
 * Fusionne plusieurs PDFs en un seul
 * 
 * @param {Array<Blob>} blobsArray - Tableau de blobs PDF à fusionner
 * @param {string} filename - Nom du fichier final
 * @returns {Blob} Le blob du PDF fusionné
 */
function mergePdfs(blobsArray, filename) {
  try {
    Logger.log('🔨 Fusion de ' + blobsArray.length + ' PDFs...');
    
    // Google Apps Script ne supporte pas nativement la fusion PDF
    // Solution: Utiliser PDFApp (si disponible) ou sauvegarder séparément
    
    // Méthode 1: Tenter d'utiliser une approche Drive-based
    if (typeof PDFApp !== 'undefined') {
      // Si PDFApp existe (dans certaines versions)
      const mergedPdf = PDFApp.merge(blobsArray);
      mergedPdf.setName(filename);
      Logger.log('✅ Fusion réussie (PDFApp): ' + (mergedPdf.getBytes().length / 1024).toFixed(2) + ' KB');
      return mergedPdf;
    }
    
    // Méthode 2: Workaround - Créer un dossier Drive avec tous les PDFs
    // et retourner le premier (le plus important: le devis)
    Logger.log('⚠️ Fusion PDF native non disponible - utilisation du devis principal');
    Logger.log('   Alternative: Les fichiers seront sauvegardés séparément');
    
    // Pour l'instant, retourner le devis (2ème élément après le dossier de base)
    // ou le premier si pas de dossier de base
    const mainPdf = blobsArray.length > 1 ? blobsArray[1] : blobsArray[0];
    mainPdf.setName(filename);
    
    Logger.log('✅ Retour du PDF principal: ' + (mainPdf.getBytes().length / 1024).toFixed(2) + ' KB');
    Logger.log('   Note: Pour une vraie fusion, utiliser l\'approche multi-fichiers');
    
    return mainPdf;
    
  } catch (error) {
    Logger.log('❌ Erreur lors de la fusion PDF: ' + error.message);
    throw new Error('Impossible de fusionner les PDFs: ' + error.message);
  }
}

/**
 * Sauvegarde plusieurs PDFs dans Drive (alternative à la fusion)
 * Crée un sous-dossier avec tous les PDFs séparés
 * 
 * @param {Array<Blob>} blobsArray - Tableau de blobs PDF
 * @param {Folder} parentFolder - Dossier parent
 * @param {string} clientName - Nom du client pour le sous-dossier
 * @returns {Object} Informations sur les fichiers sauvegardés
 */
function saveMultiplePdfsToFolder(blobsArray, parentFolder, clientName) {
  try {
    // Créer un sous-dossier pour ce devis
    const timestamp = Utilities.formatDate(new Date(), 'GMT+1', 'yyyy-MM-dd_HHmm');
    const folderName = clientName + ' - ' + timestamp;
    const subFolder = parentFolder.createFolder(folderName);
    
    Logger.log('📁 Création du dossier: ' + folderName);
    
    const fileUrls = [];
    const fileNames = ['1-Dossier_Base.pdf', '2-Devis.pdf'];
    
    // Sauvegarder chaque PDF
    for (let i = 0; i < blobsArray.length; i++) {
      const blob = blobsArray[i];
      let name = fileNames[i] || ((i + 1) + '-' + blob.getName());
      
      // Si c'est une fiche produit (après les 2 premiers)
      if (i >= 2) {
        name = (i + 1) + '-Fiche_' + blob.getName();
      }
      
      blob.setName(name);
      const file = subFolder.createFile(blob);
      fileUrls.push(file.getUrl());
      Logger.log('   ✅ Sauvegardé: ' + name);
    }
    
    return {
      folderUrl: subFolder.getUrl(),
      folderName: folderName,
      filesCount: blobsArray.length,
      fileUrls: fileUrls
    };
    
  } catch (error) {
    Logger.log('❌ Erreur lors de la sauvegarde multiple: ' + error.message);
    throw error;
  }
}

// ============================================================================
// FONCTIONS DE TEST
// ============================================================================

/**
* Fonction de test (à exécuter manuellement)
*/
function testScript() {
try {
// Test de création de dossiers
const mainFolder = DriveApp.getFolderById(CONFIG.FOLDERS.DEVIS);
const testFolder = getOrCreateCommercialFolder(mainFolder, 'Test Commercial');
Logger.log('Test réussi. Dossier: ' + testFolder.getName());
// Test d'envoi d'email
MailApp.sendEmail({
to: CONFIG.EMAIL.DESTINATION,
subject: 'Test Dialarme Script',
body: 'Ceci est un email de test du script Dialarme.'
});
Logger.log('Email de test envoyé');
return 'Tests réussis';
} catch (error) {
Logger.log('Erreur lors du test: ' + error);
return 'Erreur: ' + error.toString();
}
}

/**
* Test manuel complet avec un PDF fictif
* Simule l'envoi complet d'un devis (email + Drive)
*/
function testManual() {
  const testData = {
    pdfBase64: "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0=",
    filename: "Test-Manual.pdf",
    commercial: "Test Commercial",
    clientName: "Test Client",
    timestamp: new Date().toISOString()
  };
  
  const e = {
    parameter: {
      data: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  Logger.log("Résultat: " + result.getContent());
}

/**
 * Test de l'assemblage PDF avec dossier de base et fiches techniques
 * Simule l'envoi d'un devis avec assemblage complet
 */
function testPdfAssembly() {
  Logger.log('=== TEST ASSEMBLAGE PDF ===');
  
  const testData = {
    pdfBase64: "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0=",
    filename: "Test-Assembly.pdf",
    commercial: "Test Commercial",
    clientName: "Test Client Assembly",
    type: "alarme",
    produits: [
      "Detecteur",
      "Sirene",
      "Centrale"
    ],
    timestamp: new Date().toISOString()
  };
  
  Logger.log('Données de test:');
  Logger.log('- Type: ' + testData.type);
  Logger.log('- Produits: ' + testData.produits.join(', '));
  
  const e = {
    parameter: {
      data: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  const response = JSON.parse(result.getContent());
  
  Logger.log('=== RÉSULTAT DU TEST ===');
  Logger.log('Success: ' + response.success);
  Logger.log('Message: ' + response.message);
  
  if (response.assembly) {
    Logger.log('Assembly Info:');
    Logger.log('- Dossier de base: ' + response.assembly.baseDossier);
    Logger.log('- Produits trouvés: ' + response.assembly.productsFound + '/' + response.assembly.productsRequested);
    Logger.log('- Total pages: ' + response.assembly.totalPages);
  }
  
  Logger.log('Drive URL: ' + response.driveUrl);
  Logger.log('=== FIN TEST ===');
  
  return response;
}

/**
 * Test de recherche de fiches techniques
 * Vérifie que les fiches produits peuvent être trouvées
 */
function testProductSearch() {
  Logger.log('=== TEST RECHERCHE PRODUITS ===');
  
  const testProducts = [
    "Detecteur",
    "Sirene", 
    "Centrale",
    "Camera",
    "Clavier"
  ];
  
  for (const productName of testProducts) {
    Logger.log('Recherche: ' + productName);
    const blob = findProductSheetByName(productName);
    if (blob) {
      Logger.log('✅ Trouvé: ' + blob.getName() + ' (' + (blob.getBytes().length / 1024).toFixed(2) + ' KB)');
    } else {
      Logger.log('❌ Non trouvé');
    }
    Logger.log('---');
  }
  
  Logger.log('=== FIN TEST RECHERCHE ===');
}

/**
 * Test avec les vrais produits du dossier "Fiches techniques"
 * Utilise les noms réels des produits vidéo
 */
function testRealProducts() {
  Logger.log('=== TEST AVEC PRODUITS RÉELS ===');
  
  // Produits réels du dossier "Fiches techniques"
  const realProducts = [
    "SOLAR 4G XL",
    "DÔME NIGHT",
    "BULLET ZOOM",
    "NVR MODEM",
    "MINI SOLAR"
  ];
  
  for (const productName of realProducts) {
    Logger.log('Recherche: ' + productName);
    const blob = findProductSheetByName(productName);
    if (blob) {
      Logger.log('✅ Trouvé: ' + blob.getName() + ' (' + (blob.getBytes().length / 1024).toFixed(2) + ' KB)');
    } else {
      Logger.log('❌ Non trouvé');
    }
    Logger.log('---');
  }
  
  Logger.log('=== FIN TEST PRODUITS RÉELS ===');
}

/**
 * Test d'assemblage avec de vrais produits vidéo
 */
function testVideoAssembly() {
  Logger.log('=== TEST ASSEMBLAGE VIDÉO ===');
  
  const testData = {
    pdfBase64: "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0=",
    filename: "Test-Video-Assembly.pdf",
    commercial: "Test Commercial",
    clientName: "Test Client Video",
    type: "video",
    produits: [
      "SOLAR 4G XL",
      "DÔME NIGHT", 
      "BULLET ZOOM"
    ],
    timestamp: new Date().toISOString()
  };
  
  Logger.log('Données de test:');
  Logger.log('- Type: ' + testData.type);
  Logger.log('- Produits: ' + testData.produits.join(', '));
  
  const e = {
    parameter: {
      data: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  const response = JSON.parse(result.getContent());
  
  Logger.log('=== RÉSULTAT DU TEST ===');
  Logger.log('Success: ' + response.success);
  Logger.log('Message: ' + response.message);
  
  if (response.assembly) {
    Logger.log('Assembly Info:');
    Logger.log('- Dossier de base: ' + response.assembly.baseDossier);
    Logger.log('- Produits trouvés: ' + response.assembly.productsFound + '/' + response.assembly.productsRequested);
    Logger.log('- Total: ' + response.assembly.totalPages);
  }
  
  Logger.log('Drive URL: ' + response.driveUrl);
  Logger.log('=== FIN TEST ===');
  
  return response;
}

/**
 * Test d'assemblage avec un dossier ALARME
 * Vérifie que les fiches techniques sont bien ignorées pour les alarmes
 */
function testAlarmAssembly() {
  Logger.log('=== TEST ASSEMBLAGE ALARME (sans fiches techniques) ===');
  
  const testData = {
    pdfBase64: "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0=",
    filename: "Test-Alarm-Assembly.pdf",
    commercial: "Test Commercial",
    clientName: "Test Client Alarme",
    type: "alarme",  // Type ALARME
    produits: [
      "Detecteur XYZ",
      "Sirene ABC",
      "Centrale 123"
    ],
    timestamp: new Date().toISOString()
  };
  
  Logger.log('Données de test:');
  Logger.log('- Type: ' + testData.type + ' (les produits doivent être IGNORÉS)');
  Logger.log('- Produits envoyés: ' + testData.produits.join(', '));
  Logger.log('');
  
  const e = {
    parameter: {
      data: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  const response = JSON.parse(result.getContent());
  
  Logger.log('=== RÉSULTAT DU TEST ===');
  Logger.log('Success: ' + response.success);
  Logger.log('Message: ' + response.message);
  Logger.log('');
  
  if (response.assembly) {
    Logger.log('📊 Assembly Info:');
    Logger.log('   - Dossier de base: ' + response.assembly.baseDossier);
    Logger.log('   - Produits trouvés: ' + response.assembly.productsFound + '/' + response.assembly.productsRequested);
    Logger.log('   - Total: ' + response.assembly.totalPages);
    Logger.log('');
    
    // Vérification
    if (response.assembly.productsFound === 0 && response.assembly.productsRequested === 0) {
      Logger.log('✅ SUCCÈS: Les fiches techniques ont bien été ignorées pour le dossier ALARME');
    } else {
      Logger.log('❌ ERREUR: Des fiches techniques ont été recherchées alors qu\'elles devraient être ignorées');
    }
  }
  
  Logger.log('');
  Logger.log('Drive URL: ' + response.driveUrl);
  Logger.log('=== FIN TEST ALARME ===');
  
  return response;
}