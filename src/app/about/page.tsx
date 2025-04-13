'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrain, FaRoute, FaTicketAlt, FaUserShield, FaMobile, FaClock, FaHistory, FaLightbulb, FaAward, FaSearch, FaLock, FaBell } from 'react-icons/fa';
import { FaTrainSubway } from 'react-icons/fa6';
import { MdGroups } from 'react-icons/md';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">About RailYatra</h1>
            <p className="text-xl text-blue-100 mb-10 animate-fadeIn" style={{animationDelay: '200ms'}}>
              Transforming the way you travel by train across India
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
              <FaHistory className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Story</h2>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-16">
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6">
              Founded in 2023, RailYatra began with a simple mission: to make train travel across India more accessible, convenient, and enjoyable for everyone. Our team of travel enthusiasts and technology experts came together to create a platform that addresses the common challenges faced by train travelers.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              What started as a small startup has now grown into one of India's most trusted train ticket booking platforms, serving millions of travelers each year. Through continuous innovation and an unwavering commitment to customer satisfaction, we're revolutionizing the way people book and experience train journeys.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="container mx-auto px-4 py-20 bg-gray-100 dark:bg-gray-800 rounded-3xl my-20">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
              <FaLightbulb className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mission & Vision</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              To simplify train travel through intuitive technology and exceptional service, making it accessible and convenient for every Indian traveler, regardless of their tech-savviness or prior travel experience.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Our Vision</h3>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              To become the most trusted platform for train travel in India, setting new standards for customer experience through innovation, reliability, and personalized service.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
              <FaAward className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Sets Us Apart</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our features are designed to provide you with the most seamless and enjoyable train booking experience possible.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <FaTrainSubway className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Instant Booking</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Book your train tickets within minutes, with real-time seat availability and instant confirmations.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <FaSearch className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Smart Search</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Find the perfect train with our advanced filters for time, class, quota, and more.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <FaLock className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Secure Payments</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Your transactions are protected with bank-grade security and multiple payment options.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <FaMobile className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Mobile Friendly</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Book, manage, and track your journeys on the go with our responsive mobile experience.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <FaBell className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Real-time Updates</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Stay informed with timely alerts about your booking status, train schedules, and more.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <FaTrainSubway className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Comprehensive Coverage</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Access all trains, routes, and stations across the Indian Railways network in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-20 bg-gray-100 dark:bg-gray-800 rounded-3xl my-20">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
              <MdGroups className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meet Our Team</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our dedicated team of professionals works tirelessly to make your train journey as smooth as possible.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">A</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Aman Sharma</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">Founder & CEO</p>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              A passionate entrepreneur with 15 years of experience in the travel industry, Aman's vision drives our mission to transform train travel.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">P</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Priya Patel</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">Chief Technology Officer</p>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              With a background in both railway operations and software development, Priya leads our tech innovations with expertise and insight.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">R</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Rajiv Khanna</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">Customer Experience Head</p>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              Rajiv ensures that every customer interaction with RailYatra exceeds expectations, from booking to journey completion.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 mb-20">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-12 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-12">
              <h2 className="text-2xl font-bold text-white mb-6">Ready to Experience the RailYatra Difference?</h2>
              <p className="text-blue-100 mb-8 max-w-xl text-base leading-relaxed">
                Join millions of satisfied travelers who've simplified their train journeys with RailYatra. Book your first ticket today and discover a new way to travel.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link 
                  href="/trains" 
                  className="px-6 py-3.5 bg-white text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Book Tickets
                </Link>
                <Link 
                  href="/contact" 
                  className="px-6 py-3.5 bg-blue-600 text-white text-sm font-medium rounded-lg border border-blue-500 hover:bg-blue-500 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <div className="bg-white dark:bg-gray-800 p-7 rounded-xl shadow-inner">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Find Us On</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center">
                      Facebook
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center">
                      Twitter
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center">
                      LinkedIn
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
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