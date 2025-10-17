import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 md:py-32">
      {/* मुख्य कंटेनर में flex और items-stretch है, जो दोनों बच्चों को समान ऊँचाई देगा */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch gap-12">

        {/* लेफ्ट साइड: Illustration / Info */}
        {/* flex-grow को सुनिश्चित करने के लिए w-1/2 के साथ h-auto (डिफ़ॉल्ट) रखें */}
        <div className="md:w-1/2 flex justify-center items-center">
          {/* max-w-md को h-full के साथ हटाएँ, और इलस्ट्रेशन कंटेनर को flex-grow/h-full दें */}
          <div className="relative w-full h-full"> 
            <img
              src="https://etimg.etb2bimg.com/photo/119332875.cms"
              alt="Contact Illustration"
              // इलस्ट्रेशन को अपने पैरेंट की पूरी ऊँचाई लेने के लिए h-full और object-cover दें
              className="w-full h-full object-cover rounded-xl shadow-2xl border-4 border-orange-200 dark:border-orange-700"
            />
            {/* अन्य divs (effects) */}
            <div className="absolute top-[-20px] left-[-20px] w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full mix-blend-multiply filter blur-sm"></div>
            <div className="absolute bottom-[-20px] right-[-20px] w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-xl transform rotate-45 mix-blend-multiply filter blur-sm"></div>
          </div>
        </div>

        {/* राइट साइड: Contact Form */}
        {/* यह सेक्शन अपनी सामग्री के आधार पर ऊँचाई सेट करेगा, और items-stretch के कारण इलस्ट्रेशन सेक्शन भी उसी ऊँचाई तक फैल जाएगा। */}
        <div className="md:w-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            Have questions or want to try Varn DigiHealth? Send us a message and we’ll respond promptly.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-500"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-500"
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-orange-700 transition font-semibold"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};

export default ContactSection;