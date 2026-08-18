/**
 * Product Line Data Adapter
 *
 * Converts between ProductLineData (component format) and calculation format
 * Provides utility functions for working with product lines
 */

import { ProductLineData } from '@/components/ProductLine';

/**
 * Detect the selected central type from product lines
 */
export function detectCentralType(lines: ProductLineData[]): 'titane' | 'jablotron' | null {
  for (const line of lines) {
    if (line.product) {
      if (line.product.id === 5 || line.product.name?.includes('Jablotron')) {
        return 'jablotron';
      }
      if (line.product.id === 6 || line.product.name?.includes('Titane')) {
        return 'titane';
      }
    }
  }
  return null;
}

/**
 * Calculate remote access ("vision à distance") price.
 *
 * Client feedback:
 * - 20 CHF/mois per 4G camera
 * - For non-4G ("classic") cameras, remote access is only priced if a Modem 4G is selected
 * - The 20 CHF is for cameras only (NOT for the modem)
 * - Example: 1 classic cam (with modem) + 1 4G cam => 20 + 20 = 40 CHF/mois
 */
export function calculateRemoteAccessPrice(cameraLines: ProductLineData[]): number {
  const CAMERA_DEVICE_IDS = new Set<number>([
    23, // Bullet Mini
    24, // Dôme Mini
    26, // Dôme Antivandale
    46, // Dôme Night
    47, // Bullet XL Varifocale
    53, // Dôme XL Varifocale
    31, // Bullet Zoom x23 PTZ
    32, // Mini Solar 4G + P. Solaire
    33, // Solar 4G XL
    28  // Solar 4G XL PTZ
  ]);

  const hasModem = cameraLines.some(
    (line) =>
      !line.offered &&
      (line.quantity || 0) > 0 &&
      line.product?.name === 'Modem 4G'
  );

  let fourGCameraCount = 0;
  let classicCameraCount = 0;

  cameraLines.forEach((line) => {
    if (line.offered || !line.product) return;
    if ((line.quantity || 0) <= 0) return;
    if (typeof line.product.id !== 'number') return;

    // Only count actual camera devices, not NVR/accessories/modem
    if (!CAMERA_DEVICE_IDS.has(line.product.id)) return;

    const is4G = line.product.name.includes('4G');
    if (is4G) {
      fourGCameraCount += line.quantity;
    } else {
      classicCameraCount += line.quantity;
    }
  });

  const billableCameras = fourGCameraCount + (hasModem ? classicCameraCount : 0);
  return billableCameras * 20;
}
