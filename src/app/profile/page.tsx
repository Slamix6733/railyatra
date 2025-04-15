'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaTicketAlt, FaHistory, FaEdit, FaSignOutAlt, FaMapMarkedAlt, FaCalendarCheck, FaLock, FaEnvelope, FaPhone, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface Passenger {
  passenger_id: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  contact_number: string;
  address: string | null;
  id_proof_type: string | null;
  id_proof_number: string | null;
  concession_category: string | null;
}

interface Ticket {
  ticket_id: number;
  pnr_number: string;
  booking_date: string;
  booking_status: string;
  total_fare: number;
  journey_date: string;
  class_name: string;
  source_station: string;
  destination_station: string;
  train_number: string;
  train_name: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [user, setUser] = useState<Passenger | null>(null);
  const [ticketHistory, setTicketHistory] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    fetchUserData(parsedUser.passenger_id);
  }, [router]);
  
  const fetchUserData = async (passengerId: number) => {
    try {
      const response = await fetch(`/api/passengers?id=${passengerId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user data');
      }
      
      if (data.success && data.data) {
        setUser(data.data);
        
        if (data.data.ticket_history) {
          setTicketHistory(data.data.ticket_history);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.contact_number,
        address: user.address || '',
      });
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would be an API call to update the profile
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...formData };
    });
    
    setEditMode(false);
    alert('Profile updated successfully!');
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };
  
  const handleCancelTicket = async () => {
    if (!selectedTicket) return;
    
    setCancelLoading(true);
    setCancelError(null);
    
    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pnr: selectedTicket.pnr_number,
          reason: 'Customer requested cancellation'
        }),
      });
      
      const data = await response.json();
      console.log('Cancellation response:', data);
      
      if (response.ok && data.success) {
        // Update ticket status in the local state
        setTicketHistory(prev => 
          prev.map(ticket => 
            ticket.pnr_number === selectedTicket.pnr_number 
              ? {...ticket, booking_status: 'Cancelled'} 
              : ticket
          )
        );
        
        // Close modal
        setShowCancelModal(false);
        setSelectedTicket(null);
        
        // Show success message
        alert('Ticket cancelled successfully. Your refund will be processed according to the cancellation policy.');
      } else {
        console.error('Cancel ticket error:', data.error);
        setCancelError(data.error || 'Failed to cancel ticket. Please try again.');
      }
    } catch (error: any) {
      console.error('Cancel ticket exception:', error);
      setCancelError(error.message || 'An error occurred during cancellation.');
    } finally {
      setCancelLoading(false);
    }
  };
  
  const handleCancelButtonClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowCancelModal(true);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-red-50 rounded-xl border border-red-200 text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-red-700 mb-2">Profile Not Found</h1>
        <p className="text-red-600 mb-4">We couldn't find your profile information. Please login again.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Go to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cancel Ticket</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to cancel your ticket from <span className="font-medium">{selectedTicket.source_station}</span> to <span className="font-medium">{selectedTicket.destination_station}</span> on <span className="font-medium">{new Date(selectedTicket.journey_date).toLocaleDateString()}</span>?
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-1 text-sm text-gray-600">
              <li>Full refund if cancelled 24+ hours before journey</li>
              <li>50% refund if cancelled less than 24 hours before journey</li>
              <li>No refund after journey has started</li>
            </ul>
            
            {cancelError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                <p className="font-bold">Error:</p>
                <p className="text-sm">
                  {cancelError.includes("UPDATE") && cancelError.includes("ORDER BY") 
                    ? "Unable to process cancellation due to a database error. Please try again later or contact support." 
                    : cancelError}
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedTicket(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={cancelLoading}
              >
                Keep Ticket
              </button>
              <button
                onClick={handleCancelTicket}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Processing...
                  </>
                ) : (
                  'Cancel Ticket'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    
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
              My Profile
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Manage your account and view your booking history
            </motion.p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="container mx-auto px-4 py-8 -mt-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden max-w-4xl mx-auto border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <FaUser className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-3">
                    <FaUser className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Full Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Contact Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.contact_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Age</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.age}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Gender</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.gender}</p>
                    </div>
                    {user.address && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Address</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.address}</p>
                      </div>
                    )}
                    
                    {user.id_proof_type && user.id_proof_number && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">ID Proof</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.id_proof_type}: {user.id_proof_number}</p>
                      </div>
                    )}
                    
                    {user.concession_category && user.concession_category !== 'None' && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Concession Category</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {user.concession_category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <Link
                      href="/profile/edit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center w-max"
                    >
                      <FaEdit className="mr-2" /> Edit Profile
                    </Link>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-3">
                    <FaTicketAlt className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
                </div>
                
                {ticketHistory.length > 0 ? (
                  <div className="space-y-4">
                    {ticketHistory.slice(0, 3).map((ticket, index) => (
                      <motion.div 
                        key={ticket.ticket_id} 
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{ticket.train_name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.train_number}</p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              ticket.booking_status === 'Confirmed'
                                ? 'bg-green-100 text-green-800' 
                                : ticket.booking_status === 'Waitlisted'
                                ? 'bg-yellow-100 text-yellow-800'
                                : ticket.booking_status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : ticket.booking_status === 'RAC'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.booking_status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                            <p className="font-medium text-gray-900 dark:text-white">{ticket.source_station}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">To</p>
                            <p className="font-medium text-gray-900 dark:text-white">{ticket.destination_station}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                            <p className="font-medium text-gray-900 dark:text-white">{new Date(ticket.journey_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">PNR</p>
                            <p className="font-medium text-gray-900 dark:text-white">{ticket.pnr_number}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <p className="font-bold text-gray-900 dark:text-white">₹{ticket.total_fare.toFixed(2)}</p>
                          <div className="flex items-center space-x-2">
                            {ticket.booking_status === 'Confirmed' && 
                              new Date(ticket.journey_date) > new Date() && (
                              <button
                                onClick={() => handleCancelButtonClick(ticket)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                              >
                                <FaTimesCircle className="mr-1" />
                                Cancel
                              </button>
                            )}
                            <Link
                              href={`/booking/confirmed?pnr=${ticket.pnr_number}`}
                              className="text-blue-600 text-sm font-medium hover:underline flex items-center"
                            >
                              View Details
                              <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {ticketHistory.length > 3 && (
                      <div className="text-center mt-6">
                        <Link
                          href="/profile/bookings"
                          className="text-blue-600 font-medium hover:underline flex items-center justify-center"
                        >
                          <FaHistory className="mr-2" />
                          View All Bookings
                          <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't made any bookings yet.</p>
                    <Link
                      href="/trains"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                      Book a Ticket
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 