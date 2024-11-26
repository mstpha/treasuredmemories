import React, { useState } from 'react';
import axios from 'axios';
import worldImage from "./../assets/world.jpg";
import treasureLogo from "./../assets/logo.svg";
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      
      if (response){
        navigate("/")
      }
      
    } catch (err) {
      setError("An error occured while registering.");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="mb-8">
            <h1 className="text-white font-bold mb-1">Welcome to Register</h1>
            <p className="text-gray-400">please enter your information to register an account</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#2A1F33] text-white p-4 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#2A1F33] text-white p-4 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#2A1F33] text-white p-4 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#9C4367] hover:bg-[#863A59] text-white p-4 rounded-lg mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;