import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const PinContext = createContext();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const CACHE_PINS_KEY = "pinsData";
const CACHE_PIN_PREFIX = "pinData_";
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

export const PinProvider = ({ children }) => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState(null);

  async function fetchPins() {
    setLoading(true);
    const cached = getCache(CACHE_PINS_KEY);
    if (cached) {
      setPins(cached);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/api/pin/all");
      setPins(data);
      setCache(CACHE_PINS_KEY, data);
    } catch (error) {
      console.error("Fetch pins failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPin(id) {
    setLoading(true);
    const cacheKey = `${CACHE_PIN_PREFIX}${id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      setPin(cached);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get(`/api/pin/${id}`);
      setPin(data);
      setCache(cacheKey, data);
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
      // Invalidate cache for this pin and all pins
      localStorage.removeItem(`${CACHE_PIN_PREFIX}${id}`);
      localStorage.removeItem(CACHE_PINS_KEY);
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
      // Invalidate cache for this pin
      localStorage.removeItem(`${CACHE_PIN_PREFIX}${id}`);
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
      // Invalidate cache for this pin
      localStorage.removeItem(`${CACHE_PIN_PREFIX}${id}`);
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
      // Invalidate all pins and this pin's cache
      localStorage.removeItem(CACHE_PINS_KEY);
      localStorage.removeItem(`${CACHE_PIN_PREFIX}${id}`);
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
      // Invalidate all pins cache
      localStorage.removeItem(CACHE_PINS_KEY);
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
