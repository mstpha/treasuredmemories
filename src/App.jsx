import React, { useState } from 'react';
import Map from '/src/Map/Map';
import "./index.css";
import LoginPage from './auth/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './auth/Register';
import { UserProvider } from './context/userContext';
import Navbar from './navBar';
import Dashboard from './Dashboard/Dashboard';

function App() {
  return (
    <UserProvider>
    <div className="h-screen w-screen overflow-hidden">
      <BrowserRouter>
      <Navbar />

        <Routes>
          <Route path="/dbadmtm" element={<Dashboard/>}/>
          <Route path="/" element={<LoginPage />} />
          <Route path="/map" element={<Map />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
      </div>
    </UserProvider>

  );
}

export default App;