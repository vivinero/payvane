require("dotenv").config();
const express = require("express");
const multer = require("multer"); 

require("./config/coudinary")
require("./config/config");

const userRouter = require("./routers/router");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.use("/api/user", userRouter);
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
});
// app.use(multer);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
