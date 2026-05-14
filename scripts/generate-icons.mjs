#!/usr/bin/env node
/**
 * Generates launcher icons for customer-mobile and broker-mobile.
 * Run from repo root: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Icon SVGs ────────────────────────────────────────────────────────────────

function customerSvg(size) {
  const pad = Math.round(size * 0.15);
  const bw = Math.round(size * 0.55);   // building width
  const bh = Math.round(size * 0.48);   // building height
  const bx = Math.round((size - bw) / 2);
  const by = Math.round(size * 0.28);
  const roof = Math.round(size * 0.18); // roof triangle height
  const rx = Math.round(size / 2);      // roof apex x
  const ry = Math.round(size * 0.12);   // roof apex y
  const wx = Math.round(size * 0.38);   // window x
  const wy = Math.round(size * 0.40);   // window y
  const ws = Math.round(size * 0.12);   // window size
  const dx = Math.round(size * 0.44);   // door x
  const dy = Math.round(by + bh - Math.round(size * 0.18));
  const dw = Math.round(size * 0.14);
  const dh = Math.round(size * 0.18);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#0a1628"/>
  <!-- Roof -->
  <polygon points="${rx},${ry} ${bx - Math.round(size*0.04)},${by} ${bx + bw + Math.round(size*0.04)},${by}" fill="#2563eb"/>
  <!-- Building body -->
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#1e3a5f"/>
  <!-- Windows row 1 -->
  <rect x="${wx}" y="${wy}" width="${ws}" height="${ws}" rx="2" fill="#60a5fa" opacity="0.9"/>
  <rect x="${Math.round(size/2) - Math.round(ws/2)}" y="${wy}" width="${ws}" height="${ws}" rx="2" fill="#60a5fa" opacity="0.9"/>
  <rect x="${Math.round(size * 0.5 + ws * 0.8)}" y="${wy}" width="${ws}" height="${ws}" rx="2" fill="#60a5fa" opacity="0.9"/>
  <!-- Windows row 2 -->
  <rect x="${wx}" y="${Math.round(wy + ws * 1.6)}" width="${ws}" height="${ws}" rx="2" fill="#93c5fd" opacity="0.7"/>
  <rect x="${Math.round(size/2) - Math.round(ws/2)}" y="${Math.round(wy + ws * 1.6)}" width="${ws}" height="${ws}" rx="2" fill="#93c5fd" opacity="0.7"/>
  <rect x="${Math.round(size * 0.5 + ws * 0.8)}" y="${Math.round(wy + ws * 1.6)}" width="${ws}" height="${ws}" rx="2" fill="#93c5fd" opacity="0.7"/>
  <!-- Door -->
  <rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="2" fill="#0a1628"/>
</svg>`;
}

function brokerSvg(size) {
  const cx = Math.round(size / 2);
  const cy = Math.round(size / 2);
  // Key icon
  const kr = Math.round(size * 0.22);   // key ring radius
  const kx = Math.round(size * 0.35);   // key ring center x
  const ky = Math.round(size * 0.38);   // key ring center y
  const kt = Math.round(size * 0.055);  // key thickness
  const shaftY = ky;
  const shaftX1 = kx + kr - Math.round(size * 0.02);
  const shaftX2 = Math.round(size * 0.82);
  const toothH = Math.round(size * 0.09);
  const t1x = Math.round(size * 0.62);
  const t2x = Math.round(size * 0.72);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#064e3b"/>
  <!-- Key ring (circle outline) -->
  <circle cx="${kx}" cy="${ky}" r="${kr}" fill="none" stroke="#34d399" stroke-width="${kt}"/>
  <!-- Key ring hole -->
  <circle cx="${kx}" cy="${ky}" r="${Math.round(kr * 0.45)}" fill="#064e3b"/>
  <!-- Key shaft -->
  <rect x="${shaftX1}" y="${shaftY - Math.round(kt/2)}" width="${shaftX2 - shaftX1}" height="${kt}" rx="${Math.round(kt/2)}" fill="#34d399"/>
  <!-- Tooth 1 -->
  <rect x="${t1x}" y="${shaftY + Math.round(kt/2)}" width="${Math.round(size*0.07)}" height="${toothH}" rx="2" fill="#34d399"/>
  <!-- Tooth 2 -->
  <rect x="${t2x}" y="${shaftY + Math.round(kt/2)}" width="${Math.round(size*0.07)}" height="${Math.round(toothH*0.7)}" rx="2" fill="#34d399"/>
  <!-- Shine -->
  <circle cx="${kx - Math.round(kr*0.35)}" cy="${ky - Math.round(kr*0.35)}" r="${Math.round(size*0.04)}" fill="white" opacity="0.25"/>
</svg>`;
}

// ── Size specs ────────────────────────────────────────────────────────────────

const ANDROID_SIZES = [
  { density: 'mdpi',    size: 48  },
  { density: 'hdpi',    size: 72  },
  { density: 'xhdpi',   size: 96  },
  { density: 'xxhdpi',  size: 144 },
  { density: 'xxxhdpi', size: 192 },
];

const IOS_SIZES = [
  { name: 'Icon-20',     size: 20  },
  { name: 'Icon-20@2x',  size: 40  },
  { name: 'Icon-20@3x',  size: 60  },
  { name: 'Icon-29',     size: 29  },
  { name: 'Icon-29@2x',  size: 58  },
  { name: 'Icon-29@3x',  size: 87  },
  { name: 'Icon-40',     size: 40  },
  { name: 'Icon-40@2x',  size: 80  },
  { name: 'Icon-40@3x',  size: 120 },
  { name: 'Icon-60@2x',  size: 120 },
  { name: 'Icon-60@3x',  size: 180 },
  { name: 'Icon-76',     size: 76  },
  { name: 'Icon-76@2x',  size: 152 },
  { name: 'Icon-83.5@2x',size: 167 },
  { name: 'Icon-1024',   size: 1024},
];

// ── Generator ─────────────────────────────────────────────────────────────────

async function generateApp({ name, svgFn, appDir }) {
  console.log(`\n📱 Generating icons for ${name}...`);

  // 1. Android
  for (const { density, size } of ANDROID_SIZES) {
    const dir = join(appDir, 'android', 'app', 'src', 'main', 'res', `mipmap-${density}`);
    mkdirSync(dir, { recursive: true });
    const svg = Buffer.from(svgFn(size));
    await sharp(svg).resize(size, size).png().toFile(join(dir, 'ic_launcher.png'));
    await sharp(svg).resize(size, size).png().toFile(join(dir, 'ic_launcher_round.png'));
    // Foreground for adaptive icons
    await sharp(svg).resize(size, size).png().toFile(join(dir, 'ic_launcher_foreground.png'));
    process.stdout.write(`  Android ${density} (${size}px) ✓\n`);
  }

  // 2. Android adaptive icon XML
  const mipmapAnyDir = join(appDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26');
  mkdirSync(mipmapAnyDir, { recursive: true });
  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  writeFileSync(join(mipmapAnyDir, 'ic_launcher.xml'), adaptiveXml);
  writeFileSync(join(mipmapAnyDir, 'ic_launcher_round.xml'), adaptiveXml);

  // 3. Android colors.xml for background
  const valuesDir = join(appDir, 'android', 'app', 'src', 'main', 'res', 'values');
  mkdirSync(valuesDir, { recursive: true });

  // ← don't overwrite strings.xml here; we write it separately below
  const bgColor = name === 'customer-mobile' ? '#0a1628' : '#064e3b';
  writeFileSync(join(valuesDir, 'ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${bgColor}</color>
</resources>
`);

  // 4. iOS
  const iosDir = join(appDir, 'ios', 'icons');
  mkdirSync(iosDir, { recursive: true });
  for (const { name: fname, size } of IOS_SIZES) {
    const svg = Buffer.from(svgFn(size));
    await sharp(svg).resize(size, size).png().toFile(join(iosDir, `${fname}.png`));
  }
  console.log(`  iOS icons (${IOS_SIZES.length} sizes) ✓`);

  // 5. Master 1024px source
  const assetsDir = join(appDir, 'assets');
  mkdirSync(assetsDir, { recursive: true });
  const masterSvg = Buffer.from(svgFn(1024));
  await sharp(masterSvg).resize(1024, 1024).png().toFile(join(assetsDir, 'icon.png'));
  // Notification / small icon (white on transparent)
  await sharp(masterSvg).resize(96, 96).png().toFile(join(assetsDir, 'notification_icon.png'));
  console.log(`  Master icon + notification icon ✓`);
}

// ── App strings (name) ────────────────────────────────────────────────────────

function writeStringsXml(appDir, appName) {
  const dir = join(appDir, 'android', 'app', 'src', 'main', 'res', 'values');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'strings.xml'), `<resources>
    <string name="app_name">${appName}</string>
</resources>
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const apps = [
  {
    name: 'customer-mobile',
    appName: 'برج العرب',
    svgFn: customerSvg,
    appDir: join(ROOT, 'apps', 'customer-mobile'),
  },
  {
    name: 'broker-mobile',
    appName: 'برج العرب وسيط',
    svgFn: brokerSvg,
    appDir: join(ROOT, 'apps', 'broker-mobile'),
  },
];

for (const app of apps) {
  await generateApp(app);
  writeStringsXml(app.appDir, app.appName);
  console.log(`  strings.xml → "${app.appName}" ✓`);
}

console.log('\n✅ All icons generated successfully.\n');
console.log('Next steps:');
console.log('  1. When initializing native code, the android/ and ios/ directories will be populated.');
console.log('  2. Icons are pre-placed at the correct paths for react-native 0.74 projects.');
console.log('  3. assets/icon.png (1024px) is the master source for each app.\n');
