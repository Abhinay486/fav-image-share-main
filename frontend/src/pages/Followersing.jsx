import axios from "axios";
import { useState, useEffect } from "react";

const Followersing = ({ user, followers, following, onClose }) => {
  const [followerNames, setFollowerNames] = useState({});
  const [followingNames, setFollowingNames] = useState({});

  useEffect(() => {
    const fetchNames = async (ids, setNames) => {
      const namesMap = {};
      await Promise.all(ids.map(async (id) => {
        try {
          const res = await axios.get(`/api/user/${id}`);
          namesMap[id] = res.data.name;
        } catch {
          namesMap[id] = "Unknown";
        }
      }));
      setNames(namesMap);
    };

    fetchNames(followers, setFollowerNames);
    fetchNames(following, setFollowingNames);
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [followers, following]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-4xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 transition-all">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          {/* Followers */}
          <div className="border-r sm:border-r border-gray-200 pr-4">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Followers</h2>
            <ul className="space-y-3">
              {followers.length > 0 ? (
                followers.map((f) => (
                  <li key={f} className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center shadow-sm  text-lg">
                    {followerNames[f] || <span className="text-gray-400 italic">Loading...</span>}
                  </li>
                ))
              ) : (
                <p className="text-gray-400 italic text-center">No followers yet</p>
              )}
            </ul>
          </div>

          {/* Following */}
          <div className="pl-0 sm:pl-4">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Following</h2>
            <ul className="space-y-3">
              {following.length > 0 ? (
                following.map((f) => (
                  <li key={f} className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center shadow-sm">
                    {followingNames[f] || <span className="text-gray-400 italic">Loading...</span>}
                  </li>
                ))
              ) : (
                <p className="text-gray-400 italic text-center">Not following anyone</p>
              )}
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={onClose}
            className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-900 transition-all duration-200"
          >
            Close
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default Followersing;
