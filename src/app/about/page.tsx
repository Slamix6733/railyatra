'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrain, FaRoute, FaTicketAlt, FaUserShield, FaMobile, FaClock, FaHistory, FaLightbulb, FaAward, FaSearch, FaLock, FaBell } from 'react-icons/fa';
import { FaTrainSubway } from 'react-icons/fa6';
import { MdGroups } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function AboutPage() {
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
              About RailYatra
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transforming the way you travel by train across India
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div 
        className="container mx-auto px-4 py-12 bg-gray-100 dark:bg-gray-800 rounded-3xl my-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
              <MdGroups className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Team</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Meet the talented individuals behind the RailYatra project.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Team Member 1 */}
          <motion.div 
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden">
              <Image 
                src="/images/team/shreyas.jpeg" 
                alt="Shreyas Jaiswal" 
                width={112} 
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Shreyas Jaiswal</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">Team Member</p>
          </motion.div>
          
          {/* Team Member 2 */}
          <motion.div 
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden">
              <Image 
                src="/images/team/anurag.jpeg" 
                alt="Anurag Nath" 
                width={112} 
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Anurag Nath</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">Team Member</p>
          </motion.div>
          
          {/* Team Member 3 */}
          <motion.div 
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden">
              <Image 
                src="/images/team/Rakshit.jpg" 
                alt="Rakshit Singhal" 
                width={112} 
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Rakshit Singhal</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">Team Member</p>
          </motion.div>
          
          {/* Team Member 4 */}
          <motion.div 
            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden">
              <Image 
                src="/images/team/harshit.jpg" 
                alt="Harshit" 
                width={112} 
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Harshit</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">Team Member</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Section */}
      <motion.div 
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="flex items-center mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
              <FaHistory className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">About Our Project</h2>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <motion.p 
              className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              The goal of this mini project is to provide a realistic experience in conceptual design, logical design, implementation, operation, and maintenance of a small relational database for an Indian Railway Ticket Reservation System.
            </motion.p>
            <motion.p 
              className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              The application is a railway ticket reservation system that allows passengers to book, modify, and cancel tickets. The system also tracks train schedules, seat availability, and payments.
            </motion.p>
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Key Features:</h3>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-600 dark:text-gray-400">
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 1.1 }}>
                  Passengers can book tickets for available trains.
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 1.2 }}>
                  Tickets can be booked under different classes (Sleeper, AC 3-tier, AC 2-tier, First Class, etc.).
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 1.3 }}>
                  Seat availability and PNR status tracking.
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 1.4 }}>
                  Waitlist and RAC (Reservation Against Cancellation) system.
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 1.5 }}>
                  Online and counter ticket bookings with different payment modes.
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 1.6 }}>
                  Train schedules, routes, and stations management.
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 1.7 }}>
                  Cancellation and refund processing.
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 1.8 }}>
                  Concession categories for senior citizens, students, and disabled passengers.
                </motion.li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="container mx-auto px-4 py-10 mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <motion.div 
          className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-8 shadow-lg"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-12">
              <motion.h2 
                className="text-2xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                Ready to Experience RailYatra?
              </motion.h2>
              <motion.p 
                className="text-blue-100 mb-6 max-w-xl text-base leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                Book your train tickets easily and conveniently with our user-friendly platform.
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/trains" 
                    className="px-6 py-3 bg-white text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Book Tickets
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/contact" 
                    className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg border border-blue-500 hover:bg-blue-500 transition-colors"
                  >
                    Contact Us
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 