import React, { useEffect, useState } from 'react';
import worldImage from "./../assets/world.jpg";
import treasureLogo from "./../assets/logo.svg";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import axios from 'axios';
const LoginPage = () => {
  const [username,setName]=useState()
  const [error,setError]=useState()
  const {updateUser}=useUser()
  const navigate=useNavigate()
  const {updateMemoriesShowcase}=useUser()
  const {user}=useUser()
  useEffect(()=>{
    if (user.id){
      navigate("/map")
    }
  },[])
  const [password,setPass]=useState()
  const handleSubmit=async(e)=>{
    e.preventDefault();
    setError('');
    try{
        const response=await axios.post("http://localhost:5000/api/auth/login",{
          username,password
        })
        if (response.status==200){
          updateUser(response.data.data.user.username,response.data.data.user.id)
          updateMemoriesShowcase(response.data.data.user.id)
          localStorage.setItem('tokens', JSON.stringify(response.data.data.tokens));
          navigate("/map")
        }
        
    }
    catch (err) {
      // More detailed error handling
      if (err.response) {
          // Server responded with error
          setError(err.response.data.message || 'Login failed');
      } else if (err.request) {
          // No response received
          setError('No response from server');
      } else {
          // Other errors
          setError('Login failed');
      }
      console.error(err);
  }
  }
  return (
    <div 
      className="flex h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${worldImage})`
      }}
    >
      <div className="flex flex-1 justify-end items-center p-4 md:p-0">
        <div className="h-full w-full md:h-[80%] md:w-[40%] md:mr-12 
          bg-[#1F1625] backdrop-blur-sm rounded-lg shadow-2xl p-8 flex flex-col">
          
          {/* Centered Logo and Title Section */}
          <div className="flex flex-col items-center mb-8">
            <img 
              src={treasureLogo} 
              alt="Treasured Memories Logo" 
              className="w-[100%] h-60 mb-4 object-contain"
            />
          </div>

          {/* Welcome Text */}
          <div className=" mb-8">
            <h1 className="text-white font-bold mb-1">Welcome to login</h1>
            <p className="text-gray-400">please enter your login information</p>
          </div>

          {/* Login Form */}
          <div className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="username"
              onChange={(e)=>setName(e.target.value)}
              className="bg-[#2A1F33] text-white p-4 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input 
              type="password" 
              onChange={(e)=>setPass(e.target.value)}
              placeholder="password"
              className="bg-[#2A1F33] text-white p-4 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
                      
            <button onClick={handleSubmit} className="bg-[#9C4367] hover:bg-[#863A59] text-white p-4 rounded-lg mt-4 transition-colors">
              Log in
            </button>
            <button onClick={()=>{navigate("/register")}} className="bg-[#9C4367] hover:bg-[#863A59] text-white p-4 rounded-lg mt-4 transition-colors">
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;