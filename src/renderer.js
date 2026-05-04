// DOM Elements
const scanBtn = document.getElementById('scanBtn');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const driverList = document.getElementById('driverList');
const systemInfoEl = document.getElementById('system-info');
const filterTabs = document.querySelectorAll('.filter-tab:not(.status-filter):not(.view-tab)');
const statusFilterTabs = document.querySelectorAll('.filter-tab.status-filter');
const toolsViewTab = document.getElementById('toolsViewTab');
const toolsView = document.getElementById('toolsView');
const toolsBackBtn = document.getElementById('toolsBackBtn');
const statsBar = document.querySelector('.stats-bar');
const statClickables = document.querySelectorAll('.stat-clickable');
const themeToggle = document.getElementById('themeToggle');
const toastContainer = document.getElementById('toastContainer');
const loadingTitle = document.getElementById('loadingTitle');
const loadingSub = document.getElementById('loadingSub');
const scanProgressFill = document.getElementById('scanProgressFill');
const scanProgressText = document.getElementById('scanProgressText');
const downloadIndicator = document.getElementById('downloadIndicator');
const downloadIndicatorLabel = document.getElementById('downloadIndicatorLabel');
const toolDownloadBanner = document.getElementById('toolDownloadBanner');
const toolDownloadTitle = document.getElementById('toolDownloadTitle');
const toolDownloadMessage = document.getElementById('toolDownloadMessage');
const toolDownloadDismiss = document.getElementById('toolDownloadDismiss');
const toolDownloadPause = document.getElementById('toolDownloadPause');
const toolDownloadCancel = document.getElementById('toolDownloadCancel');
const toolDownloadAction = document.getElementById('toolDownloadAction');
const toolDownloadProgress = document.getElementById('toolDownloadProgress');
const toolDownloadProgressFill = document.getElementById('toolDownloadProgressFill');
const toolDownloadProgressText = document.getElementById('toolDownloadProgressText');

// Window control buttons
const minimizeBtn = document.getElementById('minimizeBtn');
const maximizeBtn = document.getElementById('maximizeBtn');
const closeBtn = document.getElementById('closeBtn');

// Stats elements
const totalDriversEl = document.getElementById('totalDrivers');
const upToDateEl = document.getElementById('upToDate');
const updatesAvailableEl = document.getElementById('updatesAvailable');
const unknownStatusEl = document.getElementById('unknownStatus');

// State
let allDrivers = [];
let currentFilter = 'all';
let currentStatusFilter = 'all';
let showImportantOnly = true; // Default to showing only important drivers
let activeToolDownloadButton = null;
let lastDownloadedToolPath = '';
let activeNativeDownload = false;
let activeDownloadId = '';
let downloadPaused = false;
let toolDownloadBannerDismissed = false;

const pauseDownloadIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
  </svg>
`;

const resumeDownloadIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="8,5 19,12 8,19"></polygon>
  </svg>
`;

// List of important device categories to show
const importantCategories = ['Display', 'MEDIA', 'Net', 'Bluetooth', 'Storage'];

// Keywords that indicate unimportant/system drivers to hide
const hideKeywords = [
  'standardsystem', 'standard system', 'standardgerät', 'standard device',
  'microsoft basic', 'generic', 'volume shadow', 'plug and play',
  'acpi', 'pci bus', 'pci express', 'pci-to-pci', 'smbios',
  'composite bus', 'usbxhci', 'root hub', 'host controller',
  'ndis', 'wmi data', 'battery', 'motherboard resources',
  'system timer', 'system cmos', 'system speaker', 'system board',
  'trusted platform', 'tpm', 'intel management engine',
  'high definition audio-controller', 'i2c controller',
  'smbus', 'thermal', 'watchdog', 'serial bus',
  'microsoft windows management', 'microsoft hyper-v'
];

// Keywords that indicate important drivers to always show
const importantKeywords = [
  'nvidia', 'geforce', 'quadro', 'amd', 'radeon', 'intel',
  'arc ', 'iris', 'uhd graphics', 'hd graphics',
  'realtek', 'creative', 'sound blaster', 'audio',
  'wi-fi', 'wifi', 'wireless', 'ethernet', 'killer',
  'bluetooth', 'logitech', 'razer', 'corsair', 'steelseries',
  'nvme', 'ssd', 'samsung', 'western digital', 'seagate'
];

/**
 * Check if a driver is considered "important" and should be shown by default
 */
function isImportantDriver(driver) {
  const deviceName = (driver.DeviceName || '').toLowerCase();
  const manufacturer = (driver.Manufacturer || '').toLowerCase();
  const deviceClass = (driver.DeviceClass || '').toLowerCase();
  
  // Always show if manufacturer is a known important brand
  for (const keyword of importantKeywords) {
    if (deviceName.includes(keyword) || manufacturer.includes(keyword)) {
      return true;
    }
  }
  
  // Hide if device name contains system/generic keywords
  for (const keyword of hideKeywords) {
    if (deviceName.includes(keyword) || manufacturer.includes(keyword.toLowerCase())) {
      return false;
    }
  }
  
  // Show if it's in an important category
  const category = getDeviceCategory(driver.DeviceClass);
  if (importantCategories.includes(category)) {
    return true;
  }
  
  // Hide Microsoft drivers (usually auto-updated via Windows Update)
  if (manufacturer === 'microsoft' || manufacturer.includes('microsoft corporation')) {
    return false;
  }
  
  // Show by default for unknown cases
  return true;
}

// Setup window controls
if (minimizeBtn) {
  minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
}
if (maximizeBtn) {
  maximizeBtn.addEventListener('click', () => window.electronAPI.maximizeWindow());
}
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    window.electronAPI.closeWindow({ closeToTray: getSettings().closeToTray });
  });
}

// GitHub button
const githubBtn = document.getElementById('githubBtn');
if (githubBtn) {
  githubBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await openExternalLink('https://github.com/belinda-hagen/DriverUpdate-Pro', {
      failureMessage: 'Could not open the GitHub project page'
    });
  });
}

// Toast Notification System
function showToast(title, message, type = 'info', duration = 4000) {
  const icons = {
    success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon ${type}">${icons[type]}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  toastContainer.appendChild(toast);

  const closeToast = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', closeToast);

  if (duration > 0) {
    setTimeout(closeToast, duration);
  }

  return toast;
}

async function openExternalLink(url, options = {}) {
  const {
    fallbackUrl = '',
    successTitle = '',
    successMessage = '',
    failureMessage = 'Could not open link'
  } = options;

  const candidateUrl = typeof url === 'string' ? url.trim() : '';
  if (!candidateUrl) {
    showToast('Error', failureMessage, 'error', 3000);
    return false;
  }

  try {
    await window.electronAPI.openExternal(candidateUrl);
    if (successTitle || successMessage) {
      showToast(successTitle || 'Opening...', successMessage, 'info', 2500);
    }
    return true;
  } catch (error) {
    console.error('Failed to open external URL:', candidateUrl, error);

    if (fallbackUrl && fallbackUrl !== candidateUrl) {
      try {
        await window.electronAPI.openExternal(fallbackUrl);
        showToast(
          successTitle || 'Opening...',
          successMessage || 'Opened fallback download page instead.',
          'warning',
          3500
        );
        return true;
      } catch (fallbackError) {
        console.error('Failed to open fallback URL:', fallbackUrl, fallbackError);
      }
    }

    showToast('Error', failureMessage, 'error', 3000);
    return false;
  }
}

function formatBytes(byteCount) {
  if (!Number.isFinite(byteCount) || byteCount <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(byteCount) / Math.log(1024)), units.length - 1);
  const value = byteCount / (1024 ** exponent);
  return `${value.toFixed(value >= 100 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function setToolDownloadProgress(percent, text) {
  if (!toolDownloadProgress || !toolDownloadProgressFill || !toolDownloadProgressText) {
    return;
  }

  if (percent === null || Number.isNaN(percent)) {
    toolDownloadProgressFill.style.width = '100%';
    toolDownloadProgressText.textContent = text || 'Working...';
    return;
  }

  const boundedPercent = Math.max(0, Math.min(percent, 100));
  toolDownloadProgressFill.style.width = `${boundedPercent}%`;
  toolDownloadProgressText.textContent = text || `${Math.round(boundedPercent)}%`;
}

function updateDownloadIndicator(label = '', state = 'active') {
  if (!downloadIndicator || !downloadIndicatorLabel) {
    return;
  }

  if (!label) {
    downloadIndicator.classList.add('hidden');
    downloadIndicator.removeAttribute('data-state');
    return;
  }

  downloadIndicator.classList.remove('hidden');
  downloadIndicator.dataset.state = state;
  downloadIndicatorLabel.textContent = label;
}

function showToolDownloadBanner(title, message, options = {}) {
  if (!toolDownloadBanner) {
    return;
  }

  const {
    showProgress = false,
    progressPercent = 0,
    progressText = '0%',
    showAction = false,
    actionLabel = 'Open Folder',
    showPause = false,
    pauseLabel = 'Pause',
    showCancel = false,
    forceShow = false
  } = options;

  toolDownloadTitle.textContent = title;
  toolDownloadMessage.textContent = message;
  if (forceShow) {
    toolDownloadBannerDismissed = false;
  }
  if (!toolDownloadBannerDismissed || forceShow) {
    toolDownloadBanner.classList.remove('hidden');
  }
  toolDownloadProgress.classList.toggle('hidden', !showProgress);
  toolDownloadPause.classList.toggle('hidden', !showPause);
  toolDownloadPause.innerHTML = pauseLabel === 'Resume' ? resumeDownloadIcon : pauseDownloadIcon;
  toolDownloadPause.title = pauseLabel;
  toolDownloadPause.setAttribute('aria-label', pauseLabel);
  toolDownloadCancel.classList.toggle('hidden', !showCancel);
  toolDownloadAction.classList.toggle('hidden', !showAction);
  toolDownloadAction.textContent = actionLabel;

  if (showProgress) {
    setToolDownloadProgress(progressPercent, progressText);
  }
}

function resetActiveToolDownloadButton() {
  activeNativeDownload = false;
  activeDownloadId = '';
  downloadPaused = false;
  if (!activeToolDownloadButton) {
    return;
  }

  activeToolDownloadButton.disabled = false;
  if (activeToolDownloadButton.dataset.defaultContent) {
    activeToolDownloadButton.innerHTML = activeToolDownloadButton.dataset.defaultContent;
  }
  activeToolDownloadButton = null;
}

function isNvidiaDisplayDriver(driver) {
  if (!driver) {
    return false;
  }

  const manufacturer = `${driver.Manufacturer || ''}`.toLowerCase();
  const deviceName = `${driver.DeviceName || ''}`.toLowerCase();
  const category = `${driver.category || ''}`.toLowerCase();
  const deviceClass = `${driver.DeviceClass || ''}`.toLowerCase();

  const looksLikeNvidiaGpu = manufacturer.includes('nvidia')
    || deviceName.includes('nvidia')
    || deviceName.includes('geforce')
    || deviceName.includes('quadro')
    || deviceName.includes('rtx')
    || deviceName.includes('gtx');

  return looksLikeNvidiaGpu && (category === 'display' || deviceClass.includes('display'));
}

function getPrimaryNvidiaDriver() {
  return allDrivers.find(driver => isNvidiaDisplayDriver(driver)) || null;
}

function getDriverFromCard(card) {
  const driverKey = card?.dataset?.driverKey;
  if (!driverKey) {
    return null;
  }

  return allDrivers.find(driver => driver.driverKey === driverKey) || null;
}

async function startNvidiaDriverDownload(driver, btn = null, fallbackUrl = '') {
  if (!driver) {
    showToast('Scan Required', 'Scan drivers first so the app can detect your NVIDIA GPU.', 'warning', 4000);
    return false;
  }

  if (activeNativeDownload) {
    showToast('Download In Progress', 'Please wait for the current NVIDIA download to finish.', 'info', 3000);
    return false;
  }

  if (btn) {
    if (!btn.dataset.defaultContent) {
      btn.dataset.defaultContent = btn.innerHTML;
    }
    activeToolDownloadButton = btn;
    btn.disabled = true;
    btn.textContent = 'Starting Download...';
  }

  activeNativeDownload = true;
  lastDownloadedToolPath = '';

  showToast('Preparing Download', 'Resolving the latest NVIDIA package for your GPU.', 'info', 2500);

  showToolDownloadBanner(
    'Preparing NVIDIA Driver',
    'Resolving the latest official package for your GPU.',
    {
      showProgress: true,
      progressPercent: 0,
      progressText: 'Resolving...',
      forceShow: true
    }
  );

  const result = await window.electronAPI.downloadNvidiaDriver(driver);
  if (result?.success) {
    return true;
  }

  resetActiveToolDownloadButton();
  showToolDownloadBanner(
    'Driver Download Could Not Start',
    result?.error || 'Could not resolve a direct NVIDIA package for this GPU.',
    {
      showProgress: false,
      showAction: false
    }
  );

  const fallbackDriverUrl = fallbackUrl || getManufacturerUrl(driver.Manufacturer, driver.DeviceName);
  await openExternalLink(fallbackDriverUrl, {
    successTitle: 'Opening Fallback',
    successMessage: 'Opened NVIDIA\'s manual download page instead.',
    failureMessage: 'Could not open the NVIDIA driver page'
  });
  return false;
}

async function startToolDownload(btn) {
  const url = btn.dataset.toolUrl;
  const fallbackUrl = btn.dataset.toolFallbackUrl || '';
  const fileName = btn.dataset.downloadFileName || '';

  if (!url) {
    showToast('Error', 'Missing download URL', 'error', 3000);
    return;
  }

  if (activeToolDownloadButton && activeToolDownloadButton !== btn) {
    showToast('Download In Progress', 'Please wait for the current tool download to finish.', 'info', 3000);
    return;
  }

  if (!btn.dataset.defaultContent) {
    btn.dataset.defaultContent = btn.innerHTML;
  }

  activeToolDownloadButton = btn;
  activeNativeDownload = true;
  btn.disabled = true;
  btn.textContent = 'Starting Download...';
  lastDownloadedToolPath = '';

  showToolDownloadBanner(
    'Preparing Download',
    'Saving the selected package to your Downloads folder.',
    {
      showProgress: true,
      progressPercent: 0,
      progressText: 'Preparing...',
      forceShow: true
    }
  );

  const result = await window.electronAPI.downloadFile({ url, fileName });
  if (result?.success) {
    return;
  }

  resetActiveToolDownloadButton();
  showToolDownloadBanner(
    'Download Could Not Start',
    result?.error || 'The NVIDIA download could not be started from the app.',
    {
      showProgress: false,
      showAction: false
    }
  );

  if (fallbackUrl) {
    await openExternalLink(fallbackUrl, {
      successTitle: 'Opening Fallback',
      successMessage: 'Opened the NVIDIA download page instead.',
      failureMessage: 'Could not open the NVIDIA download page'
    });
  }
}

// Update scan progress
function updateScanProgress(percent, text) {
  if (scanProgressFill) {
    scanProgressFill.style.width = `${percent}%`;
  }
  if (scanProgressText) {
    scanProgressText.textContent = text;
  }
}

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Initialize theme on load
initTheme();

// Tooltip system
let tooltipEl = null;

function initTooltips() {
  // Create tooltip element if not exists
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'custom-tooltip';
    document.body.appendChild(tooltipEl);
  }
  
  // Add event delegation for tooltips
  document.addEventListener('mouseover', (e) => {
    const trigger = e.target.closest('.tooltip-trigger');
    if (trigger && trigger.dataset.tooltip) {
      showTooltip(trigger, trigger.dataset.tooltip);
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    const trigger = e.target.closest('.tooltip-trigger');
    if (trigger) {
      hideTooltip();
    }
  });
}

function showTooltip(element, text) {
  tooltipEl.textContent = text;
  tooltipEl.classList.add('visible');
  
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();
  
  // Position below the element by default
  let top = rect.bottom + 8;
  let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  
  // If tooltip goes off the right edge, align to right
  if (left + tooltipRect.width > window.innerWidth - 10) {
    left = window.innerWidth - tooltipRect.width - 10;
  }
  
  // If tooltip goes off the left edge, align to left
  if (left < 10) {
    left = 10;
  }
  
  // If tooltip goes off the bottom, show above
  if (top + tooltipRect.height > window.innerHeight - 10) {
    top = rect.top - tooltipRect.height - 8;
  }
  
  tooltipEl.style.top = `${top}px`;
  tooltipEl.style.left = `${left}px`;
}

function hideTooltip() {
  tooltipEl.classList.remove('visible');
}

// Initialize tooltips
initTooltips();

// Settings management
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettings');
const autoScanToggle = document.getElementById('autoScanToggle');
const closeToTrayToggle = document.getElementById('closeToTrayToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const autoUpdateCheckToggle = document.getElementById('autoUpdateCheckToggle');

function getSettings() {
  const defaults = {
    autoScan: true,
    closeToTray: false,
    darkMode: true,
    autoUpdateCheck: true
  };
  try {
    const saved = localStorage.getItem('driverUpdateSettings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

function saveSettings(settings) {
  localStorage.setItem('driverUpdateSettings', JSON.stringify(settings));
}

function initSettings() {
  const settings = getSettings();
  
  // Initialize all toggles from saved settings
  if (autoScanToggle) {
    autoScanToggle.checked = settings.autoScan;
  }
  if (closeToTrayToggle) {
    closeToTrayToggle.checked = settings.closeToTray;
  }
  if (darkModeToggle) {
    darkModeToggle.checked = settings.darkMode;
  }
  if (autoUpdateCheckToggle) {
    autoUpdateCheckToggle.checked = settings.autoUpdateCheck;
  }
  
  // Apply dark mode from settings
  document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  window.electronAPI.setCloseToTrayEnabled(settings.closeToTray);
}

function openSettings() {
  settingsModal.classList.add('active');
}

function closeSettings() {
  settingsModal.classList.remove('active');
}

// Settings event listeners
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) closeSettings();
});

autoScanToggle.addEventListener('change', () => {
  const settings = getSettings();
  settings.autoScan = autoScanToggle.checked;
  saveSettings(settings);
});

if (closeToTrayToggle) {
  closeToTrayToggle.addEventListener('change', async () => {
    const settings = getSettings();
    settings.closeToTray = closeToTrayToggle.checked;
    saveSettings(settings);
    await window.electronAPI.setCloseToTrayEnabled(settings.closeToTray);

    showToast(
      settings.closeToTray ? 'Background Mode Enabled' : 'Background Mode Disabled',
      settings.closeToTray
        ? 'Closing the window will keep DriverUpdate Pro running in the tray.'
        : 'Closing the window will fully exit DriverUpdate Pro.',
      'info',
      3000
    );
  });
}

darkModeToggle.addEventListener('change', () => {
  const settings = getSettings();
  settings.darkMode = darkModeToggle.checked;
  saveSettings(settings);
  document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
});

// Initialize settings
initSettings();

// App Update handling
const updateBanner = document.getElementById('updateBanner');
const updateTitle = document.getElementById('updateTitle');
const updateMessage = document.getElementById('updateMessage');
const updateAction = document.getElementById('updateAction');
const dismissUpdate = document.getElementById('dismissUpdate');
const updateProgress = document.getElementById('updateProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');
const lastUpdateCheck = document.getElementById('lastUpdateCheck');
const appVersionEls = document.querySelectorAll('[data-app-version]');

let updateAvailableVersion = null;
let updateDownloaded = false;

// Update banner functions
function showUpdateBanner() {
  updateBanner.classList.remove('hidden');
}

function hideUpdateBanner() {
  updateBanner.classList.add('hidden');
}

function setUpdateProgress(percent) {
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${Math.round(percent)}%`;
}

// Handle update status events
window.electronAPI.onUpdateStatus((data) => {
  switch (data.status) {
    case 'checking':
      if (lastUpdateCheck) {
        lastUpdateCheck.textContent = 'Checking for updates...';
      }
      break;
      
    case 'available':
      updateAvailableVersion = data.version;
      updateTitle.textContent = 'Update Available!';
      updateMessage.textContent = `Version ${data.version} is ready to download`;
      updateAction.textContent = 'Download';
      updateAction.disabled = false;
      updateProgress.classList.add('hidden');
      showUpdateBanner();
      if (lastUpdateCheck) {
        lastUpdateCheck.textContent = `Version ${data.version} available`;
      }
      break;
      
    case 'not-available':
      if (lastUpdateCheck) {
        lastUpdateCheck.textContent = 'You have the latest version';
      }
      break;
    
    case 'dev-mode':
      if (lastUpdateCheck) {
        lastUpdateCheck.textContent = 'Update check skipped (development mode)';
      }
      break;
      
    case 'downloading':
      updateTitle.textContent = 'Downloading Update...';
      updateMessage.textContent = `Version ${updateAvailableVersion}`;
      updateAction.textContent = 'Downloading...';
      updateAction.disabled = true;
      updateProgress.classList.remove('hidden');
      setUpdateProgress(data.percent);
      break;
      
    case 'downloaded':
      updateDownloaded = true;
      updateTitle.textContent = 'Update Ready!';
      updateMessage.textContent = `Version ${data.version} is ready to install`;
      updateAction.textContent = 'Install & Restart';
      updateAction.disabled = false;
      updateProgress.classList.add('hidden');
      if (lastUpdateCheck) {
        lastUpdateCheck.textContent = `Version ${data.version} ready to install`;
      }
      break;
      
    case 'error':
      hideUpdateBanner();
      if (lastUpdateCheck) {
        lastUpdateCheck.textContent = 'Error checking for updates';
      }
      console.error('Update error:', data.message);
      break;
  }
});

window.electronAPI.onFileDownloadStatus((data) => {
  switch (data.status) {
    case 'started':
      activeDownloadId = data.downloadId || activeDownloadId;
      downloadPaused = false;
      updateDownloadIndicator('Download starting...', 'active');
      showToast('Download Started', `${data.fileName} is being saved to your Downloads folder.`, 'info', 3000);
      showToolDownloadBanner(
        'Downloading NVIDIA Driver',
        `${data.fileName} is being saved to your Downloads folder.`,
        {
          showProgress: true,
          progressPercent: 0,
          progressText: 'Starting...',
          showPause: true,
          pauseLabel: 'Pause',
          showCancel: true
        }
      );
      break;

    case 'downloading': {
      activeDownloadId = data.downloadId || activeDownloadId;
      downloadPaused = false;
      const progressText = data.percent === null
        ? `${formatBytes(data.receivedBytes)} downloaded`
        : `${Math.round(data.percent)}%`;
      const detailText = data.totalBytes > 0
        ? `${formatBytes(data.receivedBytes)} of ${formatBytes(data.totalBytes)}`
        : `${formatBytes(data.receivedBytes)} downloaded`;

      updateDownloadIndicator(`Downloading ${progressText}`, 'active');
      showToolDownloadBanner(
        'Downloading NVIDIA Driver',
        detailText,
        {
          showProgress: true,
          progressPercent: data.percent ?? 100,
          progressText,
          showPause: true,
          pauseLabel: 'Pause',
          showCancel: true
        }
      );
      break;
    }

    case 'paused': {
      downloadPaused = true;
      const currentPercent = parseFloat(toolDownloadProgressFill.style.width) || 0;
      const currentText = toolDownloadProgressText.textContent || `${Math.round(currentPercent)}%`;
      updateDownloadIndicator(`Paused ${currentText}`, 'paused');
      showToolDownloadBanner(
        'Download Paused',
        `${data.fileName} is paused. Resume when ready.`,
        {
          showProgress: true,
          progressPercent: currentPercent,
          progressText: currentText,
          showPause: true,
          pauseLabel: 'Resume',
          showCancel: true
        }
      );
      showToast('Download Paused', `${data.fileName} has been paused.`, 'warning', 2500);
      break;
    }

    case 'resumed': {
      downloadPaused = false;
      const currentPercent = parseFloat(toolDownloadProgressFill.style.width) || 0;
      const currentText = toolDownloadProgressText.textContent || `${Math.round(currentPercent)}%`;
      updateDownloadIndicator(`Downloading ${currentText}`, 'active');
      showToolDownloadBanner(
        'Resuming NVIDIA Driver',
        `${data.fileName} is resuming.`,
        {
          showProgress: true,
          progressPercent: currentPercent,
          progressText: currentText,
          showPause: true,
          pauseLabel: 'Pause',
          showCancel: true
        }
      );
      showToast('Download Resumed', `${data.fileName} is downloading again.`, 'info', 2500);
      break;
    }

    case 'completed':
      lastDownloadedToolPath = data.savePath || '';
      resetActiveToolDownloadButton();
      updateDownloadIndicator('Download ready', 'ready');
      showToolDownloadBanner(
        'Download Ready',
        `${data.fileName} was saved to ${data.savePath}`,
        {
          showProgress: false,
          showAction: Boolean(lastDownloadedToolPath),
          actionLabel: 'Open Folder'
        }
      );
      showToast('Download Complete', `${data.fileName} is ready in your Downloads folder.`, 'success', 4000);
      break;

    case 'interrupted':
    case 'cancelled':
    case 'error':
      resetActiveToolDownloadButton();
      updateDownloadIndicator(data.status === 'cancelled' ? '' : 'Download failed', data.status === 'cancelled' ? 'active' : 'paused');
      showToolDownloadBanner(
        'Download Failed',
        data.message || 'The NVIDIA download did not complete.',
        {
          showProgress: false,
          showAction: Boolean(lastDownloadedToolPath),
          actionLabel: 'Open Folder'
        }
      );
      showToast('Download Failed', data.message || 'The NVIDIA download did not complete.', 'error', 4000);
      break;
  }
});

// Update action button click
updateAction.addEventListener('click', async () => {
  if (updateDownloaded) {
    // Install and restart
    await window.electronAPI.installUpdate();
  } else {
    // Download the update
    updateAction.disabled = true;
    updateAction.textContent = 'Starting download...';
    await window.electronAPI.downloadUpdate();
  }
});

// Dismiss update banner
dismissUpdate.addEventListener('click', () => {
  hideUpdateBanner();
});

if (toolDownloadDismiss) {
  toolDownloadDismiss.addEventListener('click', () => {
    toolDownloadBannerDismissed = true;
    toolDownloadBanner.classList.add('hidden');
  });
}

if (downloadIndicator) {
  downloadIndicator.addEventListener('click', () => {
    if (toolDownloadBanner) {
      toolDownloadBannerDismissed = false;
      toolDownloadBanner.classList.remove('hidden');
    }
  });
}

if (toolDownloadAction) {
  toolDownloadAction.addEventListener('click', async () => {
    if (!lastDownloadedToolPath) {
      return;
    }

    try {
      await window.electronAPI.showItemInFolder(lastDownloadedToolPath);
    } catch (error) {
      showToast('Error', 'Could not open the downloaded file location', 'error', 3000);
    }
  });
}

if (toolDownloadPause) {
  toolDownloadPause.addEventListener('click', async () => {
    if (!activeDownloadId) {
      return;
    }

    const result = downloadPaused
      ? await window.electronAPI.resumeDownload(activeDownloadId)
      : await window.electronAPI.pauseDownload(activeDownloadId);

    if (!result?.success) {
      showToast('Error', result?.error || 'Could not change the download state.', 'error', 3000);
    }
  });
}

if (toolDownloadCancel) {
  toolDownloadCancel.addEventListener('click', async () => {
    if (!activeDownloadId) {
      return;
    }

    const result = await window.electronAPI.cancelDownload(activeDownloadId);
    if (!result?.success) {
      showToast('Error', result?.error || 'Could not cancel the download.', 'error', 3000);
      return;
    }

    showToast('Cancelling Download', 'Stopping the current NVIDIA package download.', 'warning', 2500);
  });
}

// Auto update check toggle
if (autoUpdateCheckToggle) {
  autoUpdateCheckToggle.addEventListener('change', () => {
    const settings = getSettings();
    settings.autoUpdateCheck = autoUpdateCheckToggle.checked;
    saveSettings(settings);
  });
}

// Manual check for updates button
if (checkUpdatesBtn) {
  checkUpdatesBtn.addEventListener('click', async () => {
    checkUpdatesBtn.disabled = true;
    checkUpdatesBtn.textContent = 'Checking...';
    if (lastUpdateCheck) {
      lastUpdateCheck.textContent = 'Checking for updates...';
    }
    try {
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      if (lastUpdateCheck) {
        lastUpdateCheck.textContent = 'Error checking for updates';
      }
    }
    checkUpdatesBtn.disabled = false;
    checkUpdatesBtn.textContent = 'Check for Updates';
  });
}

// Get and display app version
async function displayAppVersion() {
  try {
    const version = await window.electronAPI.getAppVersion();
    appVersionEls.forEach((element) => {
      element.textContent = `v${version}`;
    });
    // Also update the version badge in the title bar
    const versionBadge = document.getElementById('versionBadge');
    if (versionBadge) {
      versionBadge.textContent = `v${version}`;
    }
  } catch (e) {
    console.log('Could not get app version');
  }
}

displayAppVersion();

// Auto-check for updates on startup
async function checkForAppUpdates() {
  const settings = getSettings();
  if (settings.autoUpdateCheck) {
    // Delay a bit to let the app fully load
    setTimeout(async () => {
      try {
        await window.electronAPI.checkForUpdates();
      } catch (e) {
        console.log('Auto update check failed:', e);
      }
    }, 3000);
  }
}

checkForAppUpdates();

// Initialize
async function init() {
  // Hide splash screen after a short delay
  const splashScreen = document.getElementById('splashScreen');
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.classList.add('hidden');
    }
  }, 1500);

  try {
    const sysInfo = await window.electronAPI.getSystemInfo();
    systemInfoEl.textContent = `${sysInfo.Manufacturer} ${sysInfo.Model} • ${sysInfo.OSName}`;
  } catch (e) {
    systemInfoEl.textContent = 'Windows System';
  }
  
  // Setup filter tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchView('drivers');
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderDrivers();
    });
  });

  // Setup status filter tabs
  statusFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchView('drivers');
      statusFilterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentStatusFilter = tab.dataset.status;
      statClickables.forEach(t => t.classList.toggle('active', t.dataset.statFilter === currentStatusFilter));
      renderDrivers();
    });
  });

  // Setup Driver Tools view tab
  if (toolsViewTab) {
    toolsViewTab.addEventListener('click', () => {
      switchView('tools');
    });
  }

  // Setup back button on tools view
  if (toolsBackBtn) {
    toolsBackBtn.addEventListener('click', () => {
      switchView('drivers');
    });
  }

  // Setup clickable stat tiles -> apply status filter
  statClickables.forEach(tile => {
    tile.addEventListener('click', () => {
      const status = tile.dataset.statFilter;
      switchView('drivers');
      currentStatusFilter = status;
      // Reflect in the existing status filter tabs (if a matching one exists)
      statusFilterTabs.forEach(t => {
        t.classList.toggle('active', t.dataset.status === status);
      });
      // Highlight the clicked tile
      statClickables.forEach(t => t.classList.toggle('active', t === tile));
      renderDrivers();
    });
  });

  // Setup tool card buttons
  document.querySelectorAll('.tool-card-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.toolUrl;
      if (btn.dataset.downloadMode === 'nvidia-driver') {
        const nvidiaDriver = getPrimaryNvidiaDriver();
        const fallbackUrl = btn.dataset.toolFallbackUrl || url;
        const started = await startNvidiaDriverDownload(nvidiaDriver, btn, fallbackUrl);
        if (!started && !nvidiaDriver && fallbackUrl) {
          await openExternalLink(fallbackUrl, {
            successTitle: 'Opening Fallback',
            successMessage: 'Opened NVIDIA\'s manual driver page because no GPU scan result was available.',
            failureMessage: 'Could not open the NVIDIA driver page'
          });
        }
        return;
      }

      if (btn.dataset.downloadMode === 'native') {
        await startToolDownload(btn);
        return;
      }

      const fallbackUrl = btn.dataset.toolFallbackUrl;
      await openExternalLink(url, {
        fallbackUrl,
        successTitle: 'Opening...',
        successMessage: `Launching ${btn.textContent.trim()}`,
        failureMessage: 'Could not open the selected tool'
      });
    });
  });
  
  // Setup "Important Only" toggle
  const importantOnlyToggle = document.getElementById('importantOnlyToggle');
  if (importantOnlyToggle) {
    // Load saved preference
    const savedPref = localStorage.getItem('showImportantOnly');
    if (savedPref !== null) {
      showImportantOnly = savedPref === 'true';
      importantOnlyToggle.checked = showImportantOnly;
    }
    
    importantOnlyToggle.addEventListener('change', (e) => {
      showImportantOnly = e.target.checked;
      localStorage.setItem('showImportantOnly', showImportantOnly);
      renderDrivers();
      updateStats();
      
      // Show toast notification
      if (showImportantOnly) {
        showToast('Filter Applied', 'Showing important drivers only', 'info', 2000);
      } else {
        showToast('Filter Disabled', 'Showing all drivers', 'info', 2000);
      }
    });
  }
  
  // Set first status filter as active by default
  if (statusFilterTabs.length > 0) {
    statusFilterTabs[0].classList.add('active');
  }
  // Sync the stat tile active state with the default filter
  statClickables.forEach(t => {
    t.classList.toggle('active', t.dataset.statFilter === currentStatusFilter);
  });
  
  // Setup theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Setup scan button
  scanBtn.addEventListener('click', scanDrivers);
  
  // Add F5 keyboard shortcut for scan
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F5') {
      e.preventDefault();
      if (!scanBtn.disabled) {
        scanDrivers();
      }
    }
  });
  
  // Auto-scan on startup if enabled
  const settings = getSettings();
  if (settings.autoScan) {
    // Small delay to let UI render first
    setTimeout(() => {
      scanDrivers();
    }, 500);
  }
}

// Scan drivers
async function scanDrivers() {
  switchView('drivers');
  scanBtn.disabled = true;
  scanBtn.innerHTML = `
    <svg class="spinning" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M1 20V14H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Scanning...
  `;
  
  emptyState.classList.add('hidden');
  driverList.classList.add('hidden');
  loadingState.classList.add('active');
  
  // Reset progress
  updateScanProgress(0, 'Initializing scan...');
  if (loadingTitle) loadingTitle.textContent = 'Scanning system drivers...';
  if (loadingSub) loadingSub.textContent = 'Detecting installed hardware';
  
  const startTime = Date.now();
  
  try {
    // Simulate progress during scan
    updateScanProgress(10, 'Querying system drivers...');
    
    const drivers = await window.electronAPI.scanDrivers();
    
    updateScanProgress(50, 'Processing driver information...');
    
    // Filter and process drivers
    allDrivers = drivers
      .filter(d => d.DeviceName && d.DeviceName.trim() !== '')
      .map((d, index) => ({
        ...d,
        driverKey: d.DeviceID || `${d.Manufacturer || 'unknown'}-${d.DeviceName || 'device'}-${index}`,
        // Use status from update checker if available, otherwise fallback
        status: d.status || getDriverStatus(d),
        category: getDeviceCategory(d.DeviceClass),
        downloadUrl: d.downloadUrl || getManufacturerUrl(d.Manufacturer, d.DeviceName)
      }))
      .sort((a, b) => {
        // Sort by status (updates first), then by category, then by name
        const statusOrder = { 'update': 0, 'unknown': 1, 'uptodate': 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.DeviceName.localeCompare(b.DeviceName);
      });
    
    updateScanProgress(90, 'Finalizing results...');
    
    // Cache results
    try {
      localStorage.setItem('lastScanResults', JSON.stringify({
        drivers: allDrivers,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.log('Could not cache scan results');
    }
    
    updateScanProgress(100, 'Complete!');
    
    updateStats();
    renderDrivers();
    
    // Calculate stats for toast
    const updatesCount = allDrivers.filter(d => d.status === 'update').length;
    const scanDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Show completion toast
    if (updatesCount > 0) {
      showToast(
        'Scan Complete',
        `Found ${updatesCount} driver update${updatesCount !== 1 ? 's' : ''} available. Scan took ${scanDuration}s.`,
        'warning',
        5000
      );
    } else {
      showToast(
        'All Drivers Up to Date',
        `${allDrivers.length} drivers scanned in ${scanDuration}s. No updates needed.`,
        'success',
        4000
      );
    }
    
  } catch (error) {
    console.error('Scan failed:', error);
    driverList.innerHTML = `
      <div class="error-state">
        <p>Failed to scan drivers: ${error}</p>
        <p>Please try again.</p>
      </div>
    `;
    driverList.classList.remove('hidden');
    
    showToast('Scan Failed', 'Could not complete driver scan. Please try again.', 'error', 5000);
  } finally {
    loadingState.classList.remove('active');
    scanBtn.disabled = false;
    scanBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1 20V14H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1112 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Scan Drivers
    `;
  }
}

// Update statistics
function updateStats() {
  // Use filtered drivers if "important only" is enabled
  let driversToCount = allDrivers;
  if (showImportantOnly) {
    driversToCount = allDrivers.filter(d => isImportantDriver(d));
  }
  
  const total = driversToCount.length;
  const upToDate = driversToCount.filter(d => d.status === 'uptodate').length;
  const updates = driversToCount.filter(d => d.status === 'update').length;
  const unknown = driversToCount.filter(d => d.status === 'unknown').length;
  
  animateNumber(totalDriversEl, total);
  animateNumber(upToDateEl, upToDate);
  animateNumber(updatesAvailableEl, updates);
  animateNumber(unknownStatusEl, unknown);
}

// Animate number counting
function animateNumber(element, target) {
  const duration = 500;
  const start = parseInt(element.textContent) || 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (target - start) * progress);
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Switch between drivers view and tools view
function switchView(view) {
  if (view === 'tools') {
    if (toolsView) toolsView.classList.remove('hidden');
    driverList.classList.add('hidden');
    emptyState.classList.add('hidden');
    loadingState.classList.remove('active');
    if (statsBar) statsBar.style.display = 'none';
    if (toolsViewTab) toolsViewTab.classList.add('active');
    filterTabs.forEach(t => t.classList.remove('active'));
    statusFilterTabs.forEach(t => t.classList.remove('active'));
  } else {
    if (toolsView) toolsView.classList.add('hidden');
    if (statsBar) statsBar.style.display = '';
    if (toolsViewTab) toolsViewTab.classList.remove('active');
    // Re-activate the current filters visually
    filterTabs.forEach(t => {
      if (t.dataset.filter === currentFilter) t.classList.add('active');
    });
    statusFilterTabs.forEach(t => {
      if (t.dataset.status === currentStatusFilter) t.classList.add('active');
    });
    statClickables.forEach(t => {
      t.classList.toggle('active', t.dataset.statFilter === currentStatusFilter);
    });
    // Restore the driver list / empty state that was hidden when switching to tools
    renderDrivers();
  }
}

// Render drivers based on filter
function renderDrivers() {
  let filteredDrivers = allDrivers;
  
  // Apply "important only" filter first
  if (showImportantOnly) {
    filteredDrivers = filteredDrivers.filter(d => isImportantDriver(d));
  }
  
  // Apply category filter
  if (currentFilter !== 'all') {
    filteredDrivers = filteredDrivers.filter(d => d.category === currentFilter);
  }
  
  // Apply status filter
  if (currentStatusFilter !== 'all') {
    filteredDrivers = filteredDrivers.filter(d => d.status === currentStatusFilter);
  }
  
  if (filteredDrivers.length === 0) {
    if (allDrivers.length === 0) {
      emptyState.classList.remove('hidden');
      driverList.classList.add('hidden');
    } else {
      driverList.innerHTML = `
        <div class="empty-state">
          <p>No drivers found matching the selected filters.</p>
        </div>
      `;
      driverList.classList.remove('hidden');
    }
    return;
  }
  
  emptyState.classList.add('hidden');
  driverList.classList.remove('hidden');
  
  // Group by category
  const grouped = {};
  filteredDrivers.forEach(driver => {
    if (!grouped[driver.category]) {
      grouped[driver.category] = [];
    }
    grouped[driver.category].push(driver);
  });
  
  // Track collapsed state
  if (!window.collapsedCategories) {
    window.collapsedCategories = new Set();
  }
  
  // Render
  let html = '';
  
  for (const [category, drivers] of Object.entries(grouped)) {
    const isCollapsed = window.collapsedCategories.has(category);
    const categoryId = category.replace(/\s+/g, '-').toLowerCase();
    
    if (currentFilter === 'all') {
      html += `
        <div class="category-section" data-category="${category}">
          <div class="category-header ${isCollapsed ? 'collapsed' : ''}" data-category-toggle="${category}">
            <div class="category-toggle">
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <h2>${getCategoryDisplayName(category)}</h2>
            <span class="category-count">${drivers.length}</span>
          </div>
          <div class="category-content ${isCollapsed ? 'collapsed' : ''}" id="category-${categoryId}">
      `;
    }
    
    drivers.forEach(driver => {
      html += createDriverCard(driver);
    });
    
    if (currentFilter === 'all') {
      html += `
          </div>
        </div>
      `;
    }
  }
  
  driverList.innerHTML = html;
  
  // Add category toggle handlers
  document.querySelectorAll('.category-header[data-category-toggle]').forEach(header => {
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const category = header.dataset.categoryToggle;
      const content = header.nextElementSibling;
      
      if (window.collapsedCategories.has(category)) {
        window.collapsedCategories.delete(category);
        header.classList.remove('collapsed');
        content.classList.remove('collapsed');
      } else {
        window.collapsedCategories.add(category);
        header.classList.add('collapsed');
        content.classList.add('collapsed');
      }
    });
  });
  
  // Add click handlers
  document.querySelectorAll('.driver-card').forEach(card => {
    card.addEventListener('click', async () => {
      const driver = getDriverFromCard(card);
      if (isNvidiaDisplayDriver(driver)) {
        await startNvidiaDriverDownload(driver);
        return;
      }

      const url = card.dataset.url;
      if (url) {
        await openExternalLink(url, {
          failureMessage: 'Could not open the driver download page'
        });
      }
    });
  });
}

// Create driver card HTML
function createDriverCard(driver) {
  const statusClass = driver.status === 'update' ? 'has-update' : 
                      driver.status === 'uptodate' ? 'up-to-date' : '';
  const statusBadgeClass = driver.status === 'update' ? 'status-update' :
                           driver.status === 'uptodate' ? 'status-uptodate' : 'status-unknown';
  const statusText = driver.status === 'update' ? 'Update' :
                     driver.status === 'uptodate' ? 'Up to Date' : '⚠ Check';
  const needsTooltip = driver.status !== 'update' && driver.status !== 'uptodate';
  const statusTooltip = 'Unable to automatically check for updates. Click to manually verify on the manufacturer\'s website.';
  
  const icon = getDeviceIcon(driver.DeviceClass);
  
  // Build version display
  let versionHtml = `
    <div class="detail-item">
      <span class="detail-label">Current Version</span>
      <span class="detail-value">${escapeHtml(driver.DriverVersion || 'N/A')}</span>
    </div>
  `;
  
  // Add latest version if available
  if (driver.latestVersion) {
    versionHtml += `
      <div class="detail-item">
        <span class="detail-label">Latest Version</span>
        <span class="detail-value latest-version">${escapeHtml(driver.latestVersion)}</span>
      </div>
    `;
  }

  // Add verification badge with detailed tooltip
  let verifiedBadge = '';
  if (driver.checkedOnline) {
    verifiedBadge = `<span class="verified-badge tooltip-trigger" data-tooltip="This status was verified by checking the manufacturer's website for the latest available version.">✓ Verified</span>`;
  } else if (driver.ageBasedCheck) {
    verifiedBadge = `<span class="age-badge tooltip-trigger" data-tooltip="No online verification available. Status is estimated based on driver age (${driver.driverAgeDays} days old). Drivers older than 1 year may have updates available.">📅 Age-based</span>`;
  }

  return `
    <div class="driver-card ${statusClass}" data-url="${escapeAttribute(driver.downloadUrl || getManufacturerUrl(driver.Manufacturer, driver.DeviceName))}" data-driver-key="${escapeAttribute(driver.driverKey)}">
      <div class="driver-icon">${icon}</div>
      <div class="driver-info">
        <div class="driver-name">${escapeHtml(driver.DeviceName)}</div>
        <div class="driver-manufacturer">${escapeHtml(driver.Manufacturer || 'Unknown Manufacturer')}</div>
      </div>
      <div class="driver-details">
        ${versionHtml}
        <div class="detail-item">
          <span class="detail-label">Date</span>
          <span class="detail-value">${formatDriverDate(driver.DriverDate)}</span>
        </div>
      </div>
      <div class="status-container">
        ${verifiedBadge}
        <span class="driver-status ${statusBadgeClass}${needsTooltip ? ' tooltip-trigger' : ''}"${needsTooltip ? ` data-tooltip="${statusTooltip}"` : ''}>${statusText}</span>
      </div>
    </div>
  `;
}

// Get display name for category
function getCategoryDisplayName(category) {
  const names = {
    'Display': '🖥️ Display Adapters',
    'MEDIA': '🔊 Audio Devices',
    'Net': '🌐 Network Adapters',
    'System': '⚙️ System Devices',
    'USB': '🔌 USB Controllers',
    'HID': '⌨️ Input Devices',
    'Bluetooth': '📶 Bluetooth',
    'Storage': '💾 Storage',
    'Other': '📦 Other Devices'
  };
  return names[category] || category;
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttribute(text) {
  return escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
  // Escape to close modals
  if (e.key === 'Escape') {
    if (settingsModal.classList.contains('active')) {
      closeSettings();
    }
    if (!updateBanner.classList.contains('hidden')) {
      hideUpdateBanner();
    }
  }
  
  // Ctrl/Cmd + R to scan
  if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !e.shiftKey) {
    e.preventDefault();
    if (!scanBtn.disabled) {
      scanDrivers();
    }
  }
  
  // Tab navigation on driver cards
  if (e.key === 'Tab' && !settingsModal.classList.contains('active')) {
    const cards = document.querySelectorAll('.driver-card');
    if (cards.length > 0) {
      const focusedCard = document.activeElement?.closest('.driver-card');
      if (!focusedCard && !e.shiftKey) {
        // If no card is focused and tabbing forward, focus first card
        const firstVisible = Array.from(cards).find(c => c.offsetParent !== null);
        if (firstVisible) {
          e.preventDefault();
          firstVisible.setAttribute('tabindex', '0');
          firstVisible.focus();
        }
      }
    }
  }
  
  // Enter to open driver page when card is focused
  if (e.key === 'Enter') {
    const focusedCard = document.activeElement?.closest('.driver-card');
    if (focusedCard) {
      const driver = getDriverFromCard(focusedCard);
      if (isNvidiaDisplayDriver(driver)) {
        startNvidiaDriverDownload(driver);
        return;
      }

      const url = focusedCard.dataset.url;
      if (url) {
        openExternalLink(url, {
          failureMessage: 'Could not open the driver download page'
        });
      }
    }
  }
  
  // Arrow keys to navigate between cards
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const focusedCard = document.activeElement?.closest('.driver-card');
    if (focusedCard) {
      e.preventDefault();
      const cards = Array.from(document.querySelectorAll('.driver-card')).filter(c => c.offsetParent !== null);
      const currentIndex = cards.indexOf(focusedCard);
      let newIndex;
      
      if (e.key === 'ArrowDown') {
        newIndex = Math.min(currentIndex + 1, cards.length - 1);
      } else {
        newIndex = Math.max(currentIndex - 1, 0);
      }
      
      if (cards[newIndex]) {
        cards[newIndex].setAttribute('tabindex', '0');
        cards[newIndex].focus();
        focusedCard.removeAttribute('tabindex');
      }
    }
  }
});

// Load cached results on startup (if available and recent)
function loadCachedResults() {
  try {
    const cached = localStorage.getItem('lastScanResults');
    if (cached) {
      const { drivers, timestamp } = JSON.parse(cached);
      const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
      
      // Only use cache if less than 4 hours old
      if (ageHours < 4 && drivers && drivers.length > 0) {
        allDrivers = drivers.map((driver, index) => ({
          ...driver,
          driverKey: driver.driverKey || driver.DeviceID || `${driver.Manufacturer || 'unknown'}-${driver.DeviceName || 'device'}-${index}`,
          downloadUrl: getManufacturerUrl(driver.Manufacturer, driver.DeviceName)
        }));
        updateStats();
        renderDrivers();
        
        const ageMinutes = Math.round((Date.now() - timestamp) / (1000 * 60));
        showToast(
          'Last Scan Results Loaded',
          `Showing results from ${ageMinutes} minutes ago. Click "Scan Drivers" to refresh.`,
          'info',
          5000
        );
        return true;
      }
    }
  } catch (e) {
    console.log('Could not load cached results');
  }
  return false;
}

// Initialize on load
init();

// Try to load cached results if not auto-scanning
setTimeout(() => {
  const settings = getSettings();
  if (!settings.autoScan) {
    loadCachedResults();
  }
}, 100);
