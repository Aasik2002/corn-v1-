import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cornai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('cornai_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile on initial load if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
          localStorage.setItem('cornai_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to load user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      const userPayload = {
        _id: data._id,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || '',
        organization: data.organization || '',
        profileImage: data.profileImage || '',
      };
      setUser(userPayload);
      localStorage.setItem('cornai_user', JSON.stringify(userPayload));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, phoneNumber, organization) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register({
        fullName,
        email,
        password,
        phoneNumber,
        organization,
      });
      // Automatically log in after register
      return await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cornai_token');
    localStorage.removeItem('cornai_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem('cornai_user', JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileImage = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.uploadProfileImage(formData);
      setUser((prev) => {
        const next = {
          ...prev,
          profileImage: res.profileImage,
        };
        localStorage.setItem('cornai_user', JSON.stringify(next));
        return next;
      });
      return res;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile image.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        updateProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
