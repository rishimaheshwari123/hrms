import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import React from 'react';

const FeatureIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-700/30 rounded-full flex items-center justify-center mb-4">
    <span className="text-3xl text-orange-600 dark:text-orange-400">
      {children}
    </span>
  </div>
);

const AboutPage = () => {
  return (
    <>
      <Navbar/>
      <section className="bg-white dark:bg-gray-900 py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

          {/* 1. Hero / About Section */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            {/* Left Side: Content */}
            <div className="md:w-1/2 text-center md:text-left">
              <span className="text-sm font-semibold uppercase text-orange-600 dark:text-orange-400 mb-2 block tracking-wider">
                Our Story
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight">
                Revolutionizing HR Management
                <span className="text-orange-600 dark:text-orange-500 block">For The Digital Era.</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed mb-4">
                Varn DigiHealth is an intelligent HRMS software designed specifically for managing employee data, attendance, payroll, and performance efficiently.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed">
                Our platform helps organizations streamline HR processes and empowers employees and managers with real-time, actionable insights, making work simple and transparent.
              </p>
            </div>

            {/* Right Side: Image */}
            <div className="md:w-1/2 flex justify-center md:justify-end order-first md:order-last">
              <div className="relative w-full max-w-md md:max-w-lg">
                <img
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2670&auto=format&fit=crop"
                  alt="Varn DigiHealth Office"
                  className="w-full h-auto rounded-3xl shadow-2xl border-4 border-orange-500/50 dark:border-orange-700/50 transform rotate-1 hover:rotate-0 transition duration-500 ease-in-out"
                />
              </div>
            </div>
          </div>

          {/* 2. Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl text-center md:text-left">
              <FeatureIcon>🚀</FeatureIcon>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">Our Vision</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg md:text-base">
                To empower organizations with a seamless, automated HR experience where employee management, payroll, and performance tracking are simple, transparent, and integrated.
              </p>
            </div>
            {/* Mission */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl text-center md:text-left">
              <FeatureIcon>🎯</FeatureIcon>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">Our Mission</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg md:text-base">
                To provide an all-in-one HRMS platform that simplifies HR processes, improves employee engagement, and helps businesses make data-driven HR decisions effortlessly and accurately.
              </p>
            </div>
          </div>

          {/* 3. Features / Why Choose Us */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
              The <span className="text-orange-600">Varn Advantage</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 text-center shadow-lg hover:scale-105 transition-transform duration-300">
                <FeatureIcon>👥</FeatureIcon>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2">User-Friendly</h3>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                  Intuitive interface designed for HR teams and employees with minimal training.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 text-center shadow-lg hover:scale-105 transition-transform duration-300">
                <FeatureIcon>🛡️</FeatureIcon>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2">Secure & Reliable</h3>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                  Protect sensitive employee data with modern encryption and enterprise-grade security measures.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 text-center shadow-lg hover:scale-105 transition-transform duration-300">
                <FeatureIcon>⚙️</FeatureIcon>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2">All-in-One HRMS</h3>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                  Manage payroll, attendance, leave, and performance from a unified platform effortlessly.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Call to Action */}
          <div className="bg-orange-600 dark:bg-orange-700 p-10 md:p-12 rounded-3xl text-center shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 md:mb-6">
              Ready to Simplify Your HR?
            </h3>
            <p className="text-orange-100 text-lg md:text-xl mb-6 md:mb-8">
              Join hundreds of businesses benefiting from modern, intelligent HR management.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 border border-transparent text-base md:text-lg font-medium rounded-full text-orange-600 bg-white hover:bg-gray-100 transition duration-300 shadow-lg"
            >
              Get a Free Demo Today
            </a>
          </div>

        </div>
      </section>
      <Footer/>
    </>
  );
};

export default AboutPage;
