import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { authService } from '../services/authService';

const AuthContext =
  createContext();

export const AuthProvider = ({
  children
}) => {

  const [token, setToken] =
    useState(
      () =>
        authService.getToken()
    );

  const [user, setUser] =
    useState(
      () =>
        authService.getStoredUser()
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState(null);

  // =========================================================
  // VALIDATE SESSION
  // =========================================================

  useEffect(() => {

    async function initAuth() {

      const storedToken =
        authService.getToken();

      if (storedToken) {

        try {

          const userData =
            await authService.getMe();

          setUser(userData);
          setToken(storedToken);

        } catch (err) {

          console.warn(
            'Session expired or invalid token:',
            err.message
          );

          authService.logout();

          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    }

    initAuth();

  }, []);

  // =========================================================
  // LOGIN
  // =========================================================

  const login = async (
    credentials
  ) => {

    setAuthError(null);

    try {

      const res =
        await authService.login(
          credentials
        );

      setToken(res.token);
      setUser(res.user);

      return res;

    } catch (err) {

      setAuthError(
        err.message ||
        'Login failed. Please check credentials.'
      );

      throw err;
    }
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const register = async (
    userData
  ) => {

    setAuthError(null);

    try {

      const res =
        await authService.register(
          userData
        );

      setToken(res.token);
      setUser(res.user);

      return res;

    } catch (err) {

      setAuthError(
        err.message ||
        'Registration failed.'
      );

      throw err;
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {

    authService.logout();

    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  // =========================================================
  // PROFILE
  // =========================================================

  const updateProfile = async (
    profileData
  ) => {

    const res =
      await authService.updateProfile(
        profileData
      );

    if (res.user) {
      setUser(res.user);
    }

    return res;
  };

  // =========================================================
  // PASSWORD
  // =========================================================

  const changePassword = async (
    currentPassword,
    newPassword,
    confirmPassword
  ) => {

    return await authService.changePassword(
      currentPassword,
      newPassword,
      confirmPassword
    );
  };

  const forgotPassword = async (
    email
  ) => {

    return await authService.forgotPassword(
      email
    );
  };

  const resetPassword = async (
    resetToken,
    newPassword,
    confirmPassword
  ) => {

    return await authService.resetPassword(
      resetToken,
      newPassword,
      confirmPassword
    );
  };

  /*
   * App.jsx currently uses authLoading.
   * Keep both names available.
   */
  const authLoading =
    isLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,

        isAuthenticated:
          !!user && !!token,

        isLoading,
        authLoading,

        authError,
        setAuthError,

        login,
        register,
        logout,

        updateProfile,

        changePassword,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);