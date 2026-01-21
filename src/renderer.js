// DOM Elements
const scanBtn = document.getElementById('scanBtn');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const driverList = document.getElementById('driverList');
const systemInfoEl = document.getElementById('system-info');
const filterTabs = document.querySelectorAll('.filter-tab:not(.status-filter)');
const statusFilterTabs = document.querySelectorAll('.filter-tab.status-filter');
const themeToggle = document.getElementById('themeToggle');
const toastContainer = document.getElementById('toastContainer');
const loadingTitle = document.getElementById('loadingTitle');
const loadingSub = document.getElementById('loadingSub');
const scanProgressFill = document.getElementById('scanProgressFill');
const scanProgressText = document.getElementById('scanProgressText');

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

// Setup window controls
if (minimizeBtn) {
  minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
}
if (maximizeBtn) {
  maximizeBtn.addEventListener('click', () => window.electronAPI.maximizeWindow());
}
if (closeBtn) {
  closeBtn.addEventListener('click', () => window.electronAPI.closeWindow());
}

// GitHub button
const githubBtn = document.getElementById('githubBtn');
if (githubBtn) {
  githubBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.electronAPI.openExternal('https://github.com/belinda-hagen/DriverUpdate-Pro');
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
const darkModeToggle = document.getElementById('darkModeToggle');
const autoUpdateCheckToggle = document.getElementById('autoUpdateCheckToggle');

function getSettings() {
  const defaults = {
    autoScan: true,
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
  if (darkModeToggle) {
    darkModeToggle.checked = settings.darkMode;
  }
  if (autoUpdateCheckToggle) {
    autoUpdateCheckToggle.checked = settings.autoUpdateCheck;
  }
  
  // Apply dark mode from settings
  document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
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
const appVersionEl = document.getElementById('appVersion');

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
    if (appVersionEl) {
      appVersionEl.textContent = `v${version}`;
    }
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
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderDrivers();
    });
  });
  
  // Setup status filter tabs
  statusFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      statusFilterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentStatusFilter = tab.dataset.status;
      renderDrivers();
    });
  });
  
  // Set first status filter as active by default
  if (statusFilterTabs.length > 0) {
    statusFilterTabs[0].classList.add('active');
  }
  
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
      .map(d => ({
        ...d,
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
  const total = allDrivers.length;
  const upToDate = allDrivers.filter(d => d.status === 'uptodate').length;
  const updates = allDrivers.filter(d => d.status === 'update').length;
  const unknown = allDrivers.filter(d => d.status === 'unknown').length;
  
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

// Render drivers based on filter
function renderDrivers() {
  let filteredDrivers = allDrivers;
  
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
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      if (url) {
        window.electronAPI.openExternal(url);
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
    <div class="driver-card ${statusClass}" data-url="${driver.downloadUrl || getManufacturerUrl(driver.Manufacturer, driver.DeviceName)}">
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
      const url = focusedCard.dataset.url;
      if (url) {
        window.electronAPI.openExternal(url);
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
        allDrivers = drivers;
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
