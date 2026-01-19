const express = require("express");
const multer = require("multer");
const File = require("../models/File");

const router = express.Router();

/**
 * Multer configuration
 * - memoryStorage: best for cloud (Render)
 * - size limit: 10MB
 * - PDF only
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  }
});

/**
 * Generate 6-digit unique print code
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/", upload.single("pdf"), async (req, res) => {
  try {
    // 🔴 Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded"
      });
    }

    // 🌐 Get client IP safely (Render compatible)
    const ip =
      (req.headers["x-forwarded-for"] || "")
        .toString()
        .split(",")[0]
        .trim() ||
      req.socket.remoteAddress ||
      "unknown";

    // 🔐 Ensure unique print code
    let code;
    let exists = true;

    while (exists) {
      code = generateCode();
      exists = await File.exists({ code });
    }

    // 🗄 Save metadata (PDF buffer can be stored later)
    const newFile = new File({
      code,
      ipAddress: ip,
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      createdAt: new Date()
      // pdfBuffer: req.file.buffer  ← store later in Firebase/S3
    });

    await newFile.save();

    // ✅ Success response (frontend expects this)
    return res.json({
      success: true,
      code,
      ip
    });

  } catch (err) {
    console.error("Upload error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Upload failed"
    });
  }
});

module.exports = router;
