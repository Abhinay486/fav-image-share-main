import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const PinContext = createContext();

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ← reads VITE_API_BASE_URL
  withCredentials: true, // if you need cookies/auth
});

export const PinProvider = ({ children }) => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPins() {
    try {
      const { data } = await api.get("/api/pin/all");
      setPins(data);
    } catch (error) {
      console.error("Fetch pins failed:", error);
    } finally {
      setLoading(false);
    }
  }

  const [pin, setPin] = useState(null);

  async function fetchPin(id) {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/pin/${id}`);
      setPin(data);
    } catch (error) {
      console.error("Fetch pin failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updatePin(id, title, pinValue, setEdit) {
    try {
      const { data } = await api.put(`/api/pin/${id}`, { title, pin: pinValue });
      toast.success(data.message);
      await fetchPin(id);
      setEdit(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  async function addComment(id, comment, setComment) {
    try {
      const { data } = await api.post(`/api/pin/comment/${id}`, { comment });
      toast.success(data.message);
      await fetchPin(id);
      setComment("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  async function deleteComment(id, commentId) {
    try {
      const { data } = await api.delete(`/api/pin/comment/${id}`, {
        params: { commentId },
      });
      toast.success(data.message);
      await fetchPin(id);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  async function deletePin(id, navigate) {
    setLoading(true);
    try {
      const { data } = await api.delete(`/api/pin/${id}`);
      toast.success(data.message);
      navigate("/");
      await fetchPins();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addPin(
    formData,
    setFilePrev,
    setFile,
    setTitle,
    setPin,
    navigate
  ) {
    try {
      const { data } = await api.post("/api/pin/new", formData);
      toast.success(data.message);
      setFile([]);
      setFilePrev("");
      setPin("");
      setTitle("");
      await fetchPins();
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  useEffect(() => {
    fetchPins();
  }, []);

  return (
    <PinContext.Provider
      value={{
        pins,
        loading,
        fetchPin,
        pin,
        updatePin,
        addComment,
        deleteComment,
        deletePin,
        addPin,
        fetchPins,
      }}
    >
      {children}
    </PinContext.Provider>
  );
};

export const PinData = () => useContext(PinContext);
