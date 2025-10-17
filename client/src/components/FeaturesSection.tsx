import React from 'react';
import { Users, Calendar, ClipboardCheck } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
          Why Choose <span className="text-orange-600">Varn DigiHealth</span>?
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12">
          Simplify HR management, stay organized, and track your work efficiently.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Feature 1: Employee Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition">
            <Users size={48} className="text-orange-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Employee Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Manage intern and employee data, profiles, and tasks easily in one place.
            </p>
          </div>

          {/* Feature 2: Attendance Tracking */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition">
            <Calendar size={48} className="text-orange-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Attendance Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keep track of your work hours, leave, and attendance effortlessly.
            </p>
          </div>

          {/* Feature 3: Performance Monitoring */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition">
            <ClipboardCheck size={48} className="text-orange-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Performance Monitoring</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track your progress and get feedback to improve your performance.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
