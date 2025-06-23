import React, { useState } from "react";
import { logOut } from "../../../backend/controllers/userControllers";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { UserData } from "../context/UserContext";
import Followersing from "./Followersing";

const Account = ({ user }) => {
      const [showFollowersing, setShowFollowersing] = useState(false);
    
    const navigate = useNavigate();
    const {setIsAuth, setUser} = UserData();
  const logOutHand = async() => {
    try {
        const {data} = await axios.get("api/user/logout");
        toast.success(data.message);
        navigate("/login");
        setIsAuth(false);
        setUser([])
    } catch (error) {
        toast.error(error.response.data.message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96 text-center border border-gray-200 mt-20">
        {/* Profile Icon */}
        <div className="flex items-center justify-center mb-4">
          <FaUserCircle className="text-gray-500 text-6xl" />
        </div>

        {/* User Info */}
        <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
        <p className="text-gray-600 text-sm mt-1">{user.email}</p>

        {/* Logout Button */}
        <button
          onClick={logOutHand}
          className="mt-6 bg-[#1d87db] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:text-[#1d87db] transition duration-300"
        >
          Logout
        </button>
      </div>
      <div className="flex gap-3 m-2 mt-3 items-center">
        <p>{user?.followers?.length || 0} followers</p>
        <p>|</p>
        <p>{user?.following?.length || 0} following</p>

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
              user={user}
              followers={user.followers}
              following={user.following}
              onClose={() => setShowFollowersing(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
