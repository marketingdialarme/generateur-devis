# Guide de Déploiement - Backend Google Apps Script

## Vue d'ensemble

Le backend est composé de deux fichiers qui doivent être déployés ensemble dans Google Apps Script:

1. **`config.gs`** - Configuration centralisée (IDs Drive, emails, commerciaux)
2. **`google-script.gs`** - Logique principale (traitement PDF, email, Drive)

---

## Déploiement Initial

### Étape 1: Accéder à Google Apps Script

1. Ouvrez votre navigateur et allez sur [script.google.com](https://script.google.com)
2. Connectez-vous avec le compte **devis.dialarme@gmail.com**
3. Créez un nouveau projet ou ouvrez le projet existant "Dialarme PDF Generator"

### Étape 2: Ajouter les fichiers

#### **Fichier 1: config.gs**

1. Dans Google Apps Script, cliquez sur **"+"** à côté de "Fichiers"
2. Sélectionnez **"Script"**
3. Nommez-le **"config"** (l'extension .gs sera ajoutée automatiquement)
4. Copiez-collez tout le contenu de `backend/config.gs`
5. Cliquez sur **Enregistrer** (ou Ctrl+S)

#### **Fichier 2: google-script.gs**

1. Si vous avez un fichier `Code.gs` existant, renommez-le en **"google-script"**
2. Sinon, créez un nouveau fichier script nommé **"google-script"**
3. Copiez-collez tout le contenu de `backend/google-script.gs`
4. Cliquez sur **Enregistrer**

### Étape 3: Tester la configuration

1. Dans la liste déroulante des fonctions (en haut), sélectionnez **`testConfigAccess`**
2. Cliquez sur le bouton **▶Exécuter**
3. Si c'est la première fois:
   - Une fenêtre d'autorisation apparaîtra
   - Cliquez sur **"Examiner les autorisations"**
   - Sélectionnez votre compte
   - Cliquez sur **"Autoriser"**
4. Une fois exécuté, cliquez sur **"Affichage" → "Logs"** ou **"Exécution"**
5. Vérifiez que les logs affichent:
   ```
   === TEST DE CONFIGURATION ===
   Dossiers principaux:
     - Devis: 1BoUAYoJa6uING8-GKZo-ZEPhqql_7SkX
     - Fiches techniques: 1d8TprEVWym_swFXaEaUZK90PShP5zcIs
   Modèles de base:
     - Alarme Titane: 1yQeOxjlzHIN6H0p_rAiVw5TQNLlggRit
     ...
   Configuration chargée avec succès!
   ```

### Étape 4: Déployer le webhook

1. En haut à droite, cliquez sur **"Déployer"** → **"Nouveau déploiement"**
2. Cliquez sur l'icône **⚙️** à côté de "Sélectionner le type"
3. Choisissez **"Application Web"**
4. Configurez:
   - **Description**: "Dialarme PDF Generator v2 - Config centralisée"
   - **Exécuter en tant que**: Moi (votre email)
   - **Qui peut accéder**: **Tout le monde**
5. Cliquez sur **"Déployer"**
6. **Copiez l'URL du déploiement** (elle ressemble à: `https://script.google.com/macros/s/AKfyc...`)
7. **Important**: Cette URL doit être mise à jour dans `frontend/script.js`:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'VOTRE_URL_ICI';
   ```

---

## Configuration des IDs Google Drive

### Trouver un ID de dossier/fichier:

1. Ouvrez Google Drive
2. Naviguez vers le dossier ou fichier
3. L'URL contient l'ID:
   ```
   https://drive.google.com/drive/folders/[ID_DU_DOSSIER]
   https://drive.google.com/file/d/[ID_DU_FICHIER]/view
   ```
4. Copiez l'ID et remplacez-le dans `config.gs`

### Configuration des commerciaux:

Pour chaque commercial dans `CONFIG.COMMERCIAUX`:

1. **Téléphone**: Remplacez `'06 XX XX XX XX'` par le vrai numéro
2. **Email**: Remplacez par l'email réel du commercial
3. **Folder ID** (optionnel):
   - Ouvrez le dossier "Devis" dans Drive
   - Ouvrez le sous-dossier du commercial
   - Copiez l'ID depuis l'URL
   - Remplacez `'ID_TO_REPLACE'` par l'ID réel

**Exemple:**
```javascript
'Arnaud Bloch': {
  phone: '06 12 34 56 78',
  email: 'arnaud.bloch@dialarme.fr',
  folder: '1ABcDeFgHiJkLmNoPqRsTuVwXyZ123456'
}
```

---

## Mise à jour du déploiement

Quand vous modifiez le code:

### Méthode 1: Nouveau déploiement (recommandé pour les tests)

1. Modifiez les fichiers dans Google Apps Script
2. **Enregistrez** (Ctrl+S)
3. Cliquez sur **"Déployer"** → **"Nouveau déploiement"**
4. Nouvelle URL générée → Mettez à jour le frontend

### Méthode 2: Gérer les déploiements (production)

1. Modifiez les fichiers
2. **Enregistrez**
3. Cliquez sur **"Déployer"** → **"Gérer les déploiements"**
4. Cliquez sur **Modifier** à côté du déploiement actif
5. Changez **"Version"** → **"Nouvelle version"**
6. Cliquez sur **"Déployer"**
7. **L'URL reste la même** - pas besoin de mettre à jour le frontend!

---

## Tests

### Test 1: Configuration

```javascript
// Dans Google Apps Script, exécutez:
testConfigAccess()
```

**Résultat attendu**: Logs avec tous les IDs + confirmation d'accès aux dossiers

### Test 2: Backend complet

```javascript
// Dans Google Apps Script, exécutez:
testManual()
```

**Résultat attendu**: 
- Email reçu à `devis.dialarme@gmail.com`
- Fichier créé dans Drive → Devis → Test Commercial

### Test 3: Frontend → Backend

1. Ouvrez `index.html` dans votre navigateur
2. Remplissez le formulaire
3. Générez un PDF
4. Vérifiez:
   - PDF téléchargé
   - Email reçu
   - Fichier dans Drive

---

## Fonctions utiles disponibles

### Dans `config.gs`:

```javascript
// Tester la configuration
testConfigAccess()

// Récupérer les infos d'un commercial
getCommercialInfo('Arnaud Bloch')

// Vérifier si un commercial existe
commercialExists('Test Commercial')

// Obtenir tous les commerciaux
getAllCommercials()
```

### Dans `google-script.gs`:

```javascript
// Test complet du système
testScript()

// Test manuel avec données fictives
testManual()
```

---

## Checklist de déploiement

- [ ] Fichier `config.gs` ajouté et enregistré
- [ ] Fichier `google-script.gs` ajouté et enregistré
- [ ] IDs des dossiers Drive vérifiés et corrects
- [ ] IDs des modèles PDF vérifiés et corrects
- [ ] Informations des commerciaux complétées
- [ ] `testConfigAccess()` exécuté avec succès
- [ ] Application web déployée en mode "Tout le monde"
- [ ] URL du déploiement copiée
- [ ] URL mise à jour dans `frontend/script.js`
- [ ] Test frontend → backend réussi
- [ ] Email de test reçu
- [ ] Fichier de test dans Google Drive

---

## Dépannage

### Erreur: "CONFIG is not defined"

**Cause**: Le fichier `config.gs` n'est pas chargé

**Solution**: 
1. Vérifiez que `config.gs` est bien dans le projet
2. Rafraîchissez la page du script
3. Réenregistrez les deux fichiers

### Erreur: "Cannot read property 'DEVIS' of undefined"

**Cause**: La structure de CONFIG est incorrecte

**Solution**: 
1. Vérifiez que CONFIG est bien un objet avec FOLDERS, DOSSIERS, etc.
2. Exécutez `testConfigAccess()` pour diagnostiquer

### Erreur 403 lors de l'accès aux dossiers

**Cause**: Permissions insuffisantes

**Solution**:
1. Vérifiez que le compte qui exécute le script a accès aux dossiers Drive
2. Réautorisez le script (Exécuter une fonction → Autoriser)

### Les emails n'arrivent pas

**Cause**: Quota Gmail dépassé ou permissions manquantes

**Solution**:
1. Vérifiez les quotas: [Google Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas)
2. Limite: 100 emails/jour pour compte gratuit, 1500/jour pour Workspace
3. Vérifiez que `MailApp` est autorisé

---

## Support

Pour toute question sur le déploiement:
- Consultez les logs d'exécution dans Google Apps Script
- Vérifiez le fichier `README.md` principal
- Testez avec `testConfigAccess()` et `testManual()`

**Version actuelle**: 2.0  
**Dernière mise à jour**: Octobre 2025

