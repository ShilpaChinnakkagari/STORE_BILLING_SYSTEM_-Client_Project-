import { useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout, getAuthToken, setAuthToken } from "./api";

export const DEFAULT_EMAIL = "admin@mart.com";
export const DEFAULT_PAD = "56085341";

export function useAuth() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if token exists in memory
    const token = getAuthToken();
    if (token) {
      setAuthed(true);
    }
    setLoading(false);
    
    const handleAuthChange = () => {
      const token = getAuthToken();
      setAuthed(!!token);
    };
    
    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const login = async (email: string, pad: string) => {
    try {
      const response = await apiLogin(email, pad);
      if (response.token) {
        window.dispatchEvent(new Event("auth-change"));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    await apiLogout();
    window.dispatchEvent(new Event("auth-change"));
  };

  return { authed, loading, login, logout };
}