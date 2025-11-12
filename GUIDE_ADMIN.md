# 📚 Guide d'Administration - Générateur de Devis Dialarme

Guide complet pour modifier les catalogues, ajouter des fiches techniques et modifier les templates PDF.

---

## 1. 📦 Modifier les Catalogues Produits

### Fichier à modifier : `src/lib/quote-generator.ts`

### 1.1 Catalogue Alarme (`CATALOG_ALARM_PRODUCTS`)

**Localisation** : Lignes 56-76

**Structure d'un produit** :
```typescript
{
  id: 8,                                    // ID unique (numéro)
  name: "Détecteur volumétrique (radio)",  // Nom exact affiché
  priceTitane: 240.00,                      // Prix pour Titane (optionnel)
  priceJablotron: 290.00,                   // Prix pour Jablotron (optionnel)
  monthlyTitane: 6,                         // Mensualité Titane (optionnel)
  monthlyJablotron: 7,                      // Mensualité Jablotron (optionnel)
  requiresJablotron: false                  // Uniquement Jablotron ? (optionnel)
}
```

**Exemples** :
- **Produit avec prix unique** : `{ id: 5, name: "Centrale Jablotron", price: 990.00 }`
- **Produit avec prix différents** : `{ id: 8, name: "Détecteur volumétrique", priceTitane: 240.00, priceJablotron: 290.00 }`
- **Produit uniquement Jablotron** : `{ id: 22, name: "Lecteur de badge", priceJablotron: 490.00, requiresJablotron: true }`

**Pour ajouter un produit** :
1. Ouvrir `src/lib/quote-generator.ts`
2. Trouver `CATALOG_ALARM_PRODUCTS` (ligne 56)
3. Ajouter une ligne dans le tableau :
```typescript
{ id: 99, name: "Nouveau produit", priceTitane: 100.00, priceJablotron: 120.00 },
```

**Pour modifier un prix** :
- Changer la valeur dans le tableau (ex: `priceTitane: 250.00`)

---

### 1.2 Catalogue Vidéo (`CATALOG_CAMERA_MATERIAL`)

**Localisation** : Lignes 78-107

**Structure d'un produit** :
```typescript
{
  id: 23,                           // ID unique
  name: "Bullet Mini",              // Nom exact (doit correspondre au PDF)
  price: 390.00,                    // Prix d'achat
  monthly48: 10,                    // Mensualité 48 mois
  monthly36: 13,                    // Mensualité 36 mois
  monthly24: 18                     // Mensualité 24 mois
}
```

