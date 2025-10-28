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
            "Nassim Jaza",
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
        
        // 💨 CATALOGUE GÉNÉRATEUR DE BROUILLARD
        const CATALOG_FOG_MATERIAL = [
            { id: 105, name: "Générateur de brouillard", price: 2990.00 },
            { id: 103, name: "Cartouche supplémentaire HY3", price: 990.00 },
            { id: 107, name: "Clavier", price: 390.00, monthly: 9 },
            { id: 108, name: "Détecteur d'ouverture", price: 190.00, monthly: 5 },
            { id: 106, name: "Détecteur volumétrique", price: 240.00, monthly: 6 },
            { id: 102, name: "Remplissage cartouche", price: 390.00 },
            { id: 100, name: "Support mural articulé", price: 390.00, monthly: 9 },
            { id: 101, name: "Support mural fixe", price: 290.00, monthly: 7 },
            { id: 109, name: "Télécommande", price: 240.00, monthly: 6 },
            { id: 99, name: "Autre", price: 0.00, isCustom: true }
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

        // 💨 GÉNÉRATEUR DE BROUILLARD - INSTALLATION
        const FOG_INSTALL_PRICE = 490.00;

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
            
            /**
             * Create a visible debug console for mobile debugging
             */
            createDebugConsole() {
                // Create debug panel
                const debugPanel = document.createElement('div');
                debugPanel.id = 'mobile-debug-console';
                debugPanel.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    max-height: 250px;
                    overflow-y: auto;
                    background: rgba(0, 0, 0, 0.95);
                    color: #00ff00;
                    font-family: monospace;
                    font-size: 10px;
                    padding: 8px;
                    z-index: 9999999;
                    border-top: 3px solid #00ff00;
                    display: block;
                    pointer-events: auto;
                `;
                document.body.appendChild(debugPanel);
                
                this.debugPanel = debugPanel;
                this.debugLogs = [];
                
                // Override console.log, console.error, console.warn
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                
                const addToDebug = (message, type = 'log') => {
                    const color = type === 'error' ? '#ff0000' : type === 'warn' ? '#ffaa00' : '#00ff00';
                    const time = new Date().toLocaleTimeString();
                    this.debugLogs.push({time, message, type, color});
                    
                    // Keep only last 50 messages
                    if (this.debugLogs.length > 50) {
                        this.debugLogs.shift();
                    }
                    
                    // Update display
                    this.debugPanel.innerHTML = this.debugLogs.map(log => 
                        `<div style="color: ${log.color}; margin-bottom: 3px;">[${log.time}] ${log.message}</div>`
                    ).join('');
                    
                    // Show panel
                    this.debugPanel.style.display = 'block';
                    
                    // Auto-scroll to bottom
                    this.debugPanel.scrollTop = this.debugPanel.scrollHeight;
                };
                
                console.log = (...args) => {
                    originalLog.apply(console, args);
                    addToDebug(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '), 'log');
                };
                
                console.error = (...args) => {
                    originalError.apply(console, args);
                    addToDebug(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '), 'error');
                };
                
                console.warn = (...args) => {
                    originalWarn.apply(console, args);
                    addToDebug(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '), 'warn');
                };
                
                // Add toggle button
                const toggleBtn = document.createElement('button');
                toggleBtn.textContent = '🐛 DEBUG';
                toggleBtn.style.cssText = `
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    z-index: 99999999;
                    background: #00ff00;
                    border: 2px solid #000;
                    padding: 8px 12px;
                    border-radius: 5px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,255,0,0.5);
                `;
                let isMinimized = false;
                toggleBtn.onclick = () => {
                    isMinimized = !isMinimized;
                    if (isMinimized) {
                        this.debugPanel.style.maxHeight = '40px';
                        toggleBtn.textContent = '🐛 SHOW';
                    } else {
                        this.debugPanel.style.maxHeight = '250px';
                        toggleBtn.textContent = '🐛 HIDE';
                    }
                };
                document.body.appendChild(toggleBtn);
                
                console.log('🐛 Debug console initialized');
            }
            
            constructor() {
                // Create visible debug console for mobile debugging
                this.createDebugConsole();
                
                this.catalog = {
                    'alarm-material': CATALOG_ALARM_PRODUCTS.sort((a, b) => a.name.localeCompare(b.name)),
                    'alarm-installation': CATALOG_ALARM_PRODUCTS.sort((a, b) => a.name.localeCompare(b.name)),
                    'camera-material': CATALOG_CAMERA_MATERIAL.sort((a, b) => a.name.localeCompare(b.name)),
                    'fog-material': CATALOG_FOG_MATERIAL
                };

                this.currentTab = 'alarm';
                this.sections = {
                    'alarm-material': { paymentMonths: 0 },
                    'alarm-installation': { paymentMonths: 0 },
                    'camera-material': { paymentMonths: 0 },
                    'camera-installation': { paymentMonths: 0 },
                    'fog-material': { paymentMonths: 0 },
                    'fog-installation': { paymentMonths: 0 }
                };

                this.globalPaymentMonths = {
                    'alarm': 48,
                    'camera': 48,
                    'fog': 48
                };

                this.rentalMode = {
                    'alarm': false,
                    'camera': false,
                    'fog': false
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
                const selectIds = ['commercial', 'commercialCamera', 'commercialFog'];
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
                    } else if (sectionId === 'fog-material') {
                        if (product.monthly !== undefined) {
                            monthlyPrice = product.monthly;
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
                
                else if (this.currentTab === 'fog') {
                    const materialTotal = this.calculateSectionTotal('fog-material');
                    
                    const materialDiscountType = document.getElementById('fog-material-discount-type')?.value || 'percent';
                    const materialDiscountValue = parseFloat(document.getElementById('fog-material-discount-value')?.value) || 0;
                    let materialTotalBeforeDiscount = 0;
                    
                    const materialContainer = document.getElementById('fog-material-products');
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
                    
                    const installationOffered = document.getElementById('fog-installation-offered')?.checked;
                    const installationTotal = installationOffered ? 0 : FOG_INSTALL_PRICE;
                    
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
                    
                    document.getElementById('fog-material-total').textContent = materialDisplay;
                    document.getElementById('fog-installation-total').textContent = `${installationTotal.toFixed(2)} CHF`;
                    document.getElementById('fog-installation-price').textContent = installationOffered ? 'OFFERT' : `${installationTotal.toFixed(2)} CHF`;
                    
                    const paymentMonths = this.globalPaymentMonths['fog'] || 0;
                    
                    if (paymentMonths > 0) {
                        const mensualiteMatHT = this.calculateSectionMonthlyPrice('fog-material', paymentMonths);
                        const totalMensuelHT = mensualiteMatHT;
                        const totalMensuelTTC = this.roundToFiveCents(totalMensuelHT * (1 + TVA_RATE));
                        
                        document.getElementById('fog-monthly-amount').textContent = totalMensuelTTC.toFixed(2);
                        document.getElementById('fog-monthly-count').textContent = paymentMonths;
                        document.getElementById('fog-monthly-payment').style.display = 'block';
                    } else {
                        document.getElementById('fog-monthly-payment').style.display = 'none';
                    }
                    
                    document.getElementById('fog-total-ht').textContent = `${totalHT.toFixed(2)} CHF`;
                    document.getElementById('fog-total-ttc').textContent = `${totalTTC.toFixed(2)} CHF`;
                }
            }

            selectPayment(element, sectionId) {
                const tabType = sectionId.startsWith('alarm') ? 'alarm' : (sectionId.startsWith('camera') ? 'camera' : 'fog');
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

            async sendToEmailAndDrive(pdfBlob, filename, commercial, clientName) {
                this.showNotification('📤 Envoi du PDF en cours...', 'info', 0);
                
                const MAX_RETRIES = 1; // Une seule tentative suffit
                const TIMEOUT_MS = 15000; // 15 seconds - le backend répond en ~5s
                
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
                } else if (this.currentTab === 'fog') {
                    quoteType = null; // Fog doesn't have assembly yet
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
                    timestamp: new Date().toISOString()
                };
                
                console.log('📦 Assembly parameters (ACTUAL PAYLOAD):', {
                    type: quoteType,
                    centralType: centralType,
                    productsCount: products.length,
                    products: products
                });
                
                // Detect browser/device
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const isDesktop = !isMobile && !isIOS;
                
                console.log('📱 Détection appareil:', {isIOS, isSafari, isMobile, isDesktop, userAgent: navigator.userAgent});
                console.log('📦 Taille du payload:', JSON.stringify(payload).length, 'bytes');
                
                // Méthode avec retry
                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    try {
                        console.log(`🔄 Tentative ${attempt}/${MAX_RETRIES}`);
                        
                        // Utiliser la méthode appropriée selon le navigateur
                        if (isIOS || isSafari) {
                            console.log('🍎 Envoi via formulaire (iOS/Safari)...');
                            const result = await this.sendViaFormSubmit(payload, 15000);
                            console.log('✅ Réponse reçue:', result);
                            return result;
                        } else {
                            console.log('🚀 Envoi via fetch (navigateur moderne)...');
                            
                            // Créer l'URL avec les données
                            const formData = new FormData();
                            formData.append('data', JSON.stringify(payload));
                            
                            // Envoi via fetch en no-cors
                            await fetch(GOOGLE_SCRIPT_URL, {
                                method: 'POST',
                                body: formData,
                                mode: 'no-cors'
                            });
                            
                            console.log('✅ Requête envoyée au serveur');
                            
                            // Attendre que le serveur traite
                            await this.sleep(6000);
                            
                            console.log('✅ Délai d\'attente terminé - PDF normalement envoyé');
                            
                            return {
                                success: true,
                                message: 'PDF envoyé (vérifiez votre email)',
                                assumed: true
                            };
                        }
                        
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
             * Helper pour les delays
             */
            sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            generatePDF(type) {
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
                } else if (type === 'fog') {
                    clientNameField = 'clientNameFog';
                    commercialField = 'commercialFog';
                    commercialCustomField = 'commercialFog-custom';
                }
                
                const clientName = document.getElementById(clientNameField)?.value || 'Client';
                const commercialSelect = document.getElementById(commercialField)?.value;
                let commercial = '';
                
                if (commercialSelect === 'autre') {
                    commercial = document.getElementById(commercialCustomField)?.value || '';
                } else {
                    commercial = commercialSelect;
                }

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
                        } else if (type === 'fog') {
                            title = 'OFFRE DE PARTENARIAT GÉNÉRATEUR DE BROUILLARD';
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
                    } else if (type === 'fog') {
                        if (this.hasSectionProducts('fog-material')) {
                            yPos = this.createPDFSection(doc, 'MATERIEL', 'fog-material', yPos, isRental);
                        }
                        yPos = this.createFogInstallPDF(doc, yPos);
                        // Toujours ajouter la section maintenance
                        yPos = this.createMaintenancePDF(doc, yPos);
                    }

                    yPos = this.createFinalSummaryPDF(doc, yPos, type, isRental);
                    this.createPDFFooter(doc, clientName);

                    const filename = `Devis-${quoteNumber}-${clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                    const pdfBlob = doc.output('blob');
                    
                    // Téléchargement local
                    doc.save(filename);
                    
                    // Notification initiale
                    this.showNotification('✅ PDF généré localement', 'success', 2000);
                    
                    // Envoi par email et sauvegarde dans Drive
                    this.sendToEmailAndDrive(pdfBlob, filename, commercial, clientName)
                        .then((result) => {
                            if (result && result.assumed) {
                                // Success assumed (normal pour certains navigateurs)
                                this.showNotification('✅ PDF envoyé par email et sauvegardé dans Drive!\n(Vérifiez votre email pour confirmation)', 'success', 5000);
                            } else {
                                // Success confirmé
                                this.showNotification('✅ PDF envoyé par email et sauvegardé dans Drive!', 'success', 4000);
                            }
                        })
                        .catch(error => {
                            console.error('Erreur lors de l\'envoi:', error);
                            this.showNotification('⚠️ Erreur d\'envoi. Vérifiez votre email pour voir si le PDF est arrivé.', 'warning', 5000);
                        });
                    
} catch (error) {
                    console.error('Erreur PDF:', error);
                    alert(`Erreur lors de la génération du PDF: ${error.message}`);
                }
            }

            hasSectionProducts(sectionId) {
                const container = document.getElementById(`${sectionId}-products`);
                if (!container) return false;
                const productLines = container.querySelectorAll('.product-line');
                let hasProducts = false;
                productLines.forEach(line => {
                    const select = line.querySelector('.product-select');
                    if (select && select.value) hasProducts = true;
                });
                return hasProducts;
            }

            createPDFSection(doc, title, sectionId, yPos, isRental) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                doc.text(title, 40, yPos);
                yPos += 12;

                doc.setFillColor(244, 230, 0);
                doc.rect(40, yPos, 515, 14, 'F');
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(0, 0, 0);
                doc.text('Qté', 50, yPos + 9);
                doc.text('Désignation du matériel', 90, yPos + 9);
                doc.text('Prix uni. HT', 400, yPos + 9);
                doc.text('Total HT', 480,yPos + 9);
                yPos += 14;

                const container = document.getElementById(`${sectionId}-products`);
                const productLines = container ? Array.from(container.querySelectorAll('.product-line')) : [];
                let sectionTotal = 0;
                let sectionTotalBeforeDiscount = 0;
                let lineCount = 0;
                
                productLines.forEach(line => {
                    const select = line.querySelector('.product-select');
                    const qtyInput = line.querySelector('.quantity-input');
                    const offeredCheckbox = line.querySelector('.offered-checkbox');
                    const priceInput = line.querySelector('.price-input');
                    
                    const isCentralLine = line.classList.contains('central-line');
                    const isKitLine = line.style.background === 'rgb(255, 251, 240)' || line.style.background === '#fffbf0';
                    
                    if ((select && select.value && qtyInput) || (isCentralLine && qtyInput) || (line.querySelector('.price-input') && qtyInput)) {
                        lineCount++;
                        
                        if (isKitLine) {
                            doc.setFillColor(255, 251, 240);
                            doc.rect(40, yPos, 515, 12, 'F');
                        } else if (lineCount % 2 === 0) {
                            doc.setFillColor(245, 245, 245);
                            doc.rect(40, yPos, 515, 12, 'F');
                        }

                        const qty = parseFloat(qtyInput.value) || 0;
                        const isOffered = offeredCheckbox?.checked || false;
                        
                        let price = 0;
                        let productName = '';
                        
                        const selectedOption = select?.querySelector(`option[value="${select.value}"]`);
                        const nameInput = line.querySelector('.product-name-input');
                        
                        if (nameInput && nameInput.style.display !== 'none' && nameInput.value) {
                            productName = nameInput.value;
                            price = parseFloat(priceInput?.value) || 0;
                        } else if (priceInput && priceInput.style.display !== 'none') {
                            price = parseFloat(priceInput.value) || 0;
                            productName = selectedOption?.text?.split(' - ')[0] || 'Produit personnalisé';
                        } else if (selectedOption) {
                            price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
                            productName = selectedOption.text.split(' - ')[0] || '';
                        } else if (priceInput) {
                            productName = line.querySelector('div')?.textContent || '';
                            price = parseFloat(priceInput.value) || 0;
                        }
                        
                        let lineTotal = price * qty;
                        sectionTotalBeforeDiscount += lineTotal;
                        if (!isOffered) {
                            sectionTotal += lineTotal;
                        }

                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(6);
                        doc.setTextColor(0, 0, 0);
                        doc.text(qty.toString(), 55, yPos + 8);
                        
                        const maxNameLength = 45;
                        const displayName = productName.length > maxNameLength 
                            ? productName.substring(0, maxNameLength - 3) + '...' 
                            : productName;
                        doc.text(displayName, 90, yPos + 8);
                        
                        doc.setTextColor(0, 0, 0);
                        doc.text(price.toFixed(2), 405, yPos + 8);
                        
                        if (isOffered) {
                            doc.setFont('helvetica', 'bold');
                            doc.setTextColor(0, 150, 0);
                            doc.text('OFFERT', 485, yPos + 8);
                            doc.setFont('helvetica', 'normal');
                        } else {
                            doc.setTextColor(0, 0, 0);
                            doc.text(lineTotal.toFixed(2), 485, yPos + 8);
                        }
                        doc.setTextColor(0, 0, 0);
                        yPos += 12;
                    }
                });

                if (sectionId === 'alarm-installation' && !isRental) {
                    lineCount++;
                    if (lineCount % 2 === 0) {
                        doc.setFillColor(245, 245, 245);
                        doc.rect(40, yPos, 515, 12, 'F');
                    }
                    
                    const installQty = parseFloat(document.getElementById('alarm-installation-qty')?.value) || 1;
                    const installPrice = this.calculateInstallationPrice(installQty);
                    const installOffered = document.getElementById('alarm-installation-offered')?.checked || false;
                    const installTotal = installOffered ? 0 : installPrice;
                    
                    let daysText = '';
                    if (installQty === 1) daysText = ' (1/2 journée)';
                    else if (installQty === 2) daysText = ' (1 jour)';
                    else if (installQty === 3) daysText = ' (1.5 jours)';
                    else if (installQty === 4) daysText = ' (2 jours)';
                    else if (installQty === 5) daysText = ' (2.5 jours)';
                    else if (installQty === 6) daysText = ' (3 jours)';
                    else {
                        const fullDays = Math.floor(installQty / 2);
                        const halfDay = installQty % 2;
                        daysText = halfDay ? ` (${fullDays}.5 jours)` : ` (${fullDays} jours)`;
                    }
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                    doc.text(installQty.toString(), 55, yPos + 8);
                    doc.text('Installation, paramétrages, tests, mise en service & formation' + daysText, 90, yPos + 8);
                    
                    if (installOffered) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(0, 150, 0);
                        doc.text('OFFERT', 405, yPos + 8);
                        doc.text('OFFERT', 485, yPos + 8);
                    } else {
                        doc.setTextColor(0, 0, 0);
                        doc.text(installPrice.toFixed(2), 405, yPos + 8);
                        doc.text(installTotal.toFixed(2), 485, yPos + 8);
                    }
                    
                    sectionTotal += installTotal;
                    sectionTotalBeforeDiscount += installTotal;
                    yPos += 12;
                } else if (sectionId === 'alarm-installation' && isRental) {
                    lineCount++;
                    if (lineCount % 2 === 0) {
                        doc.setFillColor(245, 245, 245);
                        doc.rect(40, yPos, 515, 12, 'F');
                    }
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                    doc.text('1', 55, yPos + 8);
                    doc.text('Installation, paramétrages, tests, mise en service & formation', 90, yPos + 8);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 150, 0);
                    doc.text('Compris dans le forfait', 395, yPos + 8);
                    doc.text('Compris', 475, yPos + 8);
                    doc.setTextColor(0, 0, 0);
                    yPos += 12;
                    
                    lineCount++;
                    if (lineCount % 2 === 0) {
                        doc.setFillColor(245, 245, 245);
                        doc.rect(40, yPos, 515, 12, 'F');
                    }
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                    doc.text('1', 55, yPos + 8);
                    doc.text('Désinstallation facturée si durée inférieure à 12 mois', 90, yPos + 8);
                    doc.setTextColor(0, 0, 0);
                    doc.text(UNINSTALL_PRICE.toFixed(2), 405, yPos + 8);
                    doc.text(UNINSTALL_PRICE.toFixed(2), 485, yPos + 8);
                    yPos += 12;
                }

                const discountType = document.getElementById(`${sectionId}-discount-type`)?.value || 'percent';
                const discountValue = parseFloat(document.getElementById(`${sectionId}-discount-value`)?.value) || 0;
                
                let discountAmount = 0;
                if (discountValue > 0) {
                    if (discountType === 'percent') {
                        discountAmount = sectionTotal * (discountValue / 100);
                        sectionTotal = sectionTotal - discountAmount;
                    } else {
                        discountAmount = Math.min(discountValue, sectionTotal);
                        sectionTotal = Math.max(0, sectionTotal - discountValue);
                    }
                    
                    lineCount++;
                    if (lineCount % 2 === 0) {
                        doc.setFillColor(245, 245, 245);
                        doc.rect(40, yPos, 515, 12, 'F');
                    }
                    
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(6);
                    doc.setTextColor(200, 0, 0);
                    const discountText = discountType === 'percent' 
                        ? `Réduction ${discountValue}%` 
                        : `Réduction ${discountValue.toFixed(2)} CHF`;
                    doc.text(discountText, 90, yPos + 8);
                    doc.text(`-${discountAmount.toFixed(2)}`, 485, yPos + 8);
                    doc.setTextColor(0, 0, 0);
                    yPos += 12;
                }

                const totalTTC = this.roundToFiveCents(sectionTotal * (1 + TVA_RATE));
                const tva = totalTTC - sectionTotal;

                doc.setFillColor(230, 230, 230);
                doc.rect(390, yPos, 165, 36, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.text('Total H.T.', 400, yPos + 12);
                doc.text(sectionTotal.toFixed(2), 485, yPos + 12);
                doc.text('TVA 8.1%', 400, yPos + 24);
                doc.text(tva.toFixed(2), 485, yPos + 24);
                doc.text('Total T.T.C.', 400, yPos + 32);
                doc.text(totalTTC.toFixed(2), 485, yPos + 32);

                yPos += 40;

                return yPos + 5;
            }

            createServicesPDF(doc, yPos, isRental) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text('SERVICES', 40, yPos);
                yPos += 12;

                doc.setFillColor(244, 230, 0);
                doc.rect(40, yPos, 515, 14, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(0, 0, 0);
                doc.text('Service', 90, yPos + 9);
                doc.text('Prix', 400, yPos + 9);
                doc.text('Total', 480, yPos + 9);
                yPos += 14;

                const testCycliqueSelected = document.getElementById('test-cyclique-selected')?.checked || false;
                const testCycliquePrice = parseFloat(document.getElementById('test-cyclique-price')?.value) || TEST_CYCLIQUE_DEFAULT_PRICE;
                const testCycliqueOffered = document.getElementById('test-cyclique-offered')?.checked || false;
                
                if (testCycliqueSelected) {
                    doc.setFillColor(245, 245, 245);
                    doc.rect(40, yPos, 515, 12, 'F');
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                    doc.text('Test Cyclique', 90, yPos + 8);
                    
                    if (testCycliqueOffered) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(0, 150, 0);
                        doc.text('OFFERT', 405, yPos + 8);
                        doc.text('OFFERT', 485, yPos + 8);
                    } else {
                        doc.setTextColor(0, 0, 0);
                        doc.text(testCycliquePrice.toFixed(2), 405, yPos + 8);
                        doc.text(testCycliquePrice.toFixed(2), 485, yPos + 8);
                    }
                    yPos += 12;
                }
                
                const surveillanceType = document.getElementById('surveillance-type')?.value;
                const surveillancePrice = parseFloat(document.getElementById('surveillance-price')?.value) || 0;
                const surveillanceOffered = document.getElementById('surveillance-offered')?.checked || false;
                
                if (surveillanceType) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                    doc.setTextColor(0, 0, 0);
                    
                    let serviceName = '';
                    if (surveillanceType === 'telesurveillance') {
                        serviceName = 'Télésurveillance Particulier';
                    } else if (surveillanceType === 'telesurveillance-pro') {
                        serviceName = 'Télésurveillance Professionnel';
                    } else if (surveillanceType === 'autosurveillance') {
                        serviceName = 'Autosurveillance';
                    } else if (surveillanceType === 'autosurveillance-pro') {
                        serviceName = 'Autosurveillance Professionnel';
                    }
                    
                    doc.text(serviceName, 90, yPos + 8);
                    
                    if (surveillanceOffered) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(0, 150, 0);
                        doc.text('OFFERT', 405, yPos + 8);
                        doc.text('OFFERT', 485, yPos + 8);
                    } else {
                        doc.setTextColor(0, 0, 0);
                        doc.text(`${surveillancePrice.toFixed(2)}/mois`, 405, yPos + 8);
                        doc.text(`${surveillancePrice.toFixed(2)}/mois`, 485, yPos + 8);
                    }
                    yPos += 12;
                }

                return yPos + 5;
            }

            createOptionsAlarmPDF(doc, yPos) {
                const optionInterventionsGratuites = document.getElementById('option-interventions-gratuites')?.checked;
                const optionInterventionsAnnee = document.getElementById('option-interventions-annee')?.checked;
                const interventionsQty = parseInt(document.getElementById('interventions-qty')?.value) || 1;
                const optionServiceCles = document.getElementById('option-service-cles')?.checked;
                
                if (!optionInterventionsGratuites && !optionInterventionsAnnee && !optionServiceCles) {
                    return yPos;
                }
                
                yPos += 10;
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.text('OPTIONS DE L\'OFFRE : ', 40, yPos);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                
                const options = [];
                if (optionInterventionsGratuites) {
                    options.push('Interventions gratuites & illimitées des agents');
                }
                if (optionInterventionsAnnee) {
                    options.push(`${interventionsQty} intervention(s) par année des agents`);
                }
                if (optionServiceCles) {
                    options.push('Service des clés offert');
                }
                
                doc.text(options.join(' | '), 165, yPos);
                yPos += 20;
                
                return yPos;
            }

            createAdminFeesPDF(doc, yPos) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text('FRAIS DE DOSSIER (UNIQUE)', 40, yPos);
                yPos += 15;

                doc.setFillColor(244, 230, 0);
                doc.rect(40, yPos, 515, 16, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text('Qté', 50, yPos + 10);
                doc.text('Description', 90, yPos + 10);
                doc.text('Prix uni. HT', 400, yPos + 10);
                doc.text('Total HT', 480, yPos + 10);
                yPos += 16;

                const simCardOffered = document.getElementById('admin-simcard-offered')?.checked || false;
                const processingOffered = document.getElementById('admin-processing-offered')?.checked || false;

                const adminItems = [
                    { qty: 1, desc: 'Carte SIM + Activation', price: ADMIN_FEES.simCard, offered: simCardOffered },
                    { qty: 1, desc: 'Frais de dossier', price: ADMIN_FEES.processingFee, offered: processingOffered }
                ];

                let lineCount = 0;
                let adminTotal = 0;
                
                adminItems.forEach(item => {
                    lineCount++;
                    
                    if (lineCount % 2 === 0) {
                        doc.setFillColor(245, 245, 245);
                        doc.rect(40, yPos, 515, 14, 'F');
                    }
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(7);
                    doc.setTextColor(0, 0, 0);
                    doc.text(item.qty.toString(), 55, yPos + 9);
                    doc.text(item.desc, 90, yPos + 9);
                    
                    if (item.offered) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(0, 150, 0);
                        doc.text('OFFERT', 405, yPos + 9);
                        doc.text('OFFERT', 485, yPos + 9);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(0, 0, 0);
                    } else {
                        doc.text(item.price.toFixed(2), 405, yPos + 9);
                        doc.text(item.price.toFixed(2), 485, yPos + 9);
                        adminTotal += item.price;
                    }
                    yPos += 14;
                });

                const adminTotalTTC = this.roundToFiveCents(adminTotal * (1 + TVA_RATE));
                const adminTVA = adminTotalTTC - adminTotal;

                doc.setFillColor(230, 230, 230);
                doc.rect(390, yPos, 165, 36, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.text('Total H.T.', 400, yPos + 12);
                doc.text(adminTotal.toFixed(2), 485, yPos + 12);
                doc.text('TVA 8.1%', 400, yPos + 24);
                doc.text(adminTVA.toFixed(2), 485, yPos + 24);
                doc.text('Total T.T.C.', 400, yPos + 32);
                doc.text(adminTotalTTC.toFixed(2), 485, yPos + 32);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.setTextColor(0, 0, 0);
                doc.text('Montant à régler à l\'installation', 50, yPos + 32);

                return yPos + 50;
            }

            createCameraInstallPDF(doc, yPos, isRental) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text('INSTALLATION', 40, yPos);
                yPos += 15;

                doc.setFillColor(244, 230, 0);
                doc.rect(40, yPos, 515, 16, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text('Qté', 50, yPos + 10);
                doc.text('Désignation', 90, yPos + 10);
                doc.text('Prix uni. HT', 400, yPos + 10);
                doc.text('Total HT', 480, yPos + 10);
                yPos += 16;

                if (isRental) {
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.5);
                    doc.rect(40, yPos, 515, 14);
                    doc.line(80, yPos, 80, yPos + 14);
                    doc.line(390, yPos, 390, yPos + 14);
                    doc.line(470, yPos, 470, yPos + 14);
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(7);
                    doc.text('1', 55, yPos + 9);
                    doc.text('Installation, paramétrages, tests, mise en service & formation des utilisateurs', 90, yPos + 9);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 150, 0);
                    doc.text('Compris dans le forfait', 395, yPos + 9);
                    doc.text('Compris', 475, yPos + 9);
                    doc.setTextColor(0, 0, 0);
                    yPos += 14;
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFillColor(245, 245, 245);
                    doc.rect(40, yPos, 515, 14, 'F');
                    doc.rect(40, yPos, 515, 14);
                    doc.line(80, yPos, 80, yPos + 14);
                    doc.line(390, yPos, 390, yPos + 14);
                    doc.line(470, yPos, 470, yPos + 14);
                    
                    doc.setFontSize(7);
                    doc.text('1', 55, yPos + 9);
                    doc.text('Désinstallation facturée si durée inférieure à 12 mois', 90, yPos + 9);
                    doc.text(UNINSTALL_PRICE.toFixed(2), 405, yPos + 9);
                    doc.text(UNINSTALL_PRICE.toFixed(2), 485, yPos + 9);
                    yPos += 14;
                } else {
                    const installOffered = document.getElementById('camera-installation-offered')?.checked || false;
                    const installPrice = this.calculateCameraInstallationPrice();
                    const installTotal = installOffered ? 0 : installPrice;
                    
                    const installQty = parseFloat(document.getElementById('camera-installation-qty')?.value) || 1;
                    let description = '';
                    
                    let daysText = '';
                    if (installQty === 1) daysText = ' (1/2 journée)';
                    else if (installQty === 2) daysText = ' (1 jour)';
                    else if (installQty === 3) daysText = ' (1.5 jours)';
                    else if (installQty === 4) daysText = ' (2 jours)';
                    else if (installQty === 5) daysText = ' (2.5 jours)';
                    else if (installQty === 6) daysText = ' (3 jours)';
                    else {
                        const fullDays = Math.floor(installQty / 2);
                        const halfDay = installQty % 2;
                        daysText = halfDay ? ` (${fullDays}.5 jours)` : ` (${fullDays} jours)`;
                    }
                    description = 'Installation, paramétrages, tests, mise en service & formation' + daysText;

                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.5);
                    doc.rect(40, yPos, 515, 14);
                    doc.line(80, yPos, 80, yPos + 14);
                    doc.line(390, yPos, 390, yPos + 14);
                    doc.line(470, yPos, 470, yPos + 14);
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(7);
                    doc.text('1', 55, yPos + 9);
                    doc.text(description, 90, yPos + 9);
                    
                    if (installOffered) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(0, 150, 0);
                        doc.text('OFFERT', 405, yPos + 9);
                        doc.text('OFFERT', 485, yPos + 9);
                    } else {
                        doc.setTextColor(0, 0, 0);
                        doc.text(installPrice.toFixed(2), 405, yPos + 9);
                        doc.text(installTotal.toFixed(2), 485, yPos + 9);
                    }
                    yPos += 14;

                    const installTotalTTC = this.roundToFiveCents(installTotal * (1 + TVA_RATE));
                    const installTVA = installTotalTTC - installTotal;

                    doc.setFillColor(200, 200, 200);
                    doc.rect(390, yPos, 165, 42, 'F');
                    doc.rect(390, yPos, 165, 42);
                    doc.line(390, yPos + 14, 555, yPos + 14);
                    doc.line(390, yPos + 28, 555, yPos + 28);

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(8);
                    doc.setTextColor(0, 0, 0);
                    doc.text('Total H.T.', 400, yPos + 9);
                    doc.text(installTotal.toFixed(2), 485, yPos + 9);
                    doc.text('TVA 8.1%', 400, yPos + 21);
                    doc.text(installTVA.toFixed(2), 485, yPos + 21);
                    doc.text('Total T.T.C.', 400, yPos + 35);
                    doc.text(installTotalTTC.toFixed(2), 485, yPos + 35);

                    yPos += 42;
                }

                return yPos + 15;
            }

            createFogInstallPDF(doc, yPos) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text('INSTALLATION', 40, yPos);
                yPos += 15;

                doc.setFillColor(244, 230, 0);
                doc.rect(40, yPos, 515, 16, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text('Qté', 50, yPos + 10);
                doc.text('Désignation', 90, yPos + 10);
                doc.text('Prix uni. HT', 400, yPos + 10);
                doc.text('Total HT', 480, yPos + 10);
                yPos += 16;

                const installOffered = document.getElementById('fog-installation-offered')?.checked || false;
                
                const description = 'Installation, paramétrages, tests, mise en service & formation';
                
                const installTotal = installOffered ? 0 : FOG_INSTALL_PRICE;

                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.5);
                doc.rect(40, yPos, 515, 14);
                doc.line(80, yPos, 80, yPos + 14);
                doc.line(390, yPos, 390, yPos + 14);
                doc.line(470, yPos, 470, yPos + 14);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.text('1', 55, yPos + 9);
                doc.text(description, 90, yPos + 9);
                
                if (installOffered) {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 150, 0);
                    doc.text('OFFERT', 405, yPos + 9);
                    doc.text('OFFERT', 485, yPos + 9);
                } else {
                    doc.setTextColor(0, 0, 0);
                    doc.text(FOG_INSTALL_PRICE.toFixed(2), 405, yPos + 9);
                    doc.text(installTotal.toFixed(2), 485, yPos + 9);
                }
                yPos += 14;
                
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(7);
                doc.setTextColor(100, 100, 100);
                doc.text('* Installation uniquement au comptant (non mensualisée)', 90, yPos + 5);
                yPos += 10;

                const installTotalTTC = this.roundToFiveCents(installTotal * (1 + TVA_RATE));
                const installTVA = installTotalTTC - installTotal;

                doc.setFillColor(200, 200, 200);
                doc.rect(390, yPos, 165, 42, 'F');
                doc.rect(390, yPos, 165, 42);
                doc.line(390, yPos + 14, 555, yPos + 14);
                doc.line(390, yPos + 28, 555, yPos + 28);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text('Total H.T.', 400, yPos + 9);
                doc.text(installTotal.toFixed(2), 485, yPos + 9);
                doc.text('TVA 8.1%', 400, yPos + 21);
                doc.text(installTVA.toFixed(2), 485, yPos + 21);
                doc.text('Total T.T.C.', 400, yPos + 35);
                doc.text(installTotalTTC.toFixed(2), 485, yPos + 35);

                return yPos + 55;
            }

            // NOUVEAU: Fonction pour créer la section Maintenance dans le PDF
            createMaintenancePDF(doc, yPos) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text('MAINTENANCE ET GARANTIE', 40, yPos);
                yPos += 15;

                doc.setFillColor(244, 230, 0);
                doc.rect(40, yPos, 515, 16, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text('Qté', 50, yPos + 10);
                doc.text('Désignation', 90, yPos + 10);
                doc.text('Prix uni. HT', 400, yPos + 10);
                doc.text('Total HT', 480, yPos + 10);
                yPos += 16;

                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.5);
                doc.rect(40, yPos, 515, 14);
                doc.line(80, yPos, 80, yPos + 14);
                doc.line(390, yPos, 390, yPos + 14);
                doc.line(470, yPos, 470, yPos + 14);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.text('1', 55, yPos + 9);
                doc.text('Assistance hotline, déplacement(s), matériels pièce(s), main d\'œuvre et support téléphonique', 90, yPos + 9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 150, 0);
                doc.text('OFFERT', 405, yPos + 9);
                doc.text('OFFERT', 485, yPos + 9);
                doc.setTextColor(0, 0, 0);
                yPos += 14;

                return yPos + 15;
            }

            createFinalSummaryPDF(doc, yPos, type, isRental) {
                yPos += 15;
                
                doc.setFillColor(244, 230, 0);
                doc.rect(40, yPos, 515, 16, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.text('RÉCAPITULATIF GÉNÉRAL', 50, yPos + 10);
                yPos += 16;

                let totalMensualitesHT = 0;
                let totalComptantHT = 0;
                let monthsCount = 0;
                let surveillanceMonthlyHT = 0;
                
                if (type === 'alarm') {
                    const materialTotal = this.calculateSectionTotal('alarm-material');
                    
                    const installQty = parseFloat(document.getElementById('alarm-installation-qty')?.value) || 1;
                    const installPrice = this.calculateInstallationPrice(installQty);
                    const installOffered = document.getElementById('alarm-installation-offered')?.checked || false;
                    const installTotal = installOffered ? 0 : installPrice;
                    const otherInstallationTotal = this.calculateSectionTotal('alarm-installation');
                    const totalInstallation = installTotal + otherInstallationTotal;
                    
                    const simCardOffered = document.getElementById('admin-simcard-offered')?.checked || false;
                    const processingOffered = document.getElementById('admin-processing-offered')?.checked || false;
                    const adminTotal = (simCardOffered ? 0 : ADMIN_FEES.simCard) + (processingOffered ? 0 : ADMIN_FEES.processingFee);
                    
                    const paymentMonths = this.globalPaymentMonths['alarm'] || 0;
                    
                    const surveillanceType = document.getElementById('surveillance-type')?.value;
                    const surveillancePrice = parseFloat(document.getElementById('surveillance-price')?.value) || 0;
                    const surveillanceOffered = document.getElementById('surveillance-offered')?.checked;
                    surveillanceMonthlyHT = surveillanceType && !surveillanceOffered ? surveillancePrice : 0;
                    
                    if (paymentMonths > 0) {
                        totalMensualitesHT = materialTotal + totalInstallation;
                        monthsCount = paymentMonths;
                    } else {
                        totalComptantHT = materialTotal + totalInstallation;
                    }
                    
                    totalComptantHT += adminTotal;
                    
                } else if (type === 'camera') {
                    const materialTotal = this.calculateSectionTotal('camera-material');
                    
                    let installTotal = 0;
                    if (!isRental) {
                        const installOffered = document.getElementById('camera-installation-offered')?.checked || false;
                        const installPrice = this.calculateCameraInstallationPrice();
                        installTotal = installOffered ? 0 : installPrice;
                    }
                    
                    const paymentMonths = this.globalPaymentMonths['camera'] || 0;
                    
                    if (paymentMonths > 0 && !isRental) {
                        totalMensualitesHT = materialTotal + installTotal;
                        monthsCount = paymentMonths;
                    } else {
                        totalComptantHT = materialTotal + installTotal;
                    }
                    
                    if (!isRental) {
                        const remoteAccess = document.getElementById('camera-remote-access')?.checked;
                        if (remoteAccess) {
                            surveillanceMonthlyHT = REMOTE_ACCESS_PRICE;
                        }
                    }
                } else if (type === 'fog') {
                    const materialTotal = this.calculateSectionTotal('fog-material');
                    const installOffered = document.getElementById('fog-installation-offered')?.checked || false;
                    
                    const installTotal = installOffered ? 0 : FOG_INSTALL_PRICE;
                    
                    const paymentMonths = this.globalPaymentMonths['fog'] || 0;
                    
                    if (paymentMonths > 0) {
                        totalMensualitesHT = materialTotal;
                        monthsCount = paymentMonths;
                        
                        totalComptantHT = installTotal;
                    } else {
                        totalComptantHT = materialTotal + installTotal;
                    }
                }

                if (!isRental && monthsCount > 0 && totalMensualitesHT > 0) {
                    let mensualiteMatHT = 0;
                    let mensualiteInstallHT = 0;
                    
                    if (type === 'alarm') {
                        const installQty = parseFloat(document.getElementById('alarm-installation-qty')?.value) || 1;
                        const installOffered = document.getElementById('alarm-installation-offered')?.checked || false;
                        
                        mensualiteMatHT = this.calculateSectionMonthlyPrice('alarm-material', monthsCount);
                        mensualiteInstallHT = installOffered ? 0 : this.roundToFiveCents(this.getInstallationMonthlyPrice(installQty, monthsCount));
                        
                        const otherInstallMensualite = this.calculateSectionMonthlyPrice('alarm-installation', monthsCount);
                        mensualiteMatHT += otherInstallMensualite;
                    } else if (type === 'camera') {
                        const installQty = parseFloat(document.getElementById('camera-installation-qty')?.value) || 1;
                        const installOffered = document.getElementById('camera-installation-offered')?.checked || false;
                        
                        mensualiteMatHT = this.calculateSectionMonthlyPrice('camera-material', monthsCount);
                        mensualiteInstallHT = installOffered ? 0 : this.roundToFiveCents(this.getInstallationMonthlyPrice(installQty, monthsCount));
                    } else if (type === 'fog') {
                        mensualiteMatHT = this.calculateSectionMonthlyPrice('fog-material', monthsCount);
                        mensualiteInstallHT = 0;
                    }
                    
                    const totalInstallMatSupp = mensualiteMatHT + mensualiteInstallHT;
                    const totalMensuelHT = totalInstallMatSupp + surveillanceMonthlyHT;
                    const totalMensuelTVA = totalMensuelHT * TVA_RATE;
                    const totalMensuelTTC = this.roundToFiveCents(totalMensuelHT * (1 + TVA_RATE));

                    doc.setFillColor(245, 245, 245);
                    doc.roundedRect(40, yPos, 515, 75, 8, 8, 'F');
                    
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                    doc.text('MENSUALITÉS GLOBALES (' + monthsCount + ' mois)', 50, yPos + 18);
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    const serviceName = type === 'alarm' ? 
                        (document.getElementById('surveillance-type')?.value === 'telesurveillance' ? 'Télésurveillance' : 
                        document.getElementById('surveillance-type')?.value === 'telesurveillance-pro' ? 'Télésurveillance Pro' : 
                        document.getElementById('surveillance-type')?.value === 'autosurveillance-pro' ? 'Autosurveillance Pro' : 'Autosurveillance') : 
                        'Vision à distance';
                    
                    doc.text(`Installation et matériel supp. = ${totalInstallMatSupp.toFixed(2)} CHF HT   |   ${serviceName} = ${surveillanceMonthlyHT.toFixed(2)} CHF HT`, 50, yPos + 35);
                    
                    doc.text(`Total mensualité HT = ${totalMensuelHT.toFixed(2)} CHF`, 50, yPos + 48);
                    doc.text(`TVA 8,1% = ${totalMensuelTVA.toFixed(2)} CHF`, 250, yPos + 48);
                    
                    doc.setFillColor(255, 255, 255);
                    doc.roundedRect(420, yPos + 38, 120, 20, 5, 5, 'F');
                    
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                    doc.text(`Total TTC = ${totalMensuelTTC.toFixed(2)} CHF`, 430, yPos + 51);
                    
                    yPos += 75;
                    
                    if (totalComptantHT > 0) {
                        yPos += 15;
                        
                        doc.setFillColor(245, 245, 245);
                        doc.roundedRect(40, yPos, 515, 45, 8, 8, 'F');
                        
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(9);
                        doc.text('MONTANT À RÉGLER COMPTANT', 50, yPos + 18);
                        
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(8);
                        doc.text(`Total HT = ${totalComptantHT.toFixed(2)} CHF`, 50, yPos + 30);
                        const comptantTVA = totalComptantHT * TVA_RATE;
                        const comptantTTC = this.roundToFiveCents(totalComptantHT * (1 + TVA_RATE));
                        doc.text(`TVA 8,1% = ${comptantTVA.toFixed(2)} CHF`, 250, yPos + 30);
                        
                        doc.setFillColor(255, 255, 255);
                        doc.roundedRect(420, yPos + 20, 120, 20, 5, 5, 'F');
                        
                        doc.setFont('helvetica', 'bold');
                        doc.text(`Total TTC = ${comptantTTC.toFixed(2)} CHF`, 430, yPos + 33);
                        
                        yPos += 50;
                    }
                    
                } else {
                    const totalTVA = totalComptantHT * TVA_RATE;
                    const totalTTC = this.roundToFiveCents(totalComptantHT * (1 + TVA_RATE));
                    
                    doc.setFillColor(245, 245, 245);
                    doc.roundedRect(40, yPos, 515, 45, 8, 8, 'F');
                    
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                    
                    if (isRental) {
                        doc.text('MONTANT TOTAL LOCATION (PAIEMENT COMPTANT)', 50, yPos + 18);
                    } else {
                        doc.text('MONTANT TOTAL (PAIEMENT COMPTANT)', 50, yPos + 18);
                    }
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    doc.text(`Total HT = ${totalComptantHT.toFixed(2)} CHF`, 50, yPos + 30);
                    doc.text(`TVA 8,1% = ${totalTVA.toFixed(2)} CHF`, 250, yPos + 30);
                    
                    doc.setFillColor(255, 255, 255);
                    doc.roundedRect(420, yPos + 20, 120, 20, 5, 5, 'F');
                    
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Total TTC = ${totalTTC.toFixed(2)} CHF`, 430, yPos + 33);
                    
                    yPos += 50;
                }

                if (!isRental && type !== 'camera' && monthsCount > 0) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(0, 0, 0);
                    yPos += 10;
                    doc.text(`Nous demandons à nos abonnés la signature d'un contrat de ${monthsCount} mois par habitation.`, 80, yPos);
                    yPos += 12;
                    doc.text(`La mensualité est fixée et non indexable pendant la durée contractuelle.`, 80, yPos);
                    yPos += 15;
                }

                return yPos;
            }

            createPDFFooter(doc, clientName) {
                doc.setFillColor(51, 51, 51);
                doc.rect(0, 720, 595, 122, 'F');
                
                doc.setFillColor(244, 230, 0);
                doc.rect(0, 720, 595, 6, 'F');

                doc.setFillColor(255, 255, 255);
                doc.rect(50, 745, 200, 25, 'F');
                doc.rect(350, 745, 200, 60, 'F');

                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.text(`NOM DU CLIENT : ${clientName}`, 60, 760);
                doc.text('SIGNATURE DU CLIENT', 430, 760);
            }

            exportQuote() {
                const quote = {
                    timestamp: new Date().toISOString(),
                    type: this.currentTab,
                    isRental: this.rentalMode[this.currentTab],
                    sections: this.sections
                };
                
                const dataStr = JSON.stringify(quote, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `devis-${this.currentTab}-${this.rentalMode[this.currentTab] ? 'location' : 'vente'}-${new Date().toISOString().split('T')[0]}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                
                this.showNotification('Devis exporté avec succès!', 'success');
            }

            showNotification(message, type = 'success', duration = 3000) {
                const existingNotifs = document.querySelectorAll('.dialarme-notification');
                existingNotifs.forEach(n => n.remove());
                
                const notification = document.createElement('div');
                notification.className = 'dialarme-notification';
                
                let bgColor = '#28a745';
                let icon = '✅';
                
                if (type === 'info') {
                    bgColor = '#17a2b8';
                    icon = '📤';
                }
                if (type === 'warning') {
                    bgColor = '#ffc107';
                    icon = '⚠️';
                }
                if (type === 'error') {
                    bgColor = '#dc3545';
                    icon = '❌';
                }
                
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${bgColor};
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    max-width: 400px;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                `;
                
                notification.innerHTML = `
                    <span style="font-size: 18px;">${icon}</span>
                    <span>${message}</span>
                `;
                
                document.body.appendChild(notification);

                if (duration > 0) {
                    setTimeout(() => {
                        notification.style.animation = 'slideOut 0.3s ease';
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.remove();
                            }
                        }, 300);
                    }, duration);
                }
            }
        }

        let generator;

        function showTab(tabName, element) {
            if (generator) generator.showTab(tabName, element);
        }

        function toggleRentalMode(type) {
            if (generator) generator.toggleRentalMode(type);
        }

        function toggleInterventionsQty() {
            const checkbox = document.getElementById('option-interventions-annee');
            const qtyInput = document.getElementById('interventions-qty');
            qtyInput.style.display = checkbox.checked ? 'inline-block' : 'none';
            updateTotals();
        }

        function updateAlarmInstallationPrice() {
            if (generator) generator.updateAlarmInstallationPrice();
        }

        function updateCameraInstallationPrice() {
            if (generator) generator.updateCameraInstallationPrice();
        }

        function updateSurveillancePrice() {
            if (generator) generator.updateSurveillancePrice();
        }

        function generatePDF(type) {
            if (generator) generator.generatePDF(type);
        }

        function exportQuote() {
            if (generator) generator.exportQuote();
        }

        function selectGlobalPayment(element, type) {
            if (generator) generator.selectGlobalPayment(element, type);
        }

        function addProductLine(sectionId) {
            if (generator) generator.addProductLine(sectionId);
        }

        function handleProductSelection(selectElement) {
            if (generator) generator.handleProductSelection(selectElement);
        }

        function updateTotals() {
            if (generator) generator.updateTotals();
        }

        function showKitSelector() {
            if (generator) generator.showKitSelector();
        }

        function handleCommercialSelection(selectElement) {
            const customInput = document.getElementById('commercial-custom');
            if (selectElement.value === 'autre') {
                customInput.style.display = 'block';
                customInput.focus();
            } else {
                customInput.style.display = 'none';
                customInput.value = '';
            }
        }

        function handleCommercialSelectionCamera(selectElement) {
            const customInput = document.getElementById('commercialCamera-custom');
            if (selectElement.value === 'autre') {
                customInput.style.display = 'block';
                customInput.focus();
            } else {
                customInput.style.display = 'none';
                customInput.value = '';
            }
        }

        function handleCommercialSelectionFog(selectElement) {
            const customInput = document.getElementById('commercialFog-custom');
            if (selectElement.value === 'autre') {
                customInput.style.display = 'block';
                customInput.focus();
            } else {
                customInput.style.display = 'none';
                customInput.value = '';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            generator = new DialarmeFinalGenerator();
            console.log('✅ Application Dialarme chargée avec succès');
            console.log('📋 Catalogues disponibles:', Object.keys(generator.catalog));
            console.log('👥 Commerciaux disponibles:', COMMERCIALS_LIST.length);
            console.log('💰 Configuration des prix chargée');
            console.log('📧 URL Google Script:', GOOGLE_SCRIPT_URL);
        });
