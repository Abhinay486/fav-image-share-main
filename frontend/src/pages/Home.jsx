import React, { useState, useEffect } from "react";
import { PinData } from "../context/PinContext";
import LoadingAnimationpage from "../components/Loading";
import { Search, Grid, Filter, Link } from 'lucide-react';

const LoadingAnimation = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
  </div>
);

const PinCard = ({ pin, index }) => (
  <div 
    className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-gray-100"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {/* Image container */}
    <div className="relative overflow-hidden">
      <img 
        src={pin.image?.url || pin.image} 
        alt={pin.title}
        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Category badge */}
      {pin.category && (
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-gray-700 text-xs font-medium">{pin.category}</span>
        </div>
      )}

      {/* View Pin Button */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center">
        <a
          href={`/pin/${pin._id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform translate-y-2 group-hover:translate-y-0"
        >
          View Pin
        </a>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-5">
      <h3 className="text-gray-900 font-semibold text-base leading-snug mb-2">
        {pin.title}
      </h3>

      
    </div>
  </div>
);



export default function Home() {
  const { pins } = PinData();
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Filter pins based on the search query
 const filteredPins = pins?.filter((pin) => {
  const lowerSearch = search.toLowerCase().replace(/^#/, ""); // remove leading # if present

  const titleMatch = pin.title.toLowerCase().includes(lowerSearch);

  const tagsMatch = pin.tags?.some(tag =>
    tag.toLowerCase().replace(/^#/, "").includes(lowerSearch)
  );

  return titleMatch || tagsMatch;
});


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className={`text-center mb-12 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Discover Pins
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Explore endless inspiration from our creative community
          </p>
        </div>

        {/* Search Section */}
        <div className={`max-w-2xl mx-auto mb-16 transform transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          <div className="relative">
            {/* Main search container */}
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              
              {/* Search input container */}
              <div className="relative mb-6">
                <div className="relative flex items-center">
                  <Search className={`absolute left-4 w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
                  
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-base"
                    type="search"
                    placeholder="Search for amazing pins..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </div>
              </div>
              
              {/* Stats section */}
              {/* <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <p className="text-gray-900 font-bold text-xl">{pins?.length || 0}</p>
                  <p className="text-gray-600 text-sm font-medium">Total Pins</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <p className="text-gray-900 font-bold text-xl">500K+</p>
                  <p className="text-gray-600 text-sm font-medium">Community</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <p className="text-gray-900 font-bold text-xl">{filteredPins?.length || 0}</p>
                  <p className="text-gray-600 text-sm font-medium">Results</p>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={`transform transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4">
                <LoadingAnimation />
              </div>
              <p className="text-gray-600">Loading pins...</p>
            </div>
          ) : filteredPins && filteredPins.length > 0 ? (
            <>
              {/* Results header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Grid className="w-5 h-5 text-gray-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {search ? `Results for "${search}"` : "All Pins"}
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">{filteredPins.length} pins found</span>
                </div>
              </div>
              
              {/* Pin grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPins.map((pin, idx) => (
                  <div
                    key={pin._id || pin.id || idx}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <PinCard pin={pin} index={idx} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pins Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your search terms or explore our trending pins
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};