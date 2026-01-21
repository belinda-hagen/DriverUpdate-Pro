const sharp = require('sharp');
const { default: pngToIco } = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const assetsDir = path.join(rootDir, 'assets');

// Create icon with layers design
async function createIcon() {
  // Create a 256x256 PNG with the icon design - Windows requires 256px for high-res icons
  const size = 256;
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="256" height="256" rx="48" fill="#1a1a1a"/>
      
      <!-- Inner background with gradient effect -->
      <rect x="8" y="8" width="240" height="240" rx="40" fill="#252525"/>
      
      <!-- Layers icon centered -->
      <g transform="translate(48, 56) scale(6.67)">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#e85d04" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M2 17L12 22L22 17" stroke="#e85d04" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M2 12L12 17L22 12" stroke="#e85d04" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
    </svg>
  `;

  try {
    // Generate PNG at 256px
    const buffer = await sharp(Buffer.from(svgIcon))
      .resize(256, 256)
      .png()
      .toBuffer();
    
    // Save as icon.png
    await sharp(buffer).toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ Created icon.png (256x256)');

    // Generate additional sizes for ICO
    const pngPaths = [];
    const sizes = [256, 128, 64, 48, 32, 16];
    
    for (const s of sizes) {
      const scaledBuffer = await sharp(buffer)
        .resize(s, s)
        .png()
        .toBuffer();
      
      const pngPath = path.join(assetsDir, `icon-${s}.png`);
      fs.writeFileSync(pngPath, scaledBuffer);
      pngPaths.push(pngPath);
    }

    // Create ICO file
    const icoBuffer = await pngToIco(pngPaths);
    fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuffer);
    console.log('✅ Created icon.ico with multiple sizes');
    
    // Clean up temporary PNG files (keep only icon.png)
    for (const pngPath of pngPaths) {
      try {
        fs.unlinkSync(pngPath);
      } catch (e) {
        // Ignore errors
      }
    }
    
    console.log('\n🎉 Icon generation complete!');
  } catch (error) {
    console.error('Error generating icon:', error);
    process.exit(1);
  }
}

createIcon();
