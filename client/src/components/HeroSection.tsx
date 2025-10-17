import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white dark:bg-gray-900 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        
        {/* Left Side: Text Content */}
        <div className="md:w-1/2 lg:w-5/12 text-center md:text-left">
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            Welcome to <span className="text-orange-600">Varn DigiHealth</span>
          </h1>
          
          {/* Subheading / Description */}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Manage your tasks, attendance, and performance easily on one platform. 
            Designed specifically for interns and employees, Varn DigiHealth helps you stay organized and efficient.
          </p>
          
          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 text-lg font-semibold text-white bg-orange-600 rounded-lg shadow-md hover:bg-orange-700 transition transform hover:scale-105"
            >
              🚀 Join Us
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-8 py-3 text-lg font-semibold text-orange-600 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-orange-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              🔍 Contact Us
            </button>
          </div>
          
          

        </div>

        {/* Right Side: Illustration */}
        <div className="md:w-1/2 lg:w-6/12 flex justify-center">
          <div className="relative w-full max-w-lg">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2670&auto=format&fit=crop"
              alt="Varn DigiHealth Dashboard"
              className="w-full h-auto rounded-xl shadow-2xl border-4 border-orange-200 dark:border-orange-700"
            />
            {/* Visual Elements */}
            <div className="absolute top-[-20px] left-[-20px] w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full mix-blend-multiply filter blur-sm"></div>
            <div className="absolute bottom-[-20px] right-[-20px] w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-xl transform rotate-45 mix-blend-multiply filter blur-sm"></div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
