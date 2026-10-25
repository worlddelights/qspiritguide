export interface DeviceCapabilityReport {
  hasWebGPU: boolean;
  adapterInfo?: any;
  maxStorageBufferSize: number; // bytes
  deviceMemoryGB: number;       // navigator.deviceMemory (approx)
  logicalCores: number;         // navigator.hardwareConcurrency
  isMobile: boolean;
  recommendedTier: '1B-WebGPU' | '360M-WebGPU' | '135M-WASM';
}

export async function detectDeviceCapabilities(): Promise<DeviceCapabilityReport> {
  const nav = navigator as any;
  const deviceMemoryGB = nav.deviceMemory || 4; // fallback to 4GB
  const logicalCores = navigator.hardwareConcurrency || 4;
  
  // Basic mobile detection
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const report: DeviceCapabilityReport = {
    hasWebGPU: false,
    maxStorageBufferSize: 0,
    deviceMemoryGB,
    logicalCores,
    isMobile,
    recommendedTier: '135M-WASM', // Default fallback
  };

  if (nav.gpu) {
    try {
      const adapter = await nav.gpu.requestAdapter({ powerPreference: "high-performance" });
      if (adapter) {
        report.hasWebGPU = true;
        // Try to get adapter info if available
        if (adapter.requestAdapterInfo) {
          report.adapterInfo = await adapter.requestAdapterInfo();
        } else if (adapter.info) {
          report.adapterInfo = adapter.info;
        }
        
        report.maxStorageBufferSize = adapter.limits?.maxStorageBufferBindingSize || 0;
        
        // Tier 1 (High Performance — 1B Model)
        // For testing, we also just check if it's a desktop with >= 4GB RAM
        if (!isMobile && deviceMemoryGB >= 4) {
           report.recommendedTier = '1B-WebGPU';
        } else {
           // Tier 2 (Standard / Mobile WebGPU — 360M Model)
           report.recommendedTier = '360M-WebGPU';
        }
      }
    } catch (e) {
      console.warn("WebGPU initialization failed:", e);
    }
  }

  return report;
}
