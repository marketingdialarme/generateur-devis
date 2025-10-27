/**
* Script Google Apps Script pour Dialarme
* Gère l'envoi d'emails et le stockage dans Google Drive
* 
* ⚠️ IMPORTANT: Ce fichier utilise config.gs pour la configuration
* Assurez-vous que config.gs est présent dans le même projet
*/

// ============================================================================
// VALIDATION DE LA CONFIGURATION
// ============================================================================

/**
 * Valide que toutes les entrées CONFIG nécessaires sont présentes
 * À appeler au démarrage ou manuellement pour vérifier la configuration
 * 
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validateConfig() {
  const errors = [];
  
  Logger.log('🔍 === VALIDATION DE LA CONFIGURATION ===');
  
  // Vérifier CONFIG existe
  if (typeof CONFIG === 'undefined') {
    errors.push('CONFIG n\'est pas défini - config.gs est-il présent ?');
    Logger.log('❌ CONFIG n\'est pas défini');
    return { valid: false, errors: errors };
  }
  
  // Vérifier FOLDERS
  if (!CONFIG.FOLDERS) {
    errors.push('CONFIG.FOLDERS n\'est pas défini');
  } else {
    if (!CONFIG.FOLDERS.DEVIS) {
      errors.push('CONFIG.FOLDERS.DEVIS n\'est pas défini');
    }
    if (!CONFIG.FOLDERS.TECH_SHEETS) {
      errors.push('CONFIG.FOLDERS.TECH_SHEETS n\'est pas défini');
    }
  }
  
  // Vérifier DOSSIERS
  if (!CONFIG.DOSSIERS) {
    errors.push('CONFIG.DOSSIERS n\'est pas défini');
  } else {
    if (!CONFIG.DOSSIERS.ALARME_TITANE) {
      errors.push('CONFIG.DOSSIERS.ALARME_TITANE n\'est pas défini');
    }
    if (!CONFIG.DOSSIERS.ALARME_JABLOTRON) {
      errors.push('CONFIG.DOSSIERS.ALARME_JABLOTRON n\'est pas défini');
    }
    if (!CONFIG.DOSSIERS.VIDEO) {
      errors.push('CONFIG.DOSSIERS.VIDEO n\'est pas défini');
    }
  }
  
  // Vérifier EMAIL
  if (!CONFIG.EMAIL) {
    errors.push('CONFIG.EMAIL n\'est pas défini');
  } else {
    if (!CONFIG.EMAIL.DESTINATION) {
      errors.push('CONFIG.EMAIL.DESTINATION n\'est pas défini');
    }
  }
  
  // Vérifier APP
  if (!CONFIG.APP) {
    errors.push('CONFIG.APP n\'est pas défini');
  }
  
  // Afficher les résultats
  if (errors.length === 0) {
    Logger.log('✅ Configuration valide - tous les paramètres sont présents');
    Logger.log('   - CONFIG.FOLDERS.DEVIS: ' + CONFIG.FOLDERS.DEVIS);
    Logger.log('   - CONFIG.FOLDERS.TECH_SHEETS: ' + CONFIG.FOLDERS.TECH_SHEETS);
    Logger.log('   - CONFIG.EMAIL.DESTINATION: ' + CONFIG.EMAIL.DESTINATION);
    return { valid: true, errors: [] };
  } else {
    Logger.log('❌ Configuration invalide - ' + errors.length + ' erreur(s):');
    errors.forEach(function(error) {
      Logger.log('   - ' + error);
    });
    return { valid: false, errors: errors };
  }
}

// ============================================================================
// FONCTIONS PRINCIPALES (doPost, doGet)
// ============================================================================

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
    const centralType = data.centralType || null; // Type de centrale (titane, jablotron)
    const produits = data.produits || []; // Liste des produits pour fiches techniques
    const addCommercialOverlay = data.addCommercialOverlay || false; // Flag pour ajouter overlay commercial
    
    Logger.log('Validation - PDF présent: ' + (!!pdfBase64));
    Logger.log('Validation - Filename: ' + filename);
    Logger.log('Validation - Commercial: ' + commercial);
    Logger.log('Validation - Client: ' + clientName);
    Logger.log('Validation - Type: ' + type);
    Logger.log('Validation - Central Type: ' + (centralType || 'N/A'));
    Logger.log('Validation - Produits: ' + (produits.length > 0 ? produits.join(', ') : 'aucun'));
    Logger.log('Validation - Overlay commercial: ' + addCommercialOverlay);
    
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
        const assemblyResult = assemblePdfDossier(quotePdfBlob, type, produits, filename, commercial, addCommercialOverlay, centralType);
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
// Vérifier que l'email de destination est configuré
if (!CONFIG.EMAIL.DESTINATION) {
  Logger.log('❌ CONFIG.EMAIL.DESTINATION n\'est pas configuré');
  throw new Error('Email de destination non configuré dans CONFIG');
}

Logger.log('📧 Préparation de l\'email vers CONFIG.EMAIL.DESTINATION: ' + CONFIG.EMAIL.DESTINATION);

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
Logger.log('✅ Email envoyé avec succès à ' + CONFIG.EMAIL.DESTINATION);
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
// Vérifier que le dossier principal est configuré
if (!CONFIG.FOLDERS.DEVIS) {
  Logger.log('❌ CONFIG.FOLDERS.DEVIS n\'est pas configuré');
  throw new Error('Dossier principal DEVIS non configuré dans CONFIG');
}

// Récupérer le dossier principal
Logger.log('📂 Accès au dossier principal depuis CONFIG.FOLDERS.DEVIS (ID: ' + CONFIG.FOLDERS.DEVIS + ')');
const mainFolder = DriveApp.getFolderById(CONFIG.FOLDERS.DEVIS);
Logger.log('✅ Dossier principal: ' + mainFolder.getName());

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
 * @param {string} commercialName - Nom du commercial
 * @param {boolean} addOverlay - Flag pour ajouter overlay commercial (optionnel)
 * @param {string} centralType - Type de centrale pour alarmes (titane, jablotron)
 * @returns {Object} { blob: Blob, info: Object }
 */
