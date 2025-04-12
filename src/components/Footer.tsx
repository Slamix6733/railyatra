import Link from 'next/link';
import { FaTrain, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 animate-fadeIn">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-blue-500 rounded-lg transform rotate-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaTrain className="text-white text-xl" />
                </div>
              </div>
              <span className="text-xl font-bold text-white">RailYatra</span>
            </div>
            
            <p className="text-gray-300 mb-6">
              Your trusted companion for train travel in India. Book tickets, check schedules, and enjoy a seamless journey experience.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/trains" className="text-gray-300 hover:text-white transition-colors">
                  Find Trains
                </Link>
              </li>
              <li>
                <Link href="/schedules" className="text-gray-300 hover:text-white transition-colors">
                  Train Schedules
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/booking/confirmed" className="text-gray-300 hover:text-white transition-colors">
                  PNR Status
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Travel Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Travel Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/travel-tips" className="text-gray-300 hover:text-white transition-colors">
                  Travel Tips
                </Link>
              </li>
              <li>
                <Link href="/stations" className="text-gray-300 hover:text-white transition-colors">
                  Railway Stations
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-gray-300 hover:text-white transition-colors">
                  Travel Rules
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="text-gray-300 hover:text-white transition-colors">
                  Cancellation & Refund
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-blue-400 mt-1 mr-3" />
                <span className="text-gray-300">
                  123 Railway Avenue, Mumbai<br />
                  Maharashtra, 400001
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-blue-400 mr-3" />
                <span className="text-gray-300">+91 9876543210</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-blue-400 mr-3" />
                <a href="mailto:support@railyatra.com" className="text-gray-300 hover:text-white transition-colors">
                  support@railyatra.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} RailYatra. All rights reserved.
            </p>
            
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 