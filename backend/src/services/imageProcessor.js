const sharp = require('sharp');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const storage = require('../config/storage');

// Optimize Sharp concurrency and memory management to prevent system lag
sharp.concurrency(Math.max(1, Math.min(4, Math.floor(os.cpus().length / 2))));
sharp.cache(false); // Clear internal libvips cache after processing

/**
 * Image size configuration.
 */
const IMAGE_SIZES = {
  thumbnail: { width: 400, suffix: 'thumbnails', quality: 80, effort: 3 },
  medium:    { width: 1200, suffix: 'medium', quality: 82, effort: 3 },
  large:     { width: 2000, suffix: 'large', quality: 85, effort: 3 },
};

/**
 * Slugify a string for use in file paths.
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Process a single uploaded image.
 * Generates thumbnail, medium, large WebP variants + saves original.
 *
 * @param {Buffer} buffer - Raw image buffer from multer
 * @param {object} options
 * @param {string} options.year        - e.g. "2025"
 * @param {string} options.eventSlug   - e.g. "opening-ceremony"
 * @param {string} options.originalName - Original filename
 * @returns {Promise<{paths, metadata}>}
 */
async function processImage(buffer, { year, eventSlug, originalName }) {
  const fileId = uuidv4();
  const baseName = `photo-${fileId}`;
  const baseDir = `${year}/${eventSlug}`;

  // Read metadata from original
  const meta = await sharp(buffer, { failOnError: false }).metadata();

  const result = {
    fileId,
    paths: {},
    metadata: {
      width: meta.width || 0,
      height: meta.height || 0,
      fileSize: buffer.length,
      format: meta.format || 'jpeg',
    },
  };

  // ── Save original ─────────────────────────────────────────
  const originalExt = path.extname(originalName) || '.jpg';
  const originalRelPath = `${baseDir}/originals/${baseName}${originalExt}`;
  result.paths.original = await storage.saveFile(buffer, originalRelPath);

  // ── Generate resized WebP variants in parallel ────────────
  const resizePromises = Object.entries(IMAGE_SIZES).map(async ([sizeName, sizeConfig]) => {
    const variantRelPath = `${baseDir}/${sizeConfig.suffix}/${baseName}.webp`;

    const processedBuffer = await sharp(buffer, { failOnError: false })
      .rotate() // auto-orient based on EXIF tag
      .resize({
        width: sizeConfig.width,
        withoutEnlargement: true,
        fit: 'inside',
        fastShrinkOnLoad: true,
      })
      .webp({
        quality: sizeConfig.quality,
        effort: sizeConfig.effort,
        smartSubsample: true,
      })
      .toBuffer();

    const savedPath = await storage.saveFile(processedBuffer, variantRelPath);
    return { sizeName, savedPath };
  });

  const variants = await Promise.all(resizePromises);
  variants.forEach(({ sizeName, savedPath }) => {
    result.paths[sizeName] = savedPath;
  });

  return result;
}

module.exports = { processImage };
