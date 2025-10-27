# 🔧 Backend - Google Apps Script

Ce dossier contient tous les fichiers du backend Google Apps Script pour le générateur de devis Dialarme.

## 📁 Structure des fichiers

```
backend/
├── config.gs           # Configuration centralisée (IDs, emails, commerciaux)
├── google-script.gs    # Logique principale (doPost, email, Drive)
├── DEPLOYMENT.md       # Guide complet de déploiement
└── README.md           # Ce fichier
```

## 🎯 Architecture

### **config.gs** - Configuration centralisée

Contient toutes les valeurs configurables:

- **FOLDERS**: IDs des dossiers Google Drive principaux
  - `DEVIS`: Dossier contenant les devis par commercial
  - `TECH_SHEETS`: Dossier des fiches techniques produits

- **DOSSIERS**: IDs des modèles PDF de base
  - `ALARME_TITANE`: Template Titane
  - `ALARME_JABLOTRON`: Template Jablotron
  - `VIDEO`: Template Vidéo

- **COMMERCIAUX**: Configuration de chaque commercial
  - Téléphone
  - Email
  - Folder ID (sous-dossier personnel dans "Devis")

- **EMAIL**: Configuration des emails
  - Destination
  - Expéditeur

- **APP**: Paramètres de l'application
  - Nom
  - Version
  - Timeout

**Fonctions helper:**
- `testConfigAccess()`: Test de la configuration
- `getCommercialInfo(name)`: Récupère les infos d'un commercial
- `commercialExists(name)`: Vérifie l'existence d'un commercial
- `getAllCommercials()`: Liste tous les commerciaux

### **google-script.gs** - Logique principale

Gère le traitement des requêtes et l'intégration Google Drive/Email.

**Endpoints:**

- **`doPost(e)`**: Webhook principal
  - Reçoit le PDF en base64 du frontend
  - Optionnel: Type de dossier + liste de produits
  - Décode le PDF du devis généré
  - **Assemble le dossier complet** (si type et produits fournis):
    - Récupère le dossier de base (template)
    - Fusionne: [Dossier de base] → [Devis] → [Fiches produits]
  - Envoie l'email avec le PDF final
  - Sauvegarde dans Google Drive
  - Retourne le résultat JSON avec info d'assemblage

- **`doGet(e)`**: Status et callbacks
  - Retourne le statut du script
  - Gère les callbacks pour les confirmations

**Fonctions principales:**

- `sendEmailWithPDF()`: Envoie le devis par email
- `saveToDrive()`: Sauvegarde le PDF dans Drive
- `getOrCreateCommercialFolder()`: Gère les dossiers par commercial
- `createJsonResponse()`: Formatte les réponses JSON avec CORS

**Fonctions d'assemblage PDF:**

- `assemblePdfDossier()`: Orchestre l'assemblage complet du dossier
- `getBaseDossierBlob()`: Récupère le template de base selon le type
- `getFileBlobById()`: Récupère un fichier Drive par ID
- `findProductSheetByName()`: Recherche une fiche technique par nom (flexible)
- `mergePdfs()`: Fusionne plusieurs PDFs en un seul

**Fonctions de test:**

- `testScript()`: Test basique (dossiers + email)
- `testManual()`: Test complet avec PDF fictif
- `testPdfAssembly()`: Test d'assemblage PDF avec produits
- `testProductSearch()`: Test de recherche de fiches techniques

## 🚀 Déploiement rapide

### 1. Copier les fichiers dans Google Apps Script

1. Allez sur [script.google.com](https://script.google.com)
2. Créez/ouvrez le projet "Dialarme PDF Generator"
3. Ajoutez `config.gs` comme nouveau script
4. Ajoutez/modifiez `google-script.gs`
5. Enregistrez tout

### 2. Tester

```javascript
// Sélectionnez et exécutez:
testConfigAccess()
```

Vérifiez les logs → tout doit être ✅

### 3. Déployer

1. **Déployer** → **Nouveau déploiement**
2. Type: **Application Web**
3. Accès: **Tout le monde**
4. **Copiez l'URL** → Mettez-la dans `frontend/script.js`

### 4. Vérifier

```javascript
// Sélectionnez et exécutez:
testManual()
```

Résultat attendu:
- ✅ Email reçu à `devis.dialarme@gmail.com`
- ✅ Fichier dans Drive → Devis → Test Commercial

## 🔄 Workflow de développement

### Modification de la configuration

1. Éditez `config.gs` dans Google Apps Script
2. **Enregistrez** (Ctrl+S)
3. Testez avec `testConfigAccess()`
4. **Gérer les déploiements** → **Modifier** → **Nouvelle version**

### Modification de la logique

1. Éditez `google-script.gs`
2. **Enregistrez**
3. Testez avec `testManual()`
4. **Gérer les déploiements** → **Modifier** → **Nouvelle version**

⚠️ **Important**: En utilisant "Gérer les déploiements" → "Modifier", l'URL reste la même (pas besoin de mettre à jour le frontend!)

## 📊 Flux de données

### **Sans assemblage (devis seul)**
```
Frontend (script.js)
    ↓
    │ HTTP POST
    │ {pdfBase64, filename, commercial, clientName}
    ↓
doPost() [google-script.gs]
    ↓
    ├─→ sendEmailWithPDF()
    │      ↓
    │   MailApp.sendEmail()
    │   (vers CONFIG.EMAIL.DESTINATION)
    │
    ├─→ saveToDrive()
    │      ↓
    │   DriveApp.getFolderById(CONFIG.FOLDERS.DEVIS)
    │      ↓
    │   getOrCreateCommercialFolder()
    │      ↓
    │   folder.createFile(pdfBlob)
    │
    ↓
Retourne JSON {success, emailSent, driveUrl, ...}
```

### **Avec assemblage (dossier complet)**
```
Frontend (script.js)
    ↓
    │ HTTP POST
    │ {pdfBase64, filename, commercial, clientName, type, produits[]}
    ↓
doPost() [google-script.gs]
    ↓
    ├─→ assemblePdfDossier()
    │      ↓
    │   1. getBaseDossierBlob(type)
    │      → DriveApp.getFileById(CONFIG.DOSSIERS.ALARME_TITANE)
    │      
    │   2. Décode le PDF du devis (quotePdfBlob)
    │      
    │   3. Pour chaque produit:
    │      findProductSheetByName(productName)
    │      → DriveApp.getFolderById(CONFIG.FOLDERS.TECH_SHEETS)
    │      → Recherche flexible par nom
    │      
    │   4. mergePdfs([baseDossier, quote, ...products])
    │      → Utilities.pdfMerge()
    │      
    │   ↓ Retourne {blob: mergedPdf, info: {...}}
    │
    ├─→ sendEmailWithPDF(mergedPdf, ...)
    │      ↓
    │   Email avec info d'assemblage
    │
    ├─→ saveToDrive(mergedPdf, ...)
    │      ↓
    │   Sauvegarde le PDF complet
    │
    ↓
Retourne JSON {success, emailSent, driveUrl, assembly: {...}}
```

## 🧪 Tests disponibles

| Fonction | Description | Résultat attendu |
|----------|-------------|------------------|
| `testConfigAccess()` | Vérifie la configuration | Logs avec tous les IDs + accès Drive confirmé |
| `testScript()` | Test dossiers + email | Dossier créé + email reçu |
| `testManual()` | Test complet avec PDF | Email + fichier Drive |
| `testPdfAssembly()` | **Test assemblage complet** | Dossier de base + devis + fiches produits fusionnés |
| `testProductSearch()` | Test recherche de fiches | Liste des produits trouvés dans TECH_SHEETS |

## 🔐 Permissions requises

Le script nécessite les autorisations suivantes:

- **Gmail** (`MailApp`): Envoi d'emails
- **Google Drive** (`DriveApp`): Lecture/écriture de fichiers et dossiers
- **Utilities** (`Utilities`): Encodage/décodage base64

Ces permissions sont demandées lors de la première exécution.

## 📋 Checklist avant production

- [ ] `config.gs` avec tous les IDs corrects
- [ ] `google-script.gs` à jour
- [ ] `testConfigAccess()` ✅
- [ ] `testManual()` ✅
- [ ] Déploiement en mode "Tout le monde"
- [ ] URL mise à jour dans le frontend
- [ ] Test frontend → backend réussi

## 🐛 Logs et débogage

### Voir les logs

1. **Pendant l'exécution**: "Affichage" → "Logs"
2. **Après l'exécution**: Cliquez sur "Exécutions" (⏱️) → Sélectionnez l'exécution

### Logs typiques d'une requête réussie

```
=== Début de doPost ===
Timestamp: 2025-10-24T16:20:26.323Z
Données reçues via parameter.data
Validation - PDF présent: true
Validation - Filename: Devis-Client-2025.pdf
Validation - Commercial: Arnaud Bloch
Validation - Client: Client Test
Décodage du PDF...
PDF décodé - Taille: 45678 bytes
Envoi de l'email...
Email envoyé avec succès à devis.dialarme@gmail.com
Email envoyé: true
Sauvegarde dans Drive...
Fichier sauvegardé dans Drive: https://drive.google.com/file/d/...
Drive URL: https://drive.google.com/file/d/...
=== Fin de doPost (succès) - Durée: 5.2s ===
```

## 📚 Documentation complète

Pour plus de détails sur le déploiement, consultez **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

**Version actuelle**: 2.0  
**Dernière mise à jour**: Octobre 2025  
**Maintenu par**: Équipe Dialarme

