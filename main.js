const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const DriverUpdateChecker = require('./src/updateChecker');
const { autoUpdater } = require('electron-updater');

// Suppress GPU cache errors
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

let mainWindow;
const updateChecker = new DriverUpdateChecker();

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

function createWindow() {
  // Use .ico for Windows, .png for other platforms
  const iconPath = process.platform === 'win32' 
    ? path.join(__dirname, 'assets', 'icon.ico')
    : path.join(__dirname, 'assets', 'icon.png');

  mainWindow = new BrowserWindow({
    width: 950,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    title: 'DriverUpdate Pro',
    icon: iconPath,
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
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
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

ipcMain.handle('window-close', () => {
  mainWindow.close();
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
