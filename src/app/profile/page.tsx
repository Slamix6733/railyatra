'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaTicketAlt, FaHistory, FaEdit, FaSignOutAlt, FaMapMarkedAlt, FaCalendarCheck, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';

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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Contact Number</p>
                  <p className="font-medium">{user.contact_number}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Age</p>
                  <p className="font-medium">{user.age}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Gender</p>
                  <p className="font-medium">{user.gender}</p>
                </div>
                {user.address && (
                  <div>
                    <p className="text-gray-500 text-sm">Address</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                )}
                
                {user.id_proof_type && user.id_proof_number && (
                  <div>
                    <p className="text-gray-500 text-sm">ID Proof</p>
                    <p className="font-medium">{user.id_proof_type}: {user.id_proof_number}</p>
                  </div>
                )}
                
                {user.concession_category && user.concession_category !== 'None' && (
                  <div>
                    <p className="text-gray-500 text-sm">Concession Category</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.concession_category}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Link
                  href="/profile/edit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
              {ticketHistory.length > 0 ? (
                <div className="space-y-4">
                  {ticketHistory.slice(0, 3).map((ticket) => (
                    <div key={ticket.ticket_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-blue-600">{ticket.train_name}</h3>
                          <p className="text-sm text-gray-600">{ticket.train_number}</p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ticket.booking_status === 'Confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : ticket.booking_status === 'Waiting' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {ticket.booking_status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between">
                        <div>
                          <p className="text-sm text-gray-500">From</p>
                          <p className="font-medium">{ticket.source_station}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">To</p>
                          <p className="font-medium">{ticket.destination_station}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">{new Date(ticket.journey_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">PNR</p>
                          <p className="font-medium">{ticket.pnr_number}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <p className="font-bold">₹{ticket.total_fare.toFixed(2)}</p>
                        <Link
                          href={`/booking/confirmed?pnr=${ticket.pnr_number}`}
                          className="text-blue-600 text-sm font-medium hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  {ticketHistory.length > 3 && (
                    <div className="text-center mt-4">
                      <Link
                        href="/profile/bookings"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        View All Bookings
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-500">You haven't made any bookings yet.</p>
                  <Link
                    href="/trains"
                    className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
                  >
                    Book a Ticket
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 