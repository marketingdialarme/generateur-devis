/**
* Script Google Apps Script pour Dialarme
* Gère l'envoi d'emails et le stockage dans Google Drive
*/
// ID du dossier principal dans Google Drive
const MAIN_FOLDER_ID = '1BoUAYoJa6uING8-GKZo-ZEPhqql_7SkX';
const EMAIL_DESTINATION = 'devis.dialarme@gmail.com';
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
    
    Logger.log('Validation - PDF présent: ' + (!!pdfBase64));
    Logger.log('Validation - Filename: ' + filename);
    Logger.log('Validation - Commercial: ' + commercial);
    Logger.log('Validation - Client: ' + clientName);
    
    if (!pdfBase64 || !filename || !commercial) {
      return createJsonResponse({
        success: false,
        error: 'Données manquantes (PDF, nom de fichier ou commercial)',
        timestamp: new Date().toISOString()
      });
    }
    
    // Décoder le PDF
    Logger.log('Décodage du PDF...');
    const pdfBlob = Utilities.newBlob(
      Utilities.base64Decode(pdfBase64),
      'application/pdf',
      filename
    );
    Logger.log('PDF décodé - Taille: ' + pdfBlob.getBytes().length + ' bytes');
    
    // 1. Envoyer l'email
    Logger.log('Envoi de l\'email...');
    const emailSent = sendEmailWithPDF(pdfBlob, filename, commercial, clientName);
    Logger.log('Email envoyé: ' + emailSent);
    
    // 2. Sauvegarder dans Google Drive
    Logger.log('Sauvegarde dans Drive...');
    const driveUrl = saveToDrive(pdfBlob, filename, commercial);
    Logger.log('Drive URL: ' + driveUrl);
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    Logger.log('=== Fin de doPost (succès) - Durée: ' + duration + 's ===');
    
    return createJsonResponse({
      success: true,
      emailSent: emailSent,
      driveUrl: driveUrl,
      message: 'PDF envoyé par email et sauvegardé dans Drive',
      filename: filename,
      commercial: commercial,
      clientName: clientName,
      timestamp: new Date().toISOString(),
      duration: duration
    });
    
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
    version: '2.0',
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
function sendEmailWithPDF(pdfBlob, filename, commercial, clientName) {
try {
const subject = `Nouveau devis Dialarme - ${clientName} - ${commercial}`;
const body = `
Bonjour,
Un nouveau devis a été généré :
📄 Nom du fichier : ${filename}
👤 Client : ${clientName}
💼 Commercial : ${commercial}
📅 Date : ${new Date().toLocaleDateString('fr-CH')}
Le PDF est en pièce jointe.
Cordialement,
Système Dialarme
`;
MailApp.sendEmail({
to: EMAIL_DESTINATION,
subject: subject,
body: body,
attachments: [pdfBlob],
name: 'Dialarme - Générateur de Devis'
});
Logger.log('Email envoyé avec succès à ' + EMAIL_DESTINATION);
return true;
} catch (error) {
Logger.log('Erreur lors de l\'envoi de l\'email: ' + error);
return false;
}
}
/**
* Sauvegarde le PDF dans Google Drive
*/
function saveToDrive(pdfBlob, filename, commercial) {
try {
// Récupérer le dossier principal

const mainFolder = DriveApp.getFolderById(MAIN_FOLDER_ID);
// Chercher ou créer le dossier du commercial
const commercialFolder = getOrCreateCommercialFolder(mainFolder, commercial);
// Sauvegarder le fichier
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
/**
* Fonction de test (à exécuter manuellement)
*/
function testScript() {
try {
// Test de création de dossiers

const mainFolder = DriveApp.getFolderById(MAIN_FOLDER_ID);
const testFolder = getOrCreateCommercialFolder(mainFolder, 'Test Commercial');
Logger.log('Test réussi. Dossier: ' + testFolder.getName());
// Test d'envoi d'email
MailApp.sendEmail({
to: EMAIL_DESTINATION,
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