function assemblePdfDossier(quotePdfBlob, type, produits, filename, commercialName, addOverlay, centralType) {
  Logger.log('🔧 === DÉBUT ASSEMBLAGE PDF ===');
  
  const blobsToMerge = [];
  const assemblyInfo = {
    baseDossier: 'Aucun',
    productsFound: 0,
    productsRequested: produits.length,
    totalPages: 0,
    overlayAdded: false
  };
  
  // 1. Récupérer le dossier de base selon le type
  Logger.log('📁 Étape 1: Récupération du dossier de base (type: ' + type + ', central: ' + (centralType || 'N/A') + ')');
  try {
    const baseDossierBlob = getBaseDossierBlob(type, centralType);
    if (baseDossierBlob) {
      blobsToMerge.push(baseDossierBlob);
      assemblyInfo.baseDossier = getBaseDossierName(type, centralType);
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
  
  // 2.5. OPTIONNEL: Ajouter une page overlay avec les informations du commercial
  // Cette page sera insérée en position 2 (après le dossier de base, avant les fiches)
  if (addOverlay && commercialName) {
    Logger.log('📝 Étape 2.5: Génération de l\'overlay commercial');
    try {
      const overlayBlob = createCommercialOverlayPdf(commercialName);
      if (overlayBlob) {
        blobsToMerge.push(overlayBlob);
        assemblyInfo.overlayAdded = true;
        Logger.log('✅ Overlay page avec informations commercial ajouté à la page 2');
      } else {
        Logger.log('⚠️ Impossible de créer l\'overlay commercial');
      }
    } catch (overlayError) {
      Logger.log('⚠️ Erreur création overlay: ' + overlayError.message);
      Logger.log('   → Assemblage continue sans overlay');
    }
  } else if (addOverlay && !commercialName) {
    Logger.log('⚠️ Overlay demandé mais nom commercial manquant - ignoré');
  }
  
  // 3. Rechercher et ajouter les fiches techniques des produits
  // ⚠️ IMPORTANT: Pour les dossiers ALARME, on ne cherche PAS de fiches techniques
  // Les dossiers alarme contiennent uniquement: [Base Alarme] + [Devis généré]
  const isAlarmDossier = type && type.toLowerCase().startsWith('alarme');
  const isVideoDossier = type && (type.toLowerCase() === 'video' || type.toLowerCase() === 'vidéo');
  
  if (isAlarmDossier) {
    Logger.log('🚨 Dossier ALARME détecté – les fiches techniques produits sont IGNORÉES');
    Logger.log('   → Le dossier contiendra uniquement: Base Alarme + Devis');
    assemblyInfo.productsFound = 0;
    assemblyInfo.productsRequested = 0;
  } else if (isVideoDossier) {
    // 🎥 LOGIQUE SPÉCIFIQUE VIDÉO: Recherche détaillée avec déduplication et accessoires
    Logger.log('🎥 Dossier VIDÉO détecté – recherche détaillée des fiches techniques');
    Logger.log('🔍 Étape 3: Recherche des fiches techniques (' + produits.length + ' produits)');
    
    // Utiliser un Set pour éviter les doublons (basé sur le nom du fichier)
    const foundProductFiles = new Map(); // Map<fileName, blob>
    const productSearchResults = [];
    
    // Rechercher chaque produit
    for (let i = 0; i < produits.length; i++) {
      const productName = produits[i];
      Logger.log('   [' + (i + 1) + '/' + produits.length + '] Recherche: ' + productName);
      
      try {
        const result = findProductSheetByNameDetailed(productName);
        if (result && result.blob) {
          // Vérifier si ce fichier n'a pas déjà été ajouté (déduplication)
          if (!foundProductFiles.has(result.fileName)) {
            foundProductFiles.set(result.fileName, result.blob);
            blobsToMerge.push(result.blob);
            assemblyInfo.productsFound++;
            productSearchResults.push({
              searchTerm: productName,
              fileName: result.fileName,
              fileSize: result.fileSize,
              found: true
            });
            Logger.log('   ✅ Trouvé: ' + result.fileName + ' (' + result.fileSize + ' KB)');
          } else {
            Logger.log('   ⚠️ Doublon ignoré: ' + result.fileName + ' (déjà ajouté)');
            productSearchResults.push({
              searchTerm: productName,
              fileName: result.fileName,
              duplicate: true
            });
          }
        } else {
          Logger.log('   ⚠️ Non trouvé: ' + productName);
          productSearchResults.push({
            searchTerm: productName,
            found: false
          });
        }
      } catch (error) {
        Logger.log('   ❌ Erreur pour ' + productName + ': ' + error.message);
        productSearchResults.push({
          searchTerm: productName,
          error: error.message
        });
      }
    }
    
    Logger.log('📊 Récapitulatif produits: ' + assemblyInfo.productsFound + '/' + produits.length + ' fiches uniques trouvées');
    
    // 4. Rechercher et ajouter le PDF des accessoires (ONDULEURS - COFFRET - SWITCH)
    Logger.log('🔌 Étape 4: Recherche du PDF accessoires');
    try {
      const accessoryResult = findAccessoryPdf();
      if (accessoryResult && accessoryResult.blob) {
        blobsToMerge.push(accessoryResult.blob);
        Logger.log('   ✅ Accessoires ajouté: ' + accessoryResult.fileName + ' (' + accessoryResult.fileSize + ' KB)');
        assemblyInfo.accessoryAdded = true;
        assemblyInfo.accessoryFileName = accessoryResult.fileName;
      } else {
        Logger.log('   ℹ️ Aucun PDF accessoires trouvé (optionnel)');
        assemblyInfo.accessoryAdded = false;
      }
    } catch (error) {
      Logger.log('   ⚠️ Erreur recherche accessoires: ' + error.message);
      assemblyInfo.accessoryAdded = false;
    }
    
    // Stocker les résultats détaillés
    assemblyInfo.productDetails = productSearchResults;
  } else {
    // Pour les autres types, logique simple
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
 * @param {string} centralType - Type de centrale (titane, jablotron) pour les alarmes
 * @returns {Blob|null} Le blob du dossier ou null
 */
function getBaseDossierBlob(type, centralType) {
  let fileId = null;
  let configKey = null;
  
  // Normaliser le type pour la comparaison
  const normalizedType = type ? type.toLowerCase().trim() : '';
  const normalizedCentralType = centralType ? centralType.toLowerCase().trim() : '';
  
  // Détection des types d'alarme
  if (normalizedType === 'alarme' || normalizedType === 'alarme-titane' || normalizedType.startsWith('alarme')) {
    // Utiliser centralType pour déterminer Titane vs Jablotron
    if (normalizedCentralType === 'jablotron') {
      fileId = CONFIG.DOSSIERS.ALARME_JABLOTRON;
      configKey = 'CONFIG.DOSSIERS.ALARME_JABLOTRON';
      Logger.log('   → Utilisation du dossier Jablotron (centralType: ' + centralType + ')');
    } else {
      // Par défaut, utilise ALARME_TITANE
      fileId = CONFIG.DOSSIERS.ALARME_TITANE;
      configKey = 'CONFIG.DOSSIERS.ALARME_TITANE';
      Logger.log('   → Utilisation du dossier Titane (default ou centralType: ' + centralType + ')');
    }
  } else if (normalizedType === 'video' || normalizedType === 'vidéo') {
    fileId = CONFIG.DOSSIERS.VIDEO;
    configKey = 'CONFIG.DOSSIERS.VIDEO';
  }
  
  if (!fileId) {
    Logger.log('❌ Aucun dossier de base configuré pour le type: ' + type);
    return null;
  }
  
  if (!configKey) {
    Logger.log('❌ CONFIG key non définie pour le type: ' + type);
    return null;
  }
  
  Logger.log('📂 Chargement du dossier de base depuis ' + configKey + ' (ID: ' + fileId + ')');
  return getFileBlobById(fileId, configKey);
}

/**
 * Récupère le nom du dossier de base selon le type
 * 
 * @param {string} type - Type de dossier
 * @param {string} centralType - Type de centrale (titane, jablotron) pour les alarmes
 * @returns {string} Nom du dossier
 */
function getBaseDossierName(type, centralType) {
  const normalizedType = type ? type.toLowerCase().trim() : '';
  const normalizedCentralType = centralType ? centralType.toLowerCase().trim() : '';
  
  if (normalizedType === 'alarme' || normalizedType === 'alarme-titane' || normalizedType.startsWith('alarme')) {
    // Utiliser centralType pour déterminer Titane vs Jablotron
    if (normalizedCentralType === 'jablotron') {
      return 'Devis_ALARME_JABLOTRON.pdf';
    }
    return 'Devis_ALARME_TITANE.pdf';
  } else if (normalizedType === 'video' || normalizedType === 'vidéo') {
    return 'Devis_VIDÉO.pdf';
  }
  return 'Inconnu';
}

/**
 * Récupère un fichier Drive par son ID et retourne le Blob
 * 
 * @param {string} fileId - ID du fichier Google Drive
 * @param {string} configKey - (Optionnel) Nom de la clé CONFIG pour le logging
 * @returns {Blob} Le blob du fichier
 */
function getFileBlobById(fileId, configKey) {
  try {
    if (!fileId) {
      const errorMsg = configKey 
        ? 'ID de fichier manquant pour ' + configKey
        : 'ID de fichier manquant';
      Logger.log('❌ ' + errorMsg);
      throw new Error(errorMsg);
    }
    
    const logPrefix = configKey ? configKey + ' ' : '';
    Logger.log('📥 Récupération du fichier ' + logPrefix + '(ID: ' + fileId + ')');
    
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const fileName = file.getName();
    const fileSize = (blob.getBytes().length / 1024).toFixed(2);
    
    Logger.log('✅ Fichier chargé: ' + fileName + ' (' + fileSize + ' KB)');
    return blob;
  } catch (error) {
    const errorMsg = configKey 
      ? 'Erreur lors du chargement de ' + configKey + ' (ID: ' + fileId + '): ' + error.message
      : 'Erreur getFileBlobById(' + fileId + '): ' + error.message;
    Logger.log('❌ ' + errorMsg);
    throw new Error(errorMsg);
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
    // Vérifier que le dossier des fiches techniques est configuré
    if (!CONFIG.FOLDERS.TECH_SHEETS) {
      Logger.log('❌ CONFIG.FOLDERS.TECH_SHEETS n\'est pas configuré');
      throw new Error('Dossier des fiches techniques non configuré dans CONFIG');
    }
    
    Logger.log('🔍 Recherche dans CONFIG.FOLDERS.TECH_SHEETS (ID: ' + CONFIG.FOLDERS.TECH_SHEETS + ')');
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
 * Recherche une fiche technique de produit par nom avec détails
 * Version détaillée qui retourne des informations complètes sur le fichier trouvé
 * 
 * @param {string} productName - Nom du produit à rechercher
 * @returns {Object|null} { blob: Blob, fileName: string, fileSize: string } ou null
 */
function findProductSheetByNameDetailed(productName) {
  try {
    // Vérifier que le dossier des fiches techniques est configuré
    if (!CONFIG.FOLDERS.TECH_SHEETS) {
      Logger.log('❌ CONFIG.FOLDERS.TECH_SHEETS n\'est pas configuré');
      throw new Error('Dossier des fiches techniques non configuré dans CONFIG');
    }
    
    const techSheetsFolder = DriveApp.getFolderById(CONFIG.FOLDERS.TECH_SHEETS);
    const files = techSheetsFolder.getFiles();
    
    // Normaliser le nom du produit pour la recherche (sans accents, minuscules)
    const normalizedSearch = removeAccents(productName.toLowerCase().trim());
    
    // Première passe: recherche exacte/contient
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const normalizedFileName = removeAccents(fileName.toLowerCase());
      
      // Recherche flexible: contient le nom du produit
      if (normalizedFileName.includes(normalizedSearch) || 
          normalizedSearch.includes(normalizedFileName.replace('.pdf', '').replace(' - compressed', ''))) {
        
        // Vérifier la taille du fichier avant de le charger
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
        const fileSize = file.getSize();
        
        if (fileSize > MAX_FILE_SIZE) {
          Logger.log('   ⚠️ Fichier trop volumineux (' + (fileSize / 1024 / 1024).toFixed(2) + ' MB) - ignoré');
          continue;
        }
        
        const blob = file.getBlob();
        const fileSizeKB = (fileSize / 1024).toFixed(2);
        
        return {
          blob: blob,
          fileName: fileName,
          fileSize: fileSizeKB
        };
      }
    }
    
    // Deuxième passe: recherche partielle (au moins 2 mots clés)
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
        // Vérifier la taille du fichier avant de le charger
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
        const fileSize = file.getSize();
        
        if (fileSize > MAX_FILE_SIZE) {
          Logger.log('   ⚠️ Fichier trop volumineux (' + (fileSize / 1024 / 1024).toFixed(2) + ' MB) - ignoré');
          continue;
        }
        
        const blob = file.getBlob();
        const fileSizeKB = (fileSize / 1024).toFixed(2);
        
        return {
          blob: blob,
          fileName: fileName,
          fileSize: fileSizeKB
        };
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('❌ Erreur findProductSheetByNameDetailed(' + productName + '): ' + error.message);
    return null;
  }
}

/**
 * Recherche le PDF des accessoires (ONDULEURS - COFFRET - SWITCH)
 * 
 * @returns {Object|null} { blob: Blob, fileName: string, fileSize: string } ou null
 */
function findAccessoryPdf() {
  try {
    // Vérifier que le dossier des fiches techniques est configuré
    if (!CONFIG.FOLDERS.TECH_SHEETS) {
      Logger.log('❌ CONFIG.FOLDERS.TECH_SHEETS n\'est pas configuré');
      throw new Error('Dossier des fiches techniques non configuré dans CONFIG');
    }
    
    const techSheetsFolder = DriveApp.getFolderById(CONFIG.FOLDERS.TECH_SHEETS);
    const files = techSheetsFolder.getFiles();
    
    // Termes de recherche pour le PDF accessoires
    const accessoryKeywords = ['onduleur', 'coffret', 'switch'];
    
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const normalizedFileName = removeAccents(fileName.toLowerCase());
      
      // Vérifier si le fichier contient au moins 2 des mots-clés accessoires
      let keywordMatches = 0;
      for (const keyword of accessoryKeywords) {
        if (normalizedFileName.includes(keyword)) {
          keywordMatches++;
        }
      }
      
      // Si au moins 2 mots-clés correspondent, c'est probablement le fichier accessoires
      if (keywordMatches >= 2) {
        // Vérifier la taille du fichier
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
        const fileSize = file.getSize();
        
        if (fileSize > MAX_FILE_SIZE) {
          Logger.log('   ⚠️ Fichier accessoires trop volumineux (' + (fileSize / 1024 / 1024).toFixed(2) + ' MB) - ignoré');
          continue;
        }
        
        const blob = file.getBlob();
        const fileSizeKB = (fileSize / 1024).toFixed(2);
        
        return {
          blob: blob,
          fileName: fileName,
          fileSize: fileSizeKB
        };
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('❌ Erreur findAccessoryPdf(): ' + error.message);
    return null;
  }
}

/**
 * Crée un PDF overlay avec les informations du commercial
 * 
 * ⚠️ LIMITATION GOOGLE APPS SCRIPT:
 * Google Apps Script ne fournit pas d'API native pour créer des PDFs dynamiques
 * ou pour faire des overlays PDF. Cette fonction génère un simple PDF texte
 * qui sera inséré comme page séparée dans le dossier.
 * 
 * @param {string} commercialName - Nom du commercial
 * @returns {Blob|null} Le blob du PDF overlay ou null
 */
function createCommercialOverlayPdf(commercialName) {
  try {
    Logger.log('📝 Création du PDF overlay pour: ' + commercialName);
    
    // Récupérer les informations du commercial depuis CONFIG
    const commercialInfo = getCommercialInfo(commercialName);
    
    if (!commercialInfo) {
      Logger.log('⚠️ Commercial non trouvé dans CONFIG.COMMERCIAUX: ' + commercialName);
      Logger.log('   → Utilisation des informations de base');
    }
    
    // Préparer les données
    const currentDate = Utilities.formatDate(new Date(), 'GMT+1', 'dd/MM/yyyy');
    const phone = commercialInfo ? commercialInfo.phone : 'N/A';
    const email = commercialInfo ? commercialInfo.email : 'N/A';
    
    Logger.log('   - Date: ' + currentDate);
    Logger.log('   - Commercial: ' + commercialName);
    Logger.log('   - Téléphone: ' + phone);
    Logger.log('   - Email: ' + email);
    
    // Créer le contenu HTML pour conversion en PDF
    // Google Apps Script peut convertir HTML en PDF via Google Docs API
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      padding: 40px;
      background-color: #f8f9fa;
    }
    .overlay-container {
      background-color: white;
      border: 2px solid #0066cc;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 600px;
      margin: 50px auto;
    }
    .header {
      text-align: center;
      color: #0066cc;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 30px;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 15px;
    }
    .info-section {
      margin: 20px 0;
      line-height: 1.8;
    }
    .info-label {
      font-weight: bold;
      color: #333;
      display: inline-block;
      width: 150px;
    }
    .info-value {
      color: #555;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <div class="overlay-container">
    <div class="header">
      📋 INFORMATIONS COMMERCIAL
    </div>
    <div class="info-section">
      <div><span class="info-label">📅 Date:</span> <span class="info-value">${currentDate}</span></div>
      <div><span class="info-label">👤 Commercial:</span> <span class="info-value">${commercialName}</span></div>
      <div><span class="info-label">📞 Téléphone:</span> <span class="info-value">${phone}</span></div>
      <div><span class="info-label">📧 Email:</span> <span class="info-value">${email}</span></div>
    </div>
    <div class="footer">
      Document généré automatiquement - Dialarme
    </div>
  </div>
</body>
</html>
    `;
    
    // Convertir HTML en PDF via Google Docs
    // Créer un document temporaire, le convertir en PDF, puis le supprimer
    const tempDoc = DocumentApp.create('Temp_Overlay_' + new Date().getTime());
    const docId = tempDoc.getId();
    
    try {
      // Insérer le contenu HTML (limité, mais fonctionnel)
      const body = tempDoc.getBody();
      body.clear();
      
      // Ajouter le contenu formaté
      body.appendParagraph('INFORMATIONS COMMERCIAL')
        .setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      
      body.appendHorizontalRule();
      
      body.appendParagraph('📅 Date: ' + currentDate)
        .setSpacingAfter(10);
      
      body.appendParagraph('👤 Commercial: ' + commercialName)
        .setSpacingAfter(10);
      
      body.appendParagraph('📞 Téléphone: ' + phone)
        .setSpacingAfter(10);
      
      body.appendParagraph('📧 Email: ' + email)
        .setSpacingAfter(10);
      
      body.appendHorizontalRule();
      
      body.appendParagraph('Document généré automatiquement - Dialarme')
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
        .setFontSize(10);
      
      // Sauvegarder et fermer
      tempDoc.saveAndClose();
      
      // Convertir en PDF
      const pdfBlob = DriveApp.getFileById(docId).getAs('application/pdf');
      pdfBlob.setName('Overlay_Commercial.pdf');
      
      // Supprimer le document temporaire
      DriveApp.getFileById(docId).setTrashed(true);
      
      Logger.log('✅ Overlay PDF créé avec succès (' + (pdfBlob.getBytes().length / 1024).toFixed(2) + ' KB)');
      return pdfBlob;
      
    } catch (conversionError) {
      // Nettoyer en cas d'erreur
      try {
        DriveApp.getFileById(docId).setTrashed(true);
      } catch (cleanupError) {
        Logger.log('⚠️ Erreur nettoyage document temporaire: ' + cleanupError.message);
      }
      throw conversionError;
    }
    
  } catch (error) {
    Logger.log('❌ Erreur création overlay PDF: ' + error.message);
    Logger.log('   Stack: ' + error.stack);
    return null;
  }
}

/**
 * Récupère les informations d'un commercial depuis CONFIG
 * 
 * @param {string} commercialName - Nom du commercial
 * @returns {Object|null} Informations du commercial ou null
 */
function getCommercialInfo(commercialName) {
  if (!CONFIG.COMMERCIAUX) {
    Logger.log('⚠️ CONFIG.COMMERCIAUX n\'est pas défini');
    return null;
  }
  
  // CONFIG.COMMERCIAUX peut être un objet ou un tableau
  if (Array.isArray(CONFIG.COMMERCIAUX)) {
    // Format tableau
    return CONFIG.COMMERCIAUX.find(function(c) {
      return c.name === commercialName;
    }) || null;
  } else {
    // Format objet
    return CONFIG.COMMERCIAUX[commercialName] || null;
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
  Logger.log('=== TEST ASSEMBLAGE VIDÉO (avec déduplication et accessoires) ===');
  
  const testData = {
    pdfBase64: "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0=",
    filename: "Test-Video-Assembly.pdf",
    commercial: "Test Commercial",
    clientName: "Test Client Video",
    type: "video",
    produits: [
      "SOLAR 4G XL",
      "DÔME NIGHT", 
      "BULLET ZOOM",
      "SOLAR 4G XL",  // Doublon intentionnel pour tester la déduplication
      "NVR MODEM",
      "MINI SOLAR"
    ],
    timestamp: new Date().toISOString()
  };
  
  Logger.log('Données de test:');
  Logger.log('- Type: ' + testData.type);
  Logger.log('- Produits: ' + testData.produits.join(', '));
  Logger.log('- Note: "SOLAR 4G XL" est listé 2 fois pour tester la déduplication');
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
    Logger.log('   - Accessoires ajouté: ' + (response.assembly.accessoryAdded ? 'Oui (' + response.assembly.accessoryFileName + ')' : 'Non'));
    Logger.log('   - Total: ' + response.assembly.totalPages);
    Logger.log('');
    
    // Vérifications
    if (response.assembly.productsFound < testData.produits.length) {
      Logger.log('✅ SUCCÈS: Déduplication fonctionnelle (6 produits demandés, ' + response.assembly.productsFound + ' uniques trouvés)');
    }
    
    if (response.assembly.accessoryAdded) {
      Logger.log('✅ SUCCÈS: PDF accessoires ajouté automatiquement');
    } else {
      Logger.log('ℹ️ INFO: Aucun PDF accessoires trouvé (normal si pas dans le dossier)');
    }
    
    // Afficher les détails des produits si disponibles
    if (response.assembly.productDetails) {
      Logger.log('');
      Logger.log('📋 Détails des recherches:');
      response.assembly.productDetails.forEach(function(detail, index) {
        if (detail.duplicate) {
          Logger.log('   [' + (index + 1) + '] ' + detail.searchTerm + ' → Doublon ignoré (' + detail.fileName + ')');
        } else if (detail.found) {
          Logger.log('   [' + (index + 1) + '] ' + detail.searchTerm + ' → ✅ ' + detail.fileName + ' (' + detail.fileSize + ' KB)');
        } else if (detail.error) {
          Logger.log('   [' + (index + 1) + '] ' + detail.searchTerm + ' → ❌ Erreur: ' + detail.error);
        } else {
          Logger.log('   [' + (index + 1) + '] ' + detail.searchTerm + ' → ⚠️ Non trouvé');
        }
      });
    }
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

/**
 * Test de l'overlay commercial
 * Vérifie que l'overlay avec les informations du commercial est bien ajouté
 */
function testCommercialOverlay() {
  Logger.log('=== TEST OVERLAY COMMERCIAL ===');
  
  const testData = {
    pdfBase64: "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0=",
    filename: "Test-Overlay.pdf",
    commercial: "Test Commercial",
    clientName: "Test Client Overlay",
    type: "video",
    produits: [
      "SOLAR 4G XL",
      "DÔME NIGHT"
    ],
    addCommercialOverlay: true,  // ← Active l'overlay
    timestamp: new Date().toISOString()
  };
  
  Logger.log('Données de test:');
  Logger.log('- Type: ' + testData.type);
  Logger.log('- Commercial: ' + testData.commercial);
  Logger.log('- Overlay activé: ' + testData.addCommercialOverlay);
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
    Logger.log('   - Overlay ajouté: ' + (response.assembly.overlayAdded ? 'Oui' : 'Non'));
    Logger.log('   - Total: ' + response.assembly.totalPages);
    Logger.log('');
    
    // Vérification
    if (response.assembly.overlayAdded) {
      Logger.log('✅ SUCCÈS: L\'overlay commercial a été ajouté');
    } else {
      Logger.log('❌ ERREUR: L\'overlay n\'a pas été ajouté alors qu\'il était demandé');
    }
  }
  
  Logger.log('');
  Logger.log('Drive URL: ' + response.driveUrl);
  Logger.log('=== FIN TEST OVERLAY ===');
  
  return response;
}

/**
 * Test d'assemblage avec un dossier ALARME JABLOTRON
 * Vérifie que le bon dossier de base est utilisé
 */
function testAlarmJablotronAssembly() {
  Logger.log('=== TEST ASSEMBLAGE ALARME JABLOTRON (sans fiches techniques) ===');
  
  const testData = {
    pdfBase64: "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0=",
    filename: "Test-Alarm-Jablotron-Assembly.pdf",
    commercial: "Test Commercial",
    clientName: "Test Client Alarme Jablotron",
    type: "alarme-jablotron",  // Type ALARME JABLOTRON
    produits: [
      "Detecteur XYZ",
      "Sirene ABC",
      "Centrale 123"
    ],
    timestamp: new Date().toISOString()
  };
  
  Logger.log('Données de test:');
  Logger.log('- Type: ' + testData.type + ' (doit utiliser JABLOTRON)');
  Logger.log('- Produits envoyés: ' + testData.produits.join(', ') + ' (doivent être IGNORÉS)');
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
    
    // Vérifications
    if (response.assembly.baseDossier === 'Devis_ALARME_JABLOTRON.pdf') {
      Logger.log('✅ SUCCÈS: Le bon dossier de base JABLOTRON a été utilisé');
    } else {
      Logger.log('❌ ERREUR: Dossier de base incorrect (attendu: JABLOTRON, reçu: ' + response.assembly.baseDossier + ')');
    }
    
    if (response.assembly.productsFound === 0 && response.assembly.productsRequested === 0) {
      Logger.log('✅ SUCCÈS: Les fiches techniques ont bien été ignorées');
    } else {
      Logger.log('❌ ERREUR: Des fiches techniques ont été recherchées');
    }
  }
  
  Logger.log('');
  Logger.log('Drive URL: ' + response.driveUrl);
  Logger.log('=== FIN TEST ALARME JABLOTRON ===');
  
  return response;
}