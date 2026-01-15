import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '../firebase';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

// Set up axios defaults for token restoration
export const setupAxiosAuth = () => {
  const token = localStorage.getItem('authToken');
  console.log('🔧 Token restoration check:', { 
    hasToken: !!token, 
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
  });
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Token restored to axios headers');
    return true;
  } else {
    console.log('❌ No token found in localStorage');
    return false;
  }
};

// Don't initialize on import - let App.tsx handle it
// setupAxiosAuth();

export interface AuthResponse {
  success: boolean;
  data?: {
    userId: string;
    firebaseUid: string;
    email: string;
    role: string;
    name?: string;
    isNewUser?: boolean;
  };
  message?: string;
}

export const loginWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in process...');
    
    // Sign in with Google
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful, user:', result.user);
    
    const token = await result.user.getIdToken();
    console.log('Got ID token successfully');

    // Get user info from Google result
    const { displayName, email, photoURL, uid } = result.user;
    console.log('User info:', { displayName, email, uid });

    // Sync with backend - send token in Authorization header
    console.log('Sending token to backend...');
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/firebase-login`, 
      { 
        idToken: token,
        role: 'candidate' // Default role for Google users
      }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Backend response:', response.data);

    if (response.data.success && response.data.data) {
      // Store token and user data in localStorage
      console.log('💾 Storing auth data:', {
        tokenLength: token.length,
        tokenPreview: `${token.substring(0, 20)}...`,
        userId: response.data.data.userId,
        email: response.data.data.email
      });
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({
        ...response.data.data,
        name: displayName,
        photoURL: photoURL
      }));
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ Auth data stored successfully');
      return { success: true, data: response.data.data };
    }

    return { success: false, message: response.data.message };
  } catch (error: any) {
    console.error('Google login error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, message: 'Google sign-in was cancelled' };
    }
    if (error.code === 'auth/popup-blocked') {
      return { success: false, message: 'Google sign-in was blocked by browser' };
    }
    if (error.response) {
      // Backend responded with error
      console.error('Backend error response:', error.response.data);
      return { success: false, message: error.response.data.message || 'Backend authentication failed' };
    }
    return { success: false, message: 'Google sign-in failed' };
  }
};

export const signup = async (email: string, password: string, role: 'candidate' | 'recruiter') => {
  try {
    // Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    // Sync with backend - send token in Authorization header
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/firebase-login`, 
      { idToken: token, role }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      // Store token and user data in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, data: response.data.data };
    }

    return { success: false, message: response.data.message };
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, message: 'Email already in use' };
    }
    return { success: false, message: 'Signup failed' };
  }
};

export const login = async (email: string, password: string) => {
  try {
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    // Sync with backend - send token in Authorization header
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/firebase-login`, 
      { idToken: token }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      // Store token and user data in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, data: response.data.data };
    }

    return { success: false, message: response.data.message };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: 'User not found' };
    }
    if (error.code === 'auth/wrong-password') {
      return { success: false, message: 'Incorrect password' };
    }
    return { success: false, message: 'Login failed' };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    
    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Logout failed' };
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  // Check both localStorage and Firebase auth state
  const localUser = getCurrentUser();
  const firebaseUser = auth.currentUser;
  const hasToken = !!localStorage.getItem('authToken');
  
  console.log('🔐 Auth check:', {
    hasLocalUser: !!localUser,
    hasFirebaseUser: !!firebaseUser,
    hasToken,
    firebaseEmail: firebaseUser?.email,
    localEmail: localUser?.email
  });
  
  // User is authenticated if both localStorage and Firebase agree
  return localUser !== null && firebaseUser !== null && hasToken;
};
