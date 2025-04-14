'use client';

import TrainSearch from '@/components/TrainSearch';
import { MdDirectionsRailway, MdOutlineSchedule, MdOutlineChair, MdStar, MdAccessTime, MdSecurity, MdSupport } from 'react-icons/md';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TrainsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Find and Book Train Tickets
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover the easiest way to search, compare and book train tickets across India
            </motion.p>
          </div>
        </div>
      </motion.div>
      
      {/* Train Search */}
      <motion.div 
        className="container mx-auto px-4 -mt-14 z-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <TrainSearch />
        </div>
      </motion.div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 mt-12">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Book With Us?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enjoy a seamless booking experience with features designed to make your journey planning easy and stress-free.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdStar className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Best Prices</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              We offer competitive prices with no hidden fees. Get the best deals on train tickets across all routes.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdAccessTime className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Quick Booking</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Book your tickets in minutes with our simple and fast booking process. Save time and effort.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdSecurity className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Secure Payments</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Your payment information is always secure with our state-of-the-art encryption technology.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Information Sections */}
      <motion.div 
        className="container mx-auto px-4 py-16 bg-gray-100 dark:bg-gray-800 rounded-3xl my-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Popular Trains */}
          <motion.div 
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdDirectionsRailway className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Popular Trains</h2>
            </div>
            <ul className="space-y-4">
              <motion.li 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Rajdhani Express</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">New Delhi - Mumbai</div>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">Premium</span>
              </motion.li>
              <motion.li 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Shatabdi Express</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">New Delhi - Bhopal</div>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">Premium</span>
              </motion.li>
              <motion.li 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Duronto Express</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">Howrah - New Delhi</div>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">Premium</span>
              </motion.li>
              <motion.li 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Vande Bharat Express</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">New Delhi - Varanasi</div>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">New</span>
              </motion.li>
            </ul>
            <div className="mt-6 text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/trains/popular"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
                >
                  View all popular routes
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Train Schedules */}
          <motion.div 
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdOutlineSchedule className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Train Schedules</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-base leading-relaxed">
              Find complete train schedules including departure and arrival times at all stations on the route.
            </p>
            <ul className="space-y-4">
              <motion.li 
                className="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-gray-900 dark:text-white">New Delhi</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300 font-medium">05:55</div>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 border-b border-dashed border-gray-300 dark:border-gray-500"></div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">14h 15m</div>
                  <div className="flex-1 border-b border-dashed border-gray-300 dark:border-gray-500"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900 dark:text-white">Mumbai Central</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300 font-medium">21:45</div>
                </div>
              </motion.li>
            </ul>
            <div className="mt-6 text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/schedules" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
                >
                  View all schedules
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Seat Availability */}
          <motion.div 
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdOutlineChair className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Seat Availability</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-base leading-relaxed">
              Check real-time seat availability across different classes and quotas before booking.
            </p>
            <div className="space-y-4">
              <motion.div 
                className="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">Sleeper Class (SL)</div>
                  <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded-full">Available</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-2">General & Tatkal Quota</div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{width: '70%'}}></div>
                </div>
              </motion.div>
              <motion.div 
                className="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">AC 3 Tier (3A)</div>
                  <div className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-0.5 rounded-full">Limited</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-2">General Quota</div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{width: '30%'}}></div>
                </div>
              </motion.div>
            </div>
            <div className="mt-6 text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/availability" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
                >
                  Check seat availability
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Help Section */}
      <div className="container mx-auto px-4 py-16 mb-20">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-12 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-12">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <MdSupport className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Need Help Booking Tickets?</h2>
              </div>
              <p className="text-blue-100 mb-8 max-w-xl text-base leading-relaxed">
                Our customer service team is available 24/7 to assist you with your booking needs. Get quick answers to common questions or speak with our support team.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link 
                  href="/contact" 
                  className="px-6 py-3.5 bg-white text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Contact Support
                </Link>
                <Link 
                  href="/faq" 
                  className="px-6 py-3.5 bg-blue-600 text-white text-sm font-medium rounded-lg border border-blue-500 hover:bg-blue-500 transition-colors"
                >
                  View FAQs
                </Link>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <div className="bg-white dark:bg-gray-800 p-7 rounded-xl shadow-inner">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Popular Questions</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/faq/cancellation" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      How do I cancel my ticket?
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq/refund" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      What is the refund policy?
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq/tatkal" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      How to book Tatkal tickets?
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 