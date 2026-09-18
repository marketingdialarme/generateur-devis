/**
 * Product Line Data Adapter
 *
 * Converts between ProductLineData (component format) and calculation format
 * Provides utility functions for working with product lines
 */

import { ProductLineData } from '@/components/ProductLine';

/**
 * Case/accent-insensitive check for the Camera catalog's "Type" column
 * being "Caméra" -- a plain === comparison silently miscounts cameras
 * (e.g. install-option and vision-à-distance pricing) if the Sheet cell
 * has different casing or a missing accent, which is easy to type by
 * hand and easy to miss (client-reported bug: single-camera install
 * option not appearing).
 */
export function isCameraType(type: string | null | undefined): boolean {
  if (!type) return false;
  return type.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'camera';
}

/**
 * Detect the selected central type from product lines. Driven by the
 * sheet's REF prefix (TIT-/JAB-) rather than a hardcoded id or a name
 * substring — every Alarm product's ref now encodes its central directly,
 * since Titane and Jablotron are separate rows in Produits_Alarme.
 */
export function detectCentralType(lines: ProductLineData[]): 'titane' | 'jablotron' | null {
  for (const line of lines) {
    const ref = (line.product as any)?.ref as string | undefined;
    if (ref?.startsWith('JAB-')) return 'jablotron';
    if (ref?.startsWith('TIT-')) return 'titane';
  }
  return null;
}

/**
 * Calculate remote access ("vision à distance") price.
 *
 * Client feedback:
 * - Per-camera monthly price is the Config sheet's CAM-VIS-DIS row
 *   (was hardcoded to 20 CHF; still defaults to 20 if the caller doesn't
 *   pass a live value, e.g. before Config has loaded)
 * - For non-4G ("classic") cameras, remote access is only priced if a Modem 4G is selected
 * - The price is for cameras only (NOT for the modem)
 * - Example at 20 CHF: 1 classic cam (with modem) + 1 4G cam => 20 + 20 = 40 CHF/mois
 *
 * Driven by the Sheet's "Type" (Caméra/NVR/Modem/Accessoire) and "4G"
 * columns — replaces the old hardcoded CAMERA_DEVICE_IDS id set and
 * name.includes('4G') check, neither of which survives products coming
 * from the Sheet with freely assigned ids and wording.
 */
export function calculateRemoteAccessPrice(cameraLines: ProductLineData[], pricePerCamera: number = 20): number {
  const hasModem = cameraLines.some(
    (line) =>
      !line.offered &&
      (line.quantity || 0) > 0 &&
      (line.product as any)?.type === 'Modem'
  );

  let fourGCameraCount = 0;
  let classicCameraCount = 0;

  cameraLines.forEach((line) => {
    if (line.offered || !line.product) return;
    if ((line.quantity || 0) <= 0) return;

    // Only count actual camera devices, not NVR/accessories/modem
    if (!isCameraType((line.product as any).type)) return;

    if ((line.product as any).is4G) {
      fourGCameraCount += line.quantity;
    } else {
      classicCameraCount += line.quantity;
    }
  });

  const billableCameras = fourGCameraCount + (hasModem ? classicCameraCount : 0);
  return billableCameras * pricePerCamera;
}
