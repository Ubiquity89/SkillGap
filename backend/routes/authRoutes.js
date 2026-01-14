const express = require("express");
const { firebaseLogin } = require("../controllers/authController");

const router = express.Router();

router.post("/firebase-login", firebaseLogin);

module.exports = router;
