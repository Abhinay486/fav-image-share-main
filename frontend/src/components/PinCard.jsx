import React from "react";
import { Link } from "react-router-dom";

const PinCard = ({ pin }) => {
  return (
    <div className="group relative bg-white shadow-lg rounded-2xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl">
      {/* Pin Image */}
      <img
        src={pin.image.url}
        alt={pin.title}
        className="w-full h-56 object-cover"
      />

      {/* View Pin Button */}
      <Link
        to={`/pin/${pin._id}`}
        className="absolute inset-x-0 bottom-4 mx-auto w-max bg-[#1d87db] text-white  px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        View Pin
      </Link>
    </div>
  );
};

export default PinCard;
