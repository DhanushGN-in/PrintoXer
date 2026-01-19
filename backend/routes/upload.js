const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const File = require("../models/File");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/", upload.single("pdf"), async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;

    let code;
    let exists = true;

    while (exists) {
      code = generateCode();
      exists = await File.findOne({ code });
    }

    const newFile = new File({
      code,
      ipAddress: ip,
      filename: req.file.originalname
    });

    await newFile.save();

    res.json({
      success: true,
      code,
      ip
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
