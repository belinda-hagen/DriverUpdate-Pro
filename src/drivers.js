// ============================================
// DIRECT DOWNLOAD URL BUILDERS
// ============================================

// NVIDIA Product Series and Family IDs for direct download links
const nvidiaProductMapping = {
  // GeForce RTX 50 Series
  'rtx 5090': { psid: 129, pfid: 1067, series: 'GeForce RTX 50 Series' },
  'rtx 5080': { psid: 129, pfid: 1068, series: 'GeForce RTX 50 Series' },
  'rtx 5070 ti': { psid: 129, pfid: 1069, series: 'GeForce RTX 50 Series' },
  'rtx 5070': { psid: 129, pfid: 1070, series: 'GeForce RTX 50 Series' },
  
  // GeForce RTX 40 Series
  'rtx 4090': { psid: 127, pfid: 1037, series: 'GeForce RTX 40 Series' },
  'rtx 4080 super': { psid: 127, pfid: 1061, series: 'GeForce RTX 40 Series' },
  'rtx 4080': { psid: 127, pfid: 1038, series: 'GeForce RTX 40 Series' },
  'rtx 4070 ti super': { psid: 127, pfid: 1062, series: 'GeForce RTX 40 Series' },
  'rtx 4070 ti': { psid: 127, pfid: 1044, series: 'GeForce RTX 40 Series' },
  'rtx 4070 super': { psid: 127, pfid: 1063, series: 'GeForce RTX 40 Series' },
  'rtx 4070': { psid: 127, pfid: 1045, series: 'GeForce RTX 40 Series' },
  'rtx 4060 ti': { psid: 127, pfid: 1046, series: 'GeForce RTX 40 Series' },
  'rtx 4060': { psid: 127, pfid: 1047, series: 'GeForce RTX 40 Series' },
  
  // GeForce RTX 30 Series
  'rtx 3090 ti': { psid: 122, pfid: 1014, series: 'GeForce RTX 30 Series' },
  'rtx 3090': { psid: 122, pfid: 960, series: 'GeForce RTX 30 Series' },
  'rtx 3080 ti': { psid: 122, pfid: 984, series: 'GeForce RTX 30 Series' },
  'rtx 3080': { psid: 122, pfid: 961, series: 'GeForce RTX 30 Series' },
  'rtx 3070 ti': { psid: 122, pfid: 985, series: 'GeForce RTX 30 Series' },
  'rtx 3070': { psid: 122, pfid: 962, series: 'GeForce RTX 30 Series' },
  'rtx 3060 ti': { psid: 122, pfid: 973, series: 'GeForce RTX 30 Series' },
  'rtx 3060': { psid: 122, pfid: 975, series: 'GeForce RTX 30 Series' },
  'rtx 3050': { psid: 122, pfid: 1013, series: 'GeForce RTX 30 Series' },
  
  // GeForce RTX 20 Series
  'rtx 2080 ti': { psid: 107, pfid: 899, series: 'GeForce RTX 20 Series' },
  'rtx 2080 super': { psid: 107, pfid: 937, series: 'GeForce RTX 20 Series' },
  'rtx 2080': { psid: 107, pfid: 900, series: 'GeForce RTX 20 Series' },
  'rtx 2070 super': { psid: 107, pfid: 938, series: 'GeForce RTX 20 Series' },
  'rtx 2070': { psid: 107, pfid: 901, series: 'GeForce RTX 20 Series' },
  'rtx 2060 super': { psid: 107, pfid: 939, series: 'GeForce RTX 20 Series' },
  'rtx 2060': { psid: 107, pfid: 915, series: 'GeForce RTX 20 Series' },
  
  // GeForce GTX 16 Series
  'gtx 1660 ti': { psid: 111, pfid: 917, series: 'GeForce GTX 16 Series' },
  'gtx 1660 super': { psid: 111, pfid: 949, series: 'GeForce GTX 16 Series' },
  'gtx 1660': { psid: 111, pfid: 921, series: 'GeForce GTX 16 Series' },
  'gtx 1650 super': { psid: 111, pfid: 950, series: 'GeForce GTX 16 Series' },
  'gtx 1650': { psid: 111, pfid: 928, series: 'GeForce GTX 16 Series' },
  
  // GeForce GTX 10 Series
  'gtx 1080 ti': { psid: 101, pfid: 848, series: 'GeForce GTX 10 Series' },
  'gtx 1080': { psid: 101, pfid: 835, series: 'GeForce GTX 10 Series' },
  'gtx 1070 ti': { psid: 101, pfid: 876, series: 'GeForce GTX 10 Series' },
  'gtx 1070': { psid: 101, pfid: 836, series: 'GeForce GTX 10 Series' },
  'gtx 1060': { psid: 101, pfid: 853, series: 'GeForce GTX 10 Series' },
  'gtx 1050 ti': { psid: 101, pfid: 870, series: 'GeForce GTX 10 Series' },
  'gtx 1050': { psid: 101, pfid: 871, series: 'GeForce GTX 10 Series' },
  
  // Notebook variants
  'rtx 4090 laptop': { psid: 128, pfid: 1039, series: 'GeForce RTX 40 Series (Notebooks)' },
  'rtx 4080 laptop': { psid: 128, pfid: 1040, series: 'GeForce RTX 40 Series (Notebooks)' },
  'rtx 4070 laptop': { psid: 128, pfid: 1048, series: 'GeForce RTX 40 Series (Notebooks)' },
  'rtx 4060 laptop': { psid: 128, pfid: 1049, series: 'GeForce RTX 40 Series (Notebooks)' },
  'rtx 4050 laptop': { psid: 128, pfid: 1050, series: 'GeForce RTX 40 Series (Notebooks)' },
  'rtx 3080 laptop': { psid: 123, pfid: 971, series: 'GeForce RTX 30 Series (Notebooks)' },
  'rtx 3070 laptop': { psid: 123, pfid: 972, series: 'GeForce RTX 30 Series (Notebooks)' },
  'rtx 3060 laptop': { psid: 123, pfid: 976, series: 'GeForce RTX 30 Series (Notebooks)' },
};

