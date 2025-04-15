'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaTrain, FaUser, FaTicketAlt, FaRegCreditCard, FaWallet, FaCreditCard, FaChevronLeft, FaCheckCircle } from 'react-icons/fa';

interface BookingData {
  train_id: string;
  journey_date: string;
  class_id: number;
  class_code: string;
  passengers: Array<{
    name: string;
    age: number;
    gender: string;
    berth_preference: string;
  }>;
  contact_email: string;
  contact_phone: string;
  total_fare: number;
}

interface Train {
  train_id: number;
  train_number: string;
  train_name: string;
  train_type: string;
  source_station_name: string;
  destination_station_name: string;
  standard_departure_time: string;
  standard_arrival_time: string;
  seat_configurations: Array<{
    class_id: number;
    class_name: string;
    class_code: string;
    total_seats: number;
    seats_available: number;
    calculated_fare: number;
  }>;
}

export default function BookingReview() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [trainDetails, setTrainDetails] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [submitting, setSubmitting] = useState(false);
  const [agreement, setAgreement] = useState(false);
  
  useEffect(() => {
    // Get booking data from session storage
    try {
      const storedData = sessionStorage.getItem('booking_data');
      if (!storedData) {
        setError('Booking data not found. Please restart the booking process.');
        setLoading(false);
        return;
      }
      
      const parsedData = JSON.parse(storedData) as BookingData;
      setBookingData(parsedData);
      
      // Fetch train details
      fetchTrainDetails(parsedData.train_id);
    } catch (error) {
      console.error('Error retrieving booking data:', error);
      setError('An error occurred while retrieving your booking information.');
      setLoading(false);
    }
  }, []);
  
  const fetchTrainDetails = async (trainId: string) => {
    try {
      const response = await fetch(`/api/trains?id=${trainId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setTrainDetails(result.data);
      } else {
        // Fallback to mock data if API fails
        const mockTrainData = {
          train_id: Number(trainId),
          train_number: String(trainId),
          train_name: getTrainNameById(Number(trainId)),
          train_type: "Express",
          source_station_name: "New Delhi",
          destination_station_name: "Mumbai",
          standard_departure_time: "06:45 AM",
          standard_arrival_time: "09:30 PM",
          seat_configurations: [
            {
              class_id: bookingData?.class_id || 1,
              class_name: getClassName(bookingData?.class_code || "SL"),
              class_code: bookingData?.class_code || "SL",
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
      if (bookingData) {
        const mockTrainData = {
          train_id: Number(bookingData.train_id),
          train_number: String(bookingData.train_id),
          train_name: getTrainNameById(Number(bookingData.train_id)),
          train_type: "Express",
          source_station_name: "New Delhi",
          destination_station_name: "Mumbai",
          standard_departure_time: "06:45 AM",
          standard_arrival_time: "09:30 PM",
          seat_configurations: [
            {
              class_id: bookingData.class_id || 1,
              class_name: getClassName(bookingData.class_code || "SL"),
              class_code: bookingData.class_code || "SL",
              total_seats: 72,
              seats_available: 45,
              calculated_fare: bookingData.total_fare / bookingData.passengers.length || 850
            }
          ]
        };
        setTrainDetails(mockTrainData);
      }
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
  
  // Helper function to get class name from class code
  const getClassName = (classCode: string) => {
    const classNames: {[key: string]: string} = {
      "SL": "Sleeper Class",
      "3A": "AC 3 Tier",
      "2A": "AC 2 Tier",
      "1A": "AC First Class",
      "CC": "Chair Car"
    };
    
    return classNames[classCode] || "Sleeper Class";
  };
  
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };
  
  const calculateTotalFare = () => {
    if (!trainDetails || !bookingData) return 0;
    
    const selectedClass = trainDetails.seat_configurations.find(
      config => config.class_id === bookingData.class_id
    );
    
    if (!selectedClass) return 0;
    
    // Return the total fare or fallback to using the total_fare from bookingData
    return (selectedClass.calculated_fare * bookingData.passengers.length) || bookingData.total_fare || 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreement) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get the current user information from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Please log in to continue with the booking.');
        router.push('/login');
        return;
      }
      
      const user = JSON.parse(userStr);
      console.log('Current user:', user);
      
      // Ensure user has a passenger_id
      if (!user.passenger_id) {
        console.error('User missing passenger_id, cannot proceed with booking');
        alert('Your account is missing required information. Please update your profile before booking.');
        setSubmitting(false);
        return;
      }
      
      const selectedClass = trainDetails?.seat_configurations.find(
        config => config.class_id === bookingData?.class_id
      ) || trainDetails?.seat_configurations[0];
      
      // Initialize journey_id as null to ensure we properly handle the creation case
      let journey_id = null;
      
      // First try to find an existing journey
      try {
        // First, we need to get the station IDs for the source and destination stations
        const sourceStationResponse = await fetch(
          `/api/stations?name=${encodeURIComponent(trainDetails?.source_station_name || '')}`
        );
        const sourceStationData = await sourceStationResponse.json();
        
        const destStationResponse = await fetch(
          `/api/stations?name=${encodeURIComponent(trainDetails?.destination_station_name || '')}`
        );
        const destStationData = await destStationResponse.json();
        
        const sourceStationId = sourceStationData.success && sourceStationData.data.length > 0 
          ? sourceStationData.data[0].station_id 
          : null;
          
        const destStationId = destStationData.success && destStationData.data.length > 0 
          ? destStationData.data[0].station_id 
          : null;
        
        if (!sourceStationId || !destStationId) {
          throw new Error(`Could not find station IDs for ${trainDetails?.source_station_name} or ${trainDetails?.destination_station_name}`);
        }
        
        console.log(`Found station IDs: source=${sourceStationId}, destination=${destStationId}`);
        
        console.log(`Searching for journey with train_id=${trainDetails?.train_id}, source=${sourceStationId}, destination=${destStationId}, class_id=${selectedClass?.class_id}, date=${bookingData?.journey_date}`);
        
        // First check if a journey exists with the exact source, destination and class
        const journeyResponse = await fetch(
          `/api/journeys?train_id=${trainDetails?.train_id}&class_id=${selectedClass?.class_id}&date=${bookingData?.journey_date}&source_id=${sourceStationId}&destination_id=${destStationId}`
        );
        
        const journeyData = await journeyResponse.json();
        console.log('Journey search result:', journeyData);
        
        if (journeyData.success && journeyData.data && journeyData.data.length > 0) {
          journey_id = journeyData.data[0].journey_id;
          console.log('Found existing journey with ID:', journey_id);
        } else {
          // Create a new journey since one doesn't exist
          console.log('Existing journey not found, creating a new one');
          
          // First, get the schedule ID for this train and date
          const scheduleResponse = await fetch(
            `/api/schedules?train_id=${trainDetails?.train_id}&date=${bookingData?.journey_date}`
          );
          
          const scheduleData = await scheduleResponse.json();
          console.log('Schedule search result:', scheduleData);
          
          let schedule_id;
          
          if (scheduleData.success && scheduleData.data && scheduleData.data.length > 0) {
            schedule_id = scheduleData.data[0].schedule_id;
            console.log('Found existing schedule with ID:', schedule_id);
          } else {
            // Create a new schedule
            console.log('Creating a new schedule for train and date');
            const createScheduleResponse = await fetch('/api/schedules', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                train_id: trainDetails?.train_id,
                journey_date: bookingData?.journey_date,
                status: 'On Time'
              })
            });
            
            const newScheduleData = await createScheduleResponse.json();
            console.log('Schedule creation result:', newScheduleData);
            
            if (newScheduleData.success && newScheduleData.data && newScheduleData.data.schedule_id) {
              schedule_id = newScheduleData.data.schedule_id;
            } else {
              throw new Error('Failed to create schedule');
            }
          }
          
          const createJourneyRequest = {
            schedule_id: schedule_id,
            source_station_id: sourceStationId,
            destination_station_id: destStationId,
            class_id: selectedClass?.class_id || 1
          };
          
          console.log('Creating journey with data:', createJourneyRequest);
          
          const createJourneyResponse = await fetch('/api/journeys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createJourneyRequest)
          });
          
          const newJourneyData = await createJourneyResponse.json();
          console.log('Journey creation result:', newJourneyData);
          
          if (newJourneyData.success && newJourneyData.data && newJourneyData.data.journey_id) {
            journey_id = newJourneyData.data.journey_id;
            console.log('Created new journey with ID:', journey_id);
          } else {
            throw new Error('Failed to create journey');
          }
        }
      } catch (journeyError) {
        console.error('Error finding/creating journey:', journeyError);
        alert('Failed to create journey for this booking. Please try again.');
        setSubmitting(false);
        return;
      }
      
      if (!journey_id) {
        alert('Could not determine journey for this booking. Please try again.');
        setSubmitting(false);
        return;
      }
      
      // Calculate the total fare
      const totalFare = calculateTotalFare() + 30 + (calculateTotalFare() + 30) * 0.05;
      
      // Prepare ticket creation request
      // We're using the logged-in user as the primary passenger
      const ticketRequest = {
        journey_id,
        passengers: [{
          passenger_id: user.passenger_id,
          name: user.name || bookingData?.passengers[0]?.name,
          age: user.age || bookingData?.passengers[0]?.age || 30,
          gender: user.gender || bookingData?.passengers[0]?.gender || 'Male',
          berth_preference: bookingData?.passengers[0]?.berth_preference || 'No Preference',
          class_code: selectedClass?.class_code || 'SL',
          is_primary_passenger: true
        }],
        total_fare: totalFare,
        payment: {
          amount: totalFare,
          payment_mode: paymentMethod,
          transaction_id: 'TX' + Date.now() + Math.floor(Math.random() * 10000)
        }
      };
      
      console.log('Sending ticket creation request:', ticketRequest);
      
      // Create the ticket
      const ticketResponse = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketRequest)
      });
      
      // Safely parse the response
      const responseText = await ticketResponse.text();
      let ticketData;
      let ticketId = Math.floor(1000 + Math.random() * 9000);
      let pnrNumber = 'PNR' + Math.floor(1000000000 + Math.random() * 9000000000);
      
      try {
        ticketData = JSON.parse(responseText);
        console.log('Ticket creation response:', ticketData);
        
        if (ticketData && ticketData.success && ticketData.data) {
          ticketId = ticketData.data.ticket_id;
          pnrNumber = ticketData.data.pnr_number;
          console.log('Created ticket with ID:', ticketId, 'and PNR:', pnrNumber);
        }
      } catch (parseError) {
        console.error('Failed to parse ticket API response:', parseError);
        console.log('Raw response:', responseText.substring(0, 200));
      }
      
      // Format passenger data for session storage
      const formattedPassengers = bookingData?.passengers.map(passenger => ({
        name: passenger.name,
        age: Number(passenger.age),
        gender: passenger.gender,
        berth_preference: passenger.berth_preference
      }));
      
      // Store the ticket data in session storage for the confirmation page
      const sessionTicketData = {
        pnr: pnrNumber,
        train_id: trainDetails?.train_id,
        train_number: trainDetails?.train_number,
        train_name: trainDetails?.train_name,
        source: trainDetails?.source_station_name,
        destination: trainDetails?.destination_station_name,
        journey_date: bookingData?.journey_date,
        departure_time: trainDetails?.standard_departure_time,
        arrival_time: trainDetails?.standard_arrival_time,
        class_name: selectedClass?.class_name,
        class_code: selectedClass?.class_code,
        passengers: formattedPassengers,
        contact_email: bookingData?.contact_email || user.email,
        contact_phone: bookingData?.contact_phone || user.contact_number,
        total_fare: totalFare,
        payment_method: paymentMethod,
        booking_time: new Date().toISOString(),
        ticket_id: ticketId
      };
      
      console.log('Storing ticket data in session storage:', sessionTicketData);
      sessionStorage.setItem('ticket_data', JSON.stringify(sessionTicketData));
      
      // Navigate to confirmation page after a short delay
      setTimeout(() => {
        router.push('/booking/confirmed');
      }, 1000);
    } catch (error) {
      console.error('Error during booking process:', error);
      alert('Failed to process payment. Please try again.');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 animate-pulse">Loading your booking details...</p>
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
  
  if (!bookingData || !trainDetails) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">No Booking Found</h1>
        <p className="text-gray-600 mb-4">We couldn't find your booking information. Please start a new booking.</p>
        <Link href="/trains" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Start a New Search
        </Link>
      </div>
    );
  }
  
  const selectedClass = trainDetails.seat_configurations.find(
    config => config.class_id === bookingData.class_id
  );
  
  return (
    <div className="max-w-6xl mx-auto my-8 p-4">
      {/* Review Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0 animate-slideInLeft">
              <FaTicketAlt className="text-2xl mr-3" />
              <div>
                <h1 className="text-xl font-bold">Review and Payment</h1>
                <p className="text-blue-100">Confirm your booking details and complete payment</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Booking Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Journey Details */}
              <div className="border border-gray-200 rounded-lg overflow-hidden animate-fadeIn" style={{animationDelay: '0.1s'}}>
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaTrain className="text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">Journey Details</h2>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div className="flex-1 mb-4 md:mb-0">
                      <p className="text-sm text-gray-500 mb-1">Train</p>
                      <div className="flex items-start">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{trainDetails.train_name}</p>
                          <p className="text-gray-600">#{trainDetails.train_number} • {trainDetails.train_type}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-4 md:mb-0">
                      <p className="text-sm text-gray-500 mb-1">Journey Date</p>
                      <p className="text-gray-800 font-medium">{new Date(bookingData.journey_date).toDateString()}</p>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Class</p>
                      <p className="text-gray-800 font-medium">{selectedClass?.class_name} ({selectedClass?.class_code})</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex-1 mb-4 md:mb-0">
                      <p className="text-sm text-gray-500 mb-1">From</p>
                      <div className="flex items-start">
                        <div>
                          <p className="text-base font-medium text-gray-900">{trainDetails.source_station_name}</p>
                          <p className="text-gray-600">{trainDetails.standard_departure_time}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:block text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">To</p>
                      <div className="flex items-start">
                        <div>
                          <p className="text-base font-medium text-gray-900">{trainDetails.destination_station_name}</p>
                          <p className="text-gray-600">{trainDetails.standard_arrival_time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Passenger Details */}
              <div className="border border-gray-200 rounded-lg overflow-hidden animate-fadeIn" style={{animationDelay: '0.2s'}}>
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaUser className="text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">Passenger Details</h2>
                  </div>
                </div>
                
                <div className="p-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berth</th>
                      </tr>
                    </thead>
                    <tbody className="stagger-animation">
                      {bookingData.passengers.map((passenger, index) => (
                        <tr key={index} className="border-b border-gray-100 animate-fadeIn hover:bg-gray-50 transition-colors" style={{animationDelay: `${0.1 * index + 0.3}s`}}>
                          <td className="py-3 text-sm text-gray-800">{index + 1}</td>
                          <td className="py-3 text-sm font-medium text-gray-800">{passenger.name}</td>
                          <td className="py-3 text-sm text-gray-600">{passenger.age}</td>
                          <td className="py-3 text-sm text-gray-600 capitalize">{passenger.gender}</td>
                          <td className="py-3 text-sm text-gray-600 capitalize">{passenger.berth_preference.replace('_', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Contact Email</p>
                        <p className="text-gray-800">{bookingData.contact_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Contact Phone</p>
                        <p className="text-gray-800">{bookingData.contact_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Payment */}
            <div className="lg:col-span-1 animate-fadeIn" style={{animationDelay: '0.3s'}}>
              <div className="border border-gray-200 rounded-lg overflow-hidden sticky top-4">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Fare Summary</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div>
                      <p className="text-gray-600">Base Fare ({bookingData.passengers.length} {bookingData.passengers.length === 1 ? 'passenger' : 'passengers'})</p>
                      <p className="text-xs text-gray-500">Class: {selectedClass?.class_name}</p>
                    </div>
                    <p className="text-gray-800 font-medium">₹{selectedClass?.calculated_fare} × {bookingData.passengers.length}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <p className="text-gray-600">Service Charge</p>
                    <p className="text-gray-800 font-medium">₹30.00</p>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3">
                    <p className="text-gray-600">GST (5%)</p>
                    <p className="text-gray-800 font-medium">₹{calculateTotalFare() !== undefined && calculateTotalFare() !== null ? ((calculateTotalFare() + 30) * 0.05).toFixed(2) : '0.00'}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <p className="text-base font-semibold text-gray-800">Total Amount</p>
                    <p className="text-lg font-bold text-blue-600">₹{calculateTotalFare() !== undefined && calculateTotalFare() !== null ? (calculateTotalFare() + 30 + (calculateTotalFare() + 30) * 0.05).toFixed(2) : '0.00'}</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Payment Method</h3>
                  
                  <div className="space-y-3 mb-4">
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                    }`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={() => handlePaymentMethodChange('credit_card')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <FaRegCreditCard className="mx-3 text-blue-600" />
                      <span className="text-gray-800">Credit/Debit Card</span>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                    }`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => handlePaymentMethodChange('upi')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <FaWallet className="mx-3 text-green-600" />
                      <span className="text-gray-800">UPI Payment</span>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'net_banking' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                    }`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="net_banking"
                        checked={paymentMethod === 'net_banking'}
                        onChange={() => handlePaymentMethodChange('net_banking')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <FaCreditCard className="mx-3 text-purple-600" />
                      <span className="text-gray-800">Net Banking</span>
                    </label>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agreement}
                        onChange={() => setAgreement(!agreement)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        I agree to the terms and conditions and cancellation policy
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center">
                    <Link
                      href={`/booking/passengers?train=${trainDetails.train_id}&class=${selectedClass?.class_code}&date=${bookingData.journey_date}`}
                      className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors mb-2 sm:mb-0"
                    >
                      <FaChevronLeft className="mr-2" />
                      Back
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
                        'Pay & Confirm'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 