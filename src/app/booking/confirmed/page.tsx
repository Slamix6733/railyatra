'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaTrain, FaTicketAlt, FaUser, FaWallet, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaDownload, FaShareAlt, FaCheck, FaTimesCircle, FaEdit } from 'react-icons/fa';
import { downloadTicketAsPDF } from '@/lib/pdfUtils';

interface TicketData {
  pnr: string;
  train_id: number;
  train_number: string;
  train_name: string;
  source: string;
  destination: string;
  journey_date: string;
  departure_time: string;
  arrival_time: string;
  class_name: string;
  class_code: string;
  passengers: Array<{
    name: string;
    age: number;
    gender: string;
    berth_preference: string;
    seat?: string;
    coach?: string;
  }>;
  contact_email: string;
  contact_phone: string;
  total_fare: number;
  payment_method: string;
  booking_time: string;
  ticket_id?: number;
  booking_status: string;
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  
  useEffect(() => {
    // Get ticket data from session storage first
    try {
      console.log('Loading ticket data from session storage');
      const storedData = sessionStorage.getItem('ticket_data');
      if (!storedData) {
        console.error('No ticket data found in session storage');
        setError('Ticket information not found. Please restart the booking process.');
        setLoading(false);
        return;
      }
      
      const parsedData = JSON.parse(storedData) as TicketData;
      console.log('Session storage ticket data:', parsedData);
      
      // If there's a ticket_id, fetch the complete data from the API
      if (parsedData.ticket_id && typeof parsedData.ticket_id === 'number' && parsedData.ticket_id > 0) {
        console.log('Found ticket_id in session storage, fetching from API:', parsedData.ticket_id);
        fetchTicketFromApi(parsedData.ticket_id);
      } else {
        console.log('No valid ticket_id found, using session storage data directly');
        // Fallback to the legacy approach for compatibility
        fallbackToSessionStorage();
      }
    } catch (error) {
      console.error('Error retrieving ticket data from session storage:', error);
      setError('An error occurred while retrieving your ticket information.');
      setLoading(false);
    }
  }, []);
  
  // New function to fetch ticket data from API
  const fetchTicketFromApi = async (ticketId: number) => {
    try {
      // Helper function to safely parse JSON responses
      const safeJsonParse = async (response: Response) => {
        const text = await response.text();
        try {
          return { json: JSON.parse(text), text };
        } catch (e) {
          console.error('Failed to parse response as JSON:', text.substring(0, 100) + '...');
          return { json: null, text };
        }
      };
      
      console.log('Fetching ticket from API with ID:', ticketId);
      const response = await fetch(`/api/tickets?id=${ticketId}`);
      const { json: data, text } = await safeJsonParse(response);
      
      if (!response.ok || !data || !data.success || !data.data) {
        console.error('API Error or invalid response:', data || text.substring(0, 200));
        // Fallback to session storage data
        fallbackToSessionStorage();
        return;
      }
      
      const apiTicket = data.data;
      const ticketPassengers = apiTicket.passengers || [];
      
      // Format the data to match the TicketData interface
      setTicket({
        pnr: apiTicket.pnr_number,
        train_id: apiTicket.train_id,
        train_number: apiTicket.train_number,
        train_name: apiTicket.train_name,
        source: apiTicket.source_station,
        destination: apiTicket.destination_station,
        journey_date: apiTicket.journey_date,
        departure_time: apiTicket.departure_time || apiTicket.standard_departure_time,
        arrival_time: apiTicket.arrival_time || apiTicket.standard_arrival_time,
        class_name: apiTicket.class_name,
        class_code: apiTicket.class_code,
        passengers: ticketPassengers.map((p: any) => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          berth_preference: p.berth_type || 'No Preference',
          seat: p.seat_number || String(Math.floor(Math.random() * 72) + 1),
          coach: p.seat_number ? p.seat_number.split('-')[0] : ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'A1', 'A2', 'B1', 'B2'][Math.floor(Math.random() * 10)]
        })),
        contact_email: ticketPassengers[0]?.email || '',
        contact_phone: ticketPassengers[0]?.contact_number || '',
        total_fare: apiTicket.total_fare,
        payment_method: apiTicket.payment_method || 'online',
        booking_time: apiTicket.booking_date,
        booking_status: apiTicket.booking_status
      });
      
      // Create success animation after a short delay
      setTimeout(() => {
        setShowConfetti(true);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching ticket from API:', error);
      // Fallback to session storage data
      fallbackToSessionStorage();
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to fallback to session storage data
  const fallbackToSessionStorage = () => {
    console.log('Falling back to session storage data');
    try {
      const storedData = sessionStorage.getItem('ticket_data');
      if (!storedData) {
        setError('Ticket information not found. Please restart the booking process.');
        return;
      }
      
      const parsedData = JSON.parse(storedData) as TicketData;
      
      // Assign seat and coach numbers to each passenger
      const updatedPassengers = parsedData.passengers.map((passenger, index) => {
        const coaches = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'A1', 'A2', 'B1', 'B2'];
        const coachIndex = Math.floor(Math.random() * 10);
        
        return {
          ...passenger,
          seat: `${Math.floor(Math.random() * 72) + 1}`,
          coach: coaches[coachIndex]
        };
      });
      
      setTicket({
        ...parsedData,
        passengers: updatedPassengers,
        total_fare: typeof parsedData.total_fare === 'number' ? parsedData.total_fare : 0,
        train_id: typeof parsedData.train_id === 'number' ? parsedData.train_id : 0
      });
      
      // Create success animation after a short delay
      setTimeout(() => {
        setShowConfetti(true);
      }, 500);
    } catch (fallbackError) {
      console.error('Error in fallback mechanism:', fallbackError);
      setError('An error occurred while retrieving your ticket information. Please try again.');
    }
  };
  
  // Create confetti animation effect
  useEffect(() => {
    if (!showConfetti || !confettiRef.current) return;
    
    const container = confettiRef.current;
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 5 + 3}px`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
      confetti.style.position = 'absolute';
      confetti.style.top = '-20px';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.borderRadius = '2px';
      confetti.style.opacity = `${Math.random() + 0.4}`;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      // Animation
      confetti.style.animation = `fall ${Math.random() * 2 + 1.5}s linear forwards`;
      
      container.appendChild(confetti);
      
      // Remove confetti after animation completes
      setTimeout(() => {
        confetti.remove();
      }, 3500);
    }
    
    // Clean up
    return () => {
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [showConfetti]);
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toDateString();
  };
  
  const handleDownloadTicket = () => {
    if (ticket) {
      downloadTicketAsPDF(ticketRef.current, ticket.pnr);
    }
  };
  
  const handleShareTicket = () => {
    alert('Ticket share functionality will be implemented here');
    // In a real app, this would open a share dialog or generate a shareable link
  };
  
  const handleCancelTicket = async () => {
    if (!ticket) return;
    
    // Validate that a reason is selected
    if (!cancellationReason) {
      setCancelError("Please select a reason for cancellation.");
      return;
    }
    
    // For "Other" reason, validate that text is entered
    if (cancellationReason === 'Other' && !otherReason.trim()) {
      setCancelError("Please specify your reason for cancellation.");
      return;
    }
    
    setCancelLoading(true);
    setCancelError(null);
    
    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pnr: ticket.pnr,
          reason: cancellationReason === 'Other' ? otherReason : cancellationReason
        }),
      });
      
      const data = await response.json();
      console.log('Cancellation response:', data);
      
      if (response.ok && data.success) {
        setCancelSuccess(true);
        // Update the ticket status locally
        setTicket(prev => prev ? {...prev, booking_status: 'Cancelled'} : null);
        
        // Close the modal after a short delay
        setTimeout(() => {
          setShowCancelModal(false);
          // Redirect to profile page after successful cancellation
          router.push('/profile');
        }, 2000);
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
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          // Check if user has admin role
          setIsAdmin(userData.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 animate-pulse">Preparing your ticket...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-red-50 rounded-xl border border-red-200 text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-red-700 mb-2">Error</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/trains" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Start a New Booking
        </Link>
      </div>
    );
  }
  
  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">No Ticket Found</h1>
        <p className="text-gray-600 mb-4">We couldn't find your ticket information. Please restart the booking process.</p>
        <Link href="/trains" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Search Trains
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto my-8 p-4 relative">
      {/* Confetti container */}
      <div 
        ref={confettiRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-10"
        style={{
          overflow: 'hidden',
        }}
      >
        {/* Confetti pieces will be added here */}
        <style jsx>{`
          @keyframes fall {
            0% {
              transform: translateY(0) rotate(0deg);
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
            }
          }
        `}</style>
      </div>
      
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            {cancelSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FaCheck className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ticket Cancelled Successfully</h3>
                <p className="text-gray-600 mb-6">Your refund will be processed according to the cancellation policy.</p>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    router.push('/profile');
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Return to Profile
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <FaTimesCircle className="text-red-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Cancel Ticket</h3>
                </div>
                
                <p className="text-gray-600 mb-2">
                  Are you sure you want to cancel this ticket? Refund will be processed according to the cancellation policy:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-1 text-sm text-gray-600">
                  <li>Full refund if cancelled 24+ hours before journey</li>
                  <li>50% refund if cancelled less than 24 hours before journey</li>
                  <li>No refund after journey has started</li>
                </ul>
                
                <div className="mb-4">
                  <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for cancellation
                  </label>
                  <select
                    id="cancellationReason"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                  >
                    <option value="">Select a reason</option>
                    <option value="Change of plans">Change of plans</option>
                    <option value="Found better alternative">Found better alternative</option>
                    <option value="Emergency situation">Emergency situation</option>
                    <option value="Booking error">Booking error</option>
                    <option value="Weather conditions">Weather conditions</option>
                    <option value="Other">Other</option>
                  </select>
                  {cancellationReason === 'Other' && (
                    <textarea
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please specify your reason..."
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      rows={2}
                    />
                  )}
                </div>
                
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
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    disabled={cancelLoading}
                  >
                    Keep Ticket
                  </button>
                  <button
                    onClick={handleCancelTicket}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
                    disabled={cancelLoading || !cancellationReason || (cancellationReason === 'Other' && !otherReason.trim())}
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
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Success Message */}
      <div className="bg-green-100 border border-green-200 text-green-800 rounded-xl p-6 mb-6 flex items-start animate-fadeIn">
        <div className="bg-green-200 rounded-full p-2 mr-4">
          <FaCheck className="text-green-600 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2 animate-slideInLeft">Booking Successful!</h2>
          <p className="text-green-700 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            Your ticket has been confirmed. You'll receive a confirmation email shortly at {ticket.contact_email}.
          </p>
        </div>
      </div>
      
      {/* Ticket Card */}
      <div ref={ticketRef} className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0 animate-slideInLeft" style={{ animationDelay: '0.3s' }}>
              <FaTicketAlt className="text-2xl mr-3" />
              <div>
                <h1 className="text-xl font-bold">E-Ticket</h1>
                <p className="text-blue-100">PNR: {ticket.pnr}</p>
              </div>
            </div>
            
            <div className="flex space-x-3 animate-slideInRight" style={{ animationDelay: '0.3s' }}>
              {isAdmin && (
                <Link
                  href={`/admin/tickets/update/${ticket.pnr}`}
                  className="px-4 py-2 bg-yellow-500/60 hover:bg-yellow-500/80 rounded-lg flex items-center text-sm font-medium transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Admin Edit
                </Link>
              )}
              <button 
                onClick={handleDownloadTicket}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center text-sm font-medium transition-colors"
              >
                <FaDownload className="mr-2" />
                Download
              </button>
              
              <button 
                onClick={handleShareTicket}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center text-sm font-medium transition-colors"
              >
                <FaShareAlt className="mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Journey Information */}
          <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Journey Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-slideInLeft" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center mb-3">
                  <FaTrain className="text-blue-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Train Details</h3>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-800">
                    <span className="text-sm text-gray-500 block">Train Name</span>
                    <span className="font-medium">{ticket.train_name}</span>
                  </p>
                  <p className="text-gray-800">
                    <span className="text-sm text-gray-500 block">Train Number</span>
                    <span className="font-medium">#{ticket.train_number}</span>
                  </p>
                  <p className="text-gray-800">
                    <span className="text-sm text-gray-500 block">Class</span>
                    <span className="font-medium">{ticket.class_name} ({ticket.class_code})</span>
                  </p>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-slideInRight" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center mb-3">
                  <FaCalendarAlt className="text-blue-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Journey Date</h3>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-800">
                    <span className="text-sm text-gray-500 block">Date</span>
                    <span className="font-medium">{formatDate(ticket.journey_date)}</span>
                  </p>
                  <p className="text-gray-800">
                    <span className="text-sm text-gray-500 block">Booking Date</span>
                    <span className="font-medium">{new Date(ticket.booking_time).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border border-gray-200 rounded-lg p-5 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <FaMapMarkerAlt className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-semibold text-gray-900">{ticket.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center ml-7 text-gray-600">
                    <FaClock className="mr-2 text-sm" />
                    <span>{ticket.departure_time}</span>
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <div className="w-20 h-0.5 bg-gray-300 my-6 relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-blue-100 border border-blue-300">
                      <FaTrain className="text-blue-700 text-xs" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <FaMapMarkerAlt className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-semibold text-gray-900">{ticket.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center ml-7 text-gray-600">
                    <FaClock className="mr-2 text-sm" />
                    <span>{ticket.arrival_time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Passenger Details */}
          <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Passenger Details</h2>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 stagger-animation">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passenger
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coach
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seat
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 stagger-animation">
                  {ticket.passengers.map((passenger, index) => (
                    <tr key={index} className="animate-fadeIn" style={{ animationDelay: `${0.1 * index + 0.8}s` }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-600 text-sm" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{passenger.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{passenger.age} yrs / {passenger.gender.charAt(0).toUpperCase() + passenger.gender.slice(1)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{passenger.coach}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{passenger.seat}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Payment Details */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.9s' }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-3">
                    <FaWallet className="text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Payment Method</h3>
                  </div>
                  <p className="text-gray-800 capitalize">{ticket.payment_method.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <div className="flex items-center mb-3">
                    <svg className="text-blue-600 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-medium text-gray-800">Amount Paid</h3>
                  </div>
                  <p className="text-gray-800 font-semibold">₹{typeof ticket.total_fare === 'number' ? ticket.total_fare.toFixed(2) : '0.00'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Actions */}
          <div className="mt-8 flex flex-wrap justify-between items-center animate-fadeIn" style={{ animationDelay: '1s' }}>
            <div className="flex space-x-4 mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                For any assistance, please contact us at <span className="text-blue-600">support@railyatra.com</span>
              </p>
              {ticket.booking_status !== 'Cancelled' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                >
                  <FaTimesCircle className="mr-1" />
                  Cancel Ticket
                </button>
              )}
              {ticket.booking_status === 'Cancelled' && (
                <span className="text-red-600 text-sm font-medium flex items-center">
                  <FaTimesCircle className="mr-1" />
                  Ticket Cancelled
                </span>
              )}
            </div>
            
            <Link
              href="/trains"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Book Another Train
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 