# Fiches Techniques - Problèmes Restants

## Issues nécessitant une intervention manuelle sur Google Drive

### 1. Problème d'encodage PDF - SOLAR 4G (Issue #4)

**Symptôme:** Sur la fiche SOLAR 4G, le tableau de la deuxième page affiche des carrés au lieu de caractères.

**Cause:** Le fichier PDF stocké dans Google Drive a un problème d'encodage des caractères.

**Solution:**
1. Localiser le fichier "SOLAR 4G" ou "Solar 4G" dans le dossier des fiches techniques Google Drive
2. Ouvrir le PDF original et vérifier l'encodage
3. Si le problème persiste, régénérer le PDF en s'assurant que:
   - Les polices sont correctement incorporées (embedded)
   - L'encodage UTF-8 est utilisé
   - Le PDF est enregistré avec compatibilité maximale
4. Remplacer le fichier dans Google Drive

**Nom du fichier probable:** 
- `SOLAR 4G - compressed.pdf`
- `Solar 4G XL - compressed.pdf`

---

### 2. Fiche manquante - Moniteur 22" (Issue #5)

**Symptôme:** La fiche pour le moniteur 22" n'apparaît pas même quand le produit est sélectionné.

**Cause:** Le fichier PDF pour ce produit est manquant dans Google Drive.

**Solution:**
1. Créer ou obtenir la fiche technique pour le "Moniteur Vidéo 22""
2. Uploader le PDF dans le dossier des fiches techniques Google Drive
3. Nommer le fichier de manière cohérente avec les autres fiches

**Nom du fichier recommandé:**
- `Moniteur 22 - compressed.pdf` ou
- `Moniteur Video 22 - compressed.pdf`

**Note:** Le système de recherche est flexible et cherche les correspondances partielles, donc le nom exact n'est pas critique tant qu'il contient "Moniteur" et "22".

---

## Vérification après correction

Après avoir corrigé ces fichiers dans Google Drive:

1. Créer un nouveau devis avec le produit concerné
2. Générer le PDF
3. Vérifier que la fiche apparaît correctement
4. Pour SOLAR 4G: vérifier spécifiquement la deuxième page du tableau

---

## Informations techniques

Le système récupère les fiches depuis Google Drive en utilisant:
- Dossier ID configuré dans: `GOOGLE_DRIVE_FOLDER_TECH_SHEETS`
- Recherche par nom de produit (normalisée, sans accents)
- Supporte les fichiers compressés (avec suffix "- compressed")
