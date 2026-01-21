// Manufacturer download URLs mapping
const manufacturerUrls = {
  // GPU Manufacturers
  'nvidia': 'https://www.nvidia.com/Download/index.aspx',
  'amd': 'https://www.amd.com/en/support',
  'intel': 'https://www.intel.com/content/www/us/en/download-center/home.html',
  'advanced micro devices': 'https://www.amd.com/en/support',
  
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
function getManufacturerUrl(manufacturer, deviceName) {
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
