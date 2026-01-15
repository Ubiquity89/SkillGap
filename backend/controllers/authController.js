const admin = require("../config/firebase");
// const User = require("../models/User.js");
const fs = require('fs');
const path = require('path');

// Simple file-based persistence for users
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Load users from file on startup
let users = new Map();
try {
  if (fs.existsSync(USERS_FILE)) {
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    users = new Map(Object.entries(usersData));
    console.log('📁 Loaded users from file:', users.size, 'users');
  }
} catch (error) {
  console.log('📁 No users file found, starting fresh');
}

// Save users to file
const saveUsers = () => {
  try {
    const usersDir = path.dirname(USERS_FILE);
    if (!fs.existsSync(usersDir)) {
      fs.mkdirSync(usersDir, { recursive: true });
    }
    const usersData = Object.fromEntries(users);
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
    console.log('💾 Saved users to file:', users.size, 'users');
  } catch (error) {
    console.error('❌ Failed to save users:', error);
  }
};

// Export users map and save function
exports.users = users;
exports.saveUsers = saveUsers;

exports.firebaseLogin = async (req, res) => {
  try {
    console.log("=== AUTH REQUEST START ===");

    const { idToken, role = "candidate" } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID token is required",
      });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);

    const { uid, email } = decoded;

    let user = users.get(uid);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = {
        _id: uid,
        firebaseUid: uid,
        email,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(uid, user);
      saveUsers();
    }

    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        role: user.role,
        isNewUser,
      },
    });

  } catch (err) {
    console.error("Firebase login error:", err);

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      error: err.message,
    });
  }
};

