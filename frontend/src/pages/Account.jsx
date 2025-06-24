import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { UserData } from "../context/UserContext";
import Followersing from "./Followersing";

// create a pre-configured axios instance here
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const CACHE_KEY = "accountUser";
const CACHE_EXPIRE = 3600 * 1000; // 1 hour

const Account = ({ user }) => {
  const [showFollowersing, setShowFollowersing] = useState(false);
  const [cachedUser, setCachedUser] = useState(user);
  const navigate = useNavigate();
  const { setIsAuth, setUser } = UserData();

  // Cache user data on mount or when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: user, timestamp: Date.now() })
      );
      setCachedUser(user);
    } else {
      // Try to load from cache if user is not provided
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRE;
        if (!isExpired) {
          setCachedUser(parsed.data);
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    }
  }, [user]);

  const logOutHand = async () => {
    try {
      const { data } = await api.get("/api/user/logout");
      toast.success(data.message);
      navigate("/login");
      setIsAuth(false);
      setUser(null);
      localStorage.removeItem(CACHE_KEY); // Clear cache on logout
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (!cachedUser) return null; // or a loading state

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96 text-center border border-gray-200 mt-20">
        {/* Profile Icon */}
        <div className="flex items-center justify-center mb-4">
          <FaUserCircle className="text-gray-500 text-6xl" />
        </div>

        {/* User Info */}
        <h1 className="text-2xl font-bold text-gray-800">{cachedUser.name}</h1>
        <p className="text-gray-600 text-sm mt-1">{cachedUser.email}</p>

        {/* Logout Button */}
        <button
          onClick={logOutHand}
          className="mt-6 bg-[#1d87db] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:text-[#1d87db] transition duration-300"
        >
          Logout
        </button>
      </div>
      <div className="flex gap-3 m-2 mt-3 items-center">
        <p>{cachedUser?.followers?.length || 0} followers</p>
        <p>|</p>
        <p>{cachedUser?.following?.length || 0} following</p>

        <div className="flex flex-col items-center relative">
          <button
            type="button"
            onClick={() => setShowFollowersing(!showFollowersing)}
            className="ml-3 text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 
              hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 
              dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 
              font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            View
          </button>

          {showFollowersing && (
            <Followersing
              user={cachedUser}
              followers={cachedUser.followers}
              following={cachedUser.following}
              onClose={() => setShowFollowersing(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;