/**
 * ============================================================================
 * USE QUOTE GENERATOR HOOK
 * ============================================================================
 * 
 * React hook for managing quote generator state and logic
 * Replaces the DialarmeFinalGenerator class from script.js
 */

import { useState, useCallback, useEffect } from 'react';
import {
  CATALOG_ALARM_PRODUCTS,
  CATALOG_CAMERA_MATERIAL,
  CENTRALS_CONFIG,
  roundToFiveCents,
  calculateInstallationPrice,
  getInstallationMonthlyPrice,
  getProductPrice,
  getFilteredProducts,
  TVA_RATE,
  ADMIN_FEES,
  SURVEILLANCE_PRICES_SALE,
  SURVEILLANCE_PRICES_RENTAL,
  type AlarmProduct,
  type CameraProduct
} from '@/lib/quote-generator';

export interface QuoteGeneratorState {
  currentTab: 'alarm' | 'camera';
  rentalMode: {
    alarm: boolean;
    camera: boolean;
  };
  globalPaymentMonths: {
    alarm: number;
    camera: number;
  };
  selectedCentral: string | null;
  kitOffered: boolean;
}

export function useQuoteGenerator() {
  const [state, setState] = useState<QuoteGeneratorState>({
    currentTab: 'alarm',
    rentalMode: {
      alarm: false,
      camera: false
    },
    globalPaymentMonths: {
      alarm: 48,
      camera: 48
    },
    selectedCentral: null,
    kitOffered: false
  });

  // Show tab
  const showTab = useCallback((tabName: 'alarm' | 'camera') => {
    setState(prev => ({ ...prev, currentTab: tabName }));
    
    // Update active classes
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
  }, []);

  // Toggle rental mode
  const toggleRentalMode = useCallback((type: 'alarm' | 'camera') => {
    const checkbox = document.getElementById(`${type}-rental-mode`) as HTMLInputElement;
    const isRental = checkbox?.checked || false;
    
    setState(prev => ({
      ...prev,
      rentalMode: {
        ...prev.rentalMode,
        [type]: isRental
      },
      globalPaymentMonths: {
        ...prev.globalPaymentMonths,
        [type]: isRental ? 0 : 48
      }
    }));

    // Update UI based on rental mode
    if (type === 'alarm') {
      const paymentSection = document.getElementById('alarm-payment-section');
      if (paymentSection) {
        paymentSection.style.display = isRental ? 'none' : 'block';
      }
      
      document.getElementById('alarm-uninstall-line')!.style.display = isRental ? 'flex' : 'none';
      
      const installLine = document.getElementById('alarm-installation-line');
      if (installLine) {
        if (isRental) {
          installLine.querySelector('div:first-child')!.textContent = 'Installation, paramétrages, tests, mise en service & formation';
          (document.getElementById('alarm-installation-display') as HTMLElement).textContent = 'Compris dans le forfait';
          (document.getElementById('alarm-installation-qty') as HTMLElement).style.display = 'none';
          (installLine.querySelector('label') as HTMLElement).style.display = 'none';
          (document.getElementById('alarm-installation-offered')!.parentElement as HTMLElement).style.display = 'none';
          (document.getElementById('alarm-installation-price') as HTMLElement).style.display = 'none';
        } else {
          (document.getElementById('alarm-installation-qty') as HTMLElement).style.display = 'inline-block';
          (installLine.querySelector('label') as HTMLElement).style.display = 'inline';
          (document.getElementById('alarm-installation-offered')!.parentElement as HTMLElement).style.display = 'flex';
          (document.getElementById('alarm-installation-price') as HTMLElement).style.display = 'inline-block';
        }
      }
    } else if (type === 'camera') {
      const paymentSection = document.getElementById('camera-payment-section');
      if (paymentSection) {
        paymentSection.style.display = isRental ? 'none' : 'block';
      }
      
      document.getElementById('camera-remote-section')!.style.display = isRental ? 'none' : 'block';
      document.getElementById('camera-remote-summary')!.style.display = isRental ? 'none' : 'flex';
      
      document.getElementById('camera-uninstall-line')!.style.display = isRental ? 'flex' : 'none';
      
      const installLine = document.getElementById('camera-installation-line');
      if (installLine) {
        if (isRental) {
          installLine.querySelector('div:first-child')!.textContent = 'Installation, paramétrages, tests, mise en service & formation des utilisateurs';
          (document.getElementById('camera-installation-price') as HTMLElement).textContent = 'Compris dans le forfait';
          (document.getElementById('camera-installation-qty') as HTMLElement).style.display = 'none';
          (installLine.querySelector('label') as HTMLElement).style.display = 'none';
          (document.getElementById('camera-installation-offered')!.parentElement as HTMLElement).style.display = 'none';
        } else {
          (document.getElementById('camera-installation-qty') as HTMLElement).style.display = 'inline-block';
          (installLine.querySelector('label') as HTMLElement).style.display = 'inline';
          (document.getElementById('camera-installation-offered')!.parentElement as HTMLElement).style.display = 'flex';
        }
      }
      
      if (isRental) {
        (document.getElementById('camera-remote-access') as HTMLInputElement).checked = false;
      }
    }
  }, []);

  // Detect selected central
  const detectSelectedCentral = useCallback(() => {
    const container = document.getElementById('alarm-material-products');
    if (!container) return;
    
    const productLines = container.querySelectorAll('.product-line');
    let hasJablotron = false;
    let hasTitane = false;
    
    productLines.forEach(line => {
      const select = line.querySelector('.product-select') as HTMLSelectElement;
      if (select && select.value) {
        const productId = parseInt(select.value);
        if (productId === 5) hasJablotron = true;
        if (productId === 6) hasTitane = true;
      }
    });
    
    let newCentral: string | null = null;
    if (hasJablotron) {
      newCentral = 'jablotron';
    } else if (hasTitane) {
      newCentral = 'titane';
    }
    
    setState(prev => ({
      ...prev,
      selectedCentral: newCentral,
      kitOffered: newCentral !== null
    }));
    
    return newCentral;
  }, []);

  // Show kit selector modal
  const showKitSelector = useCallback(() => {
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
    
    const selectKit = (btn: HTMLElement, centralType: string, kitType: string) => {
      modal.querySelectorAll('.kit-btn').forEach(b => {
        (b as HTMLElement).style.background = 'white';
        (b as HTMLElement).style.borderWidth = '2px';
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
        applyKit(centralType, kitType);
        modal.remove();
      }, 400);
    };
    
    const applyKit = (centralType: string, kitType: string) => {
      const container = document.getElementById('alarm-material-products');
      if (!container) return;
      
      container.innerHTML = '';
      
      setState(prev => ({
        ...prev,
        selectedCentral: centralType,
        kitOffered: true
      }));
      
      const config = CENTRALS_CONFIG[centralType];
      if (!config) {
        alert('Erreur: Configuration de centrale introuvable');
        return;
      }
      
      // Add central
      addProductToContainer('alarm-material', config.id, 1, true);
      
      // Add kit products
      const kit = config.kits[kitType];
      if (kit && kit.products) {
        kit.products.forEach(product => {
          addProductToContainer('alarm-material', product.id, product.quantity, true);
        });
      }
      
      showNotification(`✅ ${config.name} + ${kit.name} ajouté avec succès!`, 'success');
    };
    
    const addProductToContainer = (sectionId: string, productId: number, quantity: number, isOffered: boolean) => {
      const container = document.getElementById(`${sectionId}-products`);
      if (!container) return;
      
      const product = CATALOG_ALARM_PRODUCTS.find(p => p.id === productId);
      if (!product) return;
      
      const price = getProductPrice(product, state.selectedCentral);
      const lineId = 'line-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      const productLine = document.createElement('div');
      productLine.className = 'product-line';
      if (productId === 5 || productId === 6) {
        productLine.classList.add('central-line');
      }
      
      productLine.innerHTML = `
        <div class="product-select-container" style="width: 100%;">
          <select class="product-select" id="select-${lineId}" data-section="${sectionId}">
            <option value="${productId}" data-price="${price}" selected>${product.name} - ${price.toFixed(2)} CHF</option>
          </select>
        </div>
        <input type="number" value="${quantity}" min="1" class="quantity-input">
        <input type="number" value="${price}" min="0" step="0.01" class="price-input discount-input" style="display: none;">
        <div class="checkbox-option" style="margin: 0;">
          <input type="checkbox" class="offered-checkbox" ${isOffered ? 'checked' : ''}>
          <label style="margin: 0; font-size: 12px;">OFFERT</label>
        </div>
        <div class="price-display">${isOffered ? 'OFFERT' : (price * quantity).toFixed(2) + ' CHF'}</div>
        <button class="remove-btn">×</button>
      `;
      
      container.appendChild(productLine);
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
          <button id="close-modal-btn" style="background: #e0e0e0; color: #666; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 20px; cursor: pointer;">×</button>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #666; margin-bottom: 12px; font-size: 14px;">Centrale Jablotron - ${CENTRALS_CONFIG.jablotron.price.toFixed(2)} CHF</h3>
          <div style="display: flex; gap: 12px;">
            <button class="kit-btn" data-central="jablotron" data-kit="kit1" style="position: relative; flex: 1; padding: 15px; background: white; border: 2px solid #6c757d; border-radius: 8px; cursor: pointer;">
              <div style="font-weight: 600; margin-bottom: 8px;">Kit 1</div>
              <div style="font-size: 12px; color: #666;">2 Détecteurs volumétriques<br>1 Détecteur d'ouverture<br>1 Clavier + 1 Sirène</div>
            </button>
            <button class="kit-btn" data-central="jablotron" data-kit="kit2" style="position: relative; flex: 1; padding: 15px; background: white; border: 2px solid #6c757d; border-radius: 8px; cursor: pointer;">
              <div style="font-weight: 600; margin-bottom: 8px;">Kit 2</div>
              <div style="font-size: 12px; color: #666;">1 Détecteur volumétrique<br>3 Détecteurs d'ouverture<br>1 Clavier + 1 Sirène</div>
            </button>
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #666; margin-bottom: 12px; font-size: 14px;">Centrale Titane - ${CENTRALS_CONFIG.titane.price.toFixed(2)} CHF</h3>
          <div style="display: flex; gap: 12px;">
            <button class="kit-btn" data-central="titane" data-kit="kit1" style="position: relative; flex: 1; padding: 15px; background: white; border: 2px solid #f4e600; border-radius: 8px; cursor: pointer;">
              <div style="font-weight: 600; margin-bottom: 8px;">Kit 1</div>
              <div style="font-size: 12px; color: #666;">2 Détecteurs volumétriques<br>1 Détecteur d'ouverture<br>1 Clavier + 1 Sirène</div>
            </button>
            <button class="kit-btn" data-central="titane" data-kit="kit2" style="position: relative; flex: 1; padding: 15px; background: white; border: 2px solid #f4e600; border-radius: 8px; cursor: pointer;">
              <div style="font-weight: 600; margin-bottom: 8px;">Kit 2</div>
              <div style="font-size: 12px; color: #666;">1 Détecteur volumétrique<br>3 Détecteurs d'ouverture<br>1 Clavier + 1 Sirène</div>
            </button>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 12px; background: #f8f9fa; border-left: 3px solid #f4e600; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #666;">💡 Le kit sera automatiquement marqué comme OFFERT</p>
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
        const centralType = btn.getAttribute('data-central')!;
        const kitType = btn.getAttribute('data-kit')!;
        selectKit(btn as HTMLElement, centralType, kitType);
      });
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }, [state.selectedCentral]);

  // Show notification
  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', duration = 3000) => {
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
        if (notification.parentNode) {
          notification.remove();
        }
      }, duration);
    }
  }, []);

  return {
    state,
    showTab,
    toggleRentalMode,
    detectSelectedCentral,
    showKitSelector,
    showNotification
  };
}

