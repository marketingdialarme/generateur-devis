# 👁️ VISUAL TEST CHECKLIST FOR USER

**Before you start:** Run `npm run dev` and open http://localhost:3000/create-devis

---

## ⚡ QUICK 5-MINUTE TEST

### 1. ✅ Payment Modes (Top of Page)
- [ ] See 6 buttons: Comptant, 12, 24, 36, 48, 60 mois
- [ ] Click each → they highlight in yellow
- [ ] All 6 options work

### 2. ✅ Alarm Tab - Kit Selection
- [ ] Select "Titane" → 3 buttons appear (Kit 1, Kit 2, From Scratch)
- [ ] Click "Kit 1" → button turns yellow, products auto-fill below
- [ ] See 4 products: 2× Détecteur volumétrique, 1× Détecteur ouverture, 1× Clavier, 1× Sirène
- [ ] Click "Créer à partir de rien" → products cleared, "Type de surveillance" section appears
- [ ] Select Autosurveillance → price input appears
- [ ] Click in price input → text auto-selects

### 3. ✅ Camera Tab - Automatic Calculations
- [ ] Add "Solar 4G XL" → quantity 2
- [ ] Check "Vision à distance" → see blue box showing "Prix calculé: 40 CHF/mois"
- [ ] Add "Modem 4G" → "Vision à distance" auto-checks with message "(Auto-coché car MODEM sélectionné)"
- [ ] Add "Bullet Mini" → quantity 1 → vision price updates to 60 CHF/mois
- [ ] Add "NVR 4-8 Caméras"
- [ ] Check "Contrat de maintenance" → see blue box with calculated price

### 4. ✅ Fog Tab - Default Kit
- [ ] Open Fog tab
- [ ] See 3 products already added (Générateur, Clavier, Détecteur)
- [ ] All 3 have "Offert" checked by default
- [ ] Installation shows 490 CHF

### 5. ✅ Visiophone Tab - Pre-filled
- [ ] Open Visiophone tab
- [ ] See 2 products already added (Interphone, Écran complémentaire)
- [ ] Installation shows 690 CHF

---

## 🔍 DETAILED VERIFICATION (15 minutes)

### Alarm Section

**Test 1: Central Selection**
- [ ] Titane appears BEFORE Jablotron (order correct)
- [ ] XTO appears as third option

**Test 2: Kit Loading**
- [ ] Select Jablotron → Kit 1
- [ ] Products load instantly
- [ ] Quantities are correct (check spec)

**Test 3: Custom Kit + Surveillance**
- [ ] Select "From Scratch" button
- [ ] "Type de surveillance" section appears
- [ ] Select Télésurveillance radio
- [ ] Price input appears next to it
- [ ] Type a price → it saves

**Test 4: Product Prices**
- [ ] Add "Badge x 4" (Titane) → shows 190 CHF ✅ (not 100)
- [ ] Switch to Jablotron, add "Clavier" → shows 490 CHF ✅ (not 390)

**Test 5: New Products Exist**
- [ ] Search products for "Détecteur rideau intérieur" → exists
- [ ] Search for "Interphonie" → exists
- [ ] Search for "Répéteur radio" → exists (Jablotron only)

**Test 6: Options**
- [ ] See "Intervention payante" checkbox → shows "(149 CHF HT / intervention)"
- [ ] Check it → price input appears
- [ ] See "Intervention de la police" checkbox
- [ ] See "Télésurveillance (99 CHF / 48 mois)" checkbox

### Camera Section

**Test 7: Removed Products**
- [ ] Search camera products for "Interphone" → NOT found ✅
- [ ] Search for "Écran" → NOT found ✅

**Test 8: 4G Camera Logic**
- [ ] Start fresh camera list
- [ ] Add "Solar 4G XL" quantity 1
- [ ] Check "Vision à distance"
- [ ] Blue box shows: "Prix calculé: 20 CHF/mois"
- [ ] Change quantity to 3
- [ ] Price updates to: "60 CHF/mois"

**Test 9: Classic Camera + Modem Logic**
- [ ] Add "Bullet Mini" quantity 1 (classic camera)
- [ ] Price still 60 CHF (classic not counted without modem)
- [ ] Add "Modem 4G"
- [ ] Vision auto-checks
- [ ] Price updates to: "80 CHF/mois" (3 4G + 1 classic = 4 × 20)

**Test 10: Maintenance Threshold**
- [ ] Add cameras until total < 5
- [ ] Check maintenance → see rate of 10 CHF/item
- [ ] Add more cameras until total ≥ 5
- [ ] Rate changes to 5 CHF/item
- [ ] Blue box shows breakdown with item count

**Test 11: Warning Display**
- [ ] Remove all modems
- [ ] Uncheck "Vision à distance"
- [ ] Yellow warning appears: "Sans MODEM ou vision à distance..."
- [ ] Add modem → warning disappears

### Fog Section

**Test 12: Default Kit**
- [ ] Kit has exactly 3 items
- [ ] Item 1: "Générateur de brouillard" (2990 CHF) - Offert checked
- [ ] Item 2: "Clavier de porte" (390 CHF) - Offert checked
- [ ] Item 3: "Détecteur volumétrique" (240 CHF) - Offert checked

**Test 13: Fog Prices**
- [ ] Add "Support mural articulé" → 390 CHF
- [ ] Add "Cartouche supplémentaire HY3" → 990 CHF
- [ ] All prices match spec

**Test 14: Admin Fees**
- [ ] See "Frais de dossier" → 190 CHF
- [ ] See "Carte SIM" → 50 CHF

### Visiophone Section

**Test 15: Pre-filled Products**
- [ ] "Interphone" is pre-filled → 990 CHF
- [ ] "Écran complémentaire" is pre-filled → 490 CHF
- [ ] Installation → 690 CHF

### Global UI Tests

**Test 16: Input Auto-Select**
- [ ] Click in any quantity input → text selects automatically
- [ ] Click in surveillance price input → text selects
- [ ] Click in intervention payante price → text selects

**Test 17: Section Titles (No Numbers)**
- [ ] Alarm section: "Matériel supplémentaire" (not "2. Matériel...")
- [ ] All sections have clean titles without numbers

---

## 🧮 CALCULATION VERIFICATION

### Manual Calculation Test

**Test 18: Monthly Payment Formula**
- [ ] Add Titane alarm (690 CHF)
- [ ] Select "48 mois" payment
- [ ] Expected monthly: (690 × 1.2) / 48 = 17.25 → rounds to **18 CHF**
- [ ] Check if PDF shows 18 CHF ✅

**Test 19: Vision à Distance**
- [ ] 2× Solar 4G XL
- [ ] 1× Bullet Mini
- [ ] 1× Modem 4G
- [ ] Expected: (2 4G + 1 classic) × 20 = **60 CHF/mois**
- [ ] Blue box shows 60 CHF ✅

**Test 20: Maintenance**
- [ ] 6 cameras total
- [ ] 1 NVR
- [ ] Total: 7 items ≥ 5
- [ ] Expected: 7 × 5 = **35 CHF/mois**
- [ ] Blue box shows 35 CHF ✅

---

## ❌ THINGS THAT SHOULD NOT EXIST

### Double-Check Removals
- [ ] Camera catalog does NOT have "Interphone"
- [ ] Camera catalog does NOT have "Écran"
- [ ] Section titles do NOT have numbers (1., 2., etc.)

---

## 🚀 PERFORMANCE CHECK

**Test 21: Speed**
- [ ] Selecting kit → products load instantly (no lag)
- [ ] Adding camera → vision price updates immediately
- [ ] Checking maintenance → price calculates instantly

**Test 22: No Console Errors**
- [ ] Open browser dev tools (F12)
- [ ] Check Console tab
- [ ] Should see NO red errors

---

## 📊 FINAL CHECKLIST

### Features Working
- [ ] All 6 payment modes
- [ ] Kit 1, Kit 2, From Scratch buttons
- [ ] Auto-load kit products
- [ ] Surveillance type selection
- [ ] 4G camera auto-counting
- [ ] Classic camera with modem
- [ ] Maintenance auto-calculation
- [ ] Price displays in blue boxes
- [ ] Modem auto-checks vision
- [ ] Warning displays correctly
- [ ] All inputs auto-select
- [ ] Fog default kit
- [ ] Visiophone pre-filled

### Prices Verified
- [ ] Badge x4 Titane = 190 CHF
- [ ] Clavier Jablotron = 490 CHF
- [ ] All fog products match spec
- [ ] All visiophone products match spec
- [ ] XTO products match spec

### UI Clean
- [ ] No numbers in section titles
- [ ] All buttons work
- [ ] All checkboxes work
- [ ] All inputs work
- [ ] No visual bugs

---

## ✅ IF ALL CHECKED → MILESTONE 1 COMPLETE!

**Congratulations!** The implementation is working as specified.

**Found an issue?** Note:
- What you did
- What you expected
- What actually happened
- Screenshot if visual

---

**Test Date:** _____________  
**Tested By:** _____________  
**Overall Result:** ⬜ PASS  ⬜ FAIL (with notes)


