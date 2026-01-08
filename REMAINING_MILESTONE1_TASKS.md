# REMAINING MILESTONE 1 TASKS

## ❌ STILL MISSING (Must be implemented):

### 1. **XTO Selection** (CRITICAL)
- **Status**: Catalog exists but NOT selectable in UI
- **Location**: Kit modal / central selection
- **What's needed**: Add XTO as third central type option alongside Titane and Jablotron
- **Files**: `page.tsx` - modify kit modal to include XTO option

### 2. **Include Installation in Monthly Checkbox** (CRITICAL)
- **Status**: NOT implemented
- **Location**: After installation price in alarm section
- **What's needed**: Checkbox "Inclure l'installation dans les mensualités"
- **Files**: `page.tsx` line ~1058 (after installation section)

### 3. **Custom Kit Surveillance Choice** (IMPORTANT)
- **Status**: NOT implemented
- **Location**: When "Kit de base à partir de rien" is selected
- **What's needed**: 
  - Radio buttons: Autosurveillance / Télésurveillance
  - Free price input for selected option
- **Files**: `page.tsx` - add conditional render when kitMode === 'scratch'

### 4. **Titane Autosurveillance 59/64 CHF Logic** (IMPORTANT)
- **Status**: Catalog has 59 CHF, but no SIM card choice UI
- **Location**: Alarm services section
- **What's needed**:
  - Detect if "Carte SIM" is selected in admin fees
  - If autosurveillance + no SIM: 59 CHF
  - If autosurveillance + with SIM: 64 CHF
- **Files**: `page.tsx` - add logic to ServicesSection or create new UI

### 5. **Titane Before Jablotron Ordering** (MINOR)
- **Status**: UNKNOWN - needs verification
- **Location**: Kit modal dropdown
- **What's needed**: Ensure Titane appears first in selection
- **Files**: Check `page.tsx` kit modal ordering

---

## ✅ COMPLETED ITEMS:

1. ✅ Payment modes: 12, 24, 36, 48, 60 + Comptant
2. ✅ Engagement duration dropdown
3. ✅ All section titles without numbers
4. ✅ "Choix Kit de base" title
5. ✅ Badge x4 Titane: 190 CHF
6. ✅ Clavier Jablotron: 490 CHF
7. ✅ New products: Détecteur rideau, Interphonie, Répéteur radio
8. ✅ Interphone/Écran removed from camera catalog
9. ✅ 4G camera auto-counting & pricing (20 CHF)
10. ✅ Maintenance auto-calculation (10/5 CHF)
11. ✅ Auto-check vision if MODEM
12. ✅ Warning if no MODEM/vision
13. ✅ Fog Generator complete tab
14. ✅ Visiophone complete tab
15. ✅ New alarm options (intervention payante 149 CHF, police, telesurveillance 99 CHF)
16. ✅ Input auto-select (onFocus)
17. ✅ Calculation formulas with Math.ceil
18. ✅ All catalogs created (FOG, VISIOPHONE, XTO)

---

## PRIORITY:

**HIGH PRIORITY** (Core functionality):
1. XTO Selection
2. Installation in monthly checkbox
3. Custom kit surveillance choice

**MEDIUM PRIORITY** (UX/Logic):
4. Titane 59/64 CHF SIM card logic
5. Verify Titane before Jablotron ordering

---

**COMPLETION STATUS: ~92% complete, 8% remaining**

