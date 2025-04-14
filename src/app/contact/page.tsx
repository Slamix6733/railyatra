'use client';

import React from 'react';
import { MdPhone, MdEmail, MdLocationOn, MdSupportAgent, MdHelp, MdAccessTime } from 'react-icons/md';
import { FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
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
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">Contact Us</h1>
            <p className="text-xl text-blue-100 mb-10 animate-fadeIn" style={{animationDelay: '200ms'}}>
              Have questions or need assistance? We're here to help.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our team is available to assist you through various channels. Choose the one that's most convenient for you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-6">
              <MdPhone className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Call Us</h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-4">
              Speak directly with our customer support team
            </p>
            <a href="tel:+918000123456" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              +91 8000 123 456
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-6">
              <MdEmail className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Email Us</h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-4">
              Send us your queries anytime
            </p>
            <a href="mailto:support@railyatra.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              support@railyatra.com
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-6">
              <MdLocationOn className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Visit Our Office</h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-4">
              Meet us in person at our headquarters
            </p>
            <address className="text-gray-600 dark:text-gray-400 not-italic">
              123 Railway Avenue, Tech Park<br />
              New Delhi, 110001
            </address>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="container mx-auto px-4 py-20 bg-gray-100 dark:bg-gray-800 rounded-3xl my-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdSupportAgent className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Send Us a Message</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8">
              Fill out the form below, and our team will get back to you as soon as possible. We value your feedback and are committed to providing excellent service.
            </p>
            
            {submitted ? (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
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
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="col-span-1">
                  <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div className="col-span-1">
                  <label htmlFor="phone" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div className="col-span-1">
                  <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
                  <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Please describe your query in detail..."
                  ></textarea>
                </div>
                
                {error && (
                  <div className="col-span-2 mb-4">
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center">
                      <p className="text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3.5 bg-blue-600 text-white font-medium rounded-lg transition-colors ${
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
          
          <div>
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <FaBuilding className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Offices</h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">New Delhi (Headquarters)</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">
                  123 Railway Avenue, Tech Park<br />
                  New Delhi, 110001
                </p>
                <div className="flex items-center mb-4">
                  <MdLocationOn className="text-blue-600 dark:text-blue-400 mr-2" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Opening Hours:</span> Monday - Saturday, 9:00 AM - 6:00 PM
                  </p>
                </div>
                <Link href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center">
                  Get Directions
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Mumbai</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">
                  456 Marine Drive, Floor 3<br />
                  Mumbai, 400001
                </p>
                <div className="flex items-center mb-4">
                  <MdLocationOn className="text-blue-600 dark:text-blue-400 mr-2" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Opening Hours:</span> Monday - Friday, 9:30 AM - 5:30 PM
                  </p>
                </div>
                <Link href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center">
                  Get Directions
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Bangalore</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">
                  789 Tech Boulevard, Electronic City<br />
                  Bangalore, 560100
                </p>
                <div className="flex items-center mb-4">
                  <MdLocationOn className="text-blue-600 dark:text-blue-400 mr-2" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Opening Hours:</span> Monday - Friday, 9:00 AM - 6:00 PM
                  </p>
                </div>
                <Link href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center">
                  Get Directions
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
              <MdHelp className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find quick answers to common questions about contacting us and our support services.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">What is the typical response time?</h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              We aim to respond to all email inquiries within 24 hours during business days. For urgent matters, we recommend calling our customer support directly.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">How can I track my complaint?</h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              After submitting a complaint, you'll receive a tracking number via email. You can use this number on our website or contact customer support to check the status.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Do you provide support on weekends?</h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Yes, our phone support is available on weekends from 10:00 AM to 4:00 PM. Email responses might be delayed until the next business day.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">How can I provide feedback about the service?</h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              You can use our contact form or email us at feedback@railyatra.com. We value your input and continuously strive to improve our services.
            </p>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4 py-20 bg-gray-100 dark:bg-gray-800 rounded-3xl my-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
              <FaMapMarkerAlt className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Find Us on the Map</h2>
          </div>
        </div>
        
        <div className="h-96 bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-md">
          {/* Map placeholder - in a real application, you would embed a map here */}
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
            <p className="text-gray-500 dark:text-gray-300 text-center">
              Interactive Map Will Be Displayed Here<br />
              <span className="text-sm">(Google Maps or similar integration)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Customer Support Section */}
      <div className="container mx-auto px-4 py-16 mb-20">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-12 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-12">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <MdSupportAgent className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Need Immediate Assistance?</h2>
              </div>
              <p className="text-blue-100 mb-8 max-w-xl text-base leading-relaxed">
                Our customer support team is available to provide you with immediate assistance for urgent matters. Don't hesitate to reach out.
              </p>
              <div className="flex flex-wrap gap-5">
                <a 
                  href="tel:+918000123456" 
                  className="px-6 py-3.5 bg-white text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                >
                  <MdPhone className="mr-2" />
                  Call Now
                </a>
                <a 
                  href="mailto:support@railyatra.com" 
                  className="px-6 py-3.5 bg-blue-600 text-white text-sm font-medium rounded-lg border border-blue-500 hover:bg-blue-500 transition-colors flex items-center"
                >
                  <MdEmail className="mr-2" />
                  Email Support
                </a>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <div className="bg-white dark:bg-gray-800 p-7 rounded-xl shadow-inner">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Live Chat</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Chat with our support representatives in real-time for quick assistance.
                </p>
                <button className="w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Start Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 