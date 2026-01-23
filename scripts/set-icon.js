// Post-build script to set the application icon
const rceditModule = require('rcedit');
const rcedit = rceditModule.rcedit || rceditModule;
const path = require('path');

const rootDir = path.join(__dirname, '..');
const exePath = path.join(rootDir, 'dist', 'win-unpacked', 'DriverUpdate Pro.exe');
const iconPath = path.join(rootDir, 'assets', 'icon.ico');

console.log('Setting application icon...');
console.log('Executable:', exePath);
console.log('Icon:', iconPath);

async function setIcon() {
  try {
    await rcedit(exePath, {
      icon: iconPath,
      'version-string': {
        'ProductName': 'DriverUpdate Pro',
        'FileDescription': 'Professional driver update scanner for Windows',
        'CompanyName': 'DriverUpdate Pro',
        'LegalCopyright': 'Copyright (c) 2026 Belinda Hagen',
        'OriginalFilename': 'DriverUpdate Pro.exe'
      },
      'file-version': '1.0.0',
      'product-version': '1.0.0'
    });
    console.log('✅ Icon set successfully!');
  } catch (err) {
    console.error('Error setting icon:', err);
    process.exit(1);
  }
}

setIcon();
