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
try {
// Permettre les requêtes CORS
const output = ContentService.createTextOutput();
output.setMimeType(ContentService.MimeType.JSON);
// Parser les données reçues
let data;
try {
if (e.postData && e.postData.contents) {
data = JSON.parse(e.postData.contents);
} else if (e.parameter && e.parameter.data) {
data = JSON.parse(e.parameter.data);
} else {
throw new Error('Aucune donnée reçue');
}
} catch (parseError) {
Logger.log('Erreur de parsing: ' + parseError);
return output.setContent(JSON.stringify({
success: false,
error: 'Erreur de parsing des données'
}));
}
const pdfBase64 = data.pdfBase64;
const filename = data.filename;
const commercial = data.commercial;
const clientName = data.clientName || 'Client';
if (!pdfBase64 || !filename || !commercial) {
return output.setContent(JSON.stringify({
success: false,
error: 'Données manquantes (PDF, nom de fichier ou commercial)'
}));

}
// Décoder le PDF
const pdfBlob = Utilities.newBlob(
Utilities.base64Decode(pdfBase64),
'application/pdf',
filename
);
// 1. Envoyer l'email
const emailSent = sendEmailWithPDF(pdfBlob, filename, commercial, clientName);
// 2. Sauvegarder dans Google Drive
const driveUrl = saveToDrive(pdfBlob, filename, commercial);
return output.setContent(JSON.stringify({
success: true,
emailSent: emailSent,
driveUrl: driveUrl,
message: 'PDF envoyé par email et sauvegardé dans Drive'
}));
} catch (error) {
Logger.log('Erreur globale: ' + error.toString());
const output = ContentService.createTextOutput();
output.setMimeType(ContentService.MimeType.JSON);
return output.setContent(JSON.stringify({
success: false,
error: error.toString()
}));
}
}
/**
* Fonction GET pour tester le script
*/
function doGet(e) {
return ContentService.createTextOutput(
JSON.stringify({
status: 'Script Dialarme actif',
version: '1.0',
endpoints: {
post: 'Envoyer PDF avec données JSON'
}
})
).setMimeType(ContentService.MimeType.JSON);

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