const express = require("express");
const multer = require("multer");
const File = require("../models/File");

const router = express.Router();

/**
 * Multer configuration (DEBUG MODE)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    console.log("📄 Incoming file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    if (file.mimetype !== "application/pdf") {
      console.error("❌ Rejected file type:", file.mimetype);
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  }
});

/**
 * Generate 6-digit code
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/", upload.single("pdf"), async (req, res) => {
  try {
    console.log("🚀 ===== /upload HIT =====");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("File received:", req.file);

    // ❌ File missing
    if (!req.file) {
      console.error("❌ req.file is UNDEFINED");
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded"
      });
    }

    // 🌐 Client IP
    const ip =
      (req.headers["x-forwarded-for"] || "")
        .toString()
        .split(",")[0]
        .trim() ||
      req.socket.remoteAddress ||
      "unknown";

    console.log("🌐 Client IP:", ip);

    // 🔐 Unique code generation (DEBUG: skip DB first if needed)
    let code;
    let exists = true;

    while (exists) {
      code = generateCode();
      exists = await File.exists({ code });
    }

    console.log("🔑 Generated unique code:", code);

    // 🧪 TEMP: comment DB save if needed
    const newFile = new File({
      code,
      ipAddress: ip,
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      createdAt: new Date()
    });

    await newFile.save();
    console.log("💾 Saved to MongoDB");

    return res.json({
      success: true,
      code,
      ip
    });

  } catch (err) {
    console.error("🔥 UPLOAD CRASH:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Upload failed"
    });
  }
});

module.exports = router;