// AMD Product mapping for direct download links
// AMD's current URL structure: /graphics/radeon-rx-7000-series-graphics/amd-radeon-rx-7900-xtx
const amdProductMapping = {
  // Radeon RX 9000 Series
  'rx 9070 xt': { family: 'radeon-rx-9000-series-graphics', product: 'amd-radeon-rx-9070-xt' },
  'rx 9070': { family: 'radeon-rx-9000-series-graphics', product: 'amd-radeon-rx-9070' },
  
  // Radeon RX 7000 Series
  'rx 7900 xtx': { family: 'radeon-rx-7000-series-graphics', product: 'amd-radeon-rx-7900-xtx' },
  'rx 7900 xt': { family: 'radeon-rx-7000-series-graphics', product: 'amd-radeon-rx-7900-xt' },
  'rx 7900 gre': { family: 'radeon-rx-7000-series-graphics', product: 'amd-radeon-rx-7900-gre' },
  'rx 7800 xt': { family: 'radeon-rx-7000-series-graphics', product: 'amd-radeon-rx-7800-xt' },
  'rx 7700 xt': { family: 'radeon-rx-7000-series-graphics', product: 'amd-radeon-rx-7700-xt' },
  'rx 7600 xt': { family: 'radeon-rx-7000-series-graphics', product: 'amd-radeon-rx-7600-xt' },
  'rx 7600': { family: 'radeon-rx-7000-series-graphics', product: 'amd-radeon-rx-7600' },
  
  // Radeon RX 6000 Series
  'rx 6950 xt': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6950-xt' },
  'rx 6900 xt': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6900-xt' },
  'rx 6800 xt': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6800-xt' },
  'rx 6800': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6800' },
  'rx 6750 xt': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6750-xt' },
  'rx 6700 xt': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6700-xt' },
  'rx 6700': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6700' },
  'rx 6650 xt': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6650-xt' },
  'rx 6600 xt': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6600-xt' },
  'rx 6600': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6600' },
  'rx 6500 xt': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6500-xt' },
  'rx 6400': { family: 'radeon-rx-6000-series-graphics', product: 'amd-radeon-rx-6400' },
  
  // Radeon RX 5000 Series
  'rx 5700 xt': { family: 'radeon-rx-5000-series-graphics', product: 'amd-radeon-rx-5700-xt' },
  'rx 5700': { family: 'radeon-rx-5000-series-graphics', product: 'amd-radeon-rx-5700' },
  'rx 5600 xt': { family: 'radeon-rx-5000-series-graphics', product: 'amd-radeon-rx-5600-xt' },
  'rx 5500 xt': { family: 'radeon-rx-5000-series-graphics', product: 'amd-radeon-rx-5500-xt' },
  
  // AMD Ryzen Processors with integrated graphics
  'ryzen 9': { family: 'ryzen-processors', product: 'amd-ryzen-9' },
  'ryzen 7': { family: 'ryzen-processors', product: 'amd-ryzen-7' },
  'ryzen 5': { family: 'ryzen-processors', product: 'amd-ryzen-5' },
  'ryzen 3': { family: 'ryzen-processors', product: 'amd-ryzen-3' },
  
  // AMD Chipsets
  'x670': { family: 'chipsets', product: 'amd-socket-am5' },
  'x570': { family: 'chipsets', product: 'amd-socket-am4' },
  'b650': { family: 'chipsets', product: 'amd-socket-am5' },
  'b550': { family: 'chipsets', product: 'amd-socket-am4' },
};

