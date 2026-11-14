export interface DeviceCapabilityReport {
  hasWebGPU: boolean;
  adapterInfo?: any;
  maxStorageBufferSize: number; // bytes
  deviceMemoryGB: number; // navigator.deviceMemory when reported, else 4 (see below)
  deviceMemoryReported: boolean; // Safari does not implement navigator.deviceMemory
  logicalCores: number; // navigator.hardwareConcurrency
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  recommendedTier: '1B-WebGPU' | '360M-WASM' | '135M-WASM';
}

/**
 * Model tiers (see src/components/AppPage.tsx MODEL_CONFIGS):
 * - 1B-WebGPU: Llama 3.2 1B, q4f16, WebGPU. Desktop, and flagship Android only.
 * - 360M-WASM: SmolLM2-360M, int8, WASM. The mid tier on every platform.
 *   int8 is the WASM dtype for this model: its int8 file (346MB) is smaller
 *   than its q4 file (369MB) and higher quality. q4f16 is a WebGPU dtype.
 * - 135M-WASM: SmolLM2-135M, int8, WASM. Absolute floor for very limited
 *   memory, and the last step of the silent fallback chain (1B -> 360M -> 135M).
 *
 * iOS never gets WebGPU: Safari's WebGPU is unstable for ONNX Runtime and
 * iOS Safari jetsam-kills tabs at ~2GB, so iPhones/iPads always start on
 * 360M-WASM and fall back to 135M-WASM on load failure.
 *
 * Android *can* report real memory (Chrome exposes navigator.deviceMemory),
 * so a flagship Android (WebGPU + 8GB+ RAM + 8+ cores) is offered the 1B
 * model. Anything less gets the WASM mid tier; <=2GB reported RAM goes
 * straight to the 135M floor. A failed 1B load still falls back silently.
 */
export async function detectDeviceCapabilities(): Promise<DeviceCapabilityReport> {
  const nav = navigator as any;
  // Safari does not implement navigator.deviceMemory at all. Do not treat
  // the fallback as a measurement: tier logic below must use
  // deviceMemoryReported, never the fallback value, to judge memory.
  const deviceMemoryReported = typeof nav.deviceMemory === 'number';
  const deviceMemoryGB = deviceMemoryReported ? nav.deviceMemory : 4;
  const logicalCores = navigator.hardwareConcurrency || 4;

  const ua = navigator.userAgent;
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);

  // Basic mobile detection
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const report: DeviceCapabilityReport = {
    hasWebGPU: false,
    maxStorageBufferSize: 0,
    deviceMemoryGB,
    deviceMemoryReported,
    logicalCores,
    isMobile,
    isIOS,
    isAndroid,
    recommendedTier: '135M-WASM', // Default fallback
  };

  if (nav.gpu) {
    try {
      const adapter = await nav.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (adapter) {
        report.hasWebGPU = true;
        // Try to get adapter info if available
        if (adapter.requestAdapterInfo) {
          report.adapterInfo = await adapter.requestAdapterInfo();
        } else if (adapter.info) {
          report.adapterInfo = adapter.info;
        }

        report.maxStorageBufferSize = adapter.limits?.maxStorageBufferBindingSize || 0;
      }
    } catch (e) {
      console.warn('WebGPU initialization failed:', e);
    }
  }

  // Tier selection. WebGPU is only trusted for the 1B model on desktop and
  // on flagship Android. iOS is excluded even when navigator.gpu exists.
  if (!isMobile) {
    // Desktop: 1B on WebGPU when the machine reports >= 4GB; otherwise the
    // WASM mid tier (desktop CPUs run 360M-WASM comfortably).
    report.recommendedTier = report.hasWebGPU && deviceMemoryGB >= 4 ? '1B-WebGPU' : '360M-WASM';
  } else if (isIOS) {
    // iOS/iPadOS: always the WASM mid tier. Never WebGPU here.
    report.recommendedTier = '360M-WASM';
  } else if (isAndroid) {
    if (
      report.hasWebGPU &&
      deviceMemoryReported &&
      deviceMemoryGB >= 8 &&
      logicalCores >= 8
    ) {
      // Flagship Android: WebGPU + 8GB+ RAM + 8+ cores can try the 1B model.
      // A failed load falls back silently to 360M-WASM (see AppPage).
      report.recommendedTier = '1B-WebGPU';
    } else if (deviceMemoryReported && deviceMemoryGB <= 2) {
      // Very limited memory, as actually reported by Chrome on Android.
      report.recommendedTier = '135M-WASM';
    } else {
      report.recommendedTier = '360M-WASM';
    }
  } else {
    // Other mobile browsers: WASM mid tier.
    report.recommendedTier = '360M-WASM';
  }

  return report;
}
