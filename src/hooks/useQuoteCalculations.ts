/**
 * ============================================================================
 * USE QUOTE CALCULATIONS HOOK
 * ============================================================================
 * 
 * React hook for calculating quote totals with useMemo optimization
 * Migrated from script.js updateTotals() function (lines 929-1188)
 */

import { useMemo } from 'react';
import {
  calculateAlarmTotals,
  calculateCameraTotals,
  type DiscountConfig,
  type InstallationConfig,
  type AdminFeesConfig,
  type ServicesConfig,
  type AlarmTotals,
  type CameraTotals
} from '@/lib/calculations';
import { CATALOG_ALARM_PRODUCTS, CATALOG_CAMERA_MATERIAL } from '@/lib/quote-generator';
import type { ProductLineData } from '@/components/ProductLine';

// ============================================
// ALARM CALCULATIONS HOOK
// ============================================

export interface UseAlarmCalculationsParams {
  materialLines: ProductLineData[];
  installationLines: ProductLineData[];
  materialDiscount?: DiscountConfig;
  installationDiscount?: DiscountConfig;
  installation: InstallationConfig;
  adminFees: AdminFeesConfig;
  services: ServicesConfig;
  paymentMonths: number;
  isRentalMode: boolean;
  selectedCentral: string | null;
}

export function useAlarmCalculations(params: UseAlarmCalculationsParams): AlarmTotals {
  return useMemo(() => {
    return calculateAlarmTotals(
      params.materialLines,
      params.installationLines,
      params.materialDiscount,
      params.installationDiscount,
      params.installation,
      params.adminFees,
      params.services,
      params.paymentMonths,
      params.isRentalMode,
      params.selectedCentral,
      CATALOG_ALARM_PRODUCTS
    );
  }, [
    params.materialLines,
    params.installationLines,
    params.materialDiscount,
    params.installationDiscount,
    params.installation,
    params.adminFees,
    params.services,
    params.paymentMonths,
    params.isRentalMode,
    params.selectedCentral
  ]);
}

// ============================================
// CAMERA CALCULATIONS HOOK
// ============================================

export interface UseCameraCalculationsParams {
  materialLines: ProductLineData[];
  materialDiscount?: DiscountConfig;
  installation: InstallationConfig;
  remoteAccessEnabled: boolean;
  paymentMonths: number;
  isRentalMode: boolean;
}

export function useCameraCalculations(params: UseCameraCalculationsParams): CameraTotals {
  return useMemo(() => {
    return calculateCameraTotals(
      params.materialLines,
      params.materialDiscount,
      params.installation,
      params.remoteAccessEnabled,
      params.paymentMonths,
      params.isRentalMode,
      CATALOG_CAMERA_MATERIAL
    );
  }, [
    params.materialLines,
    params.materialDiscount,
    params.installation,
    params.remoteAccessEnabled,
    params.paymentMonths,
    params.isRentalMode
  ]);
}

// ============================================
// COMBINED CALCULATIONS HOOK
// ============================================

export interface UseQuoteCalculationsParams {
  currentTab: 'alarm' | 'camera';
  alarm: UseAlarmCalculationsParams;
  camera: UseCameraCalculationsParams;
}

export interface QuoteCalculations {
  alarm: AlarmTotals | null;
  camera: CameraTotals | null;
  currentTab: 'alarm' | 'camera';
}

/**
 * Main hook that calculates totals for both tabs
 * Only calculates the active tab for performance
 */
export function useQuoteCalculations(params: UseQuoteCalculationsParams): QuoteCalculations {
  const alarmTotals = useAlarmCalculations(params.alarm);
  const cameraTotals = useCameraCalculations(params.camera);

  return useMemo(() => ({
    alarm: params.currentTab === 'alarm' ? alarmTotals : null,
    camera: params.currentTab === 'camera' ? cameraTotals : null,
    currentTab: params.currentTab
  }), [params.currentTab, alarmTotals, cameraTotals]);
}

