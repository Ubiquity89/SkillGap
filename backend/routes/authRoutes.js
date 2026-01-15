const express = require("express");
const cors = require("cors");

const router = express.Router();

// 🔥 THIS IS THE FIX
router.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "OPTIONS"],
  })
);
