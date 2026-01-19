require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

// Connect MongoDB
connectDB();

// ✅ Middleware (IMPORTANT ORDER)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ⭐ REQUIRED FOR MULTER

// ✅ Health check
app.get("/", (req, res) => {
  res.send("PrintoXer Backend is running 🚀");
});

// Routes
app.use("/upload", require("./routes/upload"));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
