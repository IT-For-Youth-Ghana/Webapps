/* eslint-disable no-undef */
/**
 * File Upload Service
 * Handles file uploads using Multer with support for:
 * - Local storage (development)
 * - Cloud storage (production - S3/Cloudinary)
 * - Image optimization and validation
 * - File type and size restrictions
 */

import multer from "multer";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp"; // For image optimization (npm install sharp)
import { v4 as uuidv4 } from "uuid";
import {
  MAX_FILE_SIZE_MB,
  ALLOWED_FILE_TYPES,
  ERROR_MESSAGES,
} from "../constants";

class FileService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || "uploads";
    this.maxFileSize = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert MB to bytes

    // Create upload directories
    this.initializeDirectories();
  }

  /**
   * Initialize upload directories
   * @private
   */
  async initializeDirectories() {
    const directories = [
      `${this.uploadDir}/profiles`,
      `${this.uploadDir}/resumes`,
      `${this.uploadDir}/logos`,
      `${this.uploadDir}/documents`,
      `${this.uploadDir}/temp`,
    ];

    try {
      for (const dir of directories) {
        await fs.mkdir(dir, { recursive: true });
      }
      console.log("Upload directories initialized");
    } catch (error) {
      console.error(" Failed to create upload directories:", error);
    }
  }

  /**
   * Configure Multer storage for local uploads
   * @param {string} subfolder - Subfolder within uploads directory
   * @returns {multer.StorageEngine}
   */
  createLocalStorage(subfolder = "temp") {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        const uploadPath = path.join(this.uploadDir, subfolder);
        
        try {
          await fs.mkdir(uploadPath, { recursive: true });
          cb(null, uploadPath);
        } catch (error) {
          cb(error, uploadPath);
        }
      },
      filename: (req, file, cb) => {
        const userId = req.user?._id || req.user?.id || "anonymous";
        const timestamp = Date.now();
        const uniqueId = uuidv4().split("-")[0];
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 30);

        const filename = `${userId}_${timestamp}_${uniqueId}_${nameWithoutExt}${ext}`;
        cb(null, filename);
      },
    });
  }

  /**
   * File filter for images
   * @param {Object} req - Express request
   * @param {Object} file - Multer file object
   * @param {Function} cb - Callback
   */
  imageFilter(req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid image type. Allowed: ${allowedTypes.join(", ")}`
        ),
        false
      );
    }
  }

  /**
   * File filter for documents (PDFs, Word docs)
   * @param {Object} req - Express request
   * @param {Object} file - Multer file object
   * @param {Function} cb - Callback
   */
  documentFilter(req, file, cb) {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid document type. Allowed: PDF, DOC, DOCX, XLS, XLSX`
        ),
        false
      );
    }
  }

  /**
   * Generic file filter (uses ALLOWED_FILE_TYPES from constants)
   * @param {Object} req - Express request
   * @param {Object} file - Multer file object
   * @param {Function} cb - Callback
   */
  genericFileFilter(req, file, cb) {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type not allowed. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`
        ),
        false
      );
    }
  }

  // ========================================
  // MULTER UPLOAD CONFIGURATIONS
  // ========================================

  /**
   * Profile photo upload (single image)
   * Usage: router.post('/photo', fileService.uploadProfilePhoto, controller.handleUpload)
   */
  get uploadProfilePhoto() {
    return multer({
      storage: this.createLocalStorage("profiles"),
      fileFilter: this.imageFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize,
        files: 1,
      },
    }).single("photo");
  }

  /**
   * Company logo upload (single image)
   */
  get uploadLogo() {
    return multer({
      storage: this.createLocalStorage("logos"),
      fileFilter: this.imageFilter.bind(this),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB for logos
        files: 1,
      },
    }).single("logo");
  }

  /**
   * Resume/CV upload (single PDF/Word document)
   */
  get uploadResume() {
    return multer({
      storage: this.createLocalStorage("resumes"),
      fileFilter: this.documentFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize,
        files: 1,
      },
    }).single("resume");
  }

  /**
   * Multiple document upload
   */
  get uploadDocuments() {
    return multer({
      storage: this.createLocalStorage("documents"),
      fileFilter: this.documentFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize,
        files: 5,
      },
    }).array("documents", 5);
  }

  /**
   * Generic single file upload
   */
  uploadFile(fieldName = "file", subfolder = "temp") {
    return multer({
      storage: this.createLocalStorage(subfolder),
      fileFilter: this.genericFileFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize,
        files: 1,
      },
    }).single(fieldName);
  }

  // ========================================
  // IMAGE PROCESSING
  // ========================================

  /**
   * Optimize and resize image
   * @param {string} filePath - Path to image file
   * @param {Object} options - Optimization options
   * @returns {Promise<string>} - Path to optimized image
   */
  async optimizeImage(filePath, options = {}) {
    const {
      width = 800,
      height = 800,
      quality = 80,
      format = "jpeg",
      fit = "inside",
    } = options;

    try {
      const ext = `.${format}`;
      const optimizedPath = filePath.replace(path.extname(filePath), `_optimized${ext}`);

      const sharpInstance = sharp(filePath).resize(width, height, { fit, withoutEnlargement: true });
      
      // Apply format-specific processing
      if (format === "jpeg") {
        await sharpInstance.jpeg({ quality }).toFile(optimizedPath);
      } else if (format === "png") {
        await sharpInstance.png({ quality }).toFile(optimizedPath);
      } else if (format === "webp") {
        await sharpInstance.webp({ quality }).toFile(optimizedPath);
      } else {
        await sharpInstance.toFile(optimizedPath);
      }

      // Delete original file
      await fs.unlink(filePath);

      return optimizedPath;
    } catch (error) {
      console.error("Image optimization failed:", error);
      throw new Error("Failed to optimize image");
    }
  }

  /**
   * Create thumbnail from image
   * @param {string} filePath - Path to image file
   * @param {number} size - Thumbnail size (width/height)
   * @returns {Promise<string>} - Path to thumbnail
   */
  async createThumbnail(filePath, size = 150) {
    try {
      const ext = path.extname(filePath);
      const thumbnailPath = filePath.replace(ext, `_thumb${ext}`);

      await sharp(filePath)
        .resize(size, size, { fit: "cover" })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error("Thumbnail creation failed:", error);
      throw new Error("Failed to create thumbnail");
    }
  }

  // ========================================
  // FILE OPERATIONS
  // ========================================

  /**
   * Delete file from local storage
   * @param {string} filePath - Path to file (relative or absolute)
   * @returns {Promise<boolean>}
   */
  async deleteFile(filePath) {
    try {
      // Handle both absolute and relative paths
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath.replace(/^\//, ""));

      await fs.unlink(absolutePath);
      console.log(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Move file to different directory
   * @param {string} sourcePath - Current file path
   * @param {string} destinationPath - New file path
   * @returns {Promise<string>} - New file path
   */
  async moveFile(sourcePath, destinationPath) {
    try {
      const destDir = path.dirname(destinationPath);
      await fs.mkdir(destDir, { recursive: true });
      await fs.rename(sourcePath, destinationPath);
      return destinationPath;
    } catch (error) {
      console.error("File move failed:", error);
      throw new Error("Failed to move file");
    }
  }

  /**
   * Get file metadata
   * @param {string} filePath - Path to file
   * @returns {Promise<Object>}
   */
  async getFileMetadata(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      console.error("Failed to get file metadata:", error);
      return null;
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to file
   * @returns {Promise<boolean>}
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // ========================================
  // CLOUD STORAGE (S3/Cloudinary) - Placeholder
  // ========================================

  /**
   * Upload file to cloud storage (S3, Cloudinary, etc.)
   * @param {Object} file - Multer file object
   * @param {string} folder - Cloud storage folder
   * @returns {Promise<Object>} - { url, publicId }
   * 
   * NOTE: Implement based on chosen cloud provider
   * For AWS S3: Use @aws-sdk/client-s3
   * For Cloudinary: Use cloudinary package
   */
  async uploadToCloud(file, folder = "uploads") {
    if (process.env.NODE_ENV === "production") {
      // TODO: Implement cloud upload
      // Example for S3:
      // const s3Client = new S3Client({ region: process.env.AWS_REGION });
      // const command = new PutObjectCommand({ ... });
      // await s3Client.send(command);
      
      throw new Error("Cloud upload not implemented yet");
    }

    // In development, return local file path
    return {
      url: `/uploads/${folder}/${file.filename}`,
      publicId: file.filename,
    };
  }

  /**
   * Delete file from cloud storage
   * @param {string} publicId - Cloud storage file identifier
   * @returns {Promise<boolean>}
   */
  async deleteFromCloud(publicId) {
    if (process.env.NODE_ENV === "production") {
      // TODO: Implement cloud deletion
      // Example for S3: await s3Client.send(new DeleteObjectCommand({ Bucket, Key: publicId }));
      // Example for Cloudinary: await cloudinary.uploader.destroy(publicId);
      console.log("Cloud deletion not implemented for:", publicId);
      throw new Error("Cloud deletion not implemented yet");
    }

    return true;
  }

  // ========================================
  // ERROR HANDLING MIDDLEWARE
  // ========================================

  /**
   * Multer error handler middleware
   * Use after multer middleware: app.use(fileService.handleUploadError)
   */
  handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: ERROR_MESSAGES.FILE_TOO_LARGE,
          message: `File size must not exceed ${MAX_FILE_SIZE_MB}MB`,
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          error: "Too many files",
          message: err.message,
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          error: "Unexpected field",
          message: "Unexpected file field in request",
        });
      }

      return res.status(400).json({
        success: false,
        error: "Upload error",
        message: err.message,
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        error: "File upload failed",
        message: err.message,
      });
    }

    next();
  }

  // ========================================
  // CLEANUP UTILITIES
  // ========================================

  /**
   * Clean up old temporary files
   * @param {number} olderThanDays - Delete files older than N days
   * @returns {Promise<number>} - Number of files deleted
   */
  async cleanupTempFiles(olderThanDays = 7) {
    try {
      const tempDir = path.join(this.uploadDir, "temp");
      const files = await fs.readdir(tempDir);
      const cutoffDate = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtimeMs < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`🧹 Cleaned up ${deletedCount} temporary files`);
      return deletedCount;
    } catch (error) {
      console.error("Cleanup failed:", error);
      return 0;
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Promise<Object>}
   */
  async getStorageStats() {
    try {
      const directories = ["profiles", "resumes", "logos", "documents", "temp"];
      const stats = {};

      for (const dir of directories) {
        const dirPath = path.join(this.uploadDir, dir);
        const files = await fs.readdir(dirPath);
        
        let totalSize = 0;
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = await fs.stat(filePath);
          if (stat.isFile()) {
            totalSize += stat.size;
          }
        }

        stats[dir] = {
          fileCount: files.length,
          totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        };
      }

      return stats;
    } catch (error) {
      console.error("Failed to get storage stats:", error);
      return null;
    }
  }
}

// Export singleton instance
export const fileService = new FileService();
export default fileService;