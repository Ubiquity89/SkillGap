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
    console.log('=== AUTH REQUEST START ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Firebase config check:', {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
    });

    const { idToken, role = 'candidate' } = req.body;

    if (!idToken) {
      console.log('ERROR: No ID token provided');
      return res.status(400).json({
        success: false,
        message: "ID token is required"
      });
    }

    console.log('Attempting to verify token...');
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log('Token decoded successfully:', { uid: decoded.uid, email: decoded.email });

    const { uid, email } = decoded;

    // Use in-memory store instead of MongoDB
    let user = users.get(uid);
    let isNewUser = false;

    if (!user) {
      console.log('User not found, creating new user...');
      isNewUser = true;
      user = {
        _id: uid,
        firebaseUid: uid,
        email,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.set(uid, user);
      saveUsers(); // Save to file
      console.log('New user created:', { userId: user._id, email: user.email });
    } else {
      console.log('Existing user found:', { userId: user._id, email: user.email });
    }

    const responseData = {
      userId: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      role: user.role,
      isNewUser
    };

    console.log('Sending response:', responseData);
    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (err) {
    console.error('Firebase login error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(401).json({ 
      success: false, 
      message: "Unauthorized",
      error: err.message 
    });
  }
};
