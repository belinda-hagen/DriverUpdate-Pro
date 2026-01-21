// Post-build script to set the application icon
const { rcedit } = require('rcedit');
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
        'LegalCopyright': 'Copyright (c) 2026 Belinda Hagen'
      }
    });
    console.log('✅ Icon set successfully!');
  } catch (err) {
    console.error('Error setting icon:', err);
    process.exit(1);
  }
}

setIcon();
