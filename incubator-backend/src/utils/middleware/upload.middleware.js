/**
 * File Upload Middleware Configuration (Multer)
 * Handles multipart/form-data file uploads with validation and storage
 * 
 * NOTE: Requires 'multer' package to be installed:
 * npm install multer
 */

import multer from "multer";
import path from "path";
import fs from "fs";

// File upload configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

// Upload directories
const UPLOAD_DIRS = {
  PROFILES: "uploads/profiles",
  RESUMES: "uploads/resumes",
  DOCUMENTS: "uploads/documents",
  TEMP: "uploads/temp",
};

// Ensure upload directories exist
Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Configure disk storage with custom filename and destination
 */
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.query.type || "temp";
    const dir = UPLOAD_DIRS[uploadType.toUpperCase()] || UPLOAD_DIRS.TEMP;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const userId = req.user?._id || "anonymous";
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");
    
    const filename = `${userId}_${timestamp}_${sanitizedName}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter for images (profile photos)
 */
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`), false);
  }
};

/**
 * File filter for documents (resumes, CVs)
 */
const documentFilter = (req, file, cb) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_DOCUMENT_TYPES.join(", ")}`), false);
  }
};

/**
 * Profile photo upload middleware
 * Single image file, max 5MB
 */
export const uploadProfilePhoto = multer({
  storage: diskStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single("photo");

/**
 * Resume/CV upload middleware
 * Single document file (PDF, DOC, DOCX), max 5MB
 */
export const uploadResume = multer({
  storage: diskStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single("resume");

/**
 * Multiple documents upload middleware
 * Up to 5 documents, max 5MB each
 */
export const uploadDocuments = multer({
  storage: diskStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
}).array("documents", 5);

/**
 * Error handler for multer errors
 * Use as middleware after multer middleware
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large",
        message: `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files",
        message: err.message,
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
};

export default {
  uploadProfilePhoto,
  uploadResume,
  uploadDocuments,
  handleUploadError,
};
