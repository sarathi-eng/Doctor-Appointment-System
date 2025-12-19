import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDeviceId } from '../utils/deviceId';

// API base URL - update this to match your backend server port
const API_BASE_URL = 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      // Skip device ID validation for demo sessions
      if (userData.deviceId === 'demo_device') {
        setUser(userData);
      } else {
        // Verify device ID for real sessions
        const currentDeviceId = getDeviceId();
        if (userData.deviceId === currentDeviceId) {
          setUser(userData);
        } else {
          // Clear invalid session (different device)
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, isDemo = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          ...data.user,
          deviceId: isDemo ? 'demo_device' : getDeviceId(),
        };

        setUser(userData);

        // Store only safe credentials in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');

        return { success: true, user: userData };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const { email, password, role, name, phone, dateOfBirth, address, specialization, experience, qualification, clinicName } = userData;
      
      // Check if user already exists
      const response = await fetch(`${API_BASE_URL}/users`);
      const users = await response.json();

      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Check if device already has an account
      const currentDeviceId = getDeviceId();
      const existingDeviceUser = users.find(u => u.deviceId === currentDeviceId);
      if (existingDeviceUser) {
        return { success: false, error: 'An account already exists on this device.' };
      }

      // Create new user with device ID
      const newUser = {
        id: String(users.length + 1),
        email,
        password,
        role: role || 'patient',
        name,
        phone,
        deviceId: currentDeviceId,
        status: 'active',
        ...(role === 'patient' && { dateOfBirth, address }),
        ...(role === 'doctor' && { specialization, experience, qualification, clinicName })
      };

      // Add user to database
      const addResponse = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (addResponse.ok) {
        const userDataToStore = { 
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: newUser.name,
          phone: newUser.phone,
          deviceId: currentDeviceId,
          clinicId: newUser.clinicId, // Add clinicId for all users
          ...(role === 'patient' && { dateOfBirth, address }),
          ...(role === 'doctor' && { specialization, experience, qualification, clinicName })
        };
        
        setUser(userDataToStore);
        
        // Store only safe credentials in localStorage
        localStorage.setItem('user', JSON.stringify(userDataToStore));
        localStorage.setItem('isLoggedIn', 'true');
        
        return { success: true, user: userDataToStore };
      } else {
        return { success: false, error: 'Registration failed. Please try again.' };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDoctor: user?.role === 'doctor',
    isPatient: user?.role === 'patient'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
