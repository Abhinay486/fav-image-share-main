import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { UserData } from '../context/UserContext';
import  LoadingAnimationbtn  from '../components/Loading';
import { PinData } from '../context/PinContext';

const Register = () => {

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
      const [password, setPassword] = useState('');
      
      const {registerUser, btnLoading} = UserData();
      const navigate = useNavigate();
    const {fetchPins} = PinData();
      
      
      const submitHandler = (e) => {
        e.preventDefault();
        console.log("Name : ", name, " Email:", email, " Password:", password);
        registerUser(name,  email, password, navigate, fetchPins)
    };
      
      
  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-slate-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-1">Register</h2>

        <form onSubmit={submitHandler} className="flex flex-col gap-2">
        <label htmlFor="name" className="font-medium">Username:</label>
          <input
            className="text-black p-2 border-[1.5px] rounded-md placeholder:text-sm placeholder:pl-2 focus:ring-2 focus:ring-blue-500 w-full"
            onChange={(e) => setName(e.target.value)}
            type="text"
            id="name"
            placeholder="Enter your Name"
            value={name}
            required
          />


          <label htmlFor="email" className="font-medium">Username:</label>
          <input
            className="text-black p-2 border-[1.5px] rounded-md placeholder:text-sm placeholder:pl-2 focus:ring-2 focus:ring-blue-500 w-full"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            required
          />

          <label htmlFor="password" className="font-medium">Password:</label>
          <input
            className="text-black p-2 border-[1.5px] rounded-md placeholder:text-sm placeholder:pl-2 focus:ring-2 focus:ring-blue-500 w-full"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            required
          />

          <button 
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition"
            disabled={btnLoading}
          >
            {
                btnLoading ?  <LoadingAnimationbtn /> : "Register"
            }
          </button>
          <br />
         <div className='flex justify-center gap-2'>
            Already have an account? <Link to="/login" className='hover:text-red-600 border-b-[1.5px] border-black hover:border-red-600'>Login</Link>
         </div>
        </form>
      </div>
    </div>
    </>
  )
}

export default Register