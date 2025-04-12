'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaPlus, FaMinus, FaInfoCircle, FaChevronLeft, FaTicketAlt } from 'react-icons/fa';

interface Passenger {
  id: number;
  name: string;
  age: string;
  gender: string;
  berth_preference: string;
}

export default function PassengerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const trainId = searchParams.get('train') || '';
  const classCode = searchParams.get('class') || '';
  const journeyDate = searchParams.get('date') || '';

  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: 1, name: '', age: '', gender: 'male', berth_preference: 'no_preference' }
  ]);
  const [trainDetails, setTrainDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTrainDetails = async () => {
      try {
        setLoading(true);
        // Attempt to fetch from API first
        const response = await fetch(`/api/trains?id=${trainId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setTrainDetails(result.data);
        } else {
          // Fallback to mock data if API fails
          const mockTrainData = {
            train_id: Number(trainId),
            train_number: trainId,
            train_name: getTrainNameById(Number(trainId)),
            train_type: "Express",
            source_station_name: "New Delhi",
            destination_station_name: "Mumbai",
            standard_departure_time: "06:45 AM",
            standard_arrival_time: "09:30 PM",
            seat_configurations: [
              {
                class_id: 1,
                class_name: "Sleeper Class",
                class_code: classCode || "SL",
                total_seats: 72,
                seats_available: 45,
                calculated_fare: 850
              },
              {
                class_id: 2,
                class_name: "AC 3 Tier",
                class_code: "3A",
                total_seats: 64,
                seats_available: 22,
                calculated_fare: 1450
              },
              {
                class_id: 3,
                class_name: "AC 2 Tier",
                class_code: "2A",
                total_seats: 48,
                seats_available: 15,
                calculated_fare: 1950
              }
            ]
          };
          setTrainDetails(mockTrainData);
        }
      } catch (error) {
        console.error('Error fetching train details:', error);
        
        // Fallback to mock data on error
        const mockTrainData = {
          train_id: Number(trainId),
          train_number: trainId,
          train_name: getTrainNameById(Number(trainId)),
          train_type: "Express",
          source_station_name: "New Delhi",
          destination_station_name: "Mumbai",
          standard_departure_time: "06:45 AM",
          standard_arrival_time: "09:30 PM",
          seat_configurations: [
            {
              class_id: 1,
              class_name: "Sleeper Class",
              class_code: classCode || "SL",
              total_seats: 72,
              seats_available: 45,
              calculated_fare: 850
            },
            {
              class_id: 2,
              class_name: "AC 3 Tier",
              class_code: "3A",
              total_seats: 64,
              seats_available: 22,
              calculated_fare: 1450
            },
            {
              class_id: 3,
              class_name: "AC 2 Tier",
              class_code: "2A",
              total_seats: 48,
              seats_available: 15,
              calculated_fare: 1950
            }
          ]
        };
        setTrainDetails(mockTrainData);
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to get train name based on ID
    const getTrainNameById = (id: number) => {
      const trainNames: {[key: number]: string} = {
        1: "Rajdhani Express",
        2: "Shatabdi Express",
        3: "Duronto Express",
        4: "Sampark Kranti Express",
        5: "Jan Shatabdi Express",
        6: "Garib Rath Express",
        7: "Humsafar Express",
        8: "Antyodaya Express",
        // Default for any other ID
        0: "Express Train"
      };
      
      return trainNames[id] || trainNames[0];
    };
    
    if (trainId) {
      fetchTrainDetails();
    } else {
      setError('Missing train information. Please go back and select a train.');
      setLoading(false);
    }
  }, [trainId, classCode]);

  const addPassenger = () => {
    if (passengers.length < 6) {
      setPassengers([
        ...passengers,
        { 
          id: passengers.length + 1, 
          name: '', 
          age: '', 
          gender: 'male', 
          berth_preference: 'no_preference' 
        }
      ]);
    }
  };

  const removePassenger = (id: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  const updatePassenger = (id: number, field: string, value: string) => {
    setPassengers(
      passengers.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const validateForm = () => {
    // Basic validation
    for (const passenger of passengers) {
      if (!passenger.name.trim()) {
        alert('Please enter name for all passengers');
        return false;
      }
      
      if (!passenger.age.trim() || isNaN(Number(passenger.age)) || Number(passenger.age) <= 0 || Number(passenger.age) > 120) {
        alert('Please enter valid age for all passengers (1-120)');
        return false;
      }
    }
    
    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      alert('Please enter a valid email address');
      return false;
    }
    
    if (!contactPhone.trim() || contactPhone.length < 10) {
      alert('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Find the selected class based on the class code
      const selectedClass = trainDetails?.seat_configurations?.find(
        (config: any) => config.class_code === classCode
      ) || trainDetails?.seat_configurations[0];
      
      const bookingData = {
        train_id: trainId,
        journey_date: journeyDate,
        class_id: selectedClass?.class_id,
        class_code: selectedClass?.class_code,
        passengers: passengers.map(p => ({
          name: p.name,
          age: Number(p.age),
          gender: p.gender,
          berth_preference: p.berth_preference
        })),
        contact_email: contactEmail,
        contact_phone: contactPhone,
        total_fare: selectedClass?.calculated_fare * passengers.length
      };
      
      // Store in session storage for next page
      sessionStorage.setItem('booking_data', JSON.stringify(bookingData));
      
      // Navigate to review page
      router.push('/booking/review');
    } catch (error) {
      console.error('Error preparing booking data:', error);
      alert('Failed to process your request. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 animate-pulse">Loading...</p>
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
          Go Back to Train Search
        </Link>
      </div>
    );
  }

  const selectedClass = trainDetails?.seat_configurations?.find(
    (config: any) => config.class_code === classCode
  );

  return (
    <div className="max-w-6xl mx-auto my-8 p-4">
      {/* Booking Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0 animate-slideInLeft">
              <FaTicketAlt className="text-2xl mr-3" />
              <div>
                <h1 className="text-xl font-bold">Passenger Information</h1>
                <p className="text-blue-100">Add traveler details to continue booking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start">
              <div className="mr-4 text-blue-600">
                <FaInfoCircle className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Train Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Train:</p>
                    <p className="font-medium text-gray-900">{trainDetails?.train_name} (#{trainDetails?.train_number})</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Class:</p>
                    <p className="font-medium text-gray-900">{selectedClass?.class_name} ({selectedClass?.class_code})</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Journey:</p>
                    <p className="font-medium text-gray-900">{trainDetails?.source_station_name} to {trainDetails?.destination_station_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date:</p>
                    <p className="font-medium text-gray-900">{new Date(journeyDate).toDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Passenger Details</h2>
                <button 
                  type="button" 
                  onClick={addPassenger}
                  disabled={passengers.length >= 6}
                  className={`text-sm px-3 py-1.5 rounded flex items-center ${
                    passengers.length >= 6
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <FaPlus className="mr-1" size={12} />
                  Add Passenger
                </button>
              </div>

              <div className="space-y-6 stagger-animation">
                {passengers.map((passenger, index) => (
                  <div 
                    key={passenger.id} 
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-fadeIn"
                    style={{ animationDelay: `${0.1 * index + 0.3}s` }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-800">Passenger {index + 1}</h3>
                      {passengers.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removePassenger(passenger.id)}
                          className="text-sm px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 flex items-center"
                        >
                          <FaMinus className="mr-1" size={12} />
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <label htmlFor={`name-${passenger.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name*
                        </label>
                        <input
                          type="text"
                          id={`name-${passenger.id}`}
                          value={passenger.name}
                          onChange={(e) => updatePassenger(passenger.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`age-${passenger.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Age*
                        </label>
                        <input
                          type="number"
                          id={`age-${passenger.id}`}
                          value={passenger.age}
                          onChange={(e) => updatePassenger(passenger.id, 'age', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          placeholder="Age"
                          min="1"
                          max="120"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`gender-${passenger.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Gender*
                        </label>
                        <select
                          id={`gender-${passenger.id}`}
                          value={passenger.gender}
                          onChange={(e) => updatePassenger(passenger.id, 'gender', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 appearance-none"
                          required
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="col-span-1 sm:col-span-2 md:col-span-4">
                        <label htmlFor={`berth-${passenger.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Berth Preference
                        </label>
                        <select
                          id={`berth-${passenger.id}`}
                          value={passenger.berth_preference}
                          onChange={(e) => updatePassenger(passenger.id, 'berth_preference', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 appearance-none"
                        >
                          <option value="no_preference">No Preference</option>
                          <option value="lower">Lower Berth</option>
                          <option value="middle">Middle Berth</option>
                          <option value="upper">Upper Berth</option>
                          <option value="side_lower">Side Lower</option>
                          <option value="side_upper">Side Upper</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="email@example.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Booking confirmation will be sent to this email</p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter phone number"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">For important updates about your journey</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-between items-center pt-4 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <Link
                href={`/trains/${trainId}?date=${journeyDate}`}
                className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors mb-4 sm:mb-0"
              >
                <FaChevronLeft className="mr-2" />
                Back to Train Details
              </Link>
              
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Review Booking'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 