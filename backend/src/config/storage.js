/**
 * Storage Abstraction Layer
 *
 * This module provides a unified interface for file storage.
 * Currently implements LocalStorageProvider.
 * To add cloud storage (S3, R2, Cloudinary), implement a new provider
 * following the same interface and update STORAGE_TYPE in .env.
 *
 * Interface methods:
 *   - saveFile(buffer, filePath) => resolves to public URL
 *   - deleteFile(filePath) => resolves to boolean
 *   - getPublicUrl(filePath) => returns full public URL
 */

const path = require('path');
const fs = require('fs').promises;
class LocalStorageProvider {
  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR 
      ? path.resolve(process.env.UPLOADS_DIR) 
      : path.resolve(__dirname, '../../uploads');
    this.ensureDir(this.uploadsDir);
  }

  /**
   * Ensures a directory exists, creating it recursively if needed.
   */
  async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
  }

  /**
   * Save a file buffer to the given relative path.
   * @param {Buffer} buffer - File data
   * @param {string} relativePath - e.g. "2025/opening-ceremony/thumbnails/photo-abc.webp"
   * @returns {Promise<string>} Public URL of the saved file
   */
  async saveFile(buffer, relativePath) {
    const absolutePath = path.join(this.uploadsDir, relativePath);
    await this.ensureDir(path.dirname(absolutePath));
    await fs.writeFile(absolutePath, buffer);
    return this.getPublicUrl(relativePath);
  }

  /**
   * Delete a file at the given relative path.
   * @param {string} relativePath
   * @returns {Promise<boolean>}
   */
  async deleteFile(relativePath) {
    try {
      const absolutePath = path.join(this.uploadsDir, relativePath);
      await fs.unlink(absolutePath);
      return true;
    } catch (err) {
      console.error(`Failed to delete file ${relativePath}:`, err.message);
      return false;
    }
  }

  /**
   * Get the public URL for a stored file.
   * @param {string} relativePath
   * @returns {string}
   */
  getPublicUrl(relativePath) {
    // Normalize Windows backslashes to forward slashes for URL
    const normalized = relativePath.replace(/\\/g, '/');
    return `/uploads/${normalized}`;
  }
}

// ─── Future Cloud Providers ─────────────────────────────────────────────────
// class S3StorageProvider { ... }   // AWS S3
// class R2StorageProvider { ... }   // Cloudflare R2
// ────────────────────────────────────────────────────────────────────────────

/**
 * Factory — returns the appropriate provider based on STORAGE_TYPE env var.
 */
function createStorageProvider() {
  const type = (process.env.STORAGE_TYPE || 'local').toLowerCase();
  switch (type) {
    case 'local':
    default:
      return new LocalStorageProvider();
  }
}

module.exports = createStorageProvider();
