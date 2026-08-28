import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Possible root locations for the photos directory
const CANDIDATE_ROOTS = [
  path.resolve(__dirname, '../../photos'),
  path.resolve(__dirname, '../photos'),
  path.resolve(__dirname, '../../gallery-data'),
  path.resolve(__dirname, '../gallery-data'),
];

const OUTPUT_DIR = path.resolve(__dirname, '../public/gallery');
const MANIFEST_PATH = path.resolve(__dirname, '../public/gallery-data.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff']);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function findPhotosRoot() {
  for (const root of CANDIDATE_ROOTS) {
    if (fs.existsSync(root)) return root;
  }
  // Default to repo root photos/
  const defaultRoot = path.resolve(__dirname, '../../photos');
  fs.mkdirSync(defaultRoot, { recursive: true });
  return defaultRoot;
}

const SIZES = {
  thumbnail: { width: 400, quality: 80, folder: 'thumbnails' },
  medium:    { width: 1200, quality: 82, folder: 'medium' },
  large:     { width: 2000, quality: 85, folder: 'large' },
};

async function processImage(sourcePath, destBaseDir, baseName) {
  const sourceStat = fs.statSync(sourcePath);
  const resultPaths = {};
  let metadata = { width: 0, height: 0 };

  try {
    const meta = await sharp(sourcePath, { failOnError: false }).metadata();
    metadata.width = meta.width || 0;
    metadata.height = meta.height || 0;
  } catch (e) {
    console.warn(`⚠️ Warning: Could not read metadata for ${sourcePath}`);
  }

  for (const [sizeKey, sizeConfig] of Object.entries(SIZES)) {
    const outSubDir = path.join(destBaseDir, sizeConfig.folder);
    fs.mkdirSync(outSubDir, { recursive: true });

    const outFilePath = path.join(outSubDir, `${baseName}.webp`);
    resultPaths[sizeKey] = outFilePath;

    // Incremental build check: skip if output exists and is newer than source
    if (fs.existsSync(outFilePath)) {
      const outStat = fs.statSync(outFilePath);
      if (outStat.mtimeMs >= sourceStat.mtimeMs) {
        continue; // Already up-to-date!
      }
    }

    try {
      await sharp(sourcePath, { failOnError: false })
        .rotate() // auto-orient from EXIF
        .resize({
          width: sizeConfig.width,
          withoutEnlargement: true,
          fit: 'inside',
          fastShrinkOnLoad: true,
        })
        .webp({ quality: sizeConfig.quality, effort: 3 })
        .toFile(outFilePath);
    } catch (err) {
      console.error(`❌ Error processing ${sourcePath} for size ${sizeKey}:`, err.message);
    }
  }

  return { resultPaths, metadata };
}

async function buildGallery() {
  console.log('📸 Scanning and building static photo gallery...');
  const photosRoot = findPhotosRoot();
  console.log(`📁 Source photos directory: ${photosRoot}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest = {
    years: [],
    events: [],
    photos: {},
    generatedAt: new Date().toISOString(),
  };

  const yearEntries = fs.readdirSync(photosRoot, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^\d{4}$/.test(d.name))
    .sort((a, b) => parseInt(b.name) - parseInt(a.name));

  for (const yearEntry of yearEntries) {
    const year = parseInt(yearEntry.name);
    manifest.years.push(year);

    const yearDir = path.join(photosRoot, yearEntry.name);
    const eventEntries = fs.readdirSync(yearDir, { withFileTypes: true })
      .filter(d => d.isDirectory());

    for (let orderIndex = 0; orderIndex < eventEntries.length; orderIndex++) {
      const eventEntry = eventEntries[orderIndex];
      const eventName = eventEntry.name;
      const eventSlug = slugify(eventName);
      const eventId = `${eventSlug}-${year}`;
      const eventDir = path.join(yearDir, eventName);

      const destEventDir = path.join(OUTPUT_DIR, String(year), eventSlug);
      fs.mkdirSync(destEventDir, { recursive: true });

      // Scan all image files in this event folder
      const allFiles = fs.readdirSync(eventDir, { withFileTypes: true })
        .filter(f => f.isFile() && IMAGE_EXTENSIONS.has(path.extname(f.name).toLowerCase()))
        .map(f => f.name);

      if (allFiles.length === 0) {
        console.log(`ℹ️  Skipping empty event folder: ${yearEntry.name}/${eventName}`);
        continue;
      }

      // Check for dedicated cover file (e.g. cover.jpg, cover.png)
      const coverFileName = allFiles.find(f => /^cover\./i.test(f)) || allFiles[0];

      let eventCoverUrl = null;
      const eventPhotosList = [];

      console.log(`⚙️  Processing event: [${year}] ${eventName} (${allFiles.length} images)...`);

      for (let i = 0; i < allFiles.length; i++) {
        const fileName = allFiles[i];
        const isCover = (fileName === coverFileName);
        const sourcePath = path.join(eventDir, fileName);
        const baseName = `photo-${slugify(path.parse(fileName).name) || i}`;

        const { metadata } = await processImage(sourcePath, destEventDir, baseName);

        const thumbRel = `/gallery/${year}/${eventSlug}/thumbnails/${baseName}.webp`;
        const mediumRel = `/gallery/${year}/${eventSlug}/medium/${baseName}.webp`;
        const largeRel = `/gallery/${year}/${eventSlug}/large/${baseName}.webp`;

        if (isCover) {
          eventCoverUrl = mediumRel;
        }

        const photoTitle = path.parse(fileName).name
          .replace(/[-_]/g, ' ')
          .replace(/^\d+[\s.-]*/, '')
          .trim();

        eventPhotosList.push({
          id: `${eventId}-p${i + 1}`,
          event_id: eventId,
          event_name: eventName,
          year,
          title: photoTitle ? (photoTitle.charAt(0).toUpperCase() + photoTitle.slice(1)) : `${eventName} #${i + 1}`,
          thumbnail_path: thumbRel,
          medium_path: mediumRel,
          large_path: largeRel,
          width: metadata.width,
          height: metadata.height,
        });
      }

      manifest.events.push({
        id: eventId,
        slug: eventSlug,
        name: eventName,
        year,
        description: `Photographs from ${eventName} - Pune Festival ${year}.`,
        cover_image_url: eventCoverUrl || (eventPhotosList[0] ? eventPhotosList[0].medium_path : null),
        cover_medium: eventCoverUrl || (eventPhotosList[0] ? eventPhotosList[0].medium_path : null),
        cover_thumbnail: eventCoverUrl || (eventPhotosList[0] ? eventPhotosList[0].thumbnail_path : null),
        photo_count: eventPhotosList.length,
        is_published: true,
        display_order: orderIndex,
      });

      manifest.photos[eventId] = eventPhotosList;
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✅ Static gallery manifest generated: ${MANIFEST_PATH}`);
  console.log(`📊 Summary: ${manifest.years.length} Years, ${manifest.events.length} Events, ${Object.values(manifest.photos).reduce((a, b) => a + b.length, 0)} Photos optimized.`);
}

buildGallery().catch(err => {
  console.error('❌ Build gallery failed:', err);
  process.exit(1);
});
