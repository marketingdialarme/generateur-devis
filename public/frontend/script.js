        // ============================================
        // ⭐⭐⭐ CATALOGUES - À MODIFIER ICI ⭐⭐⭐
        // ============================================
        
        // 📋 LISTE DES COMMERCIAUX
        const COMMERCIALS_LIST = [
            "Arnaud Bloch",
            "Benali Kodad",
            "Bryan Debrosse",
            "Cédric Boldron",
            "Emin Comert",
            "Gérald Clausen",
            "Heythem Ziaya",
            "Iyed Baccouche",
            "Matys Goiot",
            "Mohamed Tartik",
            "Nora Sassi",
            "Rodolphe De Vito",
            "Samir Ouhameni",
            "Thilan Curt",
            "Thomas Garcia",
            "Wassim Tahiri"
        ];
        
        // 🚨 CATALOGUE ALARME - PRODUITS
        const CATALOG_ALARM_PRODUCTS = [
            { id: 5, name: "Centrale Jablotron", price: 990.00 },
            { id: 6, name: "Centrale Titane", price: 690.00 },
            { id: 99, name: "Autre", price: 0.00, isCustom: true },
            { id: 3, name: "Badge x 4", priceTitane: 100.00, priceJablotron: 200.00, monthlyTitane: 3, monthlyJablotron: 5 },
            { id: 2, name: "Barrière extérieure 2x12 mètres (radio)", priceTitane: 890.00, priceJablotron: 890.00, monthlyTitane: 22, monthlyJablotron: 22 },
            { id: 1, name: "Bouton panique/Montre d'urgence (radio)", priceTitane: 190.00, priceJablotron: 190.00, monthlyTitane: 5, monthlyJablotron: 5 },
            { id: 7, name: "Clavier (radio)", priceTitane: 390.00, priceJablotron: 390.00, monthlyTitane: 10, monthlyJablotron: 12 },
            { id: 12, name: "Détecteur de bris de verre (radio)", priceTitane: 290.00, priceJablotron: 290.00, monthlyTitane: 7, monthlyJablotron: 7 },
            { id: 11, name: "Détecteur de choc (radio)", priceTitane: 290.00, priceJablotron: 290.00, monthlyTitane: 7, monthlyJablotron: 7 },
            { id: 13, name: "Détecteur de fumée (radio)", priceTitane: 190.00, priceJablotron: 290.00, monthlyTitane: 5, monthlyJablotron: 7 },
            { id: 14, name: "Détecteur de mouvement extérieur (caméra)", priceTitane: 690.00, priceJablotron: 690.00, monthlyTitane: 17, monthlyJablotron: 17 },
            { id: 10, name: "Détecteur d'ouverture (radio)", priceTitane: 190.00, priceJablotron: 240.00, monthlyTitane: 5, monthlyJablotron: 6 },
            { id: 8, name: "Détecteur volumétrique (radio)", priceTitane: 240.00, priceJablotron: 290.00, monthlyTitane: 6, monthlyJablotron: 7 },
            { id: 9, name: "Détecteur volumétrique caméra (radio)", priceTitane: 290.00, priceJablotron: 450.00, monthlyTitane: 7, monthlyJablotron: 11 },
            { id: 22, name: "Lecteur de badge intérieur (filaire/radio)", priceJablotron: 490.00, requiresJablotron: true, monthlyJablotron: 12 },
            { id: 18, name: "Sirène déportée petite (radio)", priceTitane: 390.00, priceJablotron: 390.00, monthlyTitane: 10, monthlyJablotron: 10 },
            { id: 21, name: "Sirène déportée grande (radio)", priceJablotron: 490.00, requiresJablotron: true, monthlyJablotron: 12 },
            { id: 17, name: "Sonde inondation (radio)", priceTitane: 290.00, priceJablotron: 390.00, monthlyTitane: 7, monthlyJablotron: 10 },
            { id: 19, name: "Télécommande (radio)", priceTitane: 190.00, priceJablotron: 240.00, monthlyTitane: 5, monthlyJablotron: 6 }
        ];
        
        // 📹 CATALOGUE CAMÉRA
        const CATALOG_CAMERA_MATERIAL = [
            { id: 99, name: "Autre", price: 0.00, isCustom: true },
            { id: 23, name: "Bullet Mini", price: 390.00, monthly48: 10, monthly36: 13, monthly24: 18 },
            { id: 24, name: "Bullet XL Varifocale Night", price: 640.00, monthly48: 16, monthly36: 21, monthly24: 30 },
            { id: 26, name: "Bullet Zoom x23", price: 990.00, monthly48: 25, monthly36: 32, monthly24: 46 },
            { id: 46, name: "Reo 4G + P.Solaire", price: 490.00, monthly48: 13, monthly36: 16, monthly24: 23 },
            { id: 47, name: "Solar 4G XL + P.solaire", price: 890.00, monthly48: 22, monthly36: 28, monthly24: 41 },
            { id: 53, name: "Solar 4G XL PTG + P.solaire", price: 890.00, monthly48: 22, monthly36: 28, monthly24: 41 },
            { id: 31, name: "Dôme Antivandale", price: 390.00, monthly48: 10, monthly36: 13, monthly24: 18 },
            { id: 32, name: "Dôme Mini Antivandale", price: 390.00, monthly48: 10, monthly36: 13, monthly24: 18 },
            { id: 33, name: "Dôme Night", price: 540.00, monthly48: 14, monthly36: 18, monthly24: 25 },
            { id: 28, name: "Coffret NVR 4P", price: 240.00, monthly48: 6, monthly36: 8, monthly24: 11 },
            { id: 29, name: "Coffret NVR 8P", price: 360.00, monthly48: 9, monthly36: 12, monthly24: 17 },
            { id: 49, name: "Switch POE", price: 270.00, monthly48: 7, monthly36: 9, monthly24: 13 },
            { id: 30, name: "Disque dur 4 To", price: 270.00, monthly48: 7, monthly36: 9, monthly24: 13 },
            { id: 38, name: "Modem 4G", price: 290.00, monthly48: 8, monthly36: 10, monthly24: 14 },
            { id: 39, name: "Moniteur Vidéo 22\"", price: 190.00, monthly48: 5, monthly36: 7, monthly24: 9 },
            { id: 40, name: "Moniteur Vidéo 28\" 4K", price: 460.00, monthly48: 12, monthly36: 15, monthly24: 22 },
            { id: 41, name: "Moniteur Vidéo 32\"", price: 490.00, monthly48: 13, monthly36: 16, monthly24: 23 },
            { id: 50, name: "NVR 1-4 Caméras (1 mois d'enregistrement)", price: 990.00, monthly48: 25, monthly36: 32, monthly24: 46 },
            { id: 51, name: "NVR 4-8 Caméras (1 mois d'enregistrement)", price: 1390.00, monthly48: 35, monthly36: 45, monthly24: 64 },
            { id: 52, name: "NVR 8-16 Caméras (1 mois d'enregistrement)", price: 1690.00, monthly48: 43, monthly36: 54, monthly24: 78 },
            { id: 42, name: "Onduleur 1000 - 60min", price: 360.00, monthly48: 9, monthly36: 12, monthly24: 17 },
            { id: 43, name: "Onduleur 1500 - 90min", price: 600.00, monthly48: 15, monthly36: 20, monthly24: 28 },
            { id: 44, name: "Onduleur 2200 - 120min", price: 830.00, monthly48: 21, monthly36: 27, monthly24: 39 },
            { id: 45, name: "Onduleur 700 - 30min", price: 240.00, monthly48: 6, monthly36: 8, monthly24: 11 },
            { id: 37, name: "HDMI Ext.", price: 190.00, monthly48: 5, monthly36: 7, monthly24: 9 },
            { id: 48, name: "Support Mural Articulé", price: 100.00, monthly48: 3, monthly36: 4, monthly24: 5 },
            { id: 27, name: "Caméra de comptage", price: 860.00, monthly48: 22, monthly36: 28, monthly24: 40 }
        ];
        
        // ============================================
        // 💰 CONFIGURATION DES PRIX ET TARIFS
        // ============================================

        // 📊 TAUX DE TVA
        const TVA_RATE = 0.081; // 8.1%

        // 🔧 INSTALLATION - PRIX COMPTANT (par nombre de demi-journées)
        const INSTALLATION_PRICES = {
            1: 690,   // 1/2 journée
            2: 1290,  // 1 jour
            3: 1980,  // 1.5 jours
            4: 2580,  // 2 jours
            5: 3270,  // 2.5 jours
            6: 3870   // 3 jours
        };

        // 🔧 INSTALLATION - PRIX MENSUELS (par nombre de demi-journées et durée)
        const INSTALLATION_MONTHLY_PRICES = {
            1: { 24: 32, 36: 23, 48: 18 },
            2: { 24: 60, 36: 42, 48: 33 },
            3: { 24: 91, 36: 64, 48: 50 },
            4: { 24: 119, 36: 83, 48: 65 },
            5: { 24: 151, 36: 106, 48: 83 },
            6: { 24: 179, 36: 125, 48: 98 }
        };

        // 🔧 PRIX DE BASE D'UNE DEMI-JOURNÉE
        const HALF_DAY_PRICE = 690;
        const HALF_DAY_MONTHLY_24 = 32;
        const HALF_DAY_MONTHLY_36 = 23;
        const HALF_DAY_MONTHLY_48 = 18;
        const FULL_DAY_MONTHLY_24 = 60;
        const FULL_DAY_MONTHLY_36 = 42;
        const FULL_DAY_MONTHLY_48 = 33;

        // 🗑️ DÉSINSTALLATION
        const UNINSTALL_PRICE = 290.00;

        // 📄 FRAIS DE DOSSIER
        const ADMIN_FEES = {
            simCard: 50.00,
            processingFee: 190.00
        };

        // 📹 CAMÉRA - INSTALLATION
        const CAMERA_INSTALL_BASE_PRICE = 690.00;

        // 📹 CAMÉRA - VISION À DISTANCE
        const REMOTE_ACCESS_PRICE = 20.00;

        // 🔔 TEST CYCLIQUE
        const TEST_CYCLIQUE_DEFAULT_PRICE = 0.00;

        // 📡 SERVICES DE SURVEILLANCE - MODE VENTE
        const SURVEILLANCE_PRICES_SALE = {
            titane: {
                autosurveillance: 59,
                autosurveillancePro: 79,
                telesurveillance: 129,
                telesurveillancePro: 159
            },
            jablotron: {
                telesurveillance: 139,
                telesurveillancePro: 169
            },
            default: {
                autosurveillance: 59,
                autosurveillancePro: 79,
                telesurveillance: 129,
                telesurveillancePro: 159
            }
        };

        // 📡 SERVICES DE SURVEILLANCE - MODE LOCATION
        const SURVEILLANCE_PRICES_RENTAL = {
            autosurveillance: 100,
            autosurveillancePro: 150,
            telesurveillance: 200,
            telesurveillancePro: 250
        };

        // ============================================
        // 🏢 CONFIGURATION DES CENTRALES ET KITS
        // ============================================
        const CENTRALS_CONFIG = {
            titane: {
                id: 6,
                name: "Centrale Titane",
                price: 690.00,
                description: "Système complet de sécurité",
                kits: {
                    kit1: {
                        name: "Kit 1",
                        icon: "📦",
                        products: [
                            { id: 8, quantity: 2 },
                            { id: 10, quantity: 1 },
                            { id: 7, quantity: 1 },
                            { id: 18, quantity: 1 }
                        ]
                    },
                    kit2: {
                        name: "Kit 2",
                        icon: "📦",
                        products: [
                            { id: 8, quantity: 1 },
                            { id: 10, quantity: 3 },
                            { id: 7, quantity: 1 },
                            { id: 18, quantity: 1 }
                        ]
                    }
                }
            },
            jablotron: {
                id: 5,
                name: "Centrale Jablotron",
                price: 990.00,
                description: "Système premium avancé",
                kits: {
                    kit1: {
                        name: "Kit 1",
                        icon: "📦",
                        products: [
                            { id: 8, quantity: 2 },
                            { id: 10, quantity: 1 },
                            { id: 7, quantity: 1 },
                            { id: 18, quantity: 1 }
                        ]
                    },
                    kit2: {
                        name: "Kit 2",
                        icon: "📦",
                        products: [
                            { id: 8, quantity: 1 },
                            { id: 10, quantity: 3 },
                            { id: 7, quantity: 1 },
                            { id: 18, quantity: 1 }
                        ]
                    }
                }
            }
        };
        
        // ============================================
        // ⭐⭐⭐ FIN DES CATALOGUES ET CONFIGURATION ⭐⭐⭐
        // ============================================

        // ============================================
        // 📧 CONFIGURATION DE L'ENVOI EMAIL ET DRIVE
        // ============================================
        
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPG1IzaHrk666uZL-8GXGa7T3WIX9sNwJWBUf5rwyC-5BYu-hWnwSuPPpbItCj6VRf/exec';
        
        // ============================================

        // Classe principale du générateur
        class DialarmeFinalGenerator {
            
            constructor() {
                // Feature flag for PDF merging method  
                // Enable pdf-lib for ALL devices (synchronous XHR works on iOS)
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                this.USE_PDF_LIB_MERGING = true; // PDF merging with pdf-lib enabled by default
                
                // Create visible debug console for mobile
                this.createMobileDebugConsole();
                
                this.catalog = {
                    'alarm-material': CATALOG_ALARM_PRODUCTS.sort((a, b) => a.name.localeCompare(b.name)),
                    'alarm-installation': CATALOG_ALARM_PRODUCTS.sort((a, b) => a.name.localeCompare(b.name)),
                    'camera-material': CATALOG_CAMERA_MATERIAL.sort((a, b) => a.name.localeCompare(b.name))
                };

                this.currentTab = 'alarm';
                this.sections = {
                    'alarm-material': { paymentMonths: 0 },
                    'alarm-installation': { paymentMonths: 0 },
                    'camera-material': { paymentMonths: 0 },
                    'camera-installation': { paymentMonths: 0 }
                };

                this.globalPaymentMonths = {
                    'alarm': 48,
                    'camera': 48
                };

                this.rentalMode = {
                    'alarm': false,
                    'camera': false
                };

                this.selectedCentral = null;
                this.kitOffered = false;

                this.init();
            }

            init() {
                this.updateCurrentDate();
                this.populateCommercials();
                this.updateTotals();
                console.log('✅ Générateur Dialarme initialisé');
            }

            populateCommercials() {
                const selectIds = ['commercial', 'commercialCamera'];
                selectIds.forEach(selectId => {
                    const select = document.getElementById(selectId);
                    if (select) {
                        const newOptions = COMMERCIALS_LIST.map(name => 
                            `<option value="${name}">${name}</option>`
                        ).join('');
                        select.innerHTML = '<option value="">Sélectionner un commercial</option>' + 
                                         newOptions + 
                                         '<option value="autre" style="font-style: italic; color: #007bff;">➕ Autre (saisir le nom)</option>';
                    }
                });
            }

            roundToFiveCents(amount) {
                return Math.ceil(amount * 20) / 20;
            }

            updateCurrentDate() {
                const now = new Date();
                const dateStr = now.toLocaleDateString('fr-CH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                document.getElementById('currentDate').textContent = dateStr;
            }

            showTab(tabName, element) {
                this.currentTab = tabName;
                
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                document.querySelectorAll('.nav-tab').forEach(tab => {
                    tab.classList.remove('active');
                });

                const targetTab = document.getElementById(`${tabName}-tab`);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
                
                if (element) {
                    element.classList.add('active');
                }

                this.updateTotals();
            }

            toggleRentalMode(type) {
                this.rentalMode[type] = document.getElementById(`${type}-rental-mode`).checked;
                
                if (type === 'alarm') {
                    const paymentSection = document.getElementById('alarm-payment-section');
                    if (paymentSection) {
                        paymentSection.style.display = this.rentalMode[type] ? 'none' : 'block';
                    }
                    
                    document.getElementById('alarm-uninstall-line').style.display = this.rentalMode[type] ? 'flex' : 'none';
                    
                    const installLine = document.getElementById('alarm-installation-line');
                    if (this.rentalMode[type]) {
                        installLine.querySelector('div:first-child').textContent = 'Installation, paramétrages, tests, mise en service & formation';
                        document.getElementById('alarm-installation-display').textContent = 'Compris dans le forfait';
                        document.getElementById('alarm-installation-qty').style.display = 'none';
                        installLine.querySelector('label').style.display = 'none';
                        document.getElementById('alarm-installation-offered').parentElement.style.display = 'none';
                        document.getElementById('alarm-installation-price').style.display = 'none';
} else {
                        document.getElementById('alarm-installation-qty').style.display = 'inline-block';
                        installLine.querySelector('label').style.display = 'inline';
                        document.getElementById('alarm-installation-offered').parentElement.style.display = 'flex';
                        document.getElementById('alarm-installation-price').style.display = 'inline-block';
                        this.updateAlarmInstallationPrice();
                    }
                    
                    if (this.rentalMode[type]) {
                        this.globalPaymentMonths['alarm'] = 0;
                    } else {
                        this.globalPaymentMonths['alarm'] = 48;
                    }
                    
                    this.updateSurveillanceOptions(this.selectedCentral);
                    this.updateSurveillancePrice();
                } else if (type === 'camera') {
                    const paymentSection = document.getElementById('camera-payment-section');
                    if (paymentSection) {
                        paymentSection.style.display = this.rentalMode[type] ? 'none' : 'block';
                    }
                    
                    document.getElementById('camera-remote-section').style.display = this.rentalMode[type] ? 'none' : 'block';
                    document.getElementById('camera-maintenance-section').style.display = 'block'; // Toujours visible
                    document.getElementById('camera-remote-summary').style.display = this.rentalMode[type] ? 'none' : 'flex';
                    document.getElementById('camera-maintenance-summary').style.display = 'flex'; // Toujours visible
                    
                    document.getElementById('camera-uninstall-line').style.display = this.rentalMode[type] ? 'flex' : 'none';
                    
                    const installLine = document.getElementById('camera-installation-line');
                    if (this.rentalMode[type]) {
                        installLine.querySelector('div:first-child').textContent = 'Installation, paramétrages, tests, mise en service & formation des utilisateurs';
                        document.getElementById('camera-installation-price').textContent = 'Compris dans le forfait';
                        document.getElementById('camera-installation-qty').style.display = 'none';
                        installLine.querySelector('label').style.display = 'none';
                        document.getElementById('camera-installation-offered').parentElement.style.display = 'none';
                    } else {
                        document.getElementById('camera-installation-qty').style.display = 'inline-block';
                        installLine.querySelector('label').style.display = 'inline';
                        document.getElementById('camera-installation-offered').parentElement.style.display = 'flex';
                        this.updateCameraInstallationPrice();
                    }
                    
                    if (this.rentalMode[type]) {
                        this.globalPaymentMonths['camera'] = 0;
                        document.getElementById('camera-remote-access').checked = false;
                    } else {
                        this.globalPaymentMonths['camera'] = 48;
                    }
                }
                
                this.updateTotals();
            }

            calculateInstallationPrice(qty) {
                if (qty > 6) {
                    const fullDays = Math.floor(qty / 2);
                    const halfDay = qty % 2;
                    return (fullDays * HALF_DAY_PRICE * 2) + (halfDay * HALF_DAY_PRICE);
                }
                
                return INSTALLATION_PRICES[qty] || HALF_DAY_PRICE;
            }

            getInstallationMonthlyPrice(qty, months) {
                if (qty > 6) {
                    const fullDays = Math.floor(qty / 2);
                    const halfDay = qty % 2;
                    
                    if (months === 24) {
                        return (fullDays * FULL_DAY_MONTHLY_24) + (halfDay * HALF_DAY_MONTHLY_24);
                    } else if (months === 36) {
                        return (fullDays * FULL_DAY_MONTHLY_36) + (halfDay * HALF_DAY_MONTHLY_36);
                    } else if (months === 48) {
                        return (fullDays * FULL_DAY_MONTHLY_48) + (halfDay * HALF_DAY_MONTHLY_48);
                    }
                }
                
                if (INSTALLATION_MONTHLY_PRICES[qty] && INSTALLATION_MONTHLY_PRICES[qty][months]) {
                    return INSTALLATION_MONTHLY_PRICES[qty][months];
                }
                
                return 0;
            }

            calculateSectionMonthlyPrice(sectionId, months) {
                const container = document.getElementById(`${sectionId}-products`);
                if (!container || months === 0) return 0;
                
                let monthlyTotal = 0;
                const productLines = container.querySelectorAll('.product-line');
                
                productLines.forEach(line => {
                    const select = line.querySelector('.product-select');
                    const qtyInput = line.querySelector('.quantity-input');
                    const offeredCheckbox = line.querySelector('.offered-checkbox');
                    const nameInput = line.querySelector('.product-name-input');
                    const priceInput = line.querySelector('.price-input');
                    
                    const isOffered = offeredCheckbox?.checked || false;
                    if (isOffered) return;
                    
                    const qty = parseInt(qtyInput?.value) || 0;
                    if (qty === 0) return;
                    
                    if (nameInput && nameInput.style.display !== 'none' && nameInput.value) {
                        const priceHT = parseFloat(priceInput?.value) || 0;
                        monthlyTotal += (priceHT / months) * qty;
                        return;
                    }
                    
                    if (!select || !select.value) return;
                    
                    const productId = parseInt(select.value);
                    const product = this.catalog[sectionId]?.find(p => p.id === productId);
                    
                    if (!product) return;
                    
                    let monthlyPrice = 0;
                    
                    if (sectionId === 'alarm-material' || sectionId === 'alarm-installation') {
                        if (this.selectedCentral === 'titane' && product.monthlyTitane !== undefined) {
                            monthlyPrice = product.monthlyTitane;
                        } else if (this.selectedCentral === 'jablotron' && product.monthlyJablotron !== undefined) {
                            monthlyPrice = product.monthlyJablotron;
                        }
                    } else if (sectionId === 'camera-material') {
                        if (months === 48 && product.monthly48 !== undefined) {
                            monthlyPrice = product.monthly48;
                        } else if (months === 36 && product.monthly36 !== undefined) {
                            monthlyPrice = product.monthly36;
                        } else if (months === 24 && product.monthly24 !== undefined) {
                            monthlyPrice = product.monthly24;
                        }
                    }
                    
                    if (monthlyPrice === 0) {
                        const priceHT = this.getProductPrice(product);
                        monthlyPrice = priceHT / months;
                    }
                    
                    monthlyPrice = this.roundToFiveCents(monthlyPrice);
                    monthlyTotal += monthlyPrice * qty;
                });
                
                return monthlyTotal;
            }
            
            calculateCameraInstallationPrice() {
                const qtyInput = document.getElementById('camera-installation-qty');
                const qty = parseInt(qtyInput.value) || 1;
                return this.calculateInstallationPrice(qty);
            }

            updateAlarmInstallationPrice() {
                const qtyInput = document.getElementById('alarm-installation-qty');
                const priceInput = document.getElementById('alarm-installation-price');
                const qty = parseInt(qtyInput.value) || 1;
                const price = this.calculateInstallationPrice(qty);
                priceInput.value = price;
                
                this.updateTotals();
            }

            updateCameraInstallationPrice() {
                if (this.rentalMode['camera']) {
                    document.getElementById('camera-installation-price').textContent = 'Compris dans le forfait';
                    this.updateTotals();
                    return;
                }
                
                const qtyInput = document.getElementById('camera-installation-qty');
                const qty = parseInt(qtyInput.value) || 1;
                const price = this.calculateInstallationPrice(qty);
                
                const priceDisplay = document.getElementById('camera-installation-price');
                const offeredCheckbox = document.getElementById('camera-installation-offered');
                
                if (!offeredCheckbox.checked) {
                    priceDisplay.textContent = `${price.toFixed(2)} CHF`;
                }
                
                this.updateTotals();
            }

            updateSurveillancePrice() {
                const surveillanceType = document.getElementById('surveillance-type').value;
                const priceInput = document.getElementById('surveillance-price');
                const offeredCheckbox = document.getElementById('surveillance-offered');
                
                offeredCheckbox.disabled = !surveillanceType;
                
                if (!surveillanceType) {
                    priceInput.value = 0;
                } else {
                    const isRental = this.rentalMode['alarm'];
                    
                    if (isRental) {
                        if (surveillanceType === 'autosurveillance') {
                            priceInput.value = SURVEILLANCE_PRICES_RENTAL.autosurveillance;
                        } else if (surveillanceType === 'autosurveillance-pro') {
                            priceInput.value = SURVEILLANCE_PRICES_RENTAL.autosurveillancePro;
                        } else if (surveillanceType === 'telesurveillance') {
                            priceInput.value = SURVEILLANCE_PRICES_RENTAL.telesurveillance;
                        } else if (surveillanceType === 'telesurveillance-pro') {
                            priceInput.value = SURVEILLANCE_PRICES_RENTAL.telesurveillancePro;
                        }
                    } else {
                        const prices = this.selectedCentral === 'titane' 
                            ? SURVEILLANCE_PRICES_SALE.titane 
                            : this.selectedCentral === 'jablotron' 
                                ? SURVEILLANCE_PRICES_SALE.jablotron 
                                : SURVEILLANCE_PRICES_SALE.default;
                        
                        if (surveillanceType === 'autosurveillance' && prices.autosurveillance) {
                            priceInput.value = prices.autosurveillance;
                        } else if (surveillanceType === 'autosurveillance-pro' && prices.autosurveillancePro) {
                            priceInput.value = prices.autosurveillancePro;
                        } else if (surveillanceType === 'telesurveillance' && prices.telesurveillance) {
                            priceInput.value = prices.telesurveillance;
                        } else if (surveillanceType === 'telesurveillance-pro' && prices.telesurveillancePro) {
                            priceInput.value = prices.telesurveillancePro;
                        } else {
                            priceInput.value = 0;
                        }
                    }
                }
                
                this.updateTotals();
            }

            addProductLine(sectionId) {
                const container = document.getElementById(`${sectionId}-products`);
                
                const productLine = document.createElement('div');
                productLine.className = 'product-line';
                
                let availableProducts = this.catalog[sectionId];
                if (sectionId === 'alarm-material' || sectionId === 'alarm-installation') {
                    availableProducts = this.getFilteredProducts(sectionId);
                }
                
                const lineId = 'line-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                
                productLine.innerHTML = `
                    <div class="product-select-container" style="width: 100%; position: relative;">
                        <select class="product-select" id="select-${lineId}" onchange="handleProductSelection(this)" data-section="${sectionId}">
                            <option value="">Sélectionner un produit</option>
                            ${availableProducts.map(product => {
                                const price = this.getProductPrice(product);
                                return `<option value="${product.id}" data-price="${price}" data-custom="${product.isCustom ? 'true' : 'false'}">${product.name} - ${price.toFixed(2)} CHF</option>`;
                            }).join('')}
                        </select>
                        <input type="text" class="product-name-input" id="name-${lineId}" style="display: none; width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 5px;" placeholder="Nom du produit personnalisé" oninput="updateTotals()">
                    </div>
                    <input type="number" value="1" min="1" class="quantity-input" oninput="updateTotals()">
                    <input type="number" value="0" min="0" step="0.01" class="price-input discount-input" style="display: none;" placeholder="Prix unitaire" oninput="updateTotals()">
                    <div class="checkbox-option" style="margin: 0;">
                        <input type="checkbox" class="offered-checkbox" onchange="updateTotals()">
                        <label style="margin: 0; font-size: 12px;">OFFERT</label>
                    </div>
                    <div class="price-display">0.00 CHF</div>
                    <button class="remove-btn" onclick="this.closest('.product-line').remove(); updateTotals();">×</button>
                `;
                
                container.appendChild(productLine);
            }

            handleProductSelection(selectElement) {
                const productId = parseInt(selectElement.value);
                const sectionId = selectElement.getAttribute('data-section');
                const selectedOption = selectElement.querySelector(`option[value="${selectElement.value}"]`);
                const isCustom = selectedOption?.getAttribute('data-custom') === 'true';
                const productLine = selectElement.closest('.product-line');
                const priceInput = productLine.querySelector('.price-input');
                const nameInput = productLine.querySelector('.product-name-input');
                const selectContainer = productLine.querySelector('.product-select-container');
                
                if (isCustom && productId === 99) {
                    selectElement.style.display = 'none';
                    nameInput.style.display = 'block';
                    nameInput.focus();
                    
                    if (priceInput) {
                        priceInput.style.display = 'block';
                        priceInput.value = 0;
                    }
                    
                    if (!selectContainer.querySelector('.back-to-select-btn')) {
                        const backBtn = document.createElement('button');
                        backBtn.className = 'back-to-select-btn';
                        backBtn.innerHTML = '↩';
                        backBtn.style.cssText = 'position: absolute; right: 5px; top: 50%; transform: translateY(-50%); background: #6c757d; color: white; border: none; border-radius: 3px; padding: 2px 8px; cursor: pointer; font-size: 12px; z-index: 10;';
                        backBtn.onclick = () => {
                            selectElement.style.display = 'block';
                            nameInput.style.display = 'none';
                            priceInput.style.display = 'none';
                            selectElement.value = '';
                            nameInput.value = '';
                            priceInput.value = 0;
                            backBtn.remove();
                            if (sectionId === 'camera-material') {
                                this.updateCameraInstallationPrice();
                            }
                            this.updateTotals();
                        };
                        selectContainer.appendChild(backBtn);
                    }
                } else {
                    if (nameInput) {
                        nameInput.style.display = 'none';
                    }
                    if (priceInput) {
                        priceInput.style.display = 'none';
                        const price = parseFloat(selectedOption?.getAttribute('data-price')) || 0;
                        priceInput.value = price;
                    }
                    const backBtn = selectContainer.querySelector('.back-to-select-btn');
                    if (backBtn) backBtn.remove();
                }
                
                if (sectionId === 'alarm-material' && (productId === 5 || productId === 6)) {
                    this.detectSelectedCentral();
                } else if (sectionId === 'alarm-material') {
                    this.detectSelectedCentral();
                }
                
                if (sectionId === 'camera-material') {
                    this.updateCameraInstallationPrice();
                }
                
                this.updateTotals();
            }

            getFilteredProducts(sectionId) {
                const products = this.catalog[sectionId];
                
                const isInstallationSection = sectionId === 'alarm-installation';
                
                if (!this.selectedCentral) {
                    if (isInstallationSection) {
                        return products.filter(p => p.id !== 5 && p.id !== 6 && !p.requiresJablotron);
                    }
                    return products.filter(p => !p.requiresJablotron);
                }
                
                if (this.selectedCentral === 'jablotron') {
                    if (isInstallationSection) {
                        return products.filter(p => p.id !== 5 && p.id !== 6);
                    }
                    return products;
                }
                
                if (isInstallationSection) {
                    return products.filter(p => p.id !== 5 && p.id !== 6 && !p.requiresJablotron);
                }
                return products.filter(p => !p.requiresJablotron);
            }

            getProductPrice(product) {
                if (!this.selectedCentral) {
                    return product.price || 0;
                }
                
                if (this.selectedCentral === 'titane' && product.priceTitane !== undefined) {
                    return product.priceTitane;
                }
                
                if (this.selectedCentral === 'jablotron' && product.priceJablotron !== undefined) {
                    return product.priceJablotron;
                }
                
                return product.price || 0;
            }
            
            detectSelectedCentral() {
                const container = document.getElementById('alarm-material-products');
                if (!container) return;
                
                const productLines = container.querySelectorAll('.product-line');
                let hasJablotron = false;
                let hasTitane = false;
                
                productLines.forEach(line => {
                    const select = line.querySelector('.product-select');
                    if (select && select.value) {
                        const productId = parseInt(select.value);
                        if (productId === 5) hasJablotron = true;
                        if (productId === 6) hasTitane = true;
                    }
                });
                
                if (hasJablotron) {
                    this.selectedCentral = 'jablotron';
                    this.kitOffered = true;
                    this.updateSurveillanceOptions('jablotron');
                } else if (hasTitane) {
                    this.selectedCentral = 'titane';
                    this.kitOffered = true;
                    this.updateSurveillanceOptions('titane');
                } else {
                    this.selectedCentral = null;
                    this.kitOffered = false;
                    this.updateSurveillanceOptions(null);
                }
                
                this.updateAllProductSelects();
                this.updateSurveillancePrice();
            }
            
            updateSurveillanceOptions(centralType) {
                const surveillanceSelect = document.getElementById('surveillance-type');
                if (!surveillanceSelect) return;
                
                const currentValue = surveillanceSelect.value;
                const isRental = this.rentalMode['alarm'];
                
                if (isRental) {
                    if (centralType === 'jablotron' || centralType === 'titane') {
                        surveillanceSelect.innerHTML = `
                            <option value="">Aucun</option>
                            <option value="autosurveillance">Autosurveillance (${SURVEILLANCE_PRICES_RENTAL.autosurveillance} CHF/mois)</option>
                            <option value="autosurveillance-pro">Autosurveillance Professionnel (${SURVEILLANCE_PRICES_RENTAL.autosurveillancePro} CHF/mois)</option>
                            <option value="telesurveillance">Télésurveillance (${SURVEILLANCE_PRICES_RENTAL.telesurveillance} CHF/mois)</option>
                            <option value="telesurveillance-pro">Télésurveillance Professionnel (${SURVEILLANCE_PRICES_RENTAL.telesurveillancePro} CHF/mois)</option>
                        `;
                    } else {
                        surveillanceSelect.innerHTML = `
                            <option value="">Aucun</option>
                            <option value="autosurveillance">Autosurveillance</option>
                            <option value="autosurveillance-pro">Autosurveillance Professionnel</option>
                            <option value="telesurveillance">Télésurveillance</option>
                            <option value="telesurveillance-pro">Télésurveillance Professionnel</option>
                        `;
                    }
                } else {
                    if (centralType === 'jablotron') {
                        const prices = SURVEILLANCE_PRICES_SALE.jablotron;
                        surveillanceSelect.innerHTML = `
                            <option value="">Aucun</option>
                            <option value="telesurveillance">Télésurveillance (${prices.telesurveillance} CHF/mois)</option>
                            <option value="telesurveillance-pro">Télésurveillance Professionnel (${prices.telesurveillancePro} CHF/mois)</option>
                        `;
                    } else if (centralType === 'titane') {
                        const prices = SURVEILLANCE_PRICES_SALE.titane;
                        surveillanceSelect.innerHTML = `
                            <option value="">Aucun</option>
                            <option value="autosurveillance">Autosurveillance (${prices.autosurveillance} CHF/mois)</option>
                            <option value="autosurveillance-pro">Autosurveillance Professionnel (${prices.autosurveillancePro} CHF/mois)</option>
                            <option value="telesurveillance">Télésurveillance (${prices.telesurveillance} CHF/mois)</option>
                            <option value="telesurveillance-pro">Télésurveillance Professionnel (${prices.telesurveillancePro} CHF/mois)</option>
                        `;
                    } else {
                        surveillanceSelect.innerHTML = `
                            <option value="">Aucun</option>
                            <option value="autosurveillance">Autosurveillance</option>
                            <option value="autosurveillance-pro">Autosurveillance Professionnel</option>
                            <option value="telesurveillance">Télésurveillance</option>
                            <option value="telesurveillance-pro">Télésurveillance Professionnel</option>
                        `;
                    }
                }
                
                const options = Array.from(surveillanceSelect.options).map(o => o.value);
                if (options.includes(currentValue)) {
                    surveillanceSelect.value = currentValue;
                } else {
                    surveillanceSelect.value = '';
                }
            }

            updateAllProductSelects() {
                const materialContainer = document.getElementById('alarm-material-products');
                if (materialContainer) {
                    this.updateSelectsInContainer(materialContainer, 'alarm-material');
                }
                
                const installContainer = document.getElementById('alarm-installation-products');
                if (installContainer) {
                    this.updateSelectsInContainer(installContainer, 'alarm-installation');
                }
                
                this.updateTotals();
            }
            
            updateSelectsInContainer(container, sectionId) {
                const productLines = container.querySelectorAll('.product-line');
                productLines.forEach(line => {
                    const select = line.querySelector('.product-select');
                    if (select) {
                        const currentValue = select.value;
                        const availableProducts = this.getFilteredProducts(sectionId);
                        
                        select.innerHTML = `
                            <option value="">Sélectionner un produit</option>
                            ${availableProducts.map(product => {
                                const price = this.getProductPrice(product);
                                return `<option value="${product.id}" data-price="${price}" ${product.id == currentValue ? 'selected' : ''}>${product.name} - ${price.toFixed(2)} CHF</option>`;
                            }).join('')}
                        `;
                        
                        if (currentValue) {
                            const selectedOption = select.querySelector(`option[value="${currentValue}"]`);
                            if (selectedOption) {
                                const newPrice = parseFloat(selectedOption.getAttribute('data-price'));
                                selectedOption.setAttribute('data-price', newPrice);
                            }
                        }
                    }
                });
            }

            calculateSectionTotal(sectionId) {
                const container = document.getElementById(`${sectionId}-products`);
                if (!container) return 0;
                
                let total = 0;
                const productLines = container.querySelectorAll('.product-line');
                
                productLines.forEach(line => {
                    const quantity = parseFloat(line.querySelector('.quantity-input')?.value) || 0;
                    const priceInput = line.querySelector('.price-input');
                    const select = line.querySelector('.product-select');
                    const nameInput = line.querySelector('.product-name-input');
                    const selectedOption = select?.querySelector(`option[value="${select?.value}"]`);
                    const isOffered = line.querySelector('.offered-checkbox')?.checked || false;
                    
                    if (isOffered) {
                        const priceDisplay = line.querySelector('.price-display');
                        if (priceDisplay) {
                            priceDisplay.textContent = 'OFFERT';
                        }
                        return;
                    }
                    
                    let price = 0;
                    
                    if (nameInput && nameInput.style.display !== 'none' && nameInput.value) {
                        price = parseFloat(priceInput?.value) || 0;
                    } else if (priceInput && priceInput.style.display !== 'none') {
                        price = parseFloat(priceInput.value) || 0;
                    } else if (selectedOption) {
                        price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
                    }
                    
                    let lineTotal = price * quantity;
                    total += lineTotal;
                    
                    const priceDisplay = line.querySelector('.price-display');
                    if (priceDisplay) {
                        priceDisplay.textContent = `${lineTotal.toFixed(2)} CHF`;
                    }
                });
                
                const discountType = document.getElementById(`${sectionId}-discount-type`)?.value || 'percent';
                const discountValue = parseFloat(document.getElementById(`${sectionId}-discount-value`)?.value) || 0;
                
                let discountAmount = 0;
                if (discountValue > 0) {
                    if (discountType === 'percent') {
                        discountAmount = total * (discountValue / 100);
                        total = total - discountAmount;
                    } else {
                        discountAmount = Math.min(discountValue, total);
                        total = Math.max(0, total - discountValue);
                    }
                }
                
                return total;
            }

            updateTotals() {
                if (this.currentTab === 'alarm') {
                    const materialTotal = this.calculateSectionTotal('alarm-material');
                    
                    const materialDiscountType = document.getElementById('alarm-material-discount-type')?.value || 'percent';
                    const materialDiscountValue = parseFloat(document.getElementById('alarm-material-discount-value')?.value) || 0;
                    let materialTotalBeforeDiscount = 0;
                    
                    const materialContainer = document.getElementById('alarm-material-products');
                    if (materialContainer) {
                        const productLines = materialContainer.querySelectorAll('.product-line');
                        productLines.forEach(line => {
                            const quantity = parseFloat(line.querySelector('.quantity-input')?.value) || 0;
                            const priceInput = line.querySelector('.price-input');
                            const select = line.querySelector('.product-select');
                            const selectedOption = select?.querySelector(`option[value="${select?.value}"]`);
                            const isOffered = line.querySelector('.offered-checkbox')?.checked || false;
                            if (!isOffered) {
                                let price = 0;
                                if (priceInput && priceInput.style.display !== 'none') {
                                    price = parseFloat(priceInput.value) || 0;
                                } else if (selectedOption) {
                                    price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
                                }
                                materialTotalBeforeDiscount += price * quantity;
                            }
                        });
                    }
                    
                    let installTotal = 0;
                    if (!this.rentalMode['alarm']) {
                        const installQty = parseFloat(document.getElementById('alarm-installation-qty')?.value) || 1;
                        const installPrice = parseFloat(document.getElementById('alarm-installation-price')?.value) || HALF_DAY_PRICE;
                        const installOffered = document.getElementById('alarm-installation-offered')?.checked || false;
                        installTotal = installOffered ? 0 : installPrice;
                        
                        document.getElementById('alarm-installation-display').textContent = 
                            installOffered ? 'OFFERT' : `${installTotal.toFixed(2)} CHF`;
                    } else {
                        document.getElementById('alarm-installation-display').textContent = 'Compris dans le forfait';
                    }
                    
                    const otherInstallationTotal = this.calculateSectionTotal('alarm-installation');
                    
                    const installDiscountType = document.getElementById('alarm-installation-discount-type')?.value || 'percent';
                    const installDiscountValue = parseFloat(document.getElementById('alarm-installation-discount-value')?.value) || 0;
                    let installTotalBeforeDiscount = installTotal;
                    
                    const installContainer = document.getElementById('alarm-installation-products');
                    if (installContainer) {
                        const productLines = installContainer.querySelectorAll('.product-line');
                        productLines.forEach(line => {
                            const quantity = parseFloat(line.querySelector('.quantity-input')?.value) || 0;
                            const priceInput = line.querySelector('.price-input');
                            const select = line.querySelector('.product-select');
                            const selectedOption = select?.querySelector(`option[value="${select?.value}"]`);
                            const isOffered = line.querySelector('.offered-checkbox')?.checked || false;
                            if (!isOffered) {
                                let price = 0;
                                if (priceInput && priceInput.style.display !== 'none') {
                                    price = parseFloat(priceInput.value) || 0;
                                } else if (selectedOption) {
                                    price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
                                }
                                installTotalBeforeDiscount += price * quantity;
                            }
                        });
                    }
                    
                    const totalInstallation = installTotal + otherInstallationTotal;
                    
                    // NOUVEAU: Calcul des frais de dossier avec cases à cocher
                    const simCardOffered = document.getElementById('admin-simcard-offered')?.checked || false;
                    const processingOffered = document.getElementById('admin-processing-offered')?.checked || false;
                    
                    const simCardTotal = simCardOffered ? 0 : ADMIN_FEES.simCard;
                    const processingTotal = processingOffered ? 0 : ADMIN_FEES.processingFee;
                    const adminTotal = simCardTotal + processingTotal;
                    
                    // Mise à jour des affichages
                    document.getElementById('admin-simcard-display').textContent = simCardOffered ? 'OFFERT' : `${ADMIN_FEES.simCard.toFixed(2)} CHF HT`;
                    document.getElementById('admin-processing-display').textContent = processingOffered ? 'OFFERT' : `${ADMIN_FEES.processingFee.toFixed(2)} CHF HT`;
                    document.getElementById('alarm-admin-total').textContent = adminTotal > 0 ? `${adminTotal.toFixed(2)} CHF HT` : 'OFFERT';
                    
                    const testCycliqueSelected = document.getElementById('test-cyclique-selected').checked;
                    const testCycliquePrice = parseFloat(document.getElementById('test-cyclique-price').value) || TEST_CYCLIQUE_DEFAULT_PRICE;
                    const testCycliqueOffered = document.getElementById('test-cyclique-offered').checked;
                    const testCycliqueTotal = testCycliqueSelected ? (testCycliqueOffered ? 0 : testCycliquePrice) : 0;
                    
                    const surveillanceType = document.getElementById('surveillance-type').value;
                    const surveillancePrice = parseFloat(document.getElementById('surveillance-price').value) || 0;
                    const surveillanceOffered = document.getElementById('surveillance-offered').checked;
                    const surveillanceTotal = surveillanceType ? (surveillanceOffered ? 0 : surveillancePrice) : 0;
                    
                    document.getElementById('test-cyclique-total').textContent = testCycliqueSelected ? 
                        (testCycliqueOffered ? 'OFFERT' : `${testCycliqueTotal.toFixed(2)} CHF`) : '0.00 CHF';
                    document.getElementById('surveillance-total').textContent = surveillanceType ? 
                        (surveillanceOffered ? 'OFFERT' : `${surveillanceTotal.toFixed(2)} CHF/mois`) : '0.00 CHF/mois';
                    document.getElementById('surveillance-summary').textContent = surveillanceType ? 
                        (surveillanceOffered ? 'OFFERT' : `${surveillanceTotal.toFixed(2)} CHF/mois`) : '0.00 CHF/mois';
                    
                    const totalHT = materialTotal + totalInstallation + adminTotal + testCycliqueTotal;
                    const totalTTC = this.roundToFiveCents(totalHT * (1 + TVA_RATE));
                    
                    let materialDisplay = `${materialTotal.toFixed(2)} CHF`;
                    if (materialDiscountValue > 0) {
                        let discountAmount = 0;
                        if (materialDiscountType === 'percent') {
                            discountAmount = materialTotalBeforeDiscount * (materialDiscountValue / 100);
                        } else {
                            discountAmount = Math.min(materialDiscountValue, materialTotalBeforeDiscount);
                        }
                        const discountText = materialDiscountType === 'percent' 
                            ? `${materialDiscountValue}%` 
                            : `${materialDiscountValue.toFixed(2)} CHF`;
                        materialDisplay = `${materialTotalBeforeDiscount.toFixed(2)} CHF - Réduction ${discountText} = ${materialTotal.toFixed(2)} CHF`;
                    }
                    
                    let installDisplay = this.rentalMode['alarm'] ? 'Compris dans le forfait' : `${totalInstallation.toFixed(2)} CHF`;
                    if (!this.rentalMode['alarm'] && installDiscountValue > 0) {
                        let discountAmount = 0;
                        if (installDiscountType === 'percent') {
                            discountAmount = installTotalBeforeDiscount * (installDiscountValue / 100);
                        } else {
                            discountAmount = Math.min(installDiscountValue, installTotalBeforeDiscount);
                        }
                        const discountText = installDiscountType === 'percent' 
                            ? `${installDiscountValue}%` 
                            : `${installDiscountValue.toFixed(2)} CHF`;
                        installDisplay = `${installTotalBeforeDiscount.toFixed(2)} CHF - Réduction ${discountText} = ${totalInstallation.toFixed(2)} CHF`;
                    }
                    
                    document.getElementById('alarm-material-total').textContent = materialDisplay;
                    document.getElementById('alarm-installation-total').textContent = installDisplay;
                    document.getElementById('alarm-total-ht').textContent = `${totalHT.toFixed(2)} CHF`;
                    document.getElementById('alarm-total-ttc').textContent = `${totalTTC.toFixed(2)} CHF`;
                    
                    if (!this.rentalMode['alarm']) {
                        const paymentMonths = this.globalPaymentMonths['alarm'] || 0;
                        
                        if (paymentMonths > 0) {
                            const installQty = parseFloat(document.getElementById('alarm-installation-qty')?.value) || 1;
                            const installOffered = document.getElementById('alarm-installation-offered')?.checked || false;
                            
                            const mensualiteMatHT = this.calculateSectionMonthlyPrice('alarm-material', paymentMonths);
                            const mensualiteMatSuppHT = this.calculateSectionMonthlyPrice('alarm-installation', paymentMonths);
                            const mensualiteInstallHT = installOffered ? 0 : this.roundToFiveCents(this.getInstallationMonthlyPrice(installQty, paymentMonths));
                            const totalMensuelHT = mensualiteMatHT + mensualiteMatSuppHT + mensualiteInstallHT + surveillanceTotal;
                            const totalMensuelTTC = this.roundToFiveCents(totalMensuelHT * (1 + TVA_RATE));
                            
                            document.getElementById('alarm-monthly-amount').textContent = totalMensuelTTC.toFixed(2);
                            document.getElementById('alarm-monthly-count').textContent = paymentMonths;
                            document.getElementById('alarm-monthly-payment').style.display = 'block';
                            
                            const comptantTTC = this.roundToFiveCents(adminTotal * (1 + TVA_RATE));
                            document.getElementById('alarm-cash-amount').textContent = comptantTTC.toFixed(2);
                            document.getElementById('alarm-cash-payment').style.display = 'block';
                        } else {
                            document.getElementById('alarm-monthly-payment').style.display = 'none';
                            document.getElementById('alarm-cash-payment').style.display = 'none';
                        }
                    } else {
                        document.getElementById('alarm-monthly-payment').style.display = 'none';
                        document.getElementById('alarm-cash-payment').style.display = 'none';
                    }
                    
                } else if (this.currentTab === 'camera') {
                    const materialTotal = this.calculateSectionTotal('camera-material');
                    
                    const materialDiscountType = document.getElementById('camera-material-discount-type')?.value || 'percent';
                    const materialDiscountValue = parseFloat(document.getElementById('camera-material-discount-value')?.value) || 0;
                    let materialTotalBeforeDiscount = 0;
                    
                    const materialContainer = document.getElementById('camera-material-products');
                    if (materialContainer) {
                        const productLines = materialContainer.querySelectorAll('.product-line');
                        productLines.forEach(line => {
                            const quantity = parseFloat(line.querySelector('.quantity-input')?.value) || 0;
                            const priceInput = line.querySelector('.price-input');
                            const select = line.querySelector('.product-select');
                            const selectedOption = select?.querySelector(`option[value="${select?.value}"]`);
                            const isOffered = line.querySelector('.offered-checkbox')?.checked || false;
                            if (!isOffered) {
                                let price = 0;
                                if (priceInput && priceInput.style.display !== 'none') {
                                    price = parseFloat(priceInput.value) || 0;
                                } else if (selectedOption) {
                                    price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
                                }
                                materialTotalBeforeDiscount += price * quantity;
                            }
                        });
                    }
                    
                    let installationTotal = 0;
                    if (!this.rentalMode['camera']) {
                        const installationPrice = this.calculateCameraInstallationPrice();
                        const installationOffered = document.getElementById('camera-installation-offered').checked;
                        installationTotal = installationOffered ? 0 : installationPrice;
                    }
                    
                    const remoteAccess = !this.rentalMode['camera'] && document.getElementById('camera-remote-access').checked;
                    const remoteAccessPrice = remoteAccess ? REMOTE_ACCESS_PRICE : 0;
                    
                    const totalHT = materialTotal + installationTotal;
                    const totalTTC = this.roundToFiveCents(totalHT * (1 + TVA_RATE));
                    
                    let materialDisplay = `${materialTotal.toFixed(2)} CHF`;
                    if (materialDiscountValue > 0) {
                        let discountAmount = 0;
                        if (materialDiscountType === 'percent') {
                            discountAmount = materialTotalBeforeDiscount * (materialDiscountValue / 100);
                        } else {
                            discountAmount = Math.min(materialDiscountValue, materialTotalBeforeDiscount);
                        }
                        const discountText = materialDiscountType === 'percent' 
                            ? `${materialDiscountValue}%` 
                            : `${materialDiscountValue.toFixed(2)} CHF`;
                        materialDisplay = `${materialTotalBeforeDiscount.toFixed(2)} CHF - Réduction ${discountText} = ${materialTotal.toFixed(2)} CHF`;
                    }
                    
                    document.getElementById('camera-material-total').textContent = materialDisplay;
                    
                    if (this.rentalMode['camera']) {
                        document.getElementById('camera-installation-total').textContent = 'Compris dans le forfait';
                    } else {
                        document.getElementById('camera-installation-total').textContent = `${installationTotal.toFixed(2)} CHF`;
                        document.getElementById('camera-installation-price').textContent = document.getElementById('camera-installation-offered').checked ? 'OFFERT' : `${installationTotal.toFixed(2)} CHF`;
                    }
                    
                    if (!this.rentalMode['camera']) {
                        document.getElementById('camera-remote-total').textContent = remoteAccess ? `${REMOTE_ACCESS_PRICE.toFixed(2)} CHF/mois` : '0.00 CHF/mois';
                        
                        const paymentMonths = this.globalPaymentMonths['camera'] || 0;
                        
                        if (paymentMonths > 0) {
                            const installQty = parseFloat(document.getElementById('camera-installation-qty')?.value) || 1;
                            
                            const mensualiteMatHT = this.calculateSectionMonthlyPrice('camera-material', paymentMonths);
                            const mensualiteInstallHT = document.getElementById('camera-installation-offered').checked ? 0 : this.roundToFiveCents(this.getInstallationMonthlyPrice(installQty, paymentMonths));
                            const totalMensuelHT = mensualiteMatHT + mensualiteInstallHT + remoteAccessPrice;
                            const totalMensuelTTC = this.roundToFiveCents(totalMensuelHT * (1 + TVA_RATE));
                            
                            document.getElementById('camera-monthly-amount').textContent = totalMensuelTTC.toFixed(2);
                            document.getElementById('camera-monthly-count').textContent = paymentMonths;
                            document.getElementById('camera-monthly-payment').style.display = 'block';
                            
                            const remoteMonthly = document.getElementById('camera-remote-monthly');
                            if (remoteMonthly) {
                                remoteMonthly.style.display = remoteAccess ? 'block' : 'none';
                            }
                        } else {
                            document.getElementById('camera-monthly-payment').style.display = 'none';
                        }
                    }
                    
                    document.getElementById('camera-total-ht').textContent = `${totalHT.toFixed(2)} CHF`;
                    document.getElementById('camera-total-ttc').textContent = `${totalTTC.toFixed(2)} CHF`;
                }
            }

            selectPayment(element, sectionId) {
                const tabType = sectionId.startsWith('alarm') ? 'alarm' : 'camera';
                if (this.rentalMode[tabType]) return;
                
                const parent = element.closest('.payment-options');
                parent.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                element.classList.add('active');
                
                const months = parseInt(element.getAttribute('data-months')) || 0;
                this.sections[sectionId] = { paymentMonths: months };
                
                this.updateTotals();
            }

            selectGlobalPayment(element, type) {
                if (this.rentalMode[type]) return;
                
                const parent = element.closest('.payment-options');
                parent.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                element.classList.add('active');
                
                const months = parseInt(element.getAttribute('data-months')) || 0;
                this.globalPaymentMonths[type] = months;
                
                this.updateTotals();
            }

showKitSelector() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const selectKit = (btn, centralType, kitType) => {
        modal.querySelectorAll('.kit-btn').forEach(b => {
            b.style.background = 'white';
            b.style.borderWidth = '2px';
            const checkmark = b.querySelector('.checkmark');
            if (checkmark) checkmark.remove();
        });
        
        const isTitane = centralType === 'titane';
        btn.style.background = isTitane ? '#fffef0' : '#f8f9fa';
        btn.style.borderWidth = '3px';
        
        if (!btn.querySelector('.checkmark')) {
            const checkmark = document.createElement('div');
            checkmark.className = 'checkmark';
            checkmark.innerHTML = '✓';
            checkmark.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: ${isTitane ? '#f4e600' : '#6c757d'};
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                animation: scaleIn 0.2s ease;
            `;
            btn.appendChild(checkmark);
        }
        
        setTimeout(() => {
            this.applyKit(centralType, kitType);
            modal.remove();
        }, 400);
    };
    
    const closeModal = () => {
        modal.remove();
    };
    
    modal.innerHTML = `
        <style>
            @keyframes scaleIn {
                from { transform: scale(0); }
                to { transform: scale(1); }
            }
        </style>
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">
                <h2 style="margin: 0; color: #333; font-size: 20px;">Sélectionner un kit de base</h2>
                <button id="close-modal-btn" style="background: #e0e0e0; color: #666; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 20px; cursor: pointer; line-height: 1; transition: all 0.2s;" onmouseover="this.style.background='#d0d0d0'" onmouseout="this.style.background='#e0e0e0'">×</button>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #666; margin-bottom: 12px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Centrale Jablotron - ${CENTRALS_CONFIG.jablotron.price.toFixed(2)} CHF</h3>
                <div style="display: flex; gap: 12px;">
                    <button class="kit-btn" data-central="jablotron" data-kit="kit1"
                            style="position: relative; flex: 1; padding: 15px; background: white; border: 2px solid #6c757d; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; text-align: left;"
                            onmouseover="if(!this.querySelector('.checkmark')) { this.style.background='#f8f9fa'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(108,117,125,0.2)'; }"
                            onmouseout="if(!this.querySelector('.checkmark')) { this.style.background='white'; this.style.transform='translateY(0)'; this.style.boxShadow='none'; }">
                        <div style="font-weight: 600; margin-bottom: 8px; color: #333;">Kit 1</div>
                        <div style="font-size: 12px; color: #666; line-height: 1.6;">
                            2 Détecteurs volumétriques<br>
                            1 Détecteur d'ouverture<br>
                            1 Clavier + 1 Sirène
                        </div>
                    </button>
                    <button class="kit-btn" data-central="jablotron" data-kit="kit2"
                            style="position: relative; flex: 1; padding: 15px; background: white; border: 2px solid #6c757d; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; text-align: left;"
                            onmouseover="if(!this.querySelector('.checkmark')) { this.style.background='#f8f9fa'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(108,117,125,0.2)'; }"
                            onmouseout="if(!this.querySelector('.checkmark')) { this.style.background='white'; this.style.transform='translateY(0)'; this.style.boxShadow='none'; }">
                        <div style="font-weight: 600; margin-bottom: 8px; color: #333;">Kit 2</div>
                        <div style="font-size: 12px; color: #666; line-height: 1.6;">
                            1 Détecteur volumétrique<br>
                            3 Détecteurs d'ouverture<br>
                            1 Clavier + 1 Sirène
                        </div>
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #666; margin-bottom: 12px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Centrale Titane - ${CENTRALS_CONFIG.titane.price.toFixed(2)} CHF</h3>
                <div style="display: flex; gap: 12px;">
                    <button class="kit-btn" data-central="titane" data-kit="kit1"
                            style="position: relative; flex: 1; padding: 15px; background: white; border: 2px solid #f4e600; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; text-align: left;"
                            onmouseover="if(!this.querySelector('.checkmark')) { this.style.background='#fffef0'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(244,230,0,0.2)'; }"
                            onmouseout="if(!this.querySelector('.checkmark')) { this.style.background='white'; this.style.transform='translateY(0)'; this.style.boxShadow='none'; }">
                        <div style="font-weight: 600; margin-bottom: 8px; color: #333;">Kit 1</div>
                        <div style="font-size: 12px; color: #666; line-height: 1.6;">
                            2 Détecteurs volumétriques<br>
                            1 Détecteur d'ouverture<br>
                            1 Clavier + 1 Sirène
                        </div>
                    </button>
                    <button class="kit-btn" data-central="titane" data-kit="kit2"
                            style="position: relative; flex: 1; padding: 15px; background: white; border: 2px solid #f4e600; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; text-align: left;"
                            onmouseover="if(!this.querySelector('.checkmark')) { this.style.background='#fffef0'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(244,230,0,0.2)'; }"
                            onmouseout="if(!this.querySelector('.checkmark')) { this.style.background='white'; this.style.transform='translateY(0)'; this.style.boxShadow='none'; }">
                        <div style="font-weight: 600; margin-bottom: 8px; color: #333;">Kit 2</div>
                        <div style="font-size: 12px; color: #666; line-height: 1.6;">
                            1 Détecteur volumétrique<br>
                            3 Détecteurs d'ouverture<br>
                            1 Clavier + 1 Sirène
                        </div>
                    </button>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 12px; background: #f8f9fa; border-left: 3px solid #f4e600; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #666;">
                    💡 Le kit sera automatiquement marqué comme OFFERT
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('#close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    modal.querySelectorAll('.kit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const centralType = btn.getAttribute('data-central');
            const kitType = btn.getAttribute('data-kit');
            selectKit(btn, centralType, kitType);
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

applyKit(centralType, kitType) {
    const container = document.getElementById('alarm-material-products');
    container.innerHTML = '';
    
    this.selectedCentral = centralType;
    this.kitOffered = true;
    
    const config = CENTRALS_CONFIG[centralType];
    if (!config) {
        alert('Erreur: Configuration de centrale introuvable');
        return;
    }
    
    this.addProductToContainer('alarm-material', config.id, 1, true);
    
    const kit = config.kits[kitType];
    if (kit && kit.products) {
        kit.products.forEach(product => {
            this.addProductToContainer('alarm-material', product.id, product.quantity, true);
        });
    }
    
    this.updateSurveillanceOptions(centralType);
    this.updateTotals();
    this.showNotification(`✅ ${config.name} + ${kit.name} ajouté avec succès!`, 'success');
}

addProductToContainer(sectionId, productId, quantity, isOffered) {
    const container = document.getElementById(`${sectionId}-products`);
    if (!container) return;
    
    const product = this.catalog[sectionId]?.find(p => p.id === productId);
    if (!product) return;
    
    const price = this.getProductPrice(product);
    const lineId = 'line-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const productLine = document.createElement('div');
    productLine.className = 'product-line';
    if (productId === 5 || productId === 6) {
        productLine.classList.add('central-line');
    }
    
    productLine.innerHTML = `
        <div class="product-select-container" style="width: 100%;">
            <select class="product-select" id="select-${lineId}" onchange="handleProductSelection(this)" data-section="${sectionId}">
                <option value="${productId}" data-price="${price}" selected>${product.name} - ${price.toFixed(2)} CHF</option>
            </select>
        </div>
        <input type="number" value="${quantity}" min="1" class="quantity-input" oninput="updateTotals()">
        <input type="number" value="${price}" min="0" step="0.01" class="price-input discount-input" style="display: none;" placeholder="Prix unitaire" oninput="updateTotals()">
        <div class="checkbox-option" style="margin: 0;">
            <input type="checkbox" class="offered-checkbox" ${isOffered ? 'checked' : ''} onchange="updateTotals()">
            <label style="margin: 0; font-size: 12px;">OFFERT</label>
        </div>
        <div class="price-display">${isOffered ? 'OFFERT' : (price * quantity).toFixed(2) + ' CHF'}</div>
        <button class="remove-btn" onclick="this.closest('.product-line').remove(); generator.detectSelectedCentral(); updateTotals();">×</button>
    `;
    
    container.appendChild(productLine);
}

            async sendToEmailAndDrive(pdfBlob, filename, commercial, clientName, assemblyInfo = null) {
                this.showNotification('📤 Envoi du PDF en cours...', 'info', 0);
                
                const MAX_RETRIES = 1; // Une seule tentative suffit
                // Video quotes are much larger (product sheets + accessories) - need more time on iOS
                const isVideoQuote = this.currentTab === 'camera';
                const TIMEOUT_MS = isVideoQuote ? 240000 : 120000; // 240s for video, 120s for alarm
                
                // Vérifier que l'URL est configurée
                if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === '') {
                    console.error('❌ GOOGLE_SCRIPT_URL n\'est pas configurée');
                    throw new Error('URL Google Script non configurée. Veuillez configurer GOOGLE_SCRIPT_URL dans script.js');
                }
                
                // Convert PDF to base64
                const base64 = await this.blobToBase64(pdfBlob);
                
                // Collect products for assembly
                const products = this.collectProductsForAssembly();
                
                // Determine quote type for assembly
                let quoteType = null;
                let centralType = null;
                
                if (this.currentTab === 'alarm') {
                    quoteType = 'alarme';  // Always 'alarme' for alarm quotes
                    // Add separate field for central type
                    if (this.selectedCentral === 'jablotron') {
                        centralType = 'jablotron';
                        console.log('✅ Alarm quote with Jablotron central');
                    } else {
                        centralType = 'titane';  // Default to Titane
                        console.log('✅ Alarm quote with Titane central');
                    }
                } else if (this.currentTab === 'camera') {
                    quoteType = 'video';
                }
                
                const payload = {
                    pdfBase64: base64,
                    filename: filename,
                    commercial: commercial,
                    clientName: clientName,
                    type: quoteType,
                    centralType: centralType,  // NEW: separate field for Titane vs Jablotron
                    produits: products,
                    addCommercialOverlay: false,
                    mergedByFrontend: this.USE_PDF_LIB_MERGING,  // NEW: flag to tell backend PDF is already merged
                    frontendAssemblyInfo: assemblyInfo,  // NEW: assembly info from frontend pdf-lib merge
                    timestamp: new Date().toISOString()
                };
                
                console.log('📦 Assembly parameters (ACTUAL PAYLOAD):', {
                    type: quoteType,
                    centralType: centralType,
                    productsCount: products.length,
                    products: products,
                    mergedByFrontend: this.USE_PDF_LIB_MERGING,
                    frontendAssemblyInfo: assemblyInfo
                });
                
                if (assemblyInfo) {
                    console.log('📋 Frontend assembly info being sent to backend:');
                    console.log('   - baseDossier:', assemblyInfo.baseDossier);
                    console.log('   - productsFound:', assemblyInfo.productsFound);
                    console.log('   - totalPages:', assemblyInfo.totalPages);
                }
                
                // Detect browser/device
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const isDesktop = !isMobile && !isIOS;
                
                console.log('📱 Détection appareil:', {isIOS, isSafari, isMobile, isDesktop, userAgent: navigator.userAgent});
                console.log('📦 Taille du payload:', JSON.stringify(payload).length, 'bytes');
                console.log('⏱️ Timeout configuré:', (TIMEOUT_MS / 1000) + 's', '(Type:', isVideoQuote ? 'Vidéo' : 'Alarme', ')');
                
                // Méthode avec retry
                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    try {
                        console.log(`🔄 Tentative ${attempt}/${MAX_RETRIES}`);
                        
                        // SOLUTION iOS: XMLHttpRequest ASYNCHRONE avec timeout long (synchrone ne marche pas avec gros PDFs)
                        console.log('🚀 iOS - Tentative XMLHttpRequest ASYNC...');
                        
                        return new Promise((resolve, reject) => {
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('data', JSON.stringify(payload));
                            
                            // Ouvrir connexion ASYNCHRONE avec timeout adapté au type de devis
                            xhr.open('POST', GOOGLE_SCRIPT_URL, true); // true = ASYNC
                            xhr.timeout = isVideoQuote ? 240000 : 120000; // 240s pour vidéo (gros PDFs), 120s pour alarme
                            
                            xhr.onload = () => {
                                console.log('✅ XHR Status:', xhr.status);
                                if (xhr.status === 200) {
                                    console.log('✅ Requête réussie');
                                    console.log('📧 Email envoyé à: devis.dialarme@gmail.com');
                                    console.log('📁 PDF sauvegardé dans Drive');
                                    resolve({
                                        success: true,
                                        message: 'PDF envoyé - Vérifiez votre email',
                                        assumed: false
                                    });
                                } else {
                                    console.warn('⚠️ Status non-200:', xhr.status);
                                    reject(new Error('HTTP ' + xhr.status));
                                }
                            };
                            
                            xhr.onerror = () => {
                                console.error('❌ XHR Network Error');
                                reject(new Error('Network error'));
                            };
                            
                            xhr.ontimeout = () => {
                                console.error('❌ XHR Timeout (30s)');
                                reject(new Error('Timeout'));
                            };
                            
                            console.log('📡 Envoi async (timeout 30s)...');
                            xhr.send(formData);
                        });
                        
} catch (error) {
                        console.warn(`⚠️ Tentative ${attempt} échouée:`, error.message);
                        
                        if (attempt === MAX_RETRIES) {
                            console.error('❌ Échec après', MAX_RETRIES, 'tentatives');
                            throw new Error(`Échec de l'envoi après ${MAX_RETRIES} tentatives: ${error.message}`);
                        }
                        
                        // Attendre avant de réessayer (backoff exponentiel)
                        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                        console.log(`⏳ Nouvelle tentative dans ${delay}ms...`);
                        await this.sleep(delay);
                    }
                }
            }
            
            /**
             * Convertit un Blob en base64
             */
            blobToBase64(blob) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = (error) => {
                        reject(new Error('Erreur de lecture du fichier: ' + error));
                    };
                    reader.readAsDataURL(blob);
                });
            }
            
            /**
             * Collect product names from all sections for backend assembly
             * Returns an array of product names
             * 
             * Note: Reads directly from DOM (like PDF generation does)
             */
            collectProductsForAssembly() {
                const products = [];
                
                console.log('🔍 DEBUG - Collecting products from DOM for tab:', this.currentTab);
                
                // Get the active tab content (using ID, not class)
                const activeTab = document.getElementById(`${this.currentTab}-tab`);
                if (!activeTab) {
                    console.log('❌ No active tab found for:', `${this.currentTab}-tab`);
                    return products;
                }
                console.log('✅ Active tab found:', activeTab.id);
                
                // Find all product lines in the active tab
                const productLines = activeTab.querySelectorAll('.product-line');
                console.log(`🔍 Found ${productLines.length} product lines in DOM`);
                
                productLines.forEach((line, index) => {
                    // Get the product select dropdown
                    const select = line.querySelector('.product-select');
                    if (!select) {
                        console.log(`  Line ${index}: No select found`);
                        return;
                    }
                    
                    // Get selected product name
                    const selectedOption = select.options[select.selectedIndex];
                    const productName = selectedOption ? selectedOption.text : '';
                    
                    // Get quantity
                    const quantityInput = line.querySelector('.quantity-input');
                    const quantity = quantityInput ? parseFloat(quantityInput.value) || 0 : 0;
                    
                    // Check if offered
                    const offeredCheckbox = line.querySelector('.offered-checkbox');
                    const isOffered = offeredCheckbox ? offeredCheckbox.checked : false;
                    
                    console.log(`  Line ${index}:`, {
                        name: productName,
                        quantity: quantity,
                        offered: isOffered
                    });
                    
                    // Only add if: has name, has quantity, and not offered
                    if (productName && 
                        productName.trim() !== '' && 
                        productName !== 'Sélectionner un produit' &&
                        quantity > 0 && 
                        !isOffered) {
                        // Clean product name: remove price (everything after " - " if it contains "CHF")
                        let cleanName = productName.trim();
                        if (cleanName.includes(' CHF')) {
                            cleanName = cleanName.split(' - ').slice(0, -1).join(' - ');
                        }
                        products.push(cleanName);
                        console.log(`    ✅ Added: ${cleanName}${cleanName !== productName ? ' (cleaned from: ' + productName + ')' : ''}`);
                    } else {
                        console.log(`    ⏭️ Skipped (${isOffered ? 'offered' : 'no quantity or invalid name'})`);
                    }
                });
                
                console.log('🔍 Products collected for assembly:', products);
                return products;
            }
            
            /**
             * Envoi via fetch moderne (Chrome, Firefox, Edge)
             */
            async sendViaFetch(payload, timeoutMs) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                
                try {
                    // Créer un nouvel iframe pour capturer la réponse
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.name = 'response_frame_' + Date.now();
                    document.body.appendChild(iframe);
                    
                    // Créer et soumettre le formulaire
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = GOOGLE_SCRIPT_URL;
                    form.target = iframe.name;
                    form.style.display = 'none';
                    
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'data';
                    input.value = JSON.stringify(payload);
                    
                    form.appendChild(input);
                    document.body.appendChild(form);
                    
                    // Créer une promesse pour attendre la réponse
                    const responsePromise = new Promise((resolve, reject) => {
                        const checkResponse = () => {
                            try {
                                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                const responseText = iframeDoc.body.textContent;
                                
                                if (responseText && responseText.trim()) {
                                    const response = JSON.parse(responseText);
                                    if (response.success) {
                                        resolve(response);
                                    } else {
                                        reject(new Error(response.error || 'Erreur inconnue'));
                                    }
                                } else {
                                    // Pas encore de réponse, réessayer
                                    setTimeout(checkResponse, 500);
                                }
                            } catch (e) {
                                // Iframe pas encore chargé ou erreur de parsing
                                setTimeout(checkResponse, 500);
                            }
                        };
                        
                        iframe.onload = () => {
                            setTimeout(checkResponse, 100);
                        };
                        
                        // Timeout de sécurité
                        setTimeout(() => {
                            reject(new Error('Timeout: pas de réponse du serveur'));
                        }, timeoutMs);
                    });
                    
                    // Soumettre le formulaire
                    form.submit();
                    
                    // Attendre la réponse
                    const result = await responsePromise;
                    
                    // Nettoyer
                    if (form.parentNode) document.body.removeChild(form);
                    if (iframe.parentNode) document.body.removeChild(iframe);
                    
                    clearTimeout(timeoutId);
                    return result;
                    
} catch (error) {
                    clearTimeout(timeoutId);
throw error;
}
}
            
            /**
             * Envoi optimisé pour iOS/Safari - utilise navigator.sendBeacon
             */
            async sendViaFormSubmit(payload, timeoutMs) {
                console.log('📤 iOS/Safari - Tentative 1: navigator.sendBeacon()...');
                
                // Méthode 1: sendBeacon (conçu pour mobile, toujours envoyé même si page ferme)
                if (navigator.sendBeacon) {
                    try {
                        const blob = new Blob([JSON.stringify({ data: JSON.stringify(payload) })], { 
                            type: 'application/x-www-form-urlencoded' 
                        });
                        
                        const sent = navigator.sendBeacon(GOOGLE_SCRIPT_URL, blob);
                        
                        if (sent) {
                            console.log('✅ Beacon envoyé avec succès!');
                            console.log('⏳ Attente de 10 secondes pour traitement...');
                            
                            await new Promise(resolve => setTimeout(resolve, 10000));
                            
                            console.log('✅ Traitement terminé');
                            console.log('📧 Vérifiez email: devis.dialarme@gmail.com');
                            console.log('📁 Vérifiez Google Drive');
                            
                            return {
                                success: true,
                                message: 'PDF envoyé via beacon - Vérifiez email',
                                assumed: true
                            };
                        } else {
                            console.warn('⚠️ Beacon refusé, essai fetch...');
                        }
                    } catch (error) {
                        console.error('❌ Erreur beacon:', error.message);
                    }
                }
                
                // Méthode 2: Fetch classique
                console.log('📤 iOS/Safari - Tentative 2: fetch no-cors...');
                try {
                    const formData = new FormData();
                    formData.append('data', JSON.stringify(payload));
                    
                    await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        body: formData,
                        mode: 'no-cors',
                        credentials: 'omit'
                    });
                    
                    console.log('✅ Fetch envoyé');
                    console.log('⏳ Attente de 10 secondes...');
                    
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    
                    console.log('✅ Traitement terminé');
                    console.log('📧 Vérifiez email: devis.dialarme@gmail.com');
                    
                    return {
                        success: true,
                        message: 'PDF envoyé via fetch - Vérifiez email',
                        assumed: true
                    };
                    
                } catch (error) {
                    console.error('❌ Erreur fetch:', error.message);
                    console.log('🔄 Tentative iframe...');
                    return this.sendViaTraditionalForm(payload);
                }
            }
            
            
            /**
             * Méthode iframe - fonctionne sur iOS même avec bloqueurs de popup
             */
            async sendViaTraditionalForm(payload) {
                console.log('📋 Envoi via iframe (méthode iOS-compatible)...');
                
                return new Promise((resolve) => {
                    // Créer un iframe invisible
                    const iframe = document.createElement('iframe');
                    iframe.name = 'upload_iframe_' + Date.now();
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    
                    // Créer un formulaire ciblant l'iframe
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = GOOGLE_SCRIPT_URL;
                    form.target = iframe.name;
                    form.style.display = 'none';
                    form.enctype = 'application/x-www-form-urlencoded';
                    
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'data';
                    input.value = JSON.stringify(payload);
                    
                    form.appendChild(input);
                    document.body.appendChild(form);
                    
                    console.log('📡 Soumission du formulaire vers iframe...');
                    
                    // Soumettre
                    form.submit();
                    
                    console.log('✅ Formulaire soumis vers iframe');
                    console.log('⏳ Attente de 12 secondes pour traitement backend...');
                    
                    // Attendre que le backend traite
                    setTimeout(() => {
                        console.log('✅ Traitement terminé');
                        console.log('📧 Vérifiez votre email à devis.dialarme@gmail.com');
                        console.log('📁 Vérifiez Google Drive');
                        
                        // Nettoyer
                        if (form.parentNode) document.body.removeChild(form);
                        if (iframe.parentNode) document.body.removeChild(iframe);
                        
                        resolve({
                            success: true,
                            message: 'PDF envoyé - Vérifiez votre email',
                            assumed: true
                        });
                    }, 12000);
                });
            }

            /**
             * NEW FUNCTION: Assemble PDF using pdf-lib (client-side merging)
             * This function will merge the generated quote with base documents and product sheets
             * Returns a single merged PDF blob ready to send to backend
             */
            async assemblePdfWithLibrary(pdfBlob, filename, commercial, clientName, propertyType) {
                console.log('🔧 Starting PDF assembly with pdf-lib...');
                
                try {
                    // Check if pdf-lib is available
                    if (typeof PDFLib === 'undefined') {
                        throw new Error('pdf-lib library not loaded');
                    }

                    // Determine quote type and central type
                    let quoteType = null;
                    let centralType = null;
                    
                    if (this.currentTab === 'alarm') {
                        quoteType = 'alarme';
                        centralType = this.selectedCentral === 'jablotron' ? 'jablotron' : 'titane';
                    } else if (this.currentTab === 'camera') {
                        quoteType = 'video';
                    }
                    
                    // Collect products for assembly
                    const products = this.collectProductsForAssembly();
                    
                    console.log('📋 Assembly parameters:', {
                        quoteType,
                        centralType,
                        productsCount: products.length,
                        products: products
                    });

                    if (quoteType === 'alarme') {
                        return await this.assembleAlarmPdf(pdfBlob, filename, commercial, clientName, centralType, propertyType);
                    } else if (quoteType === 'video') {
                        return await this.assembleVideoPdf(pdfBlob, filename, commercial, clientName, products, propertyType);
                    }
                    
                } catch (error) {
                    console.error('❌ Error in PDF assembly with pdf-lib:', error);
                    // Return original PDF as fallback
                    console.log('⚠️ Falling back to original PDF');
                    return { blob: pdfBlob, info: null };
                }
            }

            /**
             * Assemble alarm PDF: Base document with generated quote REPLACING page 6 + Commercial overlay at page 2
             */
            async assembleAlarmPdf(pdfBlob, filename, commercial, clientName, centralType, propertyType) {
                console.log('🚨 Assembling alarm PDF with central type:', centralType);
                
                try {
                    // 1. BATCH FETCH base document (faster than synchronous fetch)
                    console.log('⚡ Using batch fetch for faster performance...');
                    const documents = await this.fetchAllDocumentsInBatch('alarme', centralType, []);
                    
                    if (!documents.base) {
                        throw new Error('Could not fetch base document');
                    }
                    console.log('✅ Base document fetched:', documents.base.size, 'bytes');
                    
                    // 2. Load base document
                    const basePdf = await PDFLib.PDFDocument.load(await documents.base.arrayBuffer());
                    const basePageCount = basePdf.getPageCount();
                    console.log('✅ Base document loaded:', basePageCount, 'pages');
                    
                    // 3. Load generated quote
                    const quotePdf = await PDFLib.PDFDocument.load(await pdfBlob.arrayBuffer());
                    const quotePageCount = quotePdf.getPageCount();
                    console.log('✅ Generated quote loaded:', quotePageCount, 'page(s)');
                    
                    // 4. Create new PDF document
                    const pdfDoc = await PDFLib.PDFDocument.create();
                    
                    // 5. Add pages 1-5 from base document
                    for (let i = 0; i < 5 && i < basePageCount; i++) {
                        const [copiedPage] = await pdfDoc.copyPages(basePdf, [i]);
                        pdfDoc.addPage(copiedPage);
                    }
                    console.log('✅ Base document pages 1-5 added');
                    
                    // 6. INSERT generated quote as NEW page 6 (original page 6 becomes page 7)
                    const [quotePage] = await pdfDoc.copyPages(quotePdf, [0]);
                    pdfDoc.addPage(quotePage);
                    console.log('✅ Generated quote inserted as page 6');
                    
                    // 7. Add remaining pages from base document (original pages 6-11 become pages 7-12)
                    if (basePageCount > 5) {
                        for (let i = 5; i < basePageCount; i++) {
                            const [copiedPage] = await pdfDoc.copyPages(basePdf, [i]);
                            pdfDoc.addPage(copiedPage);
                        }
                        console.log('✅ Base document pages 6-' + basePageCount + ' added (now pages 7-' + (basePageCount + 1) + ')');
                    }
                    
                    console.log('📊 Total pages in final document:', pdfDoc.getPageCount());
                    console.log('   - Base document pages: 1-5, 7-' + (basePageCount + 1));
                    console.log('   - Generated quote: page 6');
                    
                    // 8. Add commercial overlay to page 2 (index 1)
                    await this.addCommercialOverlay(pdfDoc, commercial, 1, propertyType);
                    
                    // 9. Generate final PDF
                    const mergedPdfBytes = await pdfDoc.save();
                    const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                    
                    const totalPages = pdfDoc.getPageCount();
                    const baseDossierName = centralType === 'jablotron' ? 'Devis_ALARME_JABLOTRON.pdf' : 'Devis_ALARME_TITANE.pdf';
                    
                    console.log('✅ Alarm PDF assembly completed');
                    console.log('📄 Final PDF size:', mergedPdfBlob.size, 'bytes');
                    console.log('📄 Final page count:', totalPages, 'pages');
                    
                    // Return blob and assembly info
                    return {
                        blob: mergedPdfBlob,
                        info: {
                            baseDossier: baseDossierName,
                            productsFound: 0, // Alarm doesn't include product sheets
                            totalPages: totalPages,
                            overlayAdded: true
                        }
                    };
                    
                } catch (error) {
                    console.error('❌ Error assembling alarm PDF:', error);
                    throw error;
                }
            }
            /**
             * Assemble video PDF: Base document + Generated quote + Product sheets + Accessories
             * iOS: Uses individual fetches and skips accessories (timeout limitation)
             * Desktop: Uses batch fetching for faster performance
             */
            async assembleVideoPdf(pdfBlob, filename, commercial, clientName, products, propertyType) {
                console.log('📹 Assembling video PDF with', products.length, 'products');
                
                try {
                    // Detect iOS - synchronous XHR has 60s timeout limit
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                    
                    let documents;
                    
                    if (isIOS) {
                        // iOS: Fetch individually to stay within 60s timeout per request
                        // Skip accessories entirely (causes timeout)
                        console.log('📱 iOS detected - using individual fetches, skipping accessories');
                        
                        // 1. Fetch base document
                        console.log('📄 [1/2] Fetching base document...');
                        const baseBlob = await this.fetchBaseDocument('video', null);
                        if (!baseBlob) {
                            throw new Error('Could not fetch base document');
                        }
                        
                        // 2. Fetch product sheets individually
                        console.log('📦 [2/2] Fetching', products.length, 'product sheets individually...');
                        const productBlobs = [];
                        for (let i = 0; i < products.length; i++) {
                            const productName = products[i];
                            console.log(`   [${i + 1}/${products.length}] Fetching: ${productName}`);
                            const productBlob = await this.fetchProductSheet(productName);
                            if (productBlob) {
                                productBlobs.push({
                                    name: productName,
                                    blob: productBlob
                                });
                                console.log(`   ✅ Fetched: ${productName}`);
                            } else {
                                console.warn(`   ⚠️ Not found: ${productName}`);
                            }
                        }
                        
                        // 3. Accessories are skipped on iOS
                        console.log('⚠️ Accessories skipped on iOS (platform limitation)');
                        
                        documents = {
                            base: baseBlob,
                            products: productBlobs,
                            accessories: null // Explicitly null on iOS
                        };
                        
                        console.log('✅ iOS individual fetch completed:', {
                            base: baseBlob ? (baseBlob.size / 1024 / 1024).toFixed(2) + ' MB' : 'missing',
                            products: productBlobs.length + '/' + products.length,
                            accessories: 'skipped (iOS)'
                        });
                    } else {
                        // Desktop: Use batch fetch (faster, no timeout issues)
                        console.log('⚡ Desktop detected - using batch fetch for faster performance...');
                        documents = await this.fetchAllDocumentsInBatch('video', null, products);
                        
                        if (!documents.base) {
                            throw new Error('Could not fetch base document');
                        }
                    }
                    
                    // 2. Load base document
                    const basePdf = await PDFLib.PDFDocument.load(await documents.base.arrayBuffer());
                    const basePageCount = basePdf.getPageCount();
                    console.log('✅ Base document loaded:', basePageCount, 'pages');
                    
                    // 3. Create new PDF document
                    const pdfDoc = await PDFLib.PDFDocument.create();
                    
                    // 4. Add pages 1-5 from base document
                    for (let i = 0; i < 5 && i < basePageCount; i++) {
                        const [copiedPage] = await pdfDoc.copyPages(basePdf, [i]);
                        pdfDoc.addPage(copiedPage);
                    }
                    console.log('✅ Base document pages 1-5 added');
                    
                    // 5. Add generated quote as page 6
                    const quotePdf = await PDFLib.PDFDocument.load(await pdfBlob.arrayBuffer());
                    const quotePages = await pdfDoc.copyPages(quotePdf, quotePdf.getPageIndices());
                    quotePages.forEach(page => pdfDoc.addPage(page));
                    console.log('✅ Generated quote inserted as page 6');
                    
                    // 6. Add product sheets
                    let productSheetsAdded = 0;
                    if (documents.products) {
                        for (const product of documents.products) {
                            if (product.blob) {
                                try {
                                    const productPdf = await PDFLib.PDFDocument.load(await product.blob.arrayBuffer());
                                    const productPages = await pdfDoc.copyPages(productPdf, productPdf.getPageIndices());
                                    productPages.forEach(page => pdfDoc.addPage(page));
                                    console.log('✅ Product sheet added:', product.name);
                                    productSheetsAdded++;
                                } catch (error) {
                                    console.warn('⚠️ Could not add product sheet for:', product.name, error.message);
                                }
                            } else {
                                console.warn('⚠️ Product sheet not found:', product.name);
                            }
                        }
                    }
                    console.log('📊 Product sheets added:', productSheetsAdded, '/', products.length);
                    
                    // 7. Add accessories sheet (desktop only, iOS skips)
                    if (documents.accessories) {
                        try {
                            const accessoriesPdf = await PDFLib.PDFDocument.load(await documents.accessories.arrayBuffer());
                            const accessoriesPages = await pdfDoc.copyPages(accessoriesPdf, accessoriesPdf.getPageIndices());
                            accessoriesPages.forEach(page => pdfDoc.addPage(page));
                            console.log('✅ Accessories sheet added');
                        } catch (error) {
                            console.warn('⚠️ Could not add accessories sheet:', error.message);
                        }
                    } else if (isIOS) {
                        console.log('⚠️ Accessories not included (iOS limitation)');
                    }
                    
                    // 8. Add remaining pages from base document (original pages 6-end)
                    if (basePageCount > 5) {
                        for (let i = 5; i < basePageCount; i++) {
                            const [copiedPage] = await pdfDoc.copyPages(basePdf, [i]);
                            pdfDoc.addPage(copiedPage);
                        }
                        console.log('✅ Base document pages 6-' + basePageCount + ' added (now pages ' + (pdfDoc.getPageCount() - (basePageCount - 5) + 1) + '-' + pdfDoc.getPageCount() + ')');
                    }
                    
                    // 9. Add commercial overlay to page 2 (index 1)
                    await this.addCommercialOverlay(pdfDoc, commercial, 1, propertyType);
                    
                    console.log('📊 Total pages in final document:', pdfDoc.getPageCount());
                    
                    // 10. Generate final PDF
                    const mergedPdfBytes = await pdfDoc.save();
                    const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                    
                    const totalPages = pdfDoc.getPageCount();
                    
                    console.log('✅ Video PDF assembly completed');
                    console.log('📄 Final PDF size:', mergedPdfBlob.size, 'bytes');
                    console.log('📄 Final page count:', totalPages, 'pages');
                    
                    // Return blob and assembly info
                    return {
                        blob: mergedPdfBlob,
                        info: {
                            baseDossier: 'Devis_VIDÉO.pdf',
                            productsFound: productSheetsAdded,
                            totalPages: totalPages,
                            overlayAdded: true
                        }
                    };
                    
                } catch (error) {
                    console.error('❌ Error assembling video PDF:', error);
                    throw error;
                }
            }

            /**
             * Fetch product sheet from backend by product name
             */
            async fetchProductSheet(productName) {
                console.log('📥 Fetching product sheet for:', productName);
                
                try {
                    const payload = {
                        action: 'fetchProductSheet',
                        productName: productName
                    };
                    
                    // Use SYNCHRONOUS XMLHttpRequest for iOS compatibility
                    const formData = new FormData();
                    formData.append('data', JSON.stringify(payload));
                    
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', GOOGLE_SCRIPT_URL, false); // FALSE = SYNCHRONOUS (required for iOS)
                    
                    try {
                        xhr.send(formData);
                        
                        if (xhr.status === 200) {
                            const result = JSON.parse(xhr.responseText);
                            
                            if (!result.success || !result.pdfBase64) {
                                console.warn('⚠️ Product sheet not found:', productName);
                                return null;
                            }
                            
                            // Convert base64 back to blob
                            const binaryString = atob(result.pdfBase64);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            const blob = new Blob([bytes], { type: 'application/pdf' });
                            
                            console.log('✅ Product sheet fetched via synchronous XHR:', blob.size, 'bytes');
                            return blob;
                            
                        } else {
                            console.error('❌ Backend request failed:', xhr.status);
                            return null;
                        }
                    } catch (error) {
                        console.error('❌ XHR Error for product sheet:', error);
                        return null;
                    }
                    
                } catch (error) {
                    console.error('❌ Error fetching product sheet:', error);
                    return null;
                }
            }

            /**
             * Fetch accessories sheet from backend
             */
            async fetchAccessoriesSheet() {
                console.log('📥 Fetching accessories sheet...');
                
                try {
                    const payload = {
                        action: 'fetchAccessoriesSheet'
                    };
                    
                    // Use ASYNC XMLHttpRequest with longer timeout (works on iOS for large files)
                    return new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        const formData = new FormData();
                        formData.append('data', JSON.stringify(payload));
                        
                        xhr.open('POST', GOOGLE_SCRIPT_URL, true); // TRUE = ASYNC
                        xhr.timeout = 120000; // 120 seconds timeout for large accessories PDF
                        
                        xhr.onload = () => {
                            if (xhr.status === 200) {
                                try {
                                    const result = JSON.parse(xhr.responseText);
                                    
                                    if (!result.success || !result.pdfBase64) {
                                        console.warn('⚠️ Accessories sheet not found');
                                        resolve(null);
                                        return;
                                    }
                                    
                                    // Convert base64 back to blob
                                    const binaryString = atob(result.pdfBase64);
                                    const bytes = new Uint8Array(binaryString.length);
                                    for (let i = 0; i < binaryString.length; i++) {
                                        bytes[i] = binaryString.charCodeAt(i);
                                    }
                                    const blob = new Blob([bytes], { type: 'application/pdf' });
                                    
                                    console.log('✅ Accessories sheet fetched:', blob.size, 'bytes');
                                    resolve(blob);
                                } catch (error) {
                                    console.error('❌ Error parsing accessories response:', error);
                                    reject(error);
                                }
                            } else {
                                console.error('❌ Backend request failed:', xhr.status);
                                resolve(null);
                            }
                        };
                        
                        xhr.onerror = () => {
                            console.error('❌ Network error fetching accessories sheet');
                            resolve(null); // Don't fail entire process, just skip accessories
                        };
                        
                        xhr.ontimeout = () => {
                            console.error('❌ Timeout fetching accessories sheet (120s exceeded)');
                            resolve(null); // Don't fail entire process, just skip accessories
                        };
                        
                        xhr.send(formData);
                    });
                    
                } catch (error) {
                    console.error('❌ Error fetching accessories sheet:', error);
                    return null;
                }
            }

            /**
             * NEW: Batch fetch all documents at once (faster than individual fetches)
             * Fetches base document, all product sheets, and accessories in one network call
             * Uses async XHR for iOS compatibility (same method as upload)
             * 
             * @param {string} quoteType - 'alarme' or 'video'
             * @param {string} centralType - 'titane' or 'jablotron' (for alarms)
             * @param {Array<string>} productNames - Array of product names to fetch
             * @returns {Object} { base: Blob, products: Array, accessories: Blob }
             */
            async fetchAllDocumentsInBatch(quoteType, centralType, productNames) {
                console.log('📦 Batch fetching all documents at once...');
                console.log('   - Quote type:', quoteType);
                console.log('   - Central type:', centralType || 'N/A');
                console.log('   - Products:', productNames ? productNames.length : 0);
                
                try {
                    // Determine base document ID
                    let baseDocumentId = null;
                    if (quoteType === 'alarme') {
                        if (centralType === 'jablotron') {
                            baseDocumentId = '1enFlLv9q681uGBSwdRu43r8Co2nWytFf'; // ALARME_JABLOTRON
                        } else {
                            baseDocumentId = '12Ntu8bsVpO_CXdAOvL2V_AZcnGo6sA-S'; // ALARME_TITANE
                        }
                    } else if (quoteType === 'video') {
                        baseDocumentId = '15daREPnmbS1T76DLUpUxBLWahWIyq_cn'; // VIDEO
                    }
                    
                    const payload = {
                        action: 'fetchAllDocuments',
                        quoteType: quoteType,
                        centralType: centralType,
                        baseDocumentId: baseDocumentId,
                        productNames: productNames || [],
                        includeAccessories: quoteType === 'video'
                    };
                    
                    console.log('📤 Sending batch request via SYNCHRONOUS XHR (iOS-compatible)...');
                    const startTime = performance.now();
                    
                    // Use SYNCHRONOUS XHR for fetching documents (required for iOS)
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append('data', JSON.stringify(payload));
                    
                    xhr.open('POST', GOOGLE_SCRIPT_URL, false); // FALSE = SYNCHRONOUS (required for iOS)
                    xhr.send(formData);
                    
                    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
                    console.log('✅ Batch request completed in', elapsed, 's - Status:', xhr.status);
                    
                    if (xhr.status === 200) {
                        const result = JSON.parse(xhr.responseText);
                        
                        if (!result.success) {
                            throw new Error(result.message || 'Batch fetch failed');
                        }
                        
                        // Convert base64 strings back to blobs
                        const documents = {};
                        
                        // Convert base document
                        if (result.documents.base) {
                            const baseBinary = atob(result.documents.base.pdfBase64);
                            const baseBytes = new Uint8Array(baseBinary.length);
                            for (let i = 0; i < baseBinary.length; i++) {
                                baseBytes[i] = baseBinary.charCodeAt(i);
                            }
                            documents.base = new Blob([baseBytes], { type: 'application/pdf' });
                            console.log('✅ Base:', result.documents.base.filename, result.documents.base.size);
                        }
                        
                        // Convert product sheets
                        if (result.documents.products) {
                            documents.products = [];
                            let successCount = 0;
                            
                            result.documents.products.forEach(product => {
                                if (product.pdfBase64) {
                                    const productBinary = atob(product.pdfBase64);
                                    const productBytes = new Uint8Array(productBinary.length);
                                    for (let i = 0; i < productBinary.length; i++) {
                                        productBytes[i] = productBinary.charCodeAt(i);
                                    }
                                    documents.products.push({
                                        name: product.name,
                                        blob: new Blob([productBytes], { type: 'application/pdf' }),
                                        filename: product.filename
                                    });
                                    successCount++;
                                } else {
                                    documents.products.push({
                                        name: product.name,
                                        blob: null,
                                        notFound: true
                                    });
                                }
                            });
                            
                            console.log('✅ Products:', successCount + '/' + result.documents.products.length);
                        }
                        
                        // Convert accessories
                        if (result.documents.accessories && result.documents.accessories.pdfBase64) {
                            const accessoriesBinary = atob(result.documents.accessories.pdfBase64);
                            const accessoriesBytes = new Uint8Array(accessoriesBinary.length);
                            for (let i = 0; i < accessoriesBinary.length; i++) {
                                accessoriesBytes[i] = accessoriesBinary.charCodeAt(i);
                            }
                            documents.accessories = new Blob([accessoriesBytes], { type: 'application/pdf' });
                            console.log('✅ Accessories:', result.documents.accessories.size);
                        }
                        
                        console.log('✅ Batch fetch successful - all documents ready for assembly');
                        return documents;
                        
                    } else {
                        throw new Error('Batch request failed: ' + xhr.status);
                    }
                    
                } catch (error) {
                    console.error('❌ Error in batch fetch:', error);
                    throw error;
                }
            }

            /**
             * Fetch base document from Google Drive via backend
             * CORS doesn't allow direct fetch from browser, so we use the backend
             */
            async fetchBaseDocument(quoteType, centralType = null) {
                console.log('📥 Fetching base document via backend for:', quoteType, centralType);
                
                try {
                    let fileId = null;
                    
                    if (quoteType === 'alarme') {
                        if (centralType === 'jablotron') {
                            fileId = '1enFlLv9q681uGBSwdRu43r8Co2nWytFf'; // ALARME_JABLOTRON
                        } else {
                            fileId = '12Ntu8bsVpO_CXdAOvL2V_AZcnGo6sA-S'; // ALARME_TITANE
                        }
                    } else if (quoteType === 'video') {
                        fileId = '15daREPnmbS1T76DLUpUxBLWahWIyq_cn'; // VIDEO
                    }
                    
                    if (!fileId) {
                        throw new Error('No file ID found for quote type: ' + quoteType);
                    }
                    
                    // Request base document from backend
                    const payload = {
                        action: 'fetchBaseDocument',
                        fileId: fileId,
                        quoteType: quoteType,
                        centralType: centralType
                    };
                    
                    console.log('📤 Requesting base document from backend via SYNCHRONOUS XHR (iOS-compatible)...');
                    
                    // Use SYNCHRONOUS XMLHttpRequest for iOS compatibility (only way that works on iOS)
                    const formData = new FormData();
                    formData.append('data', JSON.stringify(payload));
                    
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', GOOGLE_SCRIPT_URL, false); // FALSE = SYNCHRONOUS (required for iOS)
                    
                    try {
                        xhr.send(formData);
                        
                        if (xhr.status === 200) {
                            const result = JSON.parse(xhr.responseText);
                            
                            if (!result.success || !result.pdfBase64) {
                                throw new Error(result.message || 'Failed to fetch base document');
                            }
                            
                            // Convert base64 back to blob
                            const binaryString = atob(result.pdfBase64);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            const blob = new Blob([bytes], { type: 'application/pdf' });
                            
                            console.log('✅ Base document fetched via synchronous XHR:', blob.size, 'bytes');
                            return blob;
                            
                        } else {
                            throw new Error(`Backend request failed: ${xhr.status}`);
                        }
                    } catch (error) {
                        console.error('❌ XHR Error:', error);
                        throw error;
                    }
                    
                } catch (error) {
                    console.error('❌ Error fetching base document via backend:', error);
                    throw error;
                }
            }

            /**
             * Create a visible debug console for mobile devices
             */
            createMobileDebugConsole() {
                // Create toggle button
                const toggleBtn = document.createElement('button');
                toggleBtn.textContent = '×';
                toggleBtn.style.cssText = `
                    position: fixed;
                    bottom: 205px;
                    right: 10px;
                    width: 40px;
                    height: 40px;
                    background: red;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    font-size: 30px;
                    cursor: pointer;
                    z-index: 100000;
                    line-height: 1;
                `;
                document.body.appendChild(toggleBtn);
                
                // Create debug container
                const debugDiv = document.createElement('div');
                debugDiv.id = 'mobile-debug';
                debugDiv.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    max-height: 200px;
                    overflow-y: auto;
                    background: rgba(0, 0, 0, 0.9);
                    color: #00ff00;
                    font-family: monospace;
                    font-size: 10px;
                    padding: 10px;
                    z-index: 99999;
                    border-top: 2px solid #00ff00;
                `;
                document.body.appendChild(debugDiv);
                
                // Toggle: click button to show/hide console
                toggleBtn.onclick = () => {
                    if (debugDiv.style.display === 'none') {
                        debugDiv.style.display = 'block';
                        toggleBtn.textContent = '×';
                        toggleBtn.style.background = 'red';
                    } else {
                        debugDiv.style.display = 'none';
                        toggleBtn.textContent = '📱';
                        toggleBtn.style.background = '#007bff';
                    }
                };
                
                // Override console methods
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                
                const addToDebug = (msg, color = '#00ff00') => {
                    const line = document.createElement('div');
                    line.style.color = color;
                    line.textContent = msg;
                    debugDiv.appendChild(line);
                    debugDiv.scrollTop = debugDiv.scrollHeight;
                };
                
                console.log = function(...args) {
                    originalLog.apply(console, args);
                    addToDebug(args.join(' '), '#00ff00');
                };
                
                console.error = function(...args) {
                    originalError.apply(console, args);
                    addToDebug('ERROR: ' + args.join(' '), '#ff0000');
                };
                
                console.warn = function(...args) {
                    originalWarn.apply(console, args);
                    addToDebug('WARN: ' + args.join(' '), '#ffaa00');
                };
                
                addToDebug('📱 Mobile Debug Console Ready', '#00ff00');
            }

            /**
             * Add commercial overlay to page 2
             * Date: Positioned on the same line as "Le" (top-right area)
             * Name/Phone/Email: Text INSIDE the existing yellow box (no new box drawn)
             * PropertyType: Added at specified position
             */
            async addCommercialOverlay(pdfDoc, commercialName, pageIndex, propertyType) {
                console.log('📝 Adding commercial overlay to page', pageIndex + 1);
                
                try {
                    // Get commercial info
                    const commercialInfo = this.getCommercialInfo(commercialName);
                    
                    // Get the target page
                    const pages = pdfDoc.getPages();
                    if (pageIndex >= pages.length) {
                        console.warn('⚠️ Page index out of range:', pageIndex);
                        return;
                    }
                    
                    const page = pages[pageIndex];
                    const { width, height } = page.getSize();
        
                    // Remove annotations/form fields that block text (Titane has white rectangles on page 2)
                    try {
                        const annots = page.node.get(PDFLib.PDFName.of('Annots'));
                        if (annots) {
                            page.node.delete(PDFLib.PDFName.of('Annots'));
                            console.log('✅ Removed page annotations (fixes Titane white rectangle issue)');
                        } else {
                            console.log('ℹ️ No annotations to remove (Jablotron is clean)');
                        }
                    } catch (annotError) {
                        console.warn('⚠️ Could not remove annotations:', annotError.message);
                        // Non-critical, continue anyway
                    }
        
                    // Load font
                    const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
                    const helveticaBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
        
                    // === 1. ADD DATE (On same line as "Carouge. le") ===
                    const currentDate = new Date().toLocaleDateString('fr-CH');
                    const dateText = currentDate;
                    const dateFontSize = 11;
                    const dateX = width - 139;
                    const dateY = height - 155;
        
                    page.drawText(dateText, {
                        x: dateX,
                        y: dateY,
                        size: dateFontSize,
                        font: helveticaFont,
                        color: PDFLib.rgb(0, 0, 0)
                    });
        
                    console.log('✅ Date added on "Le" line:', dateText);
        
                    // === 2. ADD PROPERTY TYPE (X=20, Y=269) ===
                    if (propertyType) {
                        page.drawText(propertyType, {
                            x: 20,
                            y: 269,
                            size: 11,
                            font: helveticaBold,
                            color: PDFLib.rgb(0, 0, 0)
                        });
            
                        console.log('✅ Property type added:', propertyType);
                    }
        
                    // === 3. ADD TEXT INSIDE EXISTING YELLOW BOX (Bottom-right) ===
                    const boxStartX = width - 185;
                    const boxStartY = 110;
        
                    const textPadding = 8;
                    const lineHeight = 15;
                    let textY = boxStartY + 58;
        
                    // Commercial name (bold)
                    page.drawText(commercialName, {
                        x: boxStartX + textPadding,
                        y: textY,
                        size: 10,
                        font: helveticaBold,
                        color: PDFLib.rgb(0, 0, 0)
                    });
                    
                    textY -= lineHeight;
        
                    // Phone
                    page.drawText(`Tel: ${commercialInfo.phone}`, {
                        x: boxStartX + textPadding,
                        y: textY,
                        size: 9,
                        font: helveticaFont,
                        color: PDFLib.rgb(0, 0, 0)
                    });
        
                    textY -= lineHeight;
        
                    // Email
                    page.drawText(commercialInfo.email, {
                        x: boxStartX + textPadding,
                        y: textY,
                        size: 8,
                        font: helveticaFont,
                        color: PDFLib.rgb(0, 0, 0)
                    });
        
                    console.log('✅ Commercial info added inside existing yellow box on page', pageIndex + 1);
                    console.log('   - Name:', commercialName);
                    console.log('   - Phone:', commercialInfo.phone);
                    console.log('   - Email:', commercialInfo.email);
                    console.log('   - Property Type:', propertyType || 'Not specified');
        
                } catch (error) {
                   console.error('❌ Error adding commercial overlay:', error);
                    // Don't throw - this is not critical
                }
            }

            /**
             * Get commercial information from config
             */
            getCommercialInfo(commercialName) {
                // Commercial info mapping based on config.gs
                const commercialData = {
                    'Anabelle': { phone: '06 XX XX XX XX', email: 'anabelle@dialarme.fr' },
                    'Test Commercial': { phone: '06 00 00 00 00', email: 'test@dialarme.fr' },
                    'Arnaud Bloch': { phone: '06 XX XX XX XX', email: 'arnaud.bloch@dialarme.fr' },
                    'Yann Mamet': { phone: '06 XX XX XX XX', email: 'yann.mamet@dialarme.fr' },
                    'Maxime Legrand': { phone: '06 XX XX XX XX', email: 'maxime.legrand@dialarme.fr' },
                    'Gérald Guenard': { phone: '06 XX XX XX XX', email: 'gerald.guenard@dialarme.fr' },
                    'François Ribeiro': { phone: '06 XX XX XX XX', email: 'francois.ribeiro@dialarme.fr' },
                    'Thomas Lefevre': { phone: '06 XX XX XX XX', email: 'thomas.lefevre@dialarme.fr' },
                    'Nicolas Dub': { phone: '06 XX XX XX XX', email: 'nicolas.dub@dialarme.fr' },
                    'Julien Auge': { phone: '06 XX XX XX XX', email: 'julien.auge@dialarme.fr' },
                    'Guillaume Marmey': { phone: '06 XX XX XX XX', email: 'guillaume.marmey@dialarme.fr' },
                    'Dylan Morel': { phone: '06 XX XX XX XX', email: 'dylan.morel@dialarme.fr' },
                    'Baptiste Laude': { phone: '06 XX XX XX XX', email: 'baptiste.laude@dialarme.fr' },
                    'Clement Faivre': { phone: '06 XX XX XX XX', email: 'clement.faivre@dialarme.fr' },
                    'Alexis Delamare': { phone: '06 XX XX XX XX', email: 'alexis.delamare@dialarme.fr' },
                    'Clement Sorel': { phone: '06 XX XX XX XX', email: 'clement.sorel@dialarme.fr' },
                    'Laurent Rochard': { phone: '06 XX XX XX XX', email: 'laurent.rochard@dialarme.fr' }
                };
                
                // Return commercial data or default values
                return commercialData[commercialName] || {
                    phone: '06 XX XX XX XX',
                    email: 'commercial@dialarme.fr'
                };
            }

            /**
             * TEST FUNCTION: Test pdf-lib functionality
             * This function can be called from console to test pdf-lib merging
             */
            async testPdfLibMerging() {
                console.log('🧪 Testing pdf-lib functionality...');
                
                try {
                    // Check if pdf-lib is available
                    if (typeof PDFLib === 'undefined') {
                        console.error('❌ pdf-lib library not loaded');
                        return false;
                    }
                    
                    console.log('✅ pdf-lib library is available');
                    
                    // Create a simple test PDF
                    const { jsPDF } = window.jspdf;
                    const testDoc = new jsPDF('portrait', 'pt', 'a4');
                    testDoc.text('Test PDF for pdf-lib merging', 40, 40);
                    const testPdfBlob = testDoc.output('blob');
                    
                    console.log('✅ Test PDF created:', testPdfBlob.size, 'bytes');
                    
                    // Test pdf-lib merging
                    const mergedBlob = await this.assemblePdfWithLibrary(testPdfBlob, 'test.pdf', 'Test Commercial', 'Test Client');
                    
                    console.log('✅ PDF merging test completed');
                    console.log('📄 Original size:', testPdfBlob.size, 'bytes');
                    console.log('📄 Merged size:', mergedBlob.size, 'bytes');
                    
                    return true;
                    
                } catch (error) {
                    console.error('❌ pdf-lib test failed:', error);
                    return false;
                }
            }
            
            /**
             * Helper pour les delays
             */
            sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            async generatePDF(type) {
                const isRental = this.rentalMode[type];
                let clientNameField, commercialField, commercialCustomField;
                
                if (type === 'alarm') {
                    clientNameField = 'clientName';
                    commercialField = 'commercial';
                    commercialCustomField = 'commercial-custom';
                } else if (type === 'camera') {
                    clientNameField = 'clientNameCamera';
                    commercialField = 'commercialCamera';
                    commercialCustomField = 'commercialCamera-custom';
                }
                
                const clientName = document.getElementById(clientNameField)?.value || 'Client';
                const commercialSelect = document.getElementById(commercialField)?.value;
                let commercial = '';
                
                if (commercialSelect === 'autre') {
                    commercial = document.getElementById(commercialCustomField)?.value || '';
                } else {
                    commercial = commercialSelect;
                }
                    // Récupérer le type de bien
                const propertyType = document.getElementById(propertyType)?.value || '';

                    if (!commercial) {
                        alert('Veuillez sélectionner un commercial avant de générer le PDF.');
                        return;
    }

                if (!window.jspdf || !window.jspdf.jsPDF) {
                    alert('Erreur: Bibliothèque PDF non disponible.');
                    return;
                }

                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF('portrait', 'pt', 'a4');

                    doc.setFillColor(51, 51, 51);
                    doc.rect(0, 0, 595, 70, 'F');
                    
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(14);
                    doc.setTextColor(255, 255, 255);
                    
                    let title = '';
                    if (isRental) {
                        if (type === 'camera') {
                            title = 'OFFRE LOCATION VIDÉO SURVEILLANCE';
                        } else if (type === 'alarm') {
                            title = 'OFFRE LOCATION MATÉRIEL DE SÉCURITÉ';
                        }
                    } else {
                        if (type === 'camera') {
                            title = 'OFFRE DE PARTENARIAT VIDÉOSURVEILLANCE';
                        } else {
                            title = 'OFFRE DE PARTENARIAT MATÉRIEL DE SÉCURITÉ';
                        }
                    }
                    doc.text(title, 40, 25);
                    
                    const now = new Date();
                    const quoteNumber = `DIA-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
                    
                    doc.setFontSize(10);
                    doc.text(quoteNumber, 40, 42);
                    doc.text(`DIALARME | A L'ATTENTION DE ${clientName.toUpperCase()}`, 40, 56);

                    doc.setFillColor(244, 230, 0);
                    doc.rect(0, 70, 595, 6, 'F');

                    let yPos = 90;

                    doc.setTextColor(0, 0, 0);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.text(`NOM DU CONSEILLER : ${commercial}`, 40, yPos);
                    doc.text(`DATE (Devis valable 30 jours) : ${new Date().toLocaleDateString('fr-CH')}`, 350, yPos);
                    yPos += 20;
                    
                    if (isRental) {
                        doc.setFont('helvetica', 'bold');
                        doc.text('MODE LOCATION - Pas de mensualités de paiement', 40, yPos);
                        yPos += 20;
                    }

                    if (type === 'alarm') {
                        yPos = this.createPDFSection(doc, 'KIT DE BASE', 'alarm-material', yPos, isRental);
                        yPos = this.createPDFSection(doc, 'INSTALLATION & MATERIEL SUPPLEMENTAIRE', 'alarm-installation', yPos, isRental);
                        yPos = this.createAdminFeesPDF(doc, yPos);
                        yPos = this.createServicesPDF(doc, yPos, isRental);
                        yPos = this.createOptionsAlarmPDF(doc, yPos);
                    } else if (type === 'camera') {
                        if (this.hasSectionProducts('camera-material')) {
                            yPos = this.createPDFSection(doc, 'MATERIEL', 'camera-material', yPos, isRental);
                        }
                        yPos = this.createCameraInstallPDF(doc, yPos, isRental);
                        if (!isRental) {
                            const remoteAccess = document.getElementById('camera-remote-access')?.checked;
                            if (remoteAccess) {
                                yPos += 15;
                                doc.setFont('helvetica', 'normal');
                                doc.setFontSize(8);
                                doc.text(`Vision à distance : ${REMOTE_ACCESS_PRICE.toFixed(2)} CHF/mois`, 40, yPos);
                                yPos += 15;
                            }
                        }
                        // Toujours ajouter la section maintenance
                        yPos = this.createMaintenancePDF(doc, yPos);
                    }

                    yPos = this.createFinalSummaryPDF(doc, yPos, type, isRental);
                    this.createPDFFooter(doc, clientName);

                    const filename = `Devis-${quoteNumber}-${clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                    const pdfBlob = doc.output('blob');
                    
                    // Choose PDF processing method based on feature flag
                    let finalPdfBlob = pdfBlob;
                    let assemblyInfo = null;
                    
                    if (this.USE_PDF_LIB_MERGING) {
                        console.log('🔧 Using pdf-lib for PDF assembly...');
                        console.log('📱 Device info:', {
                            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
                            userAgent: navigator.userAgent
                        });
                        try {
                            console.log('⏳ Starting assembly...');
                            const assemblyResult = await this.assemblePdfWithLibrary(pdfBlob, filename, commercial, clientName, propertyType);
                            finalPdfBlob = assemblyResult.blob;
                            assemblyInfo = assemblyResult.info;
                            console.log('✅ PDF assembly completed with pdf-lib');
                            console.log('📄 Final PDF size:', finalPdfBlob.size, 'bytes');
                            if (assemblyInfo) {
                                console.log('📦 Assembly info:', JSON.stringify(assemblyInfo, null, 2));
                                console.log('   - baseDossier:', assemblyInfo.baseDossier);
                                console.log('   - productsFound:', assemblyInfo.productsFound);
                                console.log('   - totalPages:', assemblyInfo.totalPages);
                            } else {
                                console.warn('⚠️ No assembly info returned!');
                            }
                        } catch (error) {
                            console.error('❌ PDF assembly failed, using original PDF:', error);
                            console.error('❌ Error details:', error.message);
                            console.error('❌ Error stack:', error.stack);
                            finalPdfBlob = pdfBlob; // Fallback to original
                            assemblyInfo = null;
                        }
                    } else {
                        console.log('📤 Using backend assembly (existing method)...');
                    }
                    
                    // Envoi par email et sauvegarde dans Drive (FIRST - before download on iOS)
                    this.sendToEmailAndDrive(finalPdfBlob, filename, commercial, clientName, assemblyInfo)
                        .then((result) => {
