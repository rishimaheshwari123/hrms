import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Company Info */}
        <div>
          <h2 className="text-2xl font-bold text-orange-600 mb-3">Varn DigiHealth</h2>
          <p className="text-sm leading-relaxed">
            Empowering organizations with intelligent HRMS software solutions. 
            Simplify HR operations, payroll, and employee management efficiently.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-orange-600 mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-orange-600 transition">Home</a></li>
            <li><a href="/login" className="hover:text-orange-600 transition">Login</a></li>
            <li><a href="/signup" className="hover:text-orange-600 transition">Register</a></li>
            <li><a href="/contact" className="hover:text-orange-600 transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-lg font-semibold text-orange-600 mb-3">Contact Us</h3>
          <div className="flex items-center space-x-2 text-sm mb-2">
            <Mail size={16} className="text-orange-600" />
            <a href="mailto:info@varndigihealth.com" className="hover:text-orange-600 transition">
              info@varndigihealth.com
            </a>
          </div>
          <div className="flex items-center space-x-2 text-sm mb-4">
            <Phone size={16} className="text-orange-600" />
            <span>+91 1234567890</span>
          </div>

          <div className="flex space-x-4">
            <a href="#" className="hover:text-orange-600 transition"><Facebook size={18} /></a>
            <a href="#" className="hover:text-orange-600 transition"><Twitter size={18} /></a>
            <a href="#" className="hover:text-orange-600 transition"><Linkedin size={18} /></a>
            <a href="#" className="hover:text-orange-600 transition"><Instagram size={18} /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Varn DigiHealth. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
