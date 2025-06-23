import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { UserData } from "../context/UserContext";
import Followersing from "./Followersing";
import { PinData } from "../context/PinContext";

const UserProfile = ({ user: loggedInUser }) => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followed, setFollowed] = useState(false);
  const [showFollowersing, setShowFollowersing] = useState(false);
  const { pin, followUser, fetchPin } = UserData();
 
useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/user/${id}`);
        setUser(data);
        setFollowed(data?.followers?.includes(loggedInUser?._id) || false);
      } catch (err) {
        setError("Failed to load user data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
     
  }, [id, loggedInUser?._id]);

  const followHandler = async () => {
    if (!user || !loggedInUser) return;

    try {
      await followUser(user._id, () => {
        setUser((prevUser) => {
          const updatedFollowers = followed
            ? prevUser.followers.filter((f) => f !== loggedInUser._id)
            : [...prevUser.followers, loggedInUser._id];

          return {
            ...prevUser,
            followers: updatedFollowers,
          };
        });
        setFollowed(!followed);
      });
    } catch (err) {
      console.error("Error following/unfollowing:", err);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96 text-center border border-gray-200 mt-20">
        <div className="flex items-center justify-center mb-4">
          <FaUserCircle className="text-gray-500 text-6xl" />
        </div>

        {user ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-600 text-sm mt-1">{user.email}</p>
          </>
        ) : (
          <p className="text-gray-500">User not found.</p>
        )}
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

      <button
        className={`border-2 px-5 py-2 rounded-lg m-2 transition-colors duration-300 ${
          followed
            ? "bg-black text-white border-black hover:bg-gray-800"
            : "border-black text-black hover:bg-gray-200"
        }`}
        onClick={followHandler}
      >
        {followed ? "Unfollow" : "Follow"}
      </button> 
    </div>
  );
};

export default UserProfile;
