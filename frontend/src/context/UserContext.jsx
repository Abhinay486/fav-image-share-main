import React, { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // register
  async function registerUser(name, email, password, navigate, fetchPins) {
    setBtnLoading(true);
    try {
      const { data } = await api.post("/api/user/register", { name, email, password });
      setUser(data.user);
      setIsAuth(true);
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
    try {
      const { data } = await api.get("/api/user/me");
      setUser(data.user || data);
      setIsAuth(true);
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
        setUser,
        setIsAuth,
      }}
    >
      <Toaster position="top-right" />
      {children}
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);