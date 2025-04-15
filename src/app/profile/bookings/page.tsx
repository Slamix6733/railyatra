'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaTicketAlt, FaArrowLeft, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Ticket[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'journey_date' | 'booking_date'>('journey_date');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
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
    fetchBookingData(parsedUser.passenger_id);
  }, [router]);
  
  const fetchBookingData = async (passengerId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/passengers?id=${passengerId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch booking data');
      }
      
      if (data.success && data.data && data.data.ticket_history) {
        setBookings(data.data.ticket_history);
        
        // Apply default filter for upcoming tickets
        const currentDate = new Date();
        const upcomingTickets = data.data.ticket_history.filter(
          (ticket: Ticket) => new Date(ticket.journey_date) >= currentDate
        );
        
        setFilteredBookings(upcomingTickets);
      } else {
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
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
      
      if (response.ok && data.success) {
        // Update booking status in the local state
        const updatedBookings = bookings.map(booking => 
          booking.pnr_number === selectedTicket.pnr_number 
            ? {...booking, booking_status: 'CANCELLED'} 
            : booking
        );
        
        setBookings(updatedBookings);
        applyFiltersAndSorting(updatedBookings);
        
        // Close modal
        setShowCancelModal(false);
        setSelectedTicket(null);
        
        // Show success message
        alert('Ticket cancelled successfully. Your refund will be processed according to the cancellation policy.');
      } else {
        setCancelError(data.error || 'Failed to cancel ticket. Please try again.');
      }
    } catch (error: any) {
      setCancelError(error.message || 'An error occurred during cancellation.');
    } finally {
      setCancelLoading(false);
    }
  };
  
  const applyFiltersAndSorting = (bookingsToFilter = bookings) => {
    let result = [...bookingsToFilter];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(ticket => 
        ticket.booking_status.toUpperCase() === statusFilter.toUpperCase()
      );
    }
    
    // Apply date filter
    const currentDate = new Date();
    if (dateFilter === 'upcoming') {
      result = result.filter(ticket => new Date(ticket.journey_date) >= currentDate);
    } else if (dateFilter === 'past') {
      result = result.filter(ticket => new Date(ticket.journey_date) < currentDate);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(sortBy === 'journey_date' ? a.journey_date : a.booking_date);
      const dateB = new Date(sortBy === 'journey_date' ? b.journey_date : b.booking_date);
      
      return sortOrder === 'asc' 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    });
    
    setFilteredBookings(result);
  };
  
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    applyFiltersAndSorting();
  };
  
  const changeSortBy = (field: 'journey_date' | 'booking_date') => {
    setSortBy(field);
    applyFiltersAndSorting();
  };
  
  const resetFilters = () => {
    setStatusFilter('all');
    setDateFilter('upcoming');
    setSortBy('journey_date');
    setSortOrder('desc');
    
    // Filter to only show upcoming tickets
    const currentDate = new Date();
    const upcomingTickets = bookings.filter(ticket => new Date(ticket.journey_date) >= currentDate);
    setFilteredBookings(upcomingTickets);
  };
  
  useEffect(() => {
    applyFiltersAndSorting();
  }, [sortOrder, sortBy, statusFilter, dateFilter]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
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
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your ticket from <span className="font-medium">{selectedTicket.source_station}</span> to <span className="font-medium">{selectedTicket.destination_station}</span> on <span className="font-medium">{new Date(selectedTicket.journey_date).toLocaleDateString()}</span>?
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Full refund if cancelled 24+ hours before journey</li>
                <li>50% refund if cancelled less than 24 hours before journey</li>
                <li>No refund after journey has started</li>
              </ul>
            </p>
            
            {cancelError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                {cancelError}
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-4">
              <Link href="/profile" className="mr-4">
                <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                  <FaArrowLeft className="text-white" />
                </button>
              </Link>
              <motion.h1 
                className="text-4xl md:text-5xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                My Bookings
              </motion.h1>
            </div>
            <motion.p 
              className="text-xl text-blue-100 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              View and manage all your train ticket bookings
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
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden max-w-5xl mx-auto border border-gray-100 dark:border-gray-700 p-6">
          {/* Filters Section */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div className="flex items-center mb-2 sm:mb-0">
                <FaTicketAlt className="text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Tickets</h2>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <FaFilter className="mr-2" />
                  Filter
                </button>
                
                <button 
                  onClick={toggleSortOrder}
                  className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                >
                  {sortOrder === 'asc' ? <FaSortAmountUp className="mr-2" /> : <FaSortAmountDown className="mr-2" />}
                  Sort
                </button>
              </div>
            </div>
            
            {showFilters && (
              <motion.div 
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                    <select 
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200"
                      value={sortBy}
                      onChange={(e) => changeSortBy(e.target.value as 'journey_date' | 'booking_date')}
                    >
                      <option value="journey_date">Journey Date</option>
                      <option value="booking_date">Booking Date</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select 
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="waiting">Waiting</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Journey</label>
                    <select 
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as 'upcoming' | 'past' | 'all')}
                    >
                      <option value="upcoming">Upcoming Journeys</option>
                      <option value="all">All Journeys</option>
                      <option value="past">Past Journeys</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button 
                      onClick={resetFilters}
                      className="w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium rounded-lg px-4 py-2 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Tickets List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((ticket, index) => (
                <motion.div 
                  key={ticket.ticket_id} 
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * Math.min(index, 5) }}
                  whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{ticket.train_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.train_number}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ticket.booking_status === 'CONFIRMED' || ticket.booking_status === 'Confirmed'
                          ? 'bg-green-100 text-green-800' 
                          : ticket.booking_status === 'WAITING' || ticket.booking_status === 'Waiting'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ticket.booking_status === 'CANCELLED' || ticket.booking_status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.booking_status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">From - To</p>
                      <p className="font-medium text-gray-900 dark:text-white">{ticket.source_station} - {ticket.destination_station}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Journey Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(ticket.journey_date).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Booking Details</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        PNR: {ticket.pnr_number} | Class: {ticket.class_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <p className="font-bold text-gray-900 dark:text-white">₹{ticket.total_fare.toFixed(2)}</p>
                    <div className="flex items-center space-x-2">
                      {(ticket.booking_status === 'CONFIRMED' || ticket.booking_status === 'Confirmed') && 
                        new Date(ticket.journey_date) > new Date() && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowCancelModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                        >
                          <FaTimesCircle className="mr-1" />
                          Cancel Ticket
                        </button>
                      )}
                      <Link
                        href={`/booking/confirmed?pnr=${ticket.pnr_number}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center border border-gray-200 dark:border-gray-600">
              <FaTicketAlt className="mx-auto text-gray-400 dark:text-gray-500 text-4xl mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Bookings Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {statusFilter !== 'all' || dateFilter !== 'all' 
                  ? "No bookings match your current filters. Try adjusting your filters or reset them." 
                  : "You haven't made any train bookings yet."}
              </p>
              {statusFilter !== 'all' || dateFilter !== 'all' ? (
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  href="/trains"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  Book a Train Ticket
                </Link>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 