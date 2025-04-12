'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrain, FaRoute, FaTicketAlt, FaUserShield, FaMobile, FaClock } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              About RailYatra
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-blue-100">
              Making train travel simpler, faster, and more accessible for everyone.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60">
            <path 
              fill="#f9fafb" 
              fillOpacity="1" 
              d="M0,0L60,5.3C120,11,240,21,360,26.7C480,32,600,32,720,26.7C840,21,960,11,1080,10.7C1200,11,1320,21,1380,26.7L1440,32L1440,60L1380,60C1320,60,1200,60,1080,60C960,60,840,60,720,60C600,60,480,60,360,60C240,60,120,60,60,60L0,60Z">
            </path>
          </svg>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:text-center mb-16">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Story</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Reimagining Train Travel In India
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-500">
            Founded in 2023, RailYatra was created with a simple mission: to make train travel hassle-free and enjoyable for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-lg text-gray-600 mb-4">
              At RailYatra, we understand that train travel is not just about getting from point A to point B—it's about the experience, convenience, and reliability.
            </p>
            <p className="text-lg text-gray-600 mb-4">
              Our team of passionate travelers and tech enthusiasts came together to build a platform that addresses the common pain points of train bookings in India.
            </p>
            <p className="text-lg text-gray-600 mb-4">
              We've combined cutting-edge technology with deep insights into the Indian railway system to create a service that millions of travelers can rely on every day.
            </p>
            <p className="text-lg text-gray-600">
              Today, RailYatra serves as the go-to platform for travelers looking to book train tickets, check PNR status, and explore train schedules with ease and confidence.
            </p>
          </div>
          <div className="order-1 lg:order-2 relative h-96 rounded-xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-blue-600 rounded-xl transform rotate-3"></div>
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <Image 
                src="/images/train-journey.jpg" 
                alt="Train journey through beautiful landscape" 
                layout="fill" 
                objectFit="cover"
                className="transition-transform duration-500 hover:scale-105" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white p-8 rounded-xl shadow-md transform transition-transform hover:-translate-y-2">
              <div className="inline-block p-3 bg-blue-100 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To simplify train travel through technology, making it accessible to all and creating a seamless booking experience that saves time and reduces stress.
              </p>
            </div>
            
            {/* Vision */}
            <div className="bg-white p-8 rounded-xl shadow-md transform transition-transform hover:-translate-y-2">
              <div className="inline-block p-3 bg-blue-100 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be the most trusted and preferred platform for all train travel needs in India, revolutionizing the way people plan, book, and experience train journeys.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">What Sets Us Apart</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Key Features of RailYatra
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
              <FaTicketAlt className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Booking</h3>
            <p className="text-gray-600">
              Book your train tickets in minutes with our optimized and user-friendly booking process.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
              <FaRoute className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-gray-600">
              Find the perfect train route with our intelligent search algorithm that considers multiple factors.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
              <FaUserShield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Your payment information is always protected with our bank-grade security measures.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
              <FaMobile className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
            <p className="text-gray-600">
              Access RailYatra anytime, anywhere with our mobile-responsive platform designed for on-the-go bookings.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
              <FaClock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
            <p className="text-gray-600">
              Stay informed with instant notifications about your journey, PNR status, and other important updates.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
              <FaTrain className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Coverage</h3>
            <p className="text-gray-600">
              Access information and bookings for all trains across the Indian railway network on a single platform.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-300 font-semibold tracking-wide uppercase">Our Team</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
              The People Behind RailYatra
            </p>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-blue-200">
              A diverse team of experts dedicated to transforming train travel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-blue-800 rounded-xl p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-500">
                <Image 
                  src="/images/team/profile1.jpg" 
                  alt="Team Member" 
                  layout="fill" 
                  objectFit="cover"
                  className="transition-transform duration-500 hover:scale-110" 
                />
              </div>
              <h3 className="text-xl font-bold">Rajesh Sharma</h3>
              <p className="text-blue-300 mb-3">Founder & CEO</p>
              <p className="text-blue-200 text-sm">
                With 15+ years of experience in the travel industry, Rajesh's vision drives our company forward.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-blue-800 rounded-xl p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-500">
                <Image 
                  src="/images/team/profile2.jpg" 
                  alt="Team Member" 
                  layout="fill" 
                  objectFit="cover"
                  className="transition-transform duration-500 hover:scale-110" 
                />
              </div>
              <h3 className="text-xl font-bold">Priya Patel</h3>
              <p className="text-blue-300 mb-3">CTO</p>
              <p className="text-blue-200 text-sm">
                Priya leads our tech team, ensuring RailYatra's platform is robust, scalable, and user-friendly.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-blue-800 rounded-xl p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-500">
                <Image 
                  src="/images/team/profile3.jpg" 
                  alt="Team Member" 
                  layout="fill" 
                  objectFit="cover"
                  className="transition-transform duration-500 hover:scale-110" 
                />
              </div>
              <h3 className="text-xl font-bold">Amit Verma</h3>
              <p className="text-blue-300 mb-3">Head of Customer Experience</p>
              <p className="text-blue-200 text-sm">
                Amit ensures that every customer interaction with RailYatra exceeds expectations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center lg:max-w-2xl">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to experience the</span>
                  <span className="block">RailYatra difference?</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-blue-200">
                  Join thousands of satisfied travelers who have made RailYatra their preferred choice for train bookings.
                </p>
                <div className="mt-8 space-x-4">
                  <Link 
                    href="/trains" 
                    className="inline-block bg-white py-3 px-6 rounded-md font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Book Now
                  </Link>
                  <Link 
                    href="/contact" 
                    className="inline-block py-3 px-6 rounded-md font-medium text-white border border-white hover:bg-blue-700 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 