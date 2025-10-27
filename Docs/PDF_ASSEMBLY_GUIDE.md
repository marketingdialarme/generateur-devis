# 📦 Guide d'Assemblage PDF Automatique

## 🎯 Vue d'ensemble

Le système d'assemblage PDF automatique permet de créer un **dossier complet** en fusionnant:

1. **Dossier de base** (template) - Conditions générales, présentation entreprise
2. **Devis généré** - Le PDF créé par le frontend avec les produits sélectionnés
3. **Fiches techniques** - Les PDFs des produits depuis Google Drive

**Résultat**: Un seul PDF professionnel contenant toutes les informations nécessaires.

---

## 🔄 Fonctionnement

### Workflow d'assemblage

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND ENVOIE                          │
│  {pdfBase64, filename, type: "alarme", produits: [...]}    │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              ÉTAPE 1: Dossier de base                       │
│  - Si type === "alarme" → ALARME_TITANE.pdf                │
│  - Si type === "video" → VIDEO.pdf                         │
│  - Récupère le fichier depuis Drive (CONFIG.DOSSIERS)      │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              ÉTAPE 2: Devis généré                          │
│  - Décode le PDF du devis reçu en base64                   │
│  - Prêt pour la fusion                                      │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│        ÉTAPE 3: Fiches techniques produits                  │
│  Pour chaque produit dans la liste:                         │
│    - Recherche dans CONFIG.FOLDERS.TECH_SHEETS              │
│    - Matching flexible (case-insensitive, mots-clés)       │
│    - Ajoute le PDF s'il est trouvé                         │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              ÉTAPE 4: Fusion PDF                            │
│  Utilities.pdfMerge([dossier, devis, ...produits])        │
│  → Un seul PDF final                                        │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│         RÉSULTAT: Dossier complet assemblé                  │
│  - Envoyé par email                                         │
│  - Sauvegardé dans Drive                                    │
│  - Métadonnées retournées au frontend                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Structure des données

### Requête du frontend

```javascript
{
  "pdfBase64": "JVBERi0xLjMK...",  // PDF du devis encodé en base64
  "filename": "Devis-Client-2025.pdf",
  "commercial": "Arnaud Bloch",
  "clientName": "Entreprise ABC",
  "type": "alarme",                 // ou "video"
  "produits": [                     // Liste des noms de produits
    "Détecteur de mouvement PIR",
    "Sirène extérieure",
    "Centrale d'alarme Titane"
  ],
  "timestamp": "2025-10-26T18:00:00.000Z"
}
```

### Réponse du backend

```javascript
{
  "success": true,
  "emailSent": true,
  "driveUrl": "https://drive.google.com/file/d/...",
  "message": "Dossier complet assemblé, envoyé par email et sauvegardé dans Drive",
  "filename": "Devis-Client-2025.pdf",
  "commercial": "Arnaud Bloch",
  "clientName": "Entreprise ABC",
  "timestamp": "2025-10-26T18:00:05.123Z",
  "duration": 5.123,
  "assembly": {                      // Informations d'assemblage
    "baseDossier": "Devis_ALARME_TITANE.pdf",
    "productsFound": 3,              // Nombre de fiches trouvées
    "productsRequested": 3,          // Nombre de produits demandés
    "totalPages": "5 fichiers fusionnés"
  }
}
```

---

## 🔧 Fonctions principales

### 1. `assemblePdfDossier()`

**Rôle**: Orchestre tout le processus d'assemblage

```javascript
function assemblePdfDossier(quotePdfBlob, type, produits, filename)
```

**Paramètres**:
- `quotePdfBlob` (Blob): PDF du devis déjà décodé
- `type` (string): "alarme" ou "video"
- `produits` (Array<string>): Liste des noms de produits
- `filename` (string): Nom du fichier final

**Retour**:
```javascript
{
  blob: Blob,        // PDF fusionné
  info: {
    baseDossier: string,
    productsFound: number,
    productsRequested: number,
    totalPages: string
  }
}
```

**Logs typiques**:
```
🔧 === DÉBUT ASSEMBLAGE PDF ===
📁 Étape 1: Récupération du dossier de base (type: alarme)
✅ Dossier de base ajouté: Devis_ALARME_TITANE.pdf
📄 Étape 2: Ajout du devis généré
✅ Devis ajouté
🔍 Étape 3: Recherche des fiches techniques (3 produits)
   [1/3] Recherche: Détecteur de mouvement PIR
   ✓ Match trouvé: detecteur-pir-titane.pdf
   ✅ Trouvé: Détecteur de mouvement PIR
   [2/3] Recherche: Sirène extérieure
   ✓ Match trouvé: sirene-exterieure.pdf
   ✅ Trouvé: Sirène extérieure
   [3/3] Recherche: Centrale d'alarme Titane
   ✓ Match trouvé: centrale-titane.pdf
   ✅ Trouvé: Centrale d'alarme Titane
📊 Récapitulatif: 3/3 fiches trouvées
🔨 Étape 4: Fusion des PDFs (5 fichiers)
🔨 Fusion de 5 PDFs...
✅ Fusion réussie: 2345.67 KB
✅ Fusion terminée: Devis-Client-2025.pdf
✅ === FIN ASSEMBLAGE PDF ===
```

---

### 2. `getBaseDossierBlob(type)`

**Rôle**: Récupère le template de base selon le type

```javascript
function getBaseDossierBlob(type)
```

**Logique**:
- `type === "alarme"` → `CONFIG.DOSSIERS.ALARME_TITANE`
- `type === "video"` → `CONFIG.DOSSIERS.VIDEO`
- Sinon → `null`

**Note**: Pour l'instant, utilise ALARME_TITANE par défaut. À raffiner pour choisir entre TITANE et JABLOTRON selon les produits.

---

### 3. `findProductSheetByName(productName)`

**Rôle**: Recherche une fiche technique dans le dossier `TECH_SHEETS`

```javascript
function findProductSheetByName(productName)
```

**Algorithme de recherche** (2 passes):

#### Passe 1: Correspondance exacte
```javascript
// Normalisation
searchName = "centrale titane" // (lowercase + trim)
fileName = "centrale-titane.pdf"

// Matching
if (fileName.includes(searchName) || searchName.includes(fileName)) {
  return file.getBlob();
}
```

#### Passe 2: Correspondance partielle
```javascript
// Découpage en mots-clés
searchWords = ["centrale", "titane"]

// Comptage des matches
matchCount = 0;
for each word in searchWords {
  if (word.length > 2 && fileName.includes(word)) {
    matchCount++;
  }
}

// Si au moins 2 mots correspondent (ou tous si < 2 mots)
if (matchCount >= min(2, searchWords.length)) {
  return file.getBlob();
}
```

**Exemples**:

| Produit demandé | Fichier dans Drive | Match? | Raison |
|-----------------|-------------------|--------|--------|
| "Detecteur PIR" | "detecteur-pir-titane.pdf" | ✅ | Passe 1: contient "detecteur" et "pir" |
| "Centrale Titane" | "centrale-alarme-titane.pdf" | ✅ | Passe 2: 2/2 mots clés |
| "Camera 4MP" | "camera-ip-4mp-dahua.pdf" | ✅ | Passe 2: "camera" + "4mp" |
| "Sirène" | "sirene-exterieure-ajax.pdf" | ✅ | Passe 1: contient "sirene" |
| "Produit Inconnu" | (aucun fichier) | ❌ | Aucune correspondance |

---

### 4. `mergePdfs(blobsArray, filename)`

**Rôle**: Fusionne plusieurs PDFs en un seul

```javascript
function mergePdfs(blobsArray, filename)
```

**Utilise**: `Utilities.pdfMerge()` (API Google Apps Script native)

**Gestion d'erreur**:
```javascript
try {
  const mergedPdf = Utilities.pdfMerge(blobsArray);
  mergedPdf.setName(filename);
  return mergedPdf;
} catch (error) {
  throw new Error('Impossible de fusionner les PDFs: ' + error.message);
}
```

---

## 🧪 Tests

### Test 1: Recherche de produits

```javascript
// Dans Google Apps Script, exécutez:
testProductSearch()
```

**Ce test**:
- Recherche 5 produits types (Detecteur, Sirene, Centrale, Camera, Clavier)
- Affiche si chaque fiche est trouvée
- Montre le nom du fichier et la taille

**Logs attendus**:
```
=== TEST RECHERCHE PRODUITS ===
Recherche: Detecteur
✅ Trouvé: detecteur-pir-titane.pdf (245.32 KB)
---
Recherche: Sirene
✅ Trouvé: sirene-exterieure-ajax.pdf (189.45 KB)
---
...
=== FIN TEST RECHERCHE ===
```

---

### Test 2: Assemblage complet

```javascript
// Dans Google Apps Script, exécutez:
testPdfAssembly()
```

**Ce test**:
- Simule l'envoi d'un devis avec type "alarme"
- Demande 3 fiches produits (Detecteur, Sirene, Centrale)
- Assemble le dossier complet
- Envoie l'email et sauvegarde dans Drive

**Résultat attendu**:
```
=== TEST ASSEMBLAGE PDF ===
Données de test:
- Type: alarme
- Produits: Detecteur, Sirene, Centrale
...
🔧 === DÉBUT ASSEMBLAGE PDF ===
...
✅ === FIN ASSEMBLAGE PDF ===
...
=== RÉSULTAT DU TEST ===
Success: true
Message: Dossier complet assemblé, envoyé par email et sauvegardé dans Drive
Assembly Info:
- Dossier de base: Devis_ALARME_TITANE.pdf
- Produits trouvés: 3/3
- Total pages: 5 fichiers fusionnés
Drive URL: https://drive.google.com/file/d/...
=== FIN TEST ===
```

---

## 📂 Configuration requise

### Dans `config.gs`

```javascript
FOLDERS: {
  TECH_SHEETS: '1d8TprEVWym_swFXaEaUZK90PShP5zcIs'  // Dossier des fiches
}

DOSSIERS: {
  ALARME_TITANE: '1yQeOxjlzHIN6H0p_rAiVw5TQNLlggRit',    // Template alarme
  ALARME_JABLOTRON: '1NsVNGcTTIGqZNzNZbPxHbBseaHF_WigS', // Template Jablotron
  VIDEO: '1_ZzXmMgL4ZFrzp4yAmMT1vG2T7gKqM6r'           // Template vidéo
}
```

### Organisation des fichiers Drive

```
📁 Devis (CONFIG.FOLDERS.DEVIS)
   └── 📁 [Nom Commercial]/
       └── 📄 Devis-Client-2025.pdf (dossier complet assemblé)

📁 Fiches techniques (CONFIG.FOLDERS.TECH_SHEETS)
   ├── 📄 detecteur-pir-titane.pdf
   ├── 📄 sirene-exterieure-ajax.pdf
   ├── 📄 centrale-alarme-titane.pdf
   ├── 📄 camera-ip-4mp-dahua.pdf
   └── ...

📄 Devis_ALARME_TITANE.pdf (CONFIG.DOSSIERS.ALARME_TITANE)
📄 Devis_ALARME_JABLOTRON.pdf (CONFIG.DOSSIERS.ALARME_JABLOTRON)
📄 Devis_VIDÉO.pdf (CONFIG.DOSSIERS.VIDEO)
```

---

## ⚙️ Personnalisation

### Ajouter un nouveau type de dossier

1. **Ajouter l'ID dans `config.gs`**:
```javascript
DOSSIERS: {
  ALARME_TITANE: '...',
  ALARME_JABLOTRON: '...',
  VIDEO: '...',
  BROUILLARD: 'NEW_FILE_ID_HERE'  // Nouveau
}
```

2. **Modifier `getBaseDossierBlob()`**:
```javascript
function getBaseDossierBlob(type) {
  if (type === 'alarme') return getFileBlobById(CONFIG.DOSSIERS.ALARME_TITANE);
  else if (type === 'video') return getFileBlobById(CONFIG.DOSSIERS.VIDEO);
  else if (type === 'brouillard') return getFileBlobById(CONFIG.DOSSIERS.BROUILLARD);  // Nouveau
  return null;
}
```

3. **Modifier `getBaseDossierName()`**:
```javascript
function getBaseDossierName(type) {
  if (type === 'alarme') return 'Devis_ALARME_TITANE.pdf';
  else if (type === 'video') return 'Devis_VIDÉO.pdf';
  else if (type === 'brouillard') return 'Devis_BROUILLARD.pdf';  // Nouveau
  return 'Inconnu';
}
```

---

### Améliorer la recherche de produits

Pour une recherche encore plus précise, vous pouvez modifier `findProductSheetByName()`:

**Option 1: Mapping exact**
```javascript
const PRODUCT_MAPPING = {
  'Détecteur PIR': 'detecteur-pir-titane.pdf',
  'Sirène Ajax': 'sirene-exterieure-ajax.pdf',
  // ...
};

function findProductSheetByName(productName) {
  if (PRODUCT_MAPPING[productName]) {
    return getFileByName(PRODUCT_MAPPING[productName]);
  }
  // Sinon, utiliser l'algorithme de recherche flexible
}
```

**Option 2: Regex personnalisées**
```javascript
const PRODUCT_PATTERNS = [
  { pattern: /d[ée]tecteur.*pir/i, file: 'detecteur-pir-titane.pdf' },
  { pattern: /sir[èe]ne.*ext/i, file: 'sirene-exterieure-ajax.pdf' },
  // ...
];
```

---

## 🐛 Dépannage

### Problème: Aucune fiche produit trouvée

**Causes possibles**:
1. **Nom du produit mal orthographié** dans le frontend
2. **Fichier absent** dans le dossier TECH_SHEETS
3. **Nom du fichier trop différent** du nom du produit

**Solution**:
1. Exécuter `testProductSearch()` pour voir les noms exacts
2. Vérifier que les fichiers sont bien dans le bon dossier Drive
3. Renommer les fichiers pour qu'ils correspondent mieux aux noms de produits

---

### Problème: Erreur lors de la fusion

**Erreur**:
```
❌ Erreur lors de la fusion PDF: ...
```

**Causes possibles**:
1. **PDF corrompu** (base, devis, ou fiche)
2. **Taille totale trop grande** (limite Google: ~50 MB)
3. **Format incompatible** (fichier non-PDF)

**Solution**:
1. Vérifier que tous les fichiers sont des PDFs valides
2. Réduire le nombre de fiches ou optimiser leur taille
3. Tester chaque fichier individuellement avec `getFileBlobById()`

---

### Problème: Mauvais dossier de base sélectionné

**Symptôme**: Le template Titane est utilisé alors qu'on veut Jablotron

**Solution actuelle**: L'algorithme choisit TITANE par défaut pour "alarme"

**À implémenter**:
```javascript
function getBaseDossierBlob(type, produits) {
  if (type === 'alarme') {
    // Logique de sélection intelligente
    const hasJablotron = produits.some(p => 
      p.toLowerCase().includes('jablotron')
    );
    
    if (hasJablotron) {
      return getFileBlobById(CONFIG.DOSSIERS.ALARME_JABLOTRON);
    } else {
      return getFileBlobById(CONFIG.DOSSIERS.ALARME_TITANE);
    }
  }
  // ...
}
```

---

## 📊 Statistiques d'assemblage

L'objet `assembly` dans la réponse contient des métriques utiles:

```javascript
{
  "baseDossier": "Devis_ALARME_TITANE.pdf",  // Template utilisé
  "productsFound": 3,                         // Fiches trouvées
  "productsRequested": 3,                     // Fiches demandées
  "totalPages": "5 fichiers fusionnés"        // Résumé
}
```

**Taux de réussite**:
```
Taux = (productsFound / productsRequested) × 100%
```

**Exemple**: 3/3 = 100% ✅

---

## 🎯 Bonnes pratiques

### Nommage des fichiers dans TECH_SHEETS

✅ **Bon**:
- `detecteur-pir-titane.pdf`
- `sirene-exterieure-ajax.pdf`
- `centrale-alarme-jablotron.pdf`

❌ **Mauvais**:
- `FT_001.pdf` (trop générique)
- `Doc1.pdf` (aucun mot-clé)
- `fiche-produit.pdf` (pas de différenciation)

### Nommage des produits dans le frontend

✅ **Bon**: Utiliser des noms descriptifs avec mots-clés
```javascript
produits: [
  "Détecteur PIR Titane",
  "Sirène extérieure Ajax",
  "Centrale d'alarme"
]
```

❌ **Mauvais**: Noms trop vagues
```javascript
produits: [
  "Produit 1",
  "Item A",
  "Équipement"
]
```

---

**Version**: 2.0  
**Dernière mise à jour**: Octobre 2025  
**Auteur**: Système Dialarme