// Intel Product mapping for direct download links
const intelProductMapping = {
  // Intel Arc GPUs
  'arc a770': { productId: '227957', category: 'graphics' },
  'arc a750': { productId: '227958', category: 'graphics' },
  'arc a580': { productId: '227959', category: 'graphics' },
  'arc a380': { productId: '227960', category: 'graphics' },
  'arc a310': { productId: '227961', category: 'graphics' },
  
  // Intel Iris Xe Graphics
  'iris xe': { productId: '80939', category: 'graphics' },
  'iris plus': { productId: '88353', category: 'graphics' },
  'uhd graphics 770': { productId: '212318', category: 'graphics' },
  'uhd graphics 730': { productId: '212319', category: 'graphics' },
  'uhd graphics 630': { productId: '126789', category: 'graphics' },
  'uhd graphics 620': { productId: '126790', category: 'graphics' },
  
  // Intel WiFi
  'wi-fi 7 be200': { productId: '230078', category: 'wireless' },
  'wi-fi 6e ax411': { productId: '204837', category: 'wireless' },
  'wi-fi 6e ax211': { productId: '204836', category: 'wireless' },
  'wi-fi 6e ax210': { productId: '204837', category: 'wireless' },
  'wi-fi 6 ax201': { productId: '130293', category: 'wireless' },
  'wi-fi 6 ax200': { productId: '130293', category: 'wireless' },
  'wireless-ac 9560': { productId: '99446', category: 'wireless' },
  'wireless-ac 9462': { productId: '94150', category: 'wireless' },
  'wireless-ac 9260': { productId: '94150', category: 'wireless' },
  'dual band wireless-ac 8265': { productId: '94150', category: 'wireless' },
  
  // Intel Ethernet
  'ethernet i225': { productId: '184686', category: 'ethernet' },
  'ethernet i219': { productId: '71305', category: 'ethernet' },
  'ethernet i211': { productId: '64403', category: 'ethernet' },
  'killer e3100': { productId: '184686', category: 'ethernet' },
  'killer e2600': { productId: '184686', category: 'ethernet' },
  
  // Intel Chipset
  'z790': { productId: '212325', category: 'chipset' },
  'z690': { productId: '212325', category: 'chipset' },
  'b760': { productId: '212325', category: 'chipset' },
  'h770': { productId: '212325', category: 'chipset' },
};

// Windows OS IDs for NVIDIA
const windowsOsIds = {
  'windows 11 64-bit': 57,
  'windows 10 64-bit': 57,
  'windows 10 32-bit': 56,
  'windows 7 64-bit': 19,
  'windows 7 32-bit': 18,
};

/**
 * Build a direct NVIDIA download URL with pre-filled parameters
 * @param {string} deviceName - The full device name (e.g., "NVIDIA GeForce RTX 4070")
 * @returns {string|null} - Direct URL or null if mapping not found
 */
function buildNvidiaDirectUrl(deviceName) {
  const lowerName = deviceName.toLowerCase();
  
  // Check for notebook/laptop variants first
  let isNotebook = lowerName.includes('laptop') || lowerName.includes('notebook') || lowerName.includes('mobile');
  
  // Find matching product
  for (const [key, value] of Object.entries(nvidiaProductMapping)) {
    if (lowerName.includes(key)) {
      // Use Windows 11/10 64-bit as default (most common)
      const osid = 57;
      const lang = 'en-us';
      
      // Build the direct search URL
      return `https://www.nvidia.com/Download/index.aspx?psid=${value.psid}&pfid=${value.pfid}&osid=${osid}&lang=${lang}`;
    }
  }
  
  return null;
}

/**
 * Build a direct AMD download URL with pre-filled parameters
 * @param {string} deviceName - The full device name (e.g., "AMD Radeon RX 7900 XTX")
 * @returns {string|null} - Direct URL or null if mapping not found
 */
function buildAmdDirectUrl(deviceName) {
  const lowerName = deviceName.toLowerCase();
  
  // Check if this is an AMD product we recognize
  for (const [key, value] of Object.entries(amdProductMapping)) {
    if (lowerName.includes(key)) {
      // AMD's support page with product-specific path
      // Format: https://www.amd.com/en/support/graphics/radeon-rx-7000-series-graphics/amd-radeon-rx-7900-xtx
      return `https://www.amd.com/en/support/${value.family}/${value.product}`;
    }
  }
  
  // Fallback: if we found a recognizable Radeon product, link to main download with auto-detect
  // This is actually the best user experience as AMD Software auto-detects the GPU
  if (lowerName.includes('radeon') || lowerName.includes('rx ') || lowerName.includes('amd')) {
    // Direct link to AMD Software download - it auto-detects the GPU
    return 'https://www.amd.com/en/support/download/drivers.html';
  }
  
  return null;
}

/**
 * Build a direct Intel download URL with pre-filled parameters
 * @param {string} deviceName - The full device name (e.g., "Intel Wi-Fi 6 AX201")
 * @returns {string|null} - Direct URL or null if mapping not found
 */
function buildIntelDirectUrl(deviceName) {
  const lowerName = deviceName.toLowerCase();
  
  // Find matching product
  for (const [key, value] of Object.entries(intelProductMapping)) {
    if (lowerName.includes(key)) {
      return `https://www.intel.com/content/www/us/en/download-center/home.html?productId=${value.productId}`;
    }
  }
  
  return null;
}

/**
 * Get the best possible download URL for a device
 * Tries direct links first, falls back to generic manufacturer page
 * @param {string} manufacturer - Device manufacturer
 * @param {string} deviceName - Full device name
 * @returns {string} - Best available download URL
 */
function getDirectDownloadUrl(manufacturer, deviceName) {
  const lowerMfr = manufacturer ? manufacturer.toLowerCase() : '';
  const lowerDevice = deviceName ? deviceName.toLowerCase() : '';
  
  // Try NVIDIA direct link
  if (lowerMfr.includes('nvidia') || lowerDevice.includes('nvidia') || lowerDevice.includes('geforce') || lowerDevice.includes('quadro')) {
    const directUrl = buildNvidiaDirectUrl(deviceName);
    if (directUrl) return directUrl;
  }
  
  // Try AMD direct link
  if (lowerMfr.includes('amd') || lowerMfr.includes('advanced micro') || lowerDevice.includes('radeon') || lowerDevice.includes('ryzen')) {
    const directUrl = buildAmdDirectUrl(deviceName);
    if (directUrl) return directUrl;
  }
  
  // Try Intel direct link
  if (lowerMfr.includes('intel') || lowerDevice.includes('intel') || lowerDevice.includes('iris') || lowerDevice.includes('uhd graphics')) {
    const directUrl = buildIntelDirectUrl(deviceName);
    if (directUrl) return directUrl;
  }
  
  // Fall back to generic manufacturer URL
  return null;
}

// ============================================
// MANUFACTURER URLs (Fallback)
// ============================================

// Manufacturer download URLs mapping
const manufacturerUrls = {
  // GPU Manufacturers
  'nvidia': 'https://www.nvidia.com/Download/index.aspx',
  'amd': 'https://www.amd.com/en/support/download/drivers.html',
  'intel': 'https://www.intel.com/content/www/us/en/download-center/home.html',
  'advanced micro devices': 'https://www.amd.com/en/support/download/drivers.html',
  
  // Audio Manufacturers
  'realtek': 'https://www.realtek.com/en/component/zoo/category/pc-audio-codecs-high-definition-audio-codecs-software',
  'creative': 'https://support.creative.com/Products/Products.aspx',
  'creative technology': 'https://support.creative.com/Products/Products.aspx',
  'conexant': 'https://www.synaptics.com/products/audio-codecs',
  'synaptics': 'https://www.synaptics.com/products',
  
  // Network Manufacturers
  'broadcom': 'https://www.broadcom.com/support/download-search',
  'qualcomm': 'https://www.qualcomm.com/support',
  'qualcomm atheros': 'https://www.qualcomm.com/support',
  'killer': 'https://www.intel.com/content/www/us/en/download/19420/killer-performance-driver-suite.html',
  'marvell': 'https://www.marvell.com/support/downloads.html',
  'mediatek': 'https://www.mediatek.com/products/connectivity-and-networking',
  
  // Chipset & System
  'microsoft': 'https://www.catalog.update.microsoft.com/',
  'american megatrends': 'https://www.ami.com/support-resources/',
  
  // Storage
  'samsung': 'https://semiconductor.samsung.com/consumer-storage/support/tools/',
  'western digital': 'https://support-en.wd.com/app/products',
  'sandisk': 'https://kb.sandisk.com/app/software',
  'seagate': 'https://www.seagate.com/support/downloads/',
  'crucial': 'https://www.crucial.com/support',
  'micron': 'https://www.micron.com/support',
  
  // Peripherals
  'logitech': 'https://support.logi.com/hc/en-us/categories/360001702274-Downloads',
  'razer': 'https://www.razer.com/synapse-3',
  'corsair': 'https://www.corsair.com/icue',
  'steelseries': 'https://steelseries.com/gg/engine',
  'hyperx': 'https://hyperx.com/pages/ngenuity',
  
  // Generic/Common
  'generic': 'https://www.catalog.update.microsoft.com/',
  'standard': 'https://www.catalog.update.microsoft.com/',
  '(standard': 'https://www.catalog.update.microsoft.com/',
  
  // Laptop Manufacturers
  'dell': 'https://www.dell.com/support/home',
  'hp': 'https://support.hp.com/drivers',
  'hewlett-packard': 'https://support.hp.com/drivers',
  'lenovo': 'https://support.lenovo.com/solutions/ht003029',
  'asus': 'https://www.asus.com/support/Download-Center/',
  'acer': 'https://www.acer.com/ac/en/US/content/drivers',
  'msi': 'https://www.msi.com/support/download',
  'gigabyte': 'https://www.gigabyte.com/Support',
  'asrock': 'https://www.asrock.com/support/index.asp',
  'toshiba': 'https://support.dynabook.com/drivers',
  'sony': 'https://www.sony.com/electronics/support',
  
  // Other
  'usb': 'https://www.catalog.update.microsoft.com/',
  'pci': 'https://www.catalog.update.microsoft.com/'
};

// Device class icons (SVG paths)
const deviceClassIcons = {
  'Display': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>`,
  
  'MEDIA': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>`,
  
  'Net': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>`,
  
  'System': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/>
    <line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/>
    <line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/>
    <line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/>
    <line x1="1" y1="14" x2="4" y2="14"/>
  </svg>`,
  
  'USB': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="7" r="3"/>
    <circle cx="6" cy="19" r="2"/>
    <circle cx="18" cy="19" r="2"/>
    <path d="M12 10v4"/>
    <path d="M6 17v-5h12v5"/>
  </svg>`,
  
  'HIDClass': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01"/>
    <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/>
    <path d="M8 16h8"/>
  </svg>`,
  
  'Bluetooth': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
  </svg>`,
  
  'DiskDrive': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>`,
  
  'Default': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>`
};

// Get icon for device class
function getDeviceIcon(deviceClass) {
  if (!deviceClass) return deviceClassIcons['Default'];
  
  for (const key of Object.keys(deviceClassIcons)) {
    if (deviceClass.toLowerCase().includes(key.toLowerCase())) {
      return deviceClassIcons[key];
    }
  }
  return deviceClassIcons['Default'];
}

// Get download URL for manufacturer
// Now tries to get direct download links first, falls back to generic page
function getManufacturerUrl(manufacturer, deviceName) {
  // First, try to get a direct download URL with pre-filled parameters
  const directUrl = getDirectDownloadUrl(manufacturer, deviceName);
  if (directUrl) {
    return directUrl;
  }
  
  // Fallback to generic manufacturer URLs
  if (!manufacturer) {
    return 'https://www.catalog.update.microsoft.com/';
  }
  
  const lowerMfr = manufacturer.toLowerCase();
  const lowerDevice = deviceName ? deviceName.toLowerCase() : '';
  
  // Check device name for specific manufacturers (e.g., NVIDIA GeForce)
  for (const [key, url] of Object.entries(manufacturerUrls)) {
    if (lowerDevice.includes(key)) {
      return url;
    }
  }
  
  // Check manufacturer name
  for (const [key, url] of Object.entries(manufacturerUrls)) {
    if (lowerMfr.includes(key)) {
      return url;
    }
  }
  
  // Default to Windows Update Catalog
  return 'https://www.catalog.update.microsoft.com/';
}

// Determine driver status (simulated - in real app would check online)
function getDriverStatus(driver) {
  // Simulate update detection based on driver age
  if (driver.DriverDate) {
    try {
      // Parse WMI date format (yyyymmdd...)
      const dateStr = driver.DriverDate.substring(0, 8);
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      const driverDate = new Date(year, month, day);
      const now = new Date();
      const ageInDays = (now - driverDate) / (1000 * 60 * 60 * 24);
      
      // If driver is older than 1 year, suggest update
      if (ageInDays > 365) {
        return 'update';
      } else if (ageInDays > 180) {
        return 'unknown';
      }
      return 'uptodate';
    } catch (e) {
      return 'unknown';
    }
  }
  return 'unknown';
}

// Format driver date
function formatDriverDate(wmiDate) {
  if (!wmiDate) return 'Unknown';
  try {
    const dateStr = wmiDate.substring(0, 8);
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  } catch (e) {
    return 'Unknown';
  }
}

// Map device class to category
function getDeviceCategory(deviceClass) {
  if (!deviceClass) return 'Other';
  
  const classLower = deviceClass.toLowerCase();
  
  if (classLower.includes('display') || classLower.includes('monitor')) return 'Display';
  if (classLower.includes('media') || classLower.includes('audio') || classLower.includes('sound')) return 'MEDIA';
  if (classLower.includes('net')) return 'Net';
  if (classLower.includes('system') || classLower.includes('processor')) return 'System';
  if (classLower.includes('usb')) return 'USB';
  if (classLower.includes('hid') || classLower.includes('keyboard') || classLower.includes('mouse')) return 'HID';
  if (classLower.includes('bluetooth')) return 'Bluetooth';
  if (classLower.includes('disk') || classLower.includes('storage')) return 'Storage';
  
  return 'Other';
}
