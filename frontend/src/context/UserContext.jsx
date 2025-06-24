import React, { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const CACHE_USER_KEY = "userData";
const CACHE_EXPIRE = 3600 * 1000; // 1 hour

function getCache(key) {
  const cached = localStorage.getItem(key);
  if (cached) {
    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRE;
    if (!isExpired) return parsed.data;
    localStorage.removeItem(key);
  }
  return null;
}

function setCache(key, data) {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCache(CACHE_USER_KEY));
  const [isAuth, setIsAuth] = useState(!!getCache(CACHE_USER_KEY));
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // register
  async function registerUser(name, email, password, navigate, fetchPins) {
    setBtnLoading(true);
    try {
      const { data } = await api.post("/api/user/register", { name, email, password });
      setUser(data.user);
      setIsAuth(true);
      setCache(CACHE_USER_KEY, data.user);
      toast.success("Registration successful!");
      navigate("/");
      fetchPins();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setBtnLoading(false);
    }
  }

  // login
  async function loginUser(email, password, navigate, fetchPins) {
    setBtnLoading(true);
    try {
      const { data } = await api.post("/api/user/login", { email, password });
      setUser(data.user);
      setIsAuth(true);
      setCache(CACHE_USER_KEY, data.user);
      toast.success("Login successful!");
      navigate("/");
      fetchPins();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setBtnLoading(false);
    }
  }

  // fetch current user
  async function fetchUser() {
    // Try cache first
    const cached = getCache(CACHE_USER_KEY);
    if (cached) {
      setUser(cached);
      setIsAuth(true);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/api/user/me");
      setUser(data.user || data);
      setIsAuth(true);
      setCache(CACHE_USER_KEY, data.user || data);
    } catch (error) {
      console.error("Fetch user failed:", error);
    } finally {
      setLoading(false);
    }
  }

  // follow/unfollow
  async function followUser(id, refreshUser) {
    try {
      const { data } = await api.post(`/api/user/follow/${id}`);
      toast.success(data.message);
      localStorage.removeItem(CACHE_USER_KEY); // Invalidate cache
      refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        registerUser,
        loginUser,
        followUser,
        user,
        isAuth,
        loading,
        btnLoading,
        setUser: (u) => {
          setUser(u);
          if (u) setCache(CACHE_USER_KEY, u);
          else localStorage.removeItem(CACHE_USER_KEY);
        },
        setIsAuth,
      }}
    >
      <Toaster position="top-right" />
      {children}
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);