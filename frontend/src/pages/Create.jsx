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
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    inputRef.current.click();
  };

  const { addPin } = PinData();
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

  const addPinh = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Create a new FormData instance
    const formData = new FormData();
    formData.append("title", title);
    formData.append("pin", pin);
    if (file) {
      formData.append("file", file);
    }

    try {
      await addPin(formData, setFilePrev, setFile, setTitle, setPin, navigate);
    } catch (error) {
      console.error("Error adding pin:", error);
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-4 rounded-md font-semibold transition-colors flex justify-center items-center`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Add +'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Create;