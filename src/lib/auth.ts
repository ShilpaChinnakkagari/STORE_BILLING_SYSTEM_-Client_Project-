import { useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout, getAuthToken, setAuthToken } from "./api";

const KEY = "grocery.auth.v1";
export const DEFAULT_EMAIL = "admin@mart.com";
export const DEFAULT_PAD = "56085341";

export function useAuth() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if token exists in memory (from previous session)
    const token = getAuthToken();
    const storedAuth = localStorage.getItem(KEY) === "1";
    
    if (token && storedAuth) {
      setAuthed(true);
    }
    setLoading(false);
    
    const handleStorage = () => {
      setAuthed(localStorage.getItem(KEY) === "1");
    };
    
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-change", handleStorage);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleStorage);
    };
  }, []);

  const login = async (email: string, pad: string) => {
    try {
      const response = await apiLogin(email, pad);
      if (response.token) {
        localStorage.setItem(KEY, "1");
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
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("auth-change"));
  };

  return { authed, loading, login, logout };
}