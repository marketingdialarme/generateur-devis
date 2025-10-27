# Générateur de Devis Dialarme

Système professionnel de génération de devis PDF pour alarmes, caméras de surveillance et générateurs de brouillard, avec envoi automatique par email et sauvegarde dans Google Drive.

## Fonctionnalités

- **Alarmes** - Devis pour systèmes Titane et Jablotron
- **Caméras** - Vidéosurveillance avec options de location
- **Générateurs de brouillard** - Système de sécurité avancé
- **Envoi automatique** - Email + Google Drive
- **Téléchargement local** - PDF disponible immédiatement
- **Retry automatique** - 3 tentatives en cas d'échec
- **Compatible tous appareils** - iPad, iPhone, Android, ordinateurs

## Dernières améliorations (Task 1 - Compatibilité iPad)

### Backend (Google Apps Script)
Logging détaillé pour debugging  
Support multi-format des données (postData, parameter, parameters)  
Réponses JSON structurées avec métadonnées  
Gestion d'erreurs améliorée

### Frontend (JavaScript)
Détection automatique du navigateur/appareil  
Méthodes adaptées par plateforme:
  - `sendViaFetch()` pour Chrome, Firefox, Edge
  - `sendViaFormSubmit()` pour iOS/Safari  
Retry automatique avec backoff exponentiel (3 tentatives)  
Timeout de 30 secondes avec gestion spéciale iOS  
Validation de l'URL Google Script  
Notifications utilisateur avec feedback visuel

## Structure du projet

```
generateur-devis/
├── index.html              # Interface utilisateur (HTML)
├── frontend/
│   ├── script.js          # Logique JavaScript (2,700+ lignes)
│   └── style.css          # Styles CSS
├── backend/
│   └── google-script.gs   # Google Apps Script (email + Drive)
├── DEPLOYMENT_GUIDE.md    # Guide de déploiement complet
├── test-upload.html       # Page de test pour l'upload
└── README.md             # Ce fichier
```

## Installation rapide

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-repo/generateur-devis.git
   cd generateur-devis
   ```

2. **Configurer Google Apps Script**
   - Voir le guide détaillé dans `DEPLOYMENT_GUIDE.md`
   - Copier `backend/google-script.gs` sur script.google.com
   - Déployer comme Web App
   - Copier l'URL de déploiement

3. **Configurer l'URL dans le frontend**
   - Ouvrir `frontend/script.js`
   - Ligne 250: Coller votre URL Google Script
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/VOTRE_ID/exec';
   ```

4. **Ouvrir index.html**
   - Double-cliquer sur `index.html`
   - Ou servir avec un serveur web local

## 🧪 Tests

### Test rapide
Ouvrir `test-upload.html` dans le navigateur pour tester uniquement le système d'upload.

### Test complet
1. Ouvrir `index.html`
2. Remplir un devis (alarme, caméra ou brouillard)
3. Sélectionner un commercial
4. Cliquer "Générer le PDF"
5. Vérifier:
   - PDF téléchargé localement
   - Email reçu
   - Fichier dans Google Drive

## 🔧 Configuration

### Variables importantes

**Backend (`backend/google-script.gs`):**
```javascript
const MAIN_FOLDER_ID = 'VOTRE_FOLDER_ID';  // ID du dossier Google Drive
const EMAIL_DESTINATION = 'votre@email.com';
```

**Frontend (`frontend/script.js`):**
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/...';  // Ligne 250
const MAX_RETRIES = 3;      // Nombre de tentatives (ligne 1532)
const TIMEOUT_MS = 30000;   // Timeout en ms (ligne 1533)
```

### Catalogues produits

Modifier les catalogues dans `frontend/script.js`:
- `COMMERCIALS_LIST` (ligne 6) - Liste des commerciaux
- `CATALOG_ALARM_PRODUCTS` (ligne 27) - Produits alarmes
- `CATALOG_CAMERA_MATERIAL` (ligne 59) - Matériel caméras
- `CATALOG_FOG_MATERIAL` (ligne 91) - Matériel brouillard
- Prix et configurations (lignes 104-249)

### Logs Google Apps Script
1. Aller sur script.google.com
2. Ouvrir votre projet
3. "Exécutions" → Voir les logs

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[Docs/UPDATE_INSTRUCTIONS.md](./Docs/UPDATE_INSTRUCTIONS.md)** | 📘 **Guide de mise à jour et maintenance** - Comment modifier les fichiers, ajouter des produits, gérer les commerciaux |
| **[Docs/DEPLOYMENT.md](./Docs/DEPLOYMENT.md)** | Guide complet de déploiement du backend Google Apps Script |
| **[Docs/PDF_ASSEMBLY_GUIDE.md](./Docs/PDF_ASSEMBLY_GUIDE.md)** | Guide technique sur le système d'assemblage automatique des PDF |
| **[Docs/README.md](./Docs/README.md)** | Documentation technique du backend |

### 📝 Pour les non-développeurs

Si vous voulez simplement **mettre à jour des fichiers PDF, ajouter un commercial ou modifier des paramètres**, consultez le **[Guide de mise à jour](./Docs/UPDATE_INSTRUCTIONS.md)** - aucune connaissance en programmation requise !

## Support

### Problèmes courants

**"URL Google Script non configurée"**
→ Vérifier ligne 250 de `frontend/script.js`

**"Données manquantes"**
→ Sélectionner un commercial avant de générer

**Timeout sur iOS**
→ Normal, le système assume un succès

**Email non reçu**
→ Vérifier le destinataire dans `backend/google-script.gs`

### Version 1.0
- Génération de devis PDF
- Envoi email basique
- Sauvegarde Google Drive

## 📄 Licence

Propriétaire - Dialarme

## 👥 Contributeurs

Développé pour Dialarme
