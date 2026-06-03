import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');

// Icon sizes to generate
const sizes = [
    { size: 192, name: 'pwa-192x192.png' },
    { size: 512, name: 'pwa-512x512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
];

// Read the SVG
const svgPath = path.join(publicDir, 'icon.png');

async function generateIcons() {
    console.log('🎨 Generating PWA icons from icon.png...\n');

    for (const { size, name } of sizes) {
        try {
            const outputPath = path.join(publicDir, name);

            await sharp(svgPath).resize(size, size).png().toFile(outputPath);

            const stats = fs.statSync(outputPath);
            console.log(
                `✓ Generated ${name} (${size}x${size}px) - ${(stats.size / 1024).toFixed(2)} KB`,
            );
        } catch (error) {
            console.error(`✗ Failed to generate ${name}:`, error.message);
        }
    }

    console.log('\n✅ Icon generation complete!');
    console.log('📍 Icons saved to: public/');
}

generateIcons().catch(console.error);
