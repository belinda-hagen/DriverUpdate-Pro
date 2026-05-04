const { app, BrowserWindow, ipcMain, shell, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const DriverUpdateChecker = require('./src/updateChecker');
const { autoUpdater } = require('electron-updater');

// Suppress GPU cache errors
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

let mainWindow;
const updateChecker = new DriverUpdateChecker();
const activeFileDownloads = new Map();
let appTray = null;
let closeToTrayEnabled = false;
let isQuitting = false;
let hasShownTrayBalloon = false;

// Auto-updater configuration
autoUpdater.autoDownload = false; // Let user decide when to download
autoUpdater.autoInstallOnAppQuit = true;

// Configure GitHub public repository access
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'belinda-hagen',
  repo: 'DriverUpdate-Pro'
});

// Enable logging for debugging
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'debug';

function getAppIconPath() {
  return process.platform === 'win32'
    ? path.join(__dirname, 'assets', 'icon.ico')
    : path.join(__dirname, 'assets', 'icon.png');
}

function showMainWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
}

function destroyTray() {
  if (appTray) {
    appTray.destroy();
    appTray = null;
  }
}

function createTray() {
  if (appTray) {
    return appTray;
  }

  appTray = new Tray(getAppIconPath());
  appTray.setToolTip('DriverUpdate Pro');
  appTray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Open DriverUpdate Pro',
      click: () => showMainWindow()
    },
    {
      type: 'separator'
    },
    {
      label: 'Exit',
      click: () => {
        isQuitting = true;
        destroyTray();
        app.quit();
      }
    }
  ]));
  appTray.on('click', () => showMainWindow());

  return appTray;
}

function hideWindowToTray() {
  if (!mainWindow) {
    return;
  }

  createTray();
  mainWindow.hide();

  if (process.platform === 'win32' && appTray && !hasShownTrayBalloon) {
    appTray.displayBalloon({
      title: 'DriverUpdate Pro',
      content: 'Still running in the background. Use the tray icon to reopen or exit.',
      iconType: 'info'
    });
    hasShownTrayBalloon = true;
  }
}

function sendFileDownloadStatus(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('file-download-status', payload);
  }
}

function sanitizeDownloadFileName(fileName) {
  const sanitized = String(fileName || 'download.bin')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim();

  return sanitized || 'download.bin';
}

function getAvailableDownloadPath(directoryPath, fileName) {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  let candidatePath = path.join(directoryPath, fileName);
  let suffix = 1;

  while (fs.existsSync(candidatePath)) {
    candidatePath = path.join(directoryPath, `${baseName} (${suffix})${extension}`);
    suffix += 1;
  }

  return candidatePath;
}

const NVIDIA_DRIVER_LOOKUP_URL = 'https://gfwsl.geforce.com/nvidia_web_services/controller.gfeclientcontent.NG.php/com.nvidia.services.GFEClientContent_NG.getDispDrvrByDevid';

function collectHardwareIds(driver) {
  const rawValues = [driver?.HardWareID, driver?.HardwareID, driver?.DeviceID];
  return [...new Set(rawValues.flatMap((value) => {
    if (Array.isArray(value)) {
      return value.filter((entry) => typeof entry === 'string' && entry.trim());
    }

    if (typeof value === 'string' && value.trim()) {
      return [value];
    }

    return [];
  }))];
}

function buildNvidiaDeviceCandidates(driver) {
  const descriptors = collectHardwareIds(driver)
    .map((hardwareId) => {
      const vendorId = hardwareId.match(/VEN_([0-9A-F]{4})/i)?.[1]?.toUpperCase();
      const deviceId = hardwareId.match(/DEV_([0-9A-F]{4})/i)?.[1]?.toUpperCase();
      const subsystem = hardwareId.match(/SUBSYS_([0-9A-F]{8})/i)?.[1]?.toUpperCase();

      if (!vendorId || !deviceId || vendorId !== '10DE') {
        return null;
      }

      return {
        deviceId,
        vendorId,
        subsystemDeviceId: subsystem ? subsystem.slice(0, 4) : '0000',
        subsystemVendorId: subsystem ? subsystem.slice(4) : vendorId
      };
    })
    .filter(Boolean);

  const candidates = descriptors.flatMap((descriptor) => [
    `${descriptor.deviceId}_${descriptor.vendorId}_${descriptor.subsystemDeviceId}_${descriptor.subsystemVendorId}`,
    `${descriptor.deviceId}_${descriptor.vendorId}_0000_0000`,
    `${descriptor.deviceId}_${descriptor.vendorId}`
  ]);

  return [...new Set(candidates)];
}

function isLikelyNvidiaLaptop(driver) {
  const deviceName = `${driver?.DeviceName || ''}`.toLowerCase();
  return deviceName.includes('laptop') || deviceName.includes('notebook') || deviceName.includes('max-q') || deviceName.includes('mobile');
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json, text/plain, */*'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function getNvidiaManualSearchParams(driver) {
  const directUrl = typeof driver?.downloadUrl === 'string' ? driver.downloadUrl.trim() : '';
  if (!directUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(directUrl);
    const psid = parsedUrl.searchParams.get('psid');
    const pfid = parsedUrl.searchParams.get('pfid');

    if (!psid || !pfid) {
      return null;
    }

    return {
      psid,
      pfid,
      osid: parsedUrl.searchParams.get('osid') || '57',
      lang: parsedUrl.searchParams.get('lang') || 'en-us'
    };
  } catch (error) {
    return null;
  }
}

async function resolveNvidiaResultPageDownload(resultId) {
  const detailsWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  try {
    await detailsWindow.loadURL(`https://www.nvidia.com/Download/driverResults.aspx/${resultId}/en-us`);

    const result = await detailsWindow.webContents.executeJavaScript(`
      new Promise((resolve) => {
        const deadline = Date.now() + 10000;

        const scan = () => {
          const links = Array.from(document.querySelectorAll('a'));
          const directLink = links.find((link) => /download\\.nvidia\\.com/i.test(link.href));
          const bodyText = document.body ? document.body.innerText : '';
          const versionMatch = bodyText.match(/Driver Version:\\s*([^|\\n]+)/i);

          if (directLink || Date.now() > deadline) {
            resolve({
              href: directLink ? directLink.href : '',
              version: versionMatch ? versionMatch[1].trim() : ''
            });
            return;
          }

          setTimeout(scan, 250);
        };

        scan();
      });
    `, true);

    if (!result?.href) {
      return null;
    }

    return {
      url: result.href,
      version: result.version || 'latest',
      fileName: sanitizeDownloadFileName(path.basename(new URL(result.href).pathname) || `nvidia-driver-${result.version || 'latest'}.exe`)
    };
  } finally {
    if (!detailsWindow.isDestroyed()) {
      detailsWindow.destroy();
    }
  }
}

async function resolveNvidiaDriverDownloadFromManualSearch(driver) {
  const searchParams = getNvidiaManualSearchParams(driver);
  if (!searchParams) {
    return null;
  }

  const driverTypes = ['0', '1'];

  for (const dtcid of driverTypes) {
    const manualSearchUrl = new URL('https://www.nvidia.com/Download/processFind.aspx');
    manualSearchUrl.search = new URLSearchParams({
      psid: searchParams.psid,
      pfid: searchParams.pfid,
      osid: searchParams.osid,
      lang: searchParams.lang,
      lid: '1',
      whql: '',
      ctk: '0',
      dtcid
    }).toString();

    const html = await fetchText(manualSearchUrl.toString());
    const matches = [...html.matchAll(/driverResults\.aspx\/(\d+)\/en-us'>([^<]+)/gi)]
      .map((match) => ({ id: match[1], title: match[2].trim() }));

    if (matches.length === 0) {
      continue;
    }

    const preferredMatch = matches.find((match) => /game ready/i.test(match.title)) || matches[0];
    const resolved = await resolveNvidiaResultPageDownload(preferredMatch.id);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

async function resolveNvidiaDriverDownload(driver) {
  const manualSearchDownload = await resolveNvidiaDriverDownloadFromManualSearch(driver);
  if (manualSearchDownload) {
    return manualSearchDownload;
  }

  const deviceCandidates = buildNvidiaDeviceCandidates(driver);
  if (deviceCandidates.length === 0) {
    throw new Error('Could not determine the NVIDIA hardware ID for this device');
  }

  const releaseParts = os.release().split('.');
  const osC = releaseParts.length >= 2 ? `${releaseParts[0]}.${releaseParts[1]}` : '10.0';
  const osB = releaseParts[2] || '19045';
  const laptopFlag = isLikelyNvidiaLaptop(driver) ? '1' : '0';
  const lookupVariants = [
    { iLp: laptopFlag, dch: '1', upCRD: '0' },
    { iLp: laptopFlag, dch: '0', upCRD: '0' },
    { iLp: laptopFlag, dch: '1', upCRD: '1' },
    { iLp: laptopFlag === '1' ? '0' : '1', dch: '1', upCRD: '0' }
  ];

  for (const deviceId of deviceCandidates) {
    for (const variant of lookupVariants) {
      const params = new URLSearchParams({
        dIDa: JSON.stringify([deviceId]),
        osC,
        osB,
        is6: process.arch === 'x64' || process.arch === 'arm64' ? '1' : '0',
        lg: '1033',
        iLp: variant.iLp,
        gIsB: '0',
        dch: variant.dch,
        upCRD: variant.upCRD
      });

      try {
        const data = await fetchJson(`${NVIDIA_DRIVER_LOOKUP_URL}?${params.toString()}`);
        const driverInfo = Array.isArray(data?.GFXDriver)
          ? data.GFXDriver.find((entry) => typeof entry?.DownloadURLAdmin === 'string' && /^https?:/i.test(entry.DownloadURLAdmin))
          : null;

        if (!driverInfo) {
          continue;
        }

        const fileName = sanitizeDownloadFileName(
          path.basename(new URL(driverInfo.DownloadURLAdmin).pathname) || `nvidia-driver-${driverInfo.Version || 'latest'}.exe`
        );

        return {
          url: driverInfo.DownloadURLAdmin,
          version: driverInfo.Version || 'latest',
          fileName
        };
      } catch (error) {
        continue;
      }
    }
  }

  throw new Error('NVIDIA did not return a direct driver package for this GPU');
}

function startManagedDownload(downloadUrl, preferredFileName = '') {
  if (!downloadUrl) {
    return Promise.resolve({ success: false, error: 'Missing download URL' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(downloadUrl);
  } catch (error) {
    return Promise.resolve({ success: false, error: 'Invalid download URL' });
  }

  if (!/^https?:$/i.test(parsedUrl.protocol)) {
    return Promise.resolve({ success: false, error: 'Only HTTP and HTTPS downloads are supported' });
  }

  if (!mainWindow || mainWindow.isDestroyed()) {
    return Promise.resolve({ success: false, error: 'Main window is not available' });
  }

  const downloadsFolder = app.getPath('downloads');
  const sanitizedFileName = sanitizeDownloadFileName(preferredFileName || path.basename(parsedUrl.pathname) || 'download.bin');
  const savePath = getAvailableDownloadPath(downloadsFolder, sanitizedFileName);
  const downloadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const session = mainWindow.webContents.session;

  return new Promise((resolve) => {
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutId);
      session.removeListener('will-download', handleWillDownload);
    };

    const finish = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(result);
    };

    const handleWillDownload = (downloadEvent, item, webContents) => {
      if (webContents !== mainWindow.webContents) {
        return;
      }

      item.setSavePath(savePath);
      activeFileDownloads.set(downloadId, {
        item,
        fileName: path.basename(savePath),
        savePath
      });
      sendFileDownloadStatus({
        downloadId,
        status: 'started',
        fileName: path.basename(savePath),
        savePath
      });

      item.on('updated', (itemEvent, state) => {
        if (state === 'interrupted') {
          sendFileDownloadStatus({
            downloadId,
            status: 'interrupted',
            fileName: path.basename(savePath),
            savePath
          });
          return;
        }

        const totalBytes = item.getTotalBytes();
        const receivedBytes = item.getReceivedBytes();
        sendFileDownloadStatus({
          downloadId,
          status: 'downloading',
          fileName: path.basename(savePath),
          savePath,
          receivedBytes,
          totalBytes,
          percent: totalBytes > 0 ? (receivedBytes / totalBytes) * 100 : null
        });
      });

      item.once('done', (itemEvent, state) => {
        activeFileDownloads.delete(downloadId);

        if (state === 'completed') {
          sendFileDownloadStatus({
            downloadId,
            status: 'completed',
            fileName: path.basename(savePath),
            savePath
          });
          return;
        }

        sendFileDownloadStatus({
          downloadId,
          status: state === 'cancelled' ? 'cancelled' : 'error',
          fileName: path.basename(savePath),
          savePath,
          message: `Download ${state}`
        });
      });

      finish({
        success: true,
        downloadId,
        fileName: path.basename(savePath),
        savePath
      });
    };

    const timeoutId = setTimeout(() => {
      finish({ success: false, error: 'Download did not start in time' });
    }, 5000);

    session.on('will-download', handleWillDownload);

    try {
      mainWindow.webContents.downloadURL(downloadUrl);
    } catch (error) {
      finish({ success: false, error: error.message });
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    title: 'DriverUpdate Pro',
    icon: getAppIconPath(),
    backgroundColor: '#1a1a2e',
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false,
    autoHideMenuBar: true
  });

  mainWindow.loadFile('src/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!closeToTrayEnabled || isQuitting) {
      return;
    }

    event.preventDefault();
    hideWindowToTray();
  });
}

app.whenReady().then(createWindow);

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    showMainWindow();
  }
});

// Handle driver scan request
ipcMain.handle('scan-drivers', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `Get-WmiObject Win32_PnPSignedDriver | Where-Object { $_.DeviceName -ne $null } | Select-Object DeviceName, Manufacturer, DriverVersion, DriverDate, DeviceClass, DeviceID, HardWareID | ConvertTo-Json -Depth 3`;

    exec(`powershell -NoProfile -Command "${psScript}"`, 
      { maxBuffer: 10 * 1024 * 1024 }, 
      async (error, stdout, stderr) => {
        if (error) {
          reject(error.message);
          return;
        }
        try {
          const drivers = JSON.parse(stdout);
          const driverList = Array.isArray(drivers) ? drivers : [drivers];
          
          // Check for updates using the update checker
          const driversWithUpdates = await updateChecker.checkForUpdates(driverList);
          resolve(driversWithUpdates);
        } catch (e) {
          reject('Failed to parse driver information: ' + e.message);
        }
      }
    );
  });
});

// Handle opening external URLs
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
  return true;
});

ipcMain.handle('download-file', async (event, options = {}) => {
  const downloadUrl = typeof options.url === 'string' ? options.url.trim() : '';
  return startManagedDownload(downloadUrl, options.fileName || '');
});

ipcMain.handle('download-nvidia-driver', async (event, driver) => {
  try {
    const resolvedDownload = await resolveNvidiaDriverDownload(driver);
    const result = await startManagedDownload(resolvedDownload.url, resolvedDownload.fileName);
    return {
      ...result,
      version: resolvedDownload.version,
      downloadUrl: resolvedDownload.url
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pause-download', async (event, downloadId) => {
  const activeDownload = activeFileDownloads.get(downloadId);
  if (!activeDownload) {
    return { success: false, error: 'Download not found' };
  }

  if (!activeDownload.item.isPaused()) {
    activeDownload.item.pause();
  }

  sendFileDownloadStatus({
    downloadId,
    status: 'paused',
    fileName: activeDownload.fileName,
    savePath: activeDownload.savePath
  });

  return { success: true };
});

ipcMain.handle('resume-download', async (event, downloadId) => {
  const activeDownload = activeFileDownloads.get(downloadId);
  if (!activeDownload) {
    return { success: false, error: 'Download not found' };
  }

  if (activeDownload.item.isPaused()) {
    activeDownload.item.resume();
  }

  sendFileDownloadStatus({
    downloadId,
    status: 'resumed',
    fileName: activeDownload.fileName,
    savePath: activeDownload.savePath
  });

  return { success: true };
});

ipcMain.handle('cancel-download', async (event, downloadId) => {
  const activeDownload = activeFileDownloads.get(downloadId);
  if (!activeDownload) {
    return { success: false, error: 'Download not found' };
  }

  activeDownload.item.cancel();
  return { success: true };
});

ipcMain.handle('show-item-in-folder', async (event, filePath) => {
  shell.showItemInFolder(filePath);
  return true;
});

ipcMain.handle('set-close-to-tray-enabled', async (event, enabled) => {
  closeToTrayEnabled = Boolean(enabled);

  if (closeToTrayEnabled) {
    createTray();
  } else if (mainWindow && mainWindow.isVisible()) {
    destroyTray();
  }

  return { success: true, enabled: closeToTrayEnabled };
});

// Window control handlers for custom title bar
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', (event, options = {}) => {
  const shouldCloseToTray = typeof options.closeToTray === 'boolean'
    ? options.closeToTray
    : closeToTrayEnabled;

  closeToTrayEnabled = shouldCloseToTray;

  if (shouldCloseToTray) {
    hideWindowToTray();
    return { background: true };
  }

  mainWindow.close();
  return { background: false };
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow.isMaximized();
});

// Get system info
ipcMain.handle('get-system-info', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `$cs = Get-WmiObject Win32_ComputerSystem; $os = Get-WmiObject Win32_OperatingSystem; @{ComputerName=$cs.Name; Manufacturer=$cs.Manufacturer; Model=$cs.Model; OSName=$os.Caption; OSVersion=$os.Version} | ConvertTo-Json`;

    exec(`powershell -NoProfile -Command "${psScript}"`, 
      (error, stdout, stderr) => {
        if (error) {
          reject(error.message);
          return;
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject('Failed to parse system information');
        }
      }
    );
  });
});

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'checking' });
  }
});

autoUpdater.on('update-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { 
      status: 'available', 
      version: info.version,
      releaseNotes: info.releaseNotes
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'not-available' });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { 
      status: 'downloading',
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { 
      status: 'downloaded',
      version: info.version
    });
  }
});

autoUpdater.on('error', (err) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { 
      status: 'error', 
      message: err.message 
    });
  }
});

// IPC handlers for update actions
ipcMain.handle('check-for-updates', async () => {
  // Check if we're running in development mode (not packaged)
  if (!app.isPackaged) {
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { 
        status: 'dev-mode',
        message: 'Update check skipped in development mode'
      });
    }
    return { success: true, devMode: true };
  }
  
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-update', async () => {
  autoUpdater.quitAndInstall(false, true);
  return { success: true };
});

ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});
