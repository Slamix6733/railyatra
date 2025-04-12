'use client';

import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaArrowRight } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitStatus({ status: 'loading', message: 'Sending your message...' });
    
    // Simulate API call
    setTimeout(() => {
      // In production, replace with actual API call
      setSubmitStatus({ 
        status: 'success', 
        message: 'Thank you for your message. We will get back to you shortly.'
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Contact Us
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-blue-100">
              We're here to help with all your train travel needs.
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

      {/* Contact Options Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Phone */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <FaPhone className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-4">
              Our customer service team is available 24/7 to assist you.
            </p>
            <a 
              href="tel:+919876543210" 
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              +91 98765 43210
            </a>
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <FaEnvelope className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600 mb-4">
              Send us an email and we'll respond as soon as possible.
            </p>
            <a 
              href="mailto:support@railyatra.com" 
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              support@railyatra.com
            </a>
          </div>

          {/* Office */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <FaMapMarkerAlt className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Us</h3>
            <p className="text-gray-600 mb-4">
              Our offices are open Monday to Friday, 9am to 6pm.
            </p>
            <p className="text-blue-600 font-semibold">
              123 Railway Avenue, Mumbai
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form & Office Locations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {submitStatus.status === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-5 rounded-lg">
                <p className="text-lg font-medium">{submitStatus.message}</p>
                <button 
                  onClick={() => setSubmitStatus({ status: 'idle', message: '' })}
                  className="mt-4 text-green-600 font-medium hover:text-green-800 flex items-center"
                >
                  Send another message <FaArrowRight className="ml-2" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject*
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="booking">Booking Assistance</option>
                      <option value="refund">Refund Query</option>
                      <option value="technical">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message*
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={submitStatus.status === 'loading'}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {submitStatus.status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                  
                  {submitStatus.status === 'error' && (
                    <p className="mt-2 text-sm text-red-600">{submitStatus.message}</p>
                  )}
                </div>
              </form>
            )}
          </div>
          
          {/* Office Locations */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Offices</h2>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Mumbai Office */}
              <div className="bg-white rounded-xl shadow-md p-6 flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Mumbai (Headquarters)</h3>
                  <p className="text-gray-600 mb-3">
                    123 Railway Avenue, Andheri East<br />
                    Mumbai, Maharashtra 400069
                  </p>
                  <div className="flex items-center text-gray-500 text-sm">
                    <FaClock className="mr-1" />
                    <span>9:00 AM - 6:00 PM (Mon-Fri)</span>
                  </div>
                </div>
              </div>
              
              {/* Delhi Office */}
              <div className="bg-white rounded-xl shadow-md p-6 flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Delhi</h3>
                  <p className="text-gray-600 mb-3">
                    456 Metro Plaza, Connaught Place<br />
                    New Delhi, 110001
                  </p>
                  <div className="flex items-center text-gray-500 text-sm">
                    <FaClock className="mr-1" />
                    <span>9:00 AM - 6:00 PM (Mon-Fri)</span>
                  </div>
                </div>
              </div>
              
              {/* Bangalore Office */}
              <div className="bg-white rounded-xl shadow-md p-6 flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Bangalore</h3>
                  <p className="text-gray-600 mb-3">
                    789 Tech Park, Whitefield<br />
                    Bangalore, Karnataka 560066
                  </p>
                  <div className="flex items-center text-gray-500 text-sm">
                    <FaClock className="mr-1" />
                    <span>9:00 AM - 6:00 PM (Mon-Fri)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Find quick answers to common questions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FAQ Item 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How can I check my PNR status?</h3>
              <p className="text-gray-600">
                You can check your PNR status by logging into your account and navigating to the "PNR Status" section, or by entering your PNR number on the PNR status page without logging in.
              </p>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What is the cancellation policy?</h3>
              <p className="text-gray-600">
                Our cancellation policy follows the Indian Railways guidelines. The refund amount depends on how far in advance you cancel your ticket. More details can be found on our Refunds page.
              </p>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I book tickets for a large group?</h3>
              <p className="text-gray-600">
                For group bookings of more than 6 passengers, we recommend using our Group Booking feature. You can find this option during the booking process, or contact our customer service for assistance.
              </p>
            </div>
            
            {/* FAQ Item 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why am I not receiving OTP during login?</h3>
              <p className="text-gray-600">
                If you're not receiving the OTP, please check your spam folder. Ensure that your mobile number is correctly entered. You can also use the "Resend OTP" option or contact our customer support.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <a 
              href="/faq" 
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
            >
              View all FAQs <FaArrowRight className="ml-2" />
            </a>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-xl overflow-hidden shadow-lg h-96 bg-gray-300">
          {/* Replace with your map implementation */}
          <div className="flex items-center justify-center h-full bg-blue-600 bg-opacity-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <FaMapMarkerAlt className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map</h3>
              <p className="text-gray-600">
                A Google Maps component would be displayed here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Support Section */}
      <div className="bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-4">Need Immediate Assistance?</h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Our customer support team is available 24/7 to help you with any queries or issues.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <a
              href="tel:+919876543210"
              className="inline-block py-3 px-8 bg-white text-blue-700 rounded-lg font-semibold shadow-lg hover:bg-blue-50 transition-colors text-center"
            >
              Call Now
            </a>
            <a
              href="mailto:support@railyatra.com"
              className="inline-block py-3 px-8 border-2 border-white text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-center"
            >
              Email Support
            </a>
            <a
              href="#"
              className="inline-block py-3 px-8 bg-blue-800 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-900 transition-colors text-center"
            >
              Live Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 