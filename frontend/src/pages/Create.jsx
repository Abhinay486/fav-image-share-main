import React, { useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { PinData } from "../context/PinContext";
import { useNavigate } from "react-router-dom";

const Create = () => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePrev, setFilePrev] = useState("");
  const [title, setTitle] = useState("");
  const [pin, setPin] = useState("");

  const handleClick = () => {
    inputRef.current.click();
  };

  const {addPin} = PinData();
  const navigate = useNavigate();

  const changeFileHandler = (e) => {

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFilePrev(reader.result);
        setFile(file);
      };
    }
  };

  const addPinh = (e) => {
    
    e.preventDefault();

    // Create a new FormData instance
    const formData = new FormData();
    formData.append("title", title);
    formData.append("pin", pin);
    if (file) {
      formData.append("file", file);
    }

    addPin(formData, setFilePrev, setFile, setTitle, setPin, navigate);
  };

  return (
    <div className="flex flex-col items-center mt-10">
      {/* File Upload Section */}
      <div className="w-80 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <div
          className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleClick}
        >
          {/* File Preview */}
          {filePrev && (
            <img src={filePrev} alt="Preview" className="w-24 h-24 object-cover rounded-lg mb-3" />
          )}
          
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={changeFileHandler}
          />

          {/* Upload Icon */}
          {!filePrev && (
            <div className="w-14 h-14 mb-3 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors">
              <FaPlus size={24} />
            </div>
          )}

          <p className="text-gray-600 text-sm font-medium">
            Click to upload a file
          </p>
        </div>
      </div>

      <p className="text-gray-500 text-xs mt-2">
        We recommend using high-quality images.
      </p>

      {/* Form Section */}
      <div className="mt-6 w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <form onSubmit={addPinh}>
          {/* Title Input */}
          <div className="mb-4">
            <label htmlFor="title" className="font-medium block mb-1">
              Title:
            </label>
            <input
              className="text-black p-2 border border-gray-300 rounded-md placeholder:text-sm placeholder:pl-2 focus:ring-2 focus:ring-blue-500 w-full"
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              id="title"
              placeholder="Enter title"
              value={title}
              required
            />
          </div>

          {/* Pin Input */}
          <div className="mb-4">
            <label htmlFor="pin" className="font-medium block mb-1">
              Pin:
            </label>
            <input
              className="text-black p-2 border border-gray-300 rounded-md placeholder:text-sm placeholder:pl-2 focus:ring-2 focus:ring-blue-500 w-full"
              onChange={(e) => setPin(e.target.value)}
              type="text"
              id="pin"
              placeholder="Enter pin"
              value={pin}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-600 transition-colors"
          >
            Add +
          </button>
        </form>
      </div>
    </div>
  );
};

export default Create;
