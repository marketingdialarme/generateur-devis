# 📘 Guide de Mise à Jour et Maintenance - Dialarme PDF Generator

Ce guide explique comment mettre à jour et maintenir le système de génération de devis PDF Dialarme **sans avoir besoin de connaissances en programmation**.

---

## 📋 Table des matières

1. [Comment trouver un ID Google Drive](#1-comment-trouver-un-id-google-drive)
2. [Mettre à jour les dossiers de base (Alarme, Vidéo)](#2-mettre-à-jour-les-dossiers-de-base-alarme-vidéo)
3. [Ajouter de nouvelles fiches techniques produits](#3-ajouter-de-nouvelles-fiches-techniques-produits)
4. [Ajouter ou modifier un commercial](#4-ajouter-ou-modifier-un-commercial)
5. [Modifier l'email de destination](#5-modifier-lemail-de-destination)
6. [Redéployer le script Google Apps Script](#6-redéployer-le-script-google-apps-script)
7. [Tester les modifications](#7-tester-les-modifications)
8. [Résolution de problèmes](#8-résolution-de-problèmes)

---

## 1. Comment trouver un ID Google Drive

Tous les fichiers et dossiers dans Google Drive ont un **ID unique**. Voici comment le trouver :

### Pour un DOSSIER :

1. Ouvrez le dossier dans Google Drive
2. Regardez l'URL dans la barre d'adresse de votre navigateur
3. L'URL ressemble à ceci :
   ```
   https://drive.google.com/drive/u/1/folders/1BoUAYoJa6uING8-GKZo-ZEPhqql_7SkX
   ```
4. **L'ID est la partie après `/folders/`** :
   ```
   1BoUAYoJa6uING8-GKZo-ZEPhqql_7SkX
   ```

### Pour un FICHIER :

1. Ouvrez le fichier dans Google Drive (ou faites clic-droit → "Obtenir le lien")
2. L'URL ressemble à :
   ```
   https://drive.google.com/file/d/1yQeOxjlzHIN6H0p_rAiVw5TQNLlggRit/view
   ```
3. **L'ID est la partie après `/d/` et avant `/view`** :
   ```
   1yQeOxjlzHIN6H0p_rAiVw5TQNLlggRit
   ```

---

## 2. Mettre à jour les dossiers de base (Alarme, Vidéo)

Les **dossiers de base** sont les templates PDF qui sont fusionnés avec le devis généré.

### Scénario : Vous avez refait le fichier "Devis_ALARME_TITANE.pdf"

#### Étape 1 : Téléverser le nouveau fichier sur Google Drive

1. Ouvrez Google Drive
2. Allez dans le dossier où vous stockez vos templates (peu importe lequel)
3. Téléversez votre nouveau fichier PDF
4. **Copiez l'ID du fichier** (voir section 1 ci-dessus)

#### Étape 2 : Mettre à jour `config.gs`

1. Allez sur [https://script.google.com](https://script.google.com)
2. Ouvrez votre projet "Générateur de Devis Dialarme"
3. Cliquez sur le fichier **`config.gs`** dans la barre latérale gauche
4. Trouvez la section **DOSSIERS** (environ ligne 40) :

```javascript
DOSSIERS: {
  /**
   * Modèle de base pour les devis Alarme Titane
   * Fichier: Devis_ALARME_TITANE.pdf
   */
  ALARME_TITANE: '1yQeOxjlzHIN6H0p_rAiVw5TQNLlggRit',
  
  /**
   * Modèle de base pour les devis Alarme Jablotron
   * Fichier: Devis_ALARME_JABLOTRON.pdf
   */
  ALARME_JABLOTRON: '1NsVNGcTTIGqZNzNZbPxHbBseaHF_WigS',
  
  /**
   * Modèle de base pour les devis Vidéosurveillance
   * Fichier: Devis_VIDÉO.pdf
   */
  VIDEO: '1_ZzXmMgL4ZFrzp4yAmMT1vG2T7gKqM6r'
},
```

5. **Remplacez l'ancien ID par le nouveau** :

```javascript
ALARME_TITANE: 'VOTRE_NOUVEL_ID_ICI',
```

6. Cliquez sur **💾 Enregistrer** (icône disquette en haut)
7. **Redéployez le script** (voir section 6)

### Exemple complet : Ajouter une nouvelle alarme "Alarme XYZ"

Si vous avez besoin d'ajouter un **nouveau type d'alarme** (par exemple début 2026) :

1. Téléversez le fichier `Devis_ALARME_XYZ.pdf` sur Google Drive
2. Copiez son ID : `1ABC123DEF456GHI789`
3. Dans `config.gs`, ajoutez une nouvelle ligne dans la section `DOSSIERS` :

```javascript
DOSSIERS: {
  ALARME_TITANE: '1yQeOxjlzHIN6H0p_rAiVw5TQNLlggRit',
  ALARME_JABLOTRON: '1NsVNGcTTIGqZNzNZbPxHbBseaHF_WigS',
  ALARME_XYZ: '1ABC123DEF456GHI789',  // ← Nouvelle alarme
  VIDEO: '1_ZzXmMgL4ZFrzp4yAmMT1vG2T7gKqM6r'
},
```

4. ⚠️ **Important** : Vous devrez aussi contacter le développeur pour mettre à jour le code dans `google-script.gs` afin que cette nouvelle alarme soit reconnue automatiquement.

---

## 3. Ajouter de nouvelles fiches techniques produits

Les **fiches techniques** sont les PDFs des produits (caméras, détecteurs, etc.) qui sont automatiquement ajoutés au dossier final.

### Étape 1 : Préparer le fichier PDF

1. **Nommage important** : Le nom du fichier doit correspondre au nom du produit dans l'application
   - Exemple : Si le produit s'appelle "DÔME NIGHT" dans l'app, nommez le fichier `DÔME NIGHT.pdf`
   - ⚠️ Les accents sont gérés automatiquement, pas de souci

2. **Compresser le PDF** (IMPORTANT) :
   - Le système peut gérer des fichiers jusqu'à **50 MB maximum**
   - Au-delà, le fichier sera ignoré
   - Utilisez un compresseur PDF en ligne :
     - [iLovePDF](https://www.ilovepdf.com/fr/compresser_pdf) (recommandé)
     - [SmallPDF](https://smallpdf.com/fr/compresser-pdf)
   - Paramètres recommandés : **Compression "Recommandée"** ou **DPI 150**

### Étape 2 : Téléverser dans Google Drive

1. Ouvrez Google Drive
2. Allez dans le dossier **"Fiches techniques"**
   - URL actuelle : `https://drive.google.com/drive/u/1/folders/1weDBc3uH8FXzrEET1oLrWajFoSstzQTx`
3. **Glissez-déposez** votre nouveau fichier PDF dans ce dossier
4. **C'est tout !** Le système détectera automatiquement le nouveau fichier

### Étape 3 : Vérifier la détection

Pour vérifier que le fichier est bien reconnu :

1. Allez sur [https://script.google.com](https://script.google.com)
2. Ouvrez votre projet
3. Cliquez sur **`google-script.gs`**
4. Trouvez la fonction `testProductSearch()` (ligne ~1400)
5. Modifiez le nom du produit pour tester :

```javascript
function testProductSearch() {
  Logger.log('=== TEST RECHERCHE PRODUIT ===');
  
  // Remplacez par le nom de votre nouveau produit
  const productName = 'VOTRE_NOUVEAU_PRODUIT';
  
  Logger.log('Recherche: ' + productName);
  const result = findProductSheetByName(productName);
  
  if (result) {
    Logger.log('✅ Trouvé: ' + result.getName());
  } else {
    Logger.log('❌ Non trouvé');
  }
}
```

6. Cliquez sur **Exécuter** (▶️) en haut
7. Regardez les **logs** (cliquez sur "Exécution" en bas)

### Cas particuliers

#### Pour les produits vidéo - Accessoires

Le système détecte automatiquement le fichier **"ONDULEURS - COFFRET - SWITCH.pdf"** et l'ajoute à la fin des dossiers vidéo.

Si vous voulez modifier ce fichier :

1. Téléversez le nouveau fichier dans le dossier "Fiches techniques"
2. **Nommez-le exactement** : `ONDULEURS - COFFRET - SWITCH.pdf`
3. Le système le détectera automatiquement

---

## 4. Ajouter ou modifier un commercial

### Ajouter un nouveau commercial

#### Étape 1 : Ajouter dans `config.gs`

1. Allez sur [https://script.google.com](https://script.google.com)
2. Ouvrez **`config.gs`**
3. Trouvez la section **COMMERCIAUX** (ligne ~65)
4. Ajoutez une nouvelle entrée :

```javascript
COMMERCIAUX: {
  // ... commerciaux existants ...
  
  'Nouveau Commercial': {
    phone: '06 12 34 56 78',
    email: 'nouveau.commercial@dialarme.fr',
    folder: 'ID_DU_DOSSIER_GOOGLE_DRIVE'  // Optionnel
  },
  
  // ... autres commerciaux ...
}
```

#### Étape 2 : Créer le sous-dossier dans Google Drive

1. Ouvrez le dossier principal **"Devis"** dans Google Drive
2. Créez un nouveau dossier : `Nouveau Commercial`
3. Copiez l'ID du dossier (voir section 1)
4. Collez l'ID dans `config.gs` à la place de `'ID_DU_DOSSIER_GOOGLE_DRIVE'`

#### Étape 3 : Ajouter dans le frontend

⚠️ **Important** : Il faut aussi ajouter le commercial dans l'application frontend.

1. Ouvrez le fichier **`frontend/script.js`**
2. Trouvez la section `COMMERCIALS_LIST` (ligne ~6)
3. Ajoutez le nom :

```javascript
const COMMERCIALS_LIST = [
    "Arnaud Bloch",
    "Benali Kodad",
    "Bryan Debrosse",
    "Nouveau Commercial",  // ← Ajoutez ici
    // ... autres commerciaux
];
```

4. Sauvegardez le fichier

### Modifier les informations d'un commercial existant

Pour changer le téléphone ou l'email :

1. Ouvrez **`config.gs`**
2. Trouvez le commercial dans la section `COMMERCIAUX`
3. Modifiez les informations :

```javascript
'Arnaud Bloch': {
  phone: '06 99 88 77 66',  // ← Nouveau numéro
  email: 'arnaud.nouveau@dialarme.fr',  // ← Nouvel email
  folder: 'ID_EXISTANT'
},
```

4. Enregistrez et redéployez

---

## 5. Modifier l'email de destination

L'email de destination est l'adresse qui reçoit tous les devis générés.

1. Ouvrez **`config.gs`**
2. Trouvez la section **EMAIL** (ligne ~220) :

```javascript
EMAIL: {
  /**
   * Adresse email de destination pour les devis
   */
  DESTINATION: 'devis.dialarme@gmail.com',
  
  /**
   * Nom de l'expéditeur (affiché dans l'email)
   */
  SENDER_NAME: 'Dialarme - Générateur de Devis'
},
```

3. Remplacez l'adresse email :

```javascript
DESTINATION: 'nouvelle.adresse@dialarme.fr',
```

4. Vous pouvez aussi modifier le nom de l'expéditeur si nécessaire

5. Enregistrez et redéployez

---

## 6. Redéployer le script Google Apps Script

⚠️ **IMPORTANT** : Après toute modification dans `config.gs` ou `google-script.gs`, vous devez **redéployer** le script.

### Méthode complète (recommandée)

1. Allez sur [https://script.google.com](https://script.google.com)
2. Ouvrez votre projet "Générateur de Devis Dialarme"
3. Cliquez sur **Déployer** (en haut à droite) → **Gérer les déploiements**
4. Cliquez sur l'icône **✏️ Modifier** à côté du déploiement actif
5. Dans "Version", sélectionnez **Nouvelle version**
6. Ajoutez une description (exemple : "Mise à jour commercial")
7. Cliquez sur **Déployer**
8. ✅ **L'URL reste la même** - pas besoin de la changer dans le frontend

### Vérification

Après le redéploiement, vérifiez que tout fonctionne :

1. Ouvrez `index.html` dans votre navigateur
2. Créez un devis de test
3. Vérifiez :
   - ✅ Email reçu
   - ✅ Fichier dans Google Drive
   - ✅ PDF téléchargé localement

---

## 7. Tester les modifications

Le script Google Apps Script contient plusieurs **fonctions de test** que vous pouvez exécuter pour vérifier que tout fonctionne.

### Test 1 : Vérifier la configuration

1. Ouvrez `google-script.gs`
2. Trouvez la fonction `validateConfig()` (ligne ~19)
3. Cliquez sur le nom de la fonction pour la sélectionner
4. Cliquez sur **▶️ Exécuter**
5. Regardez les **logs** (en bas) :

```
✅ Configuration valide - tous les paramètres sont présents
  - CONFIG.FOLDERS.DEVIS: 1BoUAYoJa6uING8-GKZo-ZEPhqql_7SkX
  - CONFIG.FOLDERS.TECH_SHEETS: 1weDBc3uH8FXzrEET1oLrWajFoSstzQTx
  - CONFIG.EMAIL.DESTINATION: devis.dialarme@gmail.com
```

### Test 2 : Tester l'envoi d'un devis

1. Trouvez la fonction `testManual()` (ligne ~1200)
2. Exécutez-la
3. Vérifiez :
   - Email reçu
   - Fichier dans Google Drive

### Test 3 : Tester l'assemblage PDF

1. Trouvez la fonction `testPdfAssembly()` (ligne ~1300)
2. Exécutez-la
3. Regardez les logs pour voir si les PDFs sont bien fusionnés

### Test 4 : Tester la recherche de produits

1. Trouvez `testRealProducts()` (ligne ~1400)
2. Modifiez les noms de produits si nécessaire
3. Exécutez et vérifiez que les fichiers sont trouvés

---

## 8. Résolution de problèmes

### ❌ Problème : "Le produit n'est pas trouvé"

**Causes possibles :**

1. Le nom du fichier PDF ne correspond pas exactement au nom du produit
2. Le fichier n'est pas dans le bon dossier Google Drive
3. Le fichier est trop volumineux (> 50 MB)

**Solution :**

1. Vérifiez le nom exact du produit dans l'application
2. Renommez le fichier PDF pour qu'il corresponde exactement
3. Compressez le PDF si nécessaire
4. Testez avec `testProductSearch()`

### ❌ Problème : "Configuration invalide"

**Causes possibles :**

1. Un ID Google Drive est incorrect
2. Une virgule manquante ou en trop dans `config.gs`

**Solution :**

1. Exécutez `validateConfig()` pour voir quel paramètre pose problème
2. Vérifiez les IDs Google Drive
3. Vérifiez la syntaxe JavaScript (virgules, guillemets)

### ❌ Problème : "L'email n'arrive pas"

**Causes possibles :**

1. L'adresse email de destination est incorrecte
2. Les permissions Google Apps Script ne sont pas accordées

**Solution :**

1. Vérifiez `CONFIG.EMAIL.DESTINATION`
2. Allez dans les paramètres du script → Autorisations
3. Vérifiez que l'autorisation "Envoyer des emails" est accordée
4. Testez avec `testManual()`

### ❌ Problème : "Le fichier n'apparaît pas dans Drive"

**Causes possibles :**

1. L'ID du dossier `CONFIG.FOLDERS.DEVIS` est incorrect
2. Les permissions Google Drive ne sont pas accordées

**Solution :**

1. Vérifiez l'ID du dossier "Devis"
2. Vérifiez que le script a l'autorisation d'écrire dans Google Drive
3. Testez avec `testManual()`

### ❌ Problème : "Après redéploiement, rien ne fonctionne"

**Solution :**

1. Vérifiez que l'URL de déploiement n'a pas changé
2. Si l'URL a changé, mettez-la à jour dans `frontend/script.js` (ligne ~250)
3. Videz le cache de votre navigateur (Ctrl + F5)

---

## 📞 Support

Si vous rencontrez un problème non documenté ici :

1. **Vérifiez les logs** sur script.google.com → Exécutions
2. **Notez le message d'erreur exact**
3. Contactez le support technique avec :
   - Le message d'erreur
   - Ce que vous avez essayé de faire
   - Les captures d'écran si possible

---

## 📝 Résumé des fichiers importants

| Fichier | Emplacement | Rôle |
|---------|-------------|------|
| `config.gs` | Google Apps Script | **Configuration centrale** - IDs Drive, emails, commerciaux |
| `google-script.gs` | Google Apps Script | Code backend - assemblage PDF, envoi email |
| `script.js` | `frontend/script.js` | Code frontend - génération PDF, interface |
| `index.html` | Racine | Interface utilisateur de l'application |

---

## ✅ Checklist de mise à jour

Après chaque modification, vérifiez :

- [ ] Les IDs Google Drive sont corrects
- [ ] La syntaxe JavaScript est correcte (virgules, guillemets)
- [ ] Le script est enregistré (💾)
- [ ] Le script est redéployé (Déployer → Gérer les déploiements)
- [ ] `validateConfig()` retourne ✅ succès
- [ ] Un test manuel fonctionne (`testManual()`)
- [ ] L'email arrive correctement
- [ ] Le fichier apparaît dans Google Drive

---

**Dernière mise à jour** : Octobre 2024  
**Version du système** : 3.0

