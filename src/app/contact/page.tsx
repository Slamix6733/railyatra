'use client';

import React from 'react';
import { MdPhone, MdEmail, MdLocationOn, MdSupportAgent, MdHelp, MdAccessTime } from 'react-icons/md';
import { FaBuilding } from 'react-icons/fa';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear any previous error when the user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error state
    
    try {
      // Send emails using the mail API endpoint with absolute URL
      const baseUrl = window.location.origin;
      
      // First send a confirmation to the user
      const confirmationResponse = await fetch(`${baseUrl}/api/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.email,
          subject: `Thank you for contacting RailYatra - ${formData.subject}`,
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="background: linear-gradient(to right, #2563eb, #3b82f6); color: white; padding: 15px; border-radius: 5px 5px 0 0;">
                <h2 style="margin: 0;">Thank You for Contacting Us</h2>
              </div>
              
              <div style="padding: 20px;">
                <p>Dear ${formData.name},</p>
                <p>Thank you for reaching out to RailYatra Support. We've received your message regarding "${formData.subject}" and will get back to you shortly.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 15px; margin: 15px 0;">
                  <h3 style="margin-top: 0;">Your Message Details</h3>
                  <p><strong>Subject:</strong> ${formData.subject}</p>
                  <p><strong>Message:</strong> ${formData.message.substring(0, 100)}${formData.message.length > 100 ? '...' : ''}</p>
                </div>
                
                <p>Our team will review your message and respond as soon as possible. If you have any additional information to provide, please reply to this email.</p>
                <p>Thank you for choosing RailYatra.</p>
              </div>
              
              <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 5px 5px;">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; ${new Date().getFullYear()} RailYatra. All rights reserved.</p>
              </div>
            </div>
          `
        }),
      });

      const confirmData = await confirmationResponse.json();
      
      if (!confirmationResponse.ok) {
        throw new Error(confirmData.error || 'Failed to send confirmation email');
      }
      
      console.log('Confirmation email sent:', confirmData);
      
      // Then send the notification to support
      const notificationResponse = await fetch(`${baseUrl}/api/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'support@railyatra.com',
          replyTo: formData.email,
          subject: `Contact Form: ${formData.subject}`,
          content: `
            <h2>Contact Form Submission</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message.replace(/\n/g, '<br/>')}</p>
          `
        }),
      });
      
      const notifData = await notificationResponse.json();
      console.log('Support notification sent:', notifData);
      
      // Even if the support notification fails, we've already sent the user confirmation
      // So we can consider the form submission successful
      setSubmitted(true);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send your message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">Contact Us</h1>
            <p className="text-xl text-blue-100 mb-6 animate-fadeIn" style={{animationDelay: '200ms'}}>
              Have questions or need assistance? We're here to help.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="container mx-auto px-4 py-12 my-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our team is available to assist you through various channels. Choose the one that's most convenient for you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700 text-center h-full flex flex-col">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-4">
              <MdPhone className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Call Us</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex-grow">
              Speak directly with our customer support team
            </p>
            <a href="tel:+918000123456" className="text-blue-600 dark:text-blue-400 font-medium hover:underline mt-auto">
              +91 8000 123 456
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700 text-center h-full flex flex-col">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-4">
              <MdEmail className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Email Us</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex-grow">
              Send us your queries anytime
            </p>
            <a href="mailto:support@railyatra.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline mt-auto">
              support@railyatra.com
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700 text-center h-full flex flex-col">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-4">
              <MdLocationOn className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Visit Our Office</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex-grow">
              Meet us in person at our headquarters
            </p>
            <p className="text-gray-800 dark:text-white text-sm font-medium mt-auto">
              IIT Patna, Bihta, Bihar 801106
            </p>
          </div>
        </div>
      </div>
      
      {/* Office Locations */}
      <div className="container mx-auto px-4 py-12 my-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
              <FaBuilding className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Campus Locations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Main Campus</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Indian Institute of Technology Patna<br />
                Bihta, Patna, Bihar 801106
              </p>
              <div className="flex items-center text-sm mb-3 mt-auto">
                <MdAccessTime className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Hours:</span> Mon-Sat, 9:00 AM - 6:00 PM
                </p>
              </div>
              <Link href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center">
                Get Directions
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Research Center</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Research & Innovation Building<br />
                IIT Patna, Bihta, Bihar 801106
              </p>
              <div className="flex items-center text-sm mb-3 mt-auto">
                <MdAccessTime className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Hours:</span> Mon-Fri, 9:30 AM - 5:30 PM
                </p>
              </div>
              <Link href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center">
                Get Directions
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Admin Block</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Administrative Building<br />
                IIT Patna, Bihta, Bihar 801106
              </p>
              <div className="flex items-center text-sm mb-3 mt-auto">
                <MdAccessTime className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Hours:</span> Mon-Fri, 9:00 AM - 6:00 PM
                </p>
              </div>
              <Link href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center">
                Get Directions
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-12 my-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-3">
              <MdHelp className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-center mb-8">
            Find quick answers to common questions about contacting us and our support services.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">What is the typical response time?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We aim to respond to all email inquiries within 24 hours during business days. For urgent matters, we recommend calling our customer support directly.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">How can I track my complaint?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                After submitting a complaint, you'll receive a tracking number via email. You can use this number on our website or contact customer support to check the status.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Do you provide support on weekends?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, our phone support is available on weekends from 10:00 AM to 4:00 PM. Email responses might be delayed until the next business day.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">How can I provide feedback?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                You can use our contact form or email us at feedback@railyatra.com. We value your input and continuously strive to improve our services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="container mx-auto px-4 py-12 my-8 bg-gray-50 dark:bg-gray-800 rounded-2xl">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-3">
              <MdSupportAgent className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send Us a Message</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                Fill out the form, and our team will get back to you as soon as possible. We value your feedback and are committed to providing excellent service.
              </p>
              
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-6 shadow-md text-white">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <MdSupportAgent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Need Immediate Help?</h3>
                </div>
                <p className="text-blue-100 text-sm mb-5">
                  Our support team is available to provide immediate assistance for urgent matters.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="tel:+918000123456" 
                    className="px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <MdPhone className="mr-2" />
                    Call Now
                  </a>
                  <a 
                    href="mailto:support@railyatra.com" 
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg border border-blue-500 hover:bg-blue-500 transition-colors flex items-center"
                  >
                    <MdEmail className="mr-2" />
                    Email Support
                  </a>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3 bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-600">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Contact Form</h3>
              
              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-5 text-center">
                  <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Your message has been sent successfully. We'll respond to you shortly.
                  </p>
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        subject: '',
                        message: ''
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="phone" className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                    >
                      <option value="">Select a subject</option>
                      <option value="booking">Booking Assistance</option>
                      <option value="refund">Refund Query</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                      placeholder="Please describe your query in detail..."
                    ></textarea>
                  </div>
                  
                  {error && (
                    <div className="col-span-2 mb-3">
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 text-center">
                        <p className="text-red-600 dark:text-red-400 text-sm">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="col-span-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm ${
                        loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-500'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
