const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  scanDrivers: () => ipcRenderer.invoke('scan-drivers'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  downloadFile: (options) => ipcRenderer.invoke('download-file', options),
  downloadNvidiaDriver: (driver) => ipcRenderer.invoke('download-nvidia-driver', driver),
  pauseDownload: (downloadId) => ipcRenderer.invoke('pause-download', downloadId),
  resumeDownload: (downloadId) => ipcRenderer.invoke('resume-download', downloadId),
  cancelDownload: (downloadId) => ipcRenderer.invoke('cancel-download', downloadId),
  setCloseToTrayEnabled: (enabled) => ipcRenderer.invoke('set-close-to-tray-enabled', enabled),
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Window controls for custom title bar
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: (options) => ipcRenderer.invoke('window-close', options),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // Auto-updater API
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Update status listener
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (event, data) => callback(data));
  },
  removeUpdateStatusListener: () => {
    ipcRenderer.removeAllListeners('update-status');
  },
  onFileDownloadStatus: (callback) => {
    ipcRenderer.on('file-download-status', (event, data) => callback(data));
  },
  removeFileDownloadStatusListener: () => {
    ipcRenderer.removeAllListeners('file-download-status');
  }
});
