import React from 'react';
import logo from "/src/assets/Images/logo.png";

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mb-4">
        <img src={logo} alt="Logo" className="w-24 h-24 animate-bounce" />
      </div>
      <p className="text-xl font-bold tracking-wider">LOADING...</p>
    </div>
  );
};

export default LoadingScreen;