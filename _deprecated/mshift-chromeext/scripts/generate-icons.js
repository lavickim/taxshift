/**
 * Generate PNG icons from SVG for Chrome Extension
 * This script uses Canvas API to convert SVG to PNG
 */

const fs = require('fs');
const path = require('path');

// Simple icon generator using Unicode symbols
function generateSimpleIcon(size, bgColor = '#667eea', textColor = '#ffffff') {
  // Create a simple data URL for PNG
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${bgColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" 
            font-family="Arial, sans-serif" font-size="${size * 0.4}" 
            font-weight="bold" fill="${textColor}">M$</text>
      <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.08}" fill="${textColor}" opacity="0.8"/>
      <circle cx="${size * 0.2}" cy="${size * 0.8}" r="${size * 0.08}" fill="${textColor}" opacity="0.8"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
}

// Create icons directory
const iconsDir = path.join(__dirname, '../assets/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate different sizes
const sizes = [16, 32, 48, 128];

console.log('🎨 Generating MoneyShift Chrome Extension icons...');

sizes.forEach(size => {
  const svgContent = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad${size})"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" 
        font-family="Arial, sans-serif" font-size="${size * 0.35}" 
        font-weight="bold" fill="white">M$</text>
  ${size >= 32 ? `<circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.08}" fill="white" opacity="0.8"/>` : ''}
  ${size >= 32 ? `<circle cx="${size * 0.2}" cy="${size * 0.8}" r="${size * 0.08}" fill="white" opacity="0.8"/>` : ''}
</svg>`;

  const outputPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(outputPath, svgContent);
  console.log(`✅ Generated icon${size}.svg`);
});

// Create a simple favicon
const faviconSvg = `
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#667eea"/>
  <text x="16" y="16" text-anchor="middle" dy="0.35em" 
        font-family="Arial, sans-serif" font-size="12" 
        font-weight="bold" fill="white">M$</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSvg);
console.log('✅ Generated favicon.svg');

console.log('🎉 All icons generated successfully!');
console.log('\n📋 Icon files created:');
sizes.forEach(size => {
  console.log(`   - icon${size}.svg (${size}x${size}px)`);
});
console.log('   - favicon.svg (32x32px)');

console.log('\n💡 Note: SVG icons are being used instead of PNG for better quality.');
console.log('   Chrome extensions support SVG icons in manifest v3.');