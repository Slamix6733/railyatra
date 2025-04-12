'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUser, FaTicketAlt, FaTrain, FaBars, FaTimes, FaChevronDown, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { Transition } from '@headlessui/react';
import DirectThemeToggle from './DirectThemeToggle';

// NavLink component for desktop navigation
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
      }`}
    >
      {children}
    </Link>
  );
}

// MobileNavLink component for mobile navigation
function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        active 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' 
          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // Check if user is logged in by looking for user data in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setIsLoggedIn(true);
          setUserData(user);
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
    }
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  const handleLogout = () => {
    // Clear user data and auth token
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    
    // Close user menu
    setIsUserMenuOpen(false);
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white dark:bg-gray-900 shadow-md py-2' 
          : 'bg-white/95 dark:bg-gray-900/95 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-blue-600 rounded-lg transform rotate-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaTrain className="text-white text-xl" />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">RailYatra</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <NavLink href="/" active={pathname === '/'}>
              Home
            </NavLink>
            <NavLink href="/trains" active={pathname.startsWith('/trains')}>
              Trains
            </NavLink>
            <NavLink href="/pnr" active={pathname.startsWith('/pnr')}>
              PNR Status
            </NavLink>
            <NavLink href="/schedules" active={pathname.startsWith('/schedules')}>
              Schedules
            </NavLink>
            <NavLink href="/about" active={pathname.startsWith('/about')}>
              About
            </NavLink>
            <NavLink href="/contact" active={pathname.startsWith('/contact')}>
              Contact
            </NavLink>
          </nav>
          
          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <DirectThemeToggle />
            
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 focus:outline-none transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600 dark:text-blue-400 text-sm" />
                  </div>
                  <span className="font-medium">{userData?.name ? userData.name.split(' ')[0] : 'User'}</span>
                  <FaChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                <Transition
                  show={isUserMenuOpen}
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaUser className="mr-2 text-blue-600 dark:text-blue-400" />
                      Your Profile
                    </Link>
                    <Link 
                      href="/profile/bookings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaTicketAlt className="mr-2 text-blue-600 dark:text-blue-400" />
                      Your Bookings
                    </Link>
                    <Link 
                      href="/profile/settings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaCog className="mr-2 text-blue-600 dark:text-blue-400" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700 w-full text-left"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="mr-2 text-blue-600 dark:text-blue-400" />
                      Sign out
                    </button>
                  </div>
                </Transition>
              </div>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="py-2 px-3 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <DirectThemeToggle />
            
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 focus:outline-none transition-colors"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
            <MobileNavLink href="/" active={pathname === '/'}>
              Home
            </MobileNavLink>
            <MobileNavLink href="/trains" active={pathname.startsWith('/trains')}>
              Trains
            </MobileNavLink>
            <MobileNavLink href="/pnr" active={pathname.startsWith('/pnr')}>
              PNR Status
            </MobileNavLink>
            <MobileNavLink href="/schedules" active={pathname.startsWith('/schedules')}>
              Schedules
            </MobileNavLink>
            <MobileNavLink href="/about" active={pathname.startsWith('/about')}>
              About
            </MobileNavLink>
            <MobileNavLink href="/contact" active={pathname.startsWith('/contact')}>
              Contact
            </MobileNavLink>
            
            {isLoggedIn ? (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <MobileNavLink href="/profile" active={pathname.startsWith('/profile')}>
                  Your Profile
                </MobileNavLink>
                <MobileNavLink href="/profile/bookings" active={pathname === '/profile/bookings'}>
                  Your Bookings
                </MobileNavLink>
                <button 
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <div className="flex flex-col space-y-2 pt-2">
                  <Link 
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="block text-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 