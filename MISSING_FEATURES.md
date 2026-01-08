# ❌ MISSING FEATURES FROM MILESTONE 1

## 🚨 CRITICAL FEATURES NOT IMPLEMENTED

### 1. PRE-MADE KIT SELECTION (Titane/Jablotron)

**SPECIFICATION:**
```
### Kits de base
- Possibilité de créer un Kit de base à partir de rien
- Dans les Kits de base déjà prêts, possibilité de :
  - rajouter des produits
  - modifier les produits déjà présents
```

**CURRENT IMPLEMENTATION:**
- When user clicks "Alarme Titane" or "Alarme Jablotron", they see an EMPTY ProductSection
- CENTRALS_CONFIG has Kit 1 and Kit 2 defined, but they're never shown or loaded

**WHAT'S MISSING:**
1. UI to choose between:
   - Kit 1 (predefined products)
   - Kit 2 (predefined products)
   - Create from scratch (empty)
2. Auto-loading of kit products when Kit 1 or Kit 2 is selected
3. Kit products should be pre-filled in the ProductSection

**IMPACT:** HIGH - Users expect to see predefined kits

---

### 2. KIT FROM SCRATCH - SURVEILLANCE TYPE CHOICE

**SPECIFICATION:**
```
- Quand kit de base à partir de rien :
  - proposer Autosurveillance ou Télésurveillance
  - laisser le prix libre
```

**CURRENT IMPLEMENTATION:**
- Users can select "Autre" to add custom products
- No surveillance type selection shown

**WHAT'S MISSING:**
1. When creating kit from scratch, show choice:
   - ⚪ Autosurveillance (with price input)
   - ⚪ Télésurveillance (with price input)
2. Free price input for the selected surveillance type

**IMPACT:** MEDIUM - Users need to choose surveillance type for custom kits

---

### 3. VISION À DISTANCE - AUTOMATIC 4G CAMERA COUNTING

**SPECIFICATION:**
```
- Vision à distance :
  - Si au moins une caméra 4G sélectionnée : 20 CHF par caméra 4G
  - Exemple : caméra classique + caméra 4G = 40 CHF / mois
```

**CURRENT IMPLEMENTATION:**
- Manual checkbox for "Vision à distance"
- Shows "20 CHF par caméra 4G" in label
- No automatic calculation

**INTERPRETATION ISSUE:**
The example "caméra classique + caméra 4G = 40 CHF / mois" is ambiguous:
- If 1 4G camera = 20 CHF, then 1 classic + 1 4G should = 20 CHF (not 40)
- Unless the example means 2 4G cameras?

**WHAT'S MISSING:**
1. Automatic detection of 4G cameras in product list
2. Calculation: count of 4G cameras × 20 CHF
3. Display: "Vision à distance : X caméras 4G × 20 CHF = Y CHF/mois"

**IMPACT:** MEDIUM - Calculation should be automatic

---

### 4. MAINTENANCE CONTRACT - AUTOMATIC CALCULATION

**SPECIFICATION:**
```
- Ajouter option : Contrat de maintenance
  - Prix = 10 CHF / caméras + NVR sélectionnés
  - À partir de 5 caméras = 5 CHF / caméra + NVR sélectionnés
```

**CURRENT IMPLEMENTATION:**
- Checkbox exists
- Shows text "(10 CHF or 5 CHF if ≥ 5 items)"
- No automatic calculation

**WHAT'S MISSING:**
1. Count total cameras + NVRs from product list
2. Calculate:
   - If count < 5: count × 10 CHF
   - If count ≥ 5: count × 5 CHF
3. Display calculated price

**IMPACT:** MEDIUM - Should calculate automatically

---

## ⚠️ IMPLEMENTATION STATUS

### ✅ FULLY IMPLEMENTED (as documented):
- All catalog prices
- Payment formulas
- Installation options
- Section title numbers removed
- All default states
- XTO components
- Custom product support ("Autre")
- Options checkboxes
- Warning texts

### ❌ NOT IMPLEMENTED:
1. **Pre-made kit selection UI** (Kit 1, Kit 2, or from scratch)
2. **Auto-load kit products** when kit selected
3. **Surveillance type choice** for custom kits
4. **Automatic 4G camera counting** and pricing
5. **Automatic maintenance calculation**

### 📋 NEEDS CLARIFICATION:
- Vision à distance example (1 classic + 1 4G = 40 CHF?) - seems like error in spec?

---

## 🔧 WHAT NEEDS TO BE ADDED

### For Alarm Section:

```typescript
// Add kit selection UI
<div className="quote-section">
  <h3>Choix de configuration</h3>
  <div>
    <button onClick={() => loadKit('titane', 'kit1')}>Kit 1</button>
    <button onClick={() => loadKit('titane', 'kit2')}>Kit 2</button>
    <button onClick={() => createFromScratch()}>Créer à partir de rien</button>
  </div>
</div>

// When "from scratch", show surveillance choice
{kitMode === 'scratch' && (
  <div>
    <h4>Type de surveillance</h4>
    <label>
      <input type="radio" name="surveillance" value="auto" />
      Autosurveillance
      <input type="number" placeholder="Prix mensuel" />
    </label>
    <label>
      <input type="radio" name="surveillance" value="tele" />
      Télésurveillance
      <input type="number" placeholder="Prix mensuel" />
    </label>
  </div>
)}
```

### For Camera Section:

```typescript
// Auto-calculate vision à distance
useEffect(() => {
  const fourGCameras = cameraLines.filter(line => 
    line.product?.name.includes('4G')
  ).length;
  
  const visionPrice = fourGCameras * 20;
  setVisionDistancePrice(visionPrice);
}, [cameraLines]);

// Auto-calculate maintenance
useEffect(() => {
  const cameraCount = cameraLines.filter(line =>
    line.product?.name.toLowerCase().includes('caméra') ||
    line.product?.name.toLowerCase().includes('bullet') ||
    line.product?.name.toLowerCase().includes('dôme')
  ).length;
  
  const nvrCount = cameraLines.filter(line =>
    line.product?.name.includes('NVR')
  ).length;
  
  const totalItems = cameraCount + nvrCount;
  const pricePerItem = totalItems >= 5 ? 5 : 10;
  const maintenancePrice = totalItems * pricePerItem;
  
  setMaintenancePrice(maintenancePrice);
}, [cameraLines]);
```

---

## 📊 COMPLETION STATUS

**Implemented:** ~85%
**Missing:** ~15%

The missing 15% consists of:
1. Kit selection workflow (5%)
2. Surveillance type for custom kits (3%)
3. Automatic 4G camera calculation (4%)
4. Automatic maintenance calculation (3%)

---

## 🎯 PRIORITY

**HIGH PRIORITY:**
1. Kit selection UI (affects user workflow)
2. Auto-load kit products

**MEDIUM PRIORITY:**
3. Automatic vision à distance calculation
4. Automatic maintenance calculation
5. Surveillance type choice for custom kits

**LOW PRIORITY:**
- Most are "nice to have" automations
- Current manual approach still works

