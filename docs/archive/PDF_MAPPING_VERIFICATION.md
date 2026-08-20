# PDF Mapping Verification - Based on Google Drive Screenshot

## All PDFs in Google Drive (From Screenshot)

1. ✅ `MONITEUR 22_DISQUE DUR_SUPPORT MURAL_HDMI.pdf`
2. ✅ `Bullet Mini et Dôme Mini.pdf`
3. ✅ `Solar 4G XL PTZ.pdf`
4. ✅ `Mini Solar 4G + P. Solaire - compressed.pdf`
5. ⚠️ `ONDULEUR - Coffret NVR 4P - Coffret NVR 8P - SWITCH POE compressed.pdf` (NO HYPHEN before "compressed"!)
6. ✅ `NVR 8-16 Cameras - compressed.pdf`
7. ✅ `NVR 4-8 Cameras - compressed.pdf`
8. ✅ `BULLET ZOOM X23 PTZ- compressed.pdf`
9. ✅ `DOME XL VARIFOCALE - compressed.pdf`
10. ✅ `Interphone.pdf`
11. ✅ `Modem 4G - compressed.pdf`
12. ✅ `NVR 1-4 Cameras - compressed.pdf`
13. ❓ `NVR - MODEM 4G - compressed.pdf` (What is this? Combined sheet?)
14. ✅ `BULLET XL VARIFOCALE - compressed.pdf`
15. ✅ `DOME NIGHT - compressed.pdf`
16. ✅ `DÔME ANTIVANDALE - compressed.pdf`
17. ✅ `SOLAR 4G XL - compressed.pdf`
18. ❗ `Disque dur 4 To - compressed.pdf` (INDIVIDUAL sheet exists!)
19. ❗ `Support Mural Articulé - compressed.pdf` (INDIVIDUAL sheet exists!)
20. ❗ `HDMI Ext - compressed.pdf` (INDIVIDUAL sheet exists!)
21. ❗ `Switch POE - compressed.pdf.pdf` (INDIVIDUAL sheet exists! Double .pdf?)

## Issues Found:

### Issue 1: ONDULEUR Sheet Filename Has NO HYPHEN Before "compressed"
**Current mapping:** `ONDULEUR - Coffret NVR 4P - Coffret NVR 8P - SWITCH POE`
**Actual filename:** `ONDULEUR - Coffret NVR 4P - Coffret NVR 8P - SWITCH POE compressed.pdf` (space before compressed, NOT hyphen)

### Issue 2: Individual Sheets Exist for Accessories
Both COMBINED and INDIVIDUAL sheets exist for:
- Disque dur 4 To
- Support Mural Articulé
- HDMI Ext
- Switch POE (with `.pdf.pdf` typo)

**Question:** Should we use individual or combined sheets?

### Issue 3: Unknown "NVR - MODEM 4G" Sheet
There's a file called `NVR - MODEM 4G - compressed.pdf` - what is this for?

## Catalog Products That Need Sheets:

From `CATALOG_CAMERA_MATERIAL`:
- ✅ Bullet Mini → `Bullet Mini et Dôme Mini.pdf`
- ✅ Dôme Mini → `Bullet Mini et Dôme Mini.pdf`
- ✅ Dôme Antivandale → `DÔME ANTIVANDALE - compressed.pdf`
- ✅ Dôme Night → `DOME NIGHT - compressed.pdf`
- ✅ Bullet XL Varifocale → `BULLET XL VARIFOCALE - compressed.pdf`
- ✅ Dôme XL Varifocale → `DOME XL VARIFOCALE - compressed.pdf`
- ✅ Bullet Zoom x23 PTZ → `BULLET ZOOM X23 PTZ- compressed.pdf`
- ✅ Mini Solar 4G + P. Solaire → `Mini Solar 4G + P. Solaire - compressed.pdf`
- ✅ Solar 4G XL → `SOLAR 4G XL - compressed.pdf`
- ✅ Solar 4G XL PTZ → `Solar 4G XL PTZ.pdf`
- ✅ Interphone → `Interphone.pdf`
- ❌ Ecran complémentaire - interphone → NO SHEET
- ✅ NVR 1-4 Caméras (1 mois d'enregistrement) → `NVR 1-4 Cameras - compressed.pdf`
- ✅ NVR 4-8 Caméras (1 mois d'enregistrement) → `NVR 4-8 Cameras - compressed.pdf`
- ✅ NVR 8-16 Caméras (1 mois d'enregistrement) → `NVR 8-16 Cameras - compressed.pdf`
- ⚠️ Disque dur 4 To → Individual OR Combined?
- ✅ Modem 4G → `Modem 4G - compressed.pdf`
- ⚠️ Switch POE → Individual OR Combined?
- ⚠️ HDMI Ext. → Individual OR Combined?
- ⚠️ Moniteur Vidéo 22" → Combined works (user confirmed)
- ⚠️ Support Mural Articulé → Individual OR Combined?
- ❌ Mat 3 mètre → NO SHEET
- ⚠️ Onduleur 1000 - 60min → Combined?
- ⚠️ Coffret NVR 4P → Combined?
- ⚠️ Coffret NVR 8P → Combined?
- ❌ Autre → NO SHEET (custom product)

## Recommendations:

1. **Fix ONDULEUR filename** - add space before "compressed" not hyphen
2. **Decision needed:** Use individual sheets for Disque dur, Support, HDMI, Switch OR use combined sheets?
3. **Clarify:** What is "NVR - MODEM 4G" sheet for?
