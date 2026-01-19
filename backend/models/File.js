const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  ipAddress: String,
  filename: String,
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("File", FileSchema);