**⚠️ IMPORTANT** : Le `name` doit correspondre **exactement** au nom du fichier PDF dans Google Drive (sans l'extension `.pdf`).

**Exemples** :
- Si le PDF s'appelle `Bullet Mini.pdf` → `name: "Bullet Mini"`
- Si le PDF s'appelle `Reo 4G + P.Solaire.pdf` → `name: "Reo 4G + P.Solaire"`

---

## 2. 📄 Ajouter des Fiches Techniques (PDF Produits)

### 2.1 Où placer les fichiers

**Dossier Google Drive** : Le dossier configuré dans `GOOGLE_DRIVE_FOLDER_PRODUCT_SHEETS` (ou `GOOGLE_DRIVE_FOLDER_TECH_SHEETS`)

**Comment vérifier le dossier** :
1. Ouvrir `src/lib/config.ts`
2. Ligne 77 : `productSheets: process.env.GOOGLE_DRIVE_FOLDER_PRODUCT_SHEETS`
3. Copier l'ID du dossier depuis les variables d'environnement Vercel

### 2.2 Règles de nommage

**Règle principale** : Le nom du fichier PDF doit correspondre **exactement** au `name` dans le catalogue.

**Exemples** :
| Nom dans le catalogue | Nom du fichier PDF |
|----------------------|-------------------|
| `Bullet Mini` | `Bullet Mini.pdf` |
| `Reo 4G + P.Solaire` | `Reo 4G + P.Solaire.pdf` |
| `Dôme Antivandale` | `Dôme Antivandale.pdf` |

**⚠️ Points importants** :
- ✅ Respecter les majuscules/minuscules
- ✅ Respecter les espaces
- ✅ Respecter les caractères spéciaux (`+`, `-`, etc.)
- ❌ Pas d'extension dans le catalogue, mais `.pdf` dans Drive

### 2.3 Processus d'ajout

1. **Créer/modifier** le PDF de la fiche technique
2. **Nommer** le fichier exactement comme dans le catalogue
3. **Uploader** dans le dossier Google Drive configuré
4. **Vérifier** que le produit existe dans `CATALOG_CAMERA_MATERIAL` avec le même nom

**Note** : Si le nom ne correspond pas, la fiche ne sera pas trouvée lors de l'assemblage du PDF.

---

## 3. 📋 Modifier les Fichiers de Base des Devis (Templates)

### 3.1 Fichiers de base

Les templates PDF sont stockés dans Google Drive et référencés par leur **ID**.

**Fichiers disponibles** :
- **Alarme Titane** : `GOOGLE_DRIVE_FILE_ALARME_TITANE` (défaut: `12Ntu8bsVpO_CXdAOvL2V_AZcnGo6sA-S`)
- **Alarme Jablotron** : `GOOGLE_DRIVE_FILE_ALARME_JABLOTRON` (défaut: `1enFlLv9q681uGBSwdRu43r8Co2nWytFf`)
- **Vidéo** : `GOOGLE_DRIVE_FILE_VIDEO` (défaut: `15daREPnmbS1T76DLUpUxBLWahWIyq_cn`)
- **Accessoires** : `GOOGLE_DRIVE_FILE_ACCESSORIES` (optionnel)

### 3.2 Comment obtenir l'ID d'un fichier Google Drive

1. Ouvrir le fichier dans Google Drive
2. Regarder l'URL : `https://drive.google.com/file/d/FILE_ID_HERE/view`
3. Copier la partie `FILE_ID_HERE`

### 3.3 Modifier un template

#### Option 1 : Remplacer le fichier existant (⭐ Recommandé)

1. Modifier le PDF dans Google Drive
2. Remplacer le fichier existant (même nom, même emplacement)
3. L'ID reste le même → **aucun changement de code nécessaire**

#### Option 2 : Utiliser un nouveau fichier

1. **Uploader** le nouveau PDF dans Google Drive
2. **Copier** l'ID du fichier
3. **Modifier dans Vercel** :
   - Aller dans **Settings** → **Environment Variables**
   - Modifier la variable correspondante :
     - `GOOGLE_DRIVE_FILE_ALARME_TITANE` (pour Titane)
     - `GOOGLE_DRIVE_FILE_ALARME_JABLOTRON` (pour Jablotron)
     - `GOOGLE_DRIVE_FILE_VIDEO` (pour Vidéo)
     - `GOOGLE_DRIVE_FILE_ACCESSORIES` (pour Accessoires)
4. **Redéployer** l'application

#### Option 3 : Modifier dans le code (⚠️ Non recommandé)

1. Ouvrir `src/lib/config.ts`
2. Lignes 99, 105, 111, 116
3. Modifier les valeurs par défaut (ex: `alarmTitane: 'NOUVEL_ID_ICI'`)
4. Commit + push → Vercel redéploie automatiquement

---

## 4. ✅ Checklist avant de Tester

### Modifications de catalogue
- [ ] Produit ajouté dans `CATALOG_ALARM_PRODUCTS` ou `CATALOG_CAMERA_MATERIAL`
- [ ] ID unique utilisé
- [ ] Prix corrects (Titane/Jablotron si applicable)
- [ ] Mensualités correctes (si applicable)

### Fiches techniques
- [ ] PDF uploadé dans le bon dossier Google Drive
- [ ] Nom du fichier = nom dans le catalogue (exact)
- [ ] Extension `.pdf` présente
- [ ] Fichier accessible (permissions Drive)

### Templates de base
- [ ] PDF modifié/remplacé dans Google Drive
- [ ] ID du fichier vérifié
- [ ] Variable d'environnement mise à jour (si nouveau fichier)
- [ ] Redéploiement effectué (si variable modifiée)

---

## 5. 🧪 Test Rapide

1. Générer un devis avec le nouveau produit
2. Vérifier que le produit apparaît dans la liste
3. Vérifier que le prix est correct
4. Vérifier que la fiche technique est ajoutée (pour vidéo)
5. Vérifier que le template de base est correct

---

## 6. 🔧 Support

### Fichiers importants
- `src/lib/quote-generator.ts` → Catalogues produits
- `src/lib/config.ts` → Configuration Drive et commerciaux
- Google Drive → Fiches techniques et templates

### En cas de problème
- Vérifier les logs dans la console du navigateur (F12)
- Vérifier les logs Vercel (Dashboard → Deployments → Logs)
- Vérifier que les noms correspondent exactement

---

## 7. 💡 Bon à Savoir

- ✅ Les modifications de code nécessitent un commit + push (redéploiement automatique sur Vercel)
- ✅ Les modifications dans Google Drive sont **immédiates** (pas de redéploiement)
- ⚠️ Les variables d'environnement nécessitent un redéploiement manuel

---

## 8. 📝 Exemples Pratiques

### Exemple 1 : Ajouter un nouveau produit alarme

```typescript
// Dans src/lib/quote-generator.ts, ligne ~75
{ id: 25, name: "Nouveau détecteur", priceTitane: 150.00, priceJablotron: 180.00, monthlyTitane: 4, monthlyJablotron: 5 },
```

### Exemple 2 : Ajouter un nouveau produit vidéo

```typescript
// Dans src/lib/quote-generator.ts, ligne ~107
{ id: 54, name: "Nouvelle caméra", price: 500.00, monthly48: 13, monthly36: 17, monthly24: 24 },
```

**Puis** :
1. Créer le PDF `Nouvelle caméra.pdf`
2. Uploader dans le dossier Google Drive des fiches techniques

### Exemple 3 : Modifier un prix

```typescript
// Avant
{ id: 23, name: "Bullet Mini", price: 390.00, ... }

// Après
{ id: 23, name: "Bullet Mini", price: 420.00, ... }
```

---

**Dernière mise à jour** : 2025-01-12

