/**
 * useCameraTotals Hook
 * 
 * Handles all camera-related calculations in real-time
 * Converts logic from script.js lines 1098-1190
 */

import { useMemo } from 'react';
import { ProductLineData } from '@/components/ProductLine';

interface CameraTotalsInput {
  materialLines: ProductLineData[];
  materialDiscount: { type: 'percent' | 'amount'; value: number };
  installationQty: number;
  installationOffered: boolean;
  remoteAccess: boolean;
  rentalMode: boolean;
  paymentMonths: number;
}

interface CameraTotals {
  materialHT: number;
  materialTTC: number;
  installationHT: number;
  installationTTC: number;
  uninstallHT: number;
  uninstallTTC: number;
  remoteAccessMonthly: number;
  totalHT: number;
  totalTTC: number;
  monthlyPayment: number;
  cashPayment: number;
}

const TVA_RATE = 0.081;
const CAMERA_INSTALL_BASE = 690;
const CAMERA_INSTALL_PER_CAMERA = 140;
const REMOTE_ACCESS_PRICE = 20;
const UNINSTALL_PRICE = 290;

export function useCameraTotals(input: CameraTotalsInput): CameraTotals {
  return useMemo(() => {
    const {
      materialLines,
      materialDiscount,
      installationQty,
      installationOffered,
      remoteAccess,
      rentalMode,
      paymentMonths
    } = input;

    // Calculate material total
    let materialSubtotal = 0;
    materialLines.forEach(line => {
      if (!line.product || line.offered) return;
      
      let price = 0;
      if (line.product.isCustom && line.customPrice !== undefined) {
        price = line.customPrice;
      } else if (line.product.price !== undefined) {
        price = line.product.price;
      }
      
      materialSubtotal += price * line.quantity;
    });

    // Apply material discount
    let materialDiscountValue = 0;
    if (materialDiscount.type === 'percent') {
      materialDiscountValue = materialSubtotal * (materialDiscount.value / 100);
    } else {
      materialDiscountValue = materialDiscount.value;
    }
    
    const materialHT = Math.max(0, materialSubtotal - materialDiscountValue);
    const materialTTC = materialHT * (1 + TVA_RATE);

    // Calculate installation
    // Formula: 690 + (number of cameras × 140)
    const cameraCount = materialLines.reduce((sum, line) => {
      return sum + (line.product && !line.offered ? line.quantity : 0);
    }, 0);
    
    const installationPrice = CAMERA_INSTALL_BASE + (cameraCount * CAMERA_INSTALL_PER_CAMERA);
    const installationHT = installationOffered ? 0 : installationPrice * installationQty;
    const installationTTC = installationHT * (1 + TVA_RATE);

    // Uninstall (only in rental mode)
    const uninstallHT = rentalMode ? UNINSTALL_PRICE : 0;
    const uninstallTTC = uninstallHT * (1 + TVA_RATE);

    // Remote access (monthly, not in rental mode)
    const remoteAccessMonthly = (!rentalMode && remoteAccess) ? REMOTE_ACCESS_PRICE : 0;

    // Totals
    const totalHT = materialHT + installationHT + uninstallHT;
    const totalTTC = totalHT * (1 + TVA_RATE);

    // Monthly payments (if not rental mode and payment months > 0)
    let monthlyPayment = 0;
    let cashPayment = totalTTC;

    if (!rentalMode && paymentMonths > 0) {
      // Calculate monthly payment including remote access
      monthlyPayment = (totalTTC / paymentMonths) + remoteAccessMonthly;
      cashPayment = 0;
    } else if (!rentalMode) {
      // Comptant - no monthly payment
      monthlyPayment = remoteAccessMonthly; // Still show remote access as monthly
      cashPayment = totalTTC;
    }

    return {
      materialHT,
      materialTTC,
      installationHT,
      installationTTC,
      uninstallHT,
      uninstallTTC,
      remoteAccessMonthly,
      totalHT,
      totalTTC,
      monthlyPayment,
      cashPayment
    };
  }, [input]);
}

