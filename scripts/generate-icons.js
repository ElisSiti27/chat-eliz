// scripts/generate-icons.js
// Jalankan: node scripts/generate-icons.js

import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_IMAGE = join(__dirname, '../public/elis-ai-icon.svg');
const OUTPUT_DIR = join(__dirname, '../public/icons');
const APP_ICON = join(__dirname, '../src/app/icon.png');
const APP_FAVICON = join(__dirname, '../src/app/favicon.ico');
const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

async function generateIcons() {
  // Pastikan folder output ada
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Folder dibuat: ${OUTPUT_DIR}`);
  }

  // Cek apakah file sumber ada
  if (!existsSync(SOURCE_IMAGE)) {
    console.error(`❌ File sumber tidak ditemukan: ${SOURCE_IMAGE}`);
    process.exit(1);
  }

  console.log(`🔧 Membaca sumber icon dari: ${SOURCE_IMAGE}`);
  console.log(`📁 Output ke: ${OUTPUT_DIR}`);
  console.log('');

  await sharp(SOURCE_IMAGE).resize(512, 512).png().toFile(APP_ICON);
  console.log('✅ Generated: src/app/icon.png');

  const faviconPng = await sharp(SOURCE_IMAGE).resize(32, 32).png().toBuffer();
  const faviconHeader = Buffer.alloc(22);
  faviconHeader.writeUInt16LE(1, 2);
  faviconHeader.writeUInt16LE(1, 4);
  faviconHeader.writeUInt8(32, 6);
  faviconHeader.writeUInt8(32, 7);
  faviconHeader.writeUInt16LE(1, 10);
  faviconHeader.writeUInt16LE(32, 12);
  faviconHeader.writeUInt32LE(faviconPng.length, 14);
  faviconHeader.writeUInt32LE(faviconHeader.length, 18);
  writeFileSync(APP_FAVICON, Buffer.concat([faviconHeader, faviconPng]));
  console.log('✅ Generated: src/app/favicon.ico');

  for (const size of SIZES) {
    const outputFile = join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    try {
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 240, g: 244, b: 252, alpha: 1 },
        })
        .png()
        .toFile(outputFile);
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    } catch (err) {
      console.error(`❌ Gagal membuat icon-${size}x${size}.png:`, err.message);
    }
  }

  console.log('\n🎉 Selesai! Semua icon berhasil dibuat.');
  console.log('📌 Semua ikon aplikasi dan PWA sudah diperbarui dari aset SVG.');
}

generateIcons();
