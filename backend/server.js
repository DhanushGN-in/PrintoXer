require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Health check / root route
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
