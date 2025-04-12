'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check if user is logged in - run this check more often
  const checkLoginStatus = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setIsLoggedIn(true);
          setUserData(user);
        } catch (err) {
          console.error('Error parsing user data:', err);
          // Clear invalid data
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          setUserData(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    }
  };

  // Check login status on mount and when localStorage changes
  useEffect(() => {
    checkLoginStatus();
    
    // Listen for storage changes (in case of login/logout in another tab)
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle clicks outside the profile menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('user');
    
    // Remove auth cookie by making a request to logout endpoint
    fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    })
      .then(() => {
        setIsLoggedIn(false);
        setUserData(null);
        setIsProfileMenuOpen(false);
        router.push('/');
      })
      .catch(err => console.error('Error logging out:', err));
  };

  // Navigate with router to ensure client-side navigation with cookies
  const handleNavigation = (path: string) => {
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    router.push(path);
  };

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => handleNavigation('/')} className="flex items-center bg-transparent border-none cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-xl font-bold">R</span>
              </div>
              <span className="text-xl font-semibold text-blue-700 dark:text-blue-400">RailYatra</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('/trains')}
              className="text-gray-700 hover:text-blue-700 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              Find Trains
            </button>
            <button
              onClick={() => handleNavigation('/schedules')}
              className="text-gray-700 hover:text-blue-700 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              Train Schedule
            </button>
            <button
              onClick={() => handleNavigation('/pnr')}
              className="text-gray-700 hover:text-blue-700 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              PNR Status
            </button>
            <button
              onClick={() => handleNavigation('/booking')}
              className="text-gray-700 hover:text-blue-700 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              My Bookings
            </button>
            <button
              onClick={() => handleNavigation('/about')}
              className="text-gray-700 hover:text-blue-700 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => handleNavigation('/contact')}
              className="text-gray-700 hover:text-blue-700 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              Contact Us
            </button>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {userData?.name || 'User'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isProfileMenuOpen ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{userData?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userData?.email}</p>
                    </div>
                    <button 
                      onClick={() => handleNavigation('/profile')} 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Your Profile
                    </button>
                    <button 
                      onClick={() => handleNavigation('/booking')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Your Bookings
                    </button>
                    <button 
                      onClick={() => handleNavigation('/settings')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('/login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors bg-transparent cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation('/register')}
                  className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800 transition-colors cursor-pointer border-none"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              type="button" 
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => handleNavigation('/trains')}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium text-sm dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Find Trains
              </button>
              <button 
                onClick={() => handleNavigation('/schedules')}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium text-sm dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Train Schedule
              </button>
              <button 
                onClick={() => handleNavigation('/pnr')}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium text-sm dark:text-gray-300 dark:hover:bg-gray-800"
              >
                PNR Status
              </button>
              <button 
                onClick={() => handleNavigation('/booking')}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium text-sm dark:text-gray-300 dark:hover:bg-gray-800"
              >
                My Bookings
              </button>
              <button 
                onClick={() => handleNavigation('/about')}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium text-sm dark:text-gray-300 dark:hover:bg-gray-800"
              >
                About Us
              </button>
              <button 
                onClick={() => handleNavigation('/contact')}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium text-sm dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Contact Us
              </button>

              {/* Mobile Profile Section */}
              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                {isLoggedIn ? (
                  <div className="px-4 space-y-3">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{userData?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userData?.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleNavigation('/profile')}
                      className="block w-full text-left py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Your Profile
                    </button>
                    <button 
                      onClick={() => handleNavigation('/booking')}
                      className="block w-full text-left py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Your Bookings
                    </button>
                    <button 
                      onClick={() => handleNavigation('/settings')}
                      className="block w-full text-left py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 text-red-600 hover:bg-gray-50 rounded-md text-sm dark:text-red-400 dark:hover:bg-gray-800 mt-2 border-t border-gray-200 dark:border-gray-700 pt-2"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3 px-4">
                    <button
                      onClick={() => handleNavigation('/login')}
                      className="text-left w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleNavigation('/register')}
                      className="text-left w-full px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800 transition-colors"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 