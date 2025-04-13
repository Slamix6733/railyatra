'use client';

import { useState } from 'react';
import { FaTrain, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaSadTear, FaSearch, FaTicketAlt, FaClock } from 'react-icons/fa';

// Define types for the ticket data
interface Passenger {
  name: string;
  age: number;
  gender: string;
  status: string;
  seat_number?: string;
  berth_type?: string;
  waitlist_number?: number;
}

interface StationTiming {
  station_id: number;
  station_name: string;
  station_code: string;
  city?: string;
  sequence_number?: number;
  distance_from_source?: number;
  actual_arrival_time: string | null;
  actual_departure_time: string | null;
  scheduled_arrival?: string | null;
  scheduled_departure?: string | null;
}

interface TicketData {
  ticket_id: number;
  pnr_number: string;
  booking_date: string;
  booking_status: string;
  total_fare: number;
  train_number: string;
  train_name: string;
  source_station: string;
  source_code: string;
  destination_station: string;
  destination_code: string;
  journey_date: string;
  class_name?: string;
  class_code?: string;
  source_departure_time?: string;
  destination_arrival_time?: string;
  train_status?: string;
  passengers: Passenger[];
  station_timings?: StationTiming[];
}

export default function PnrStatusPage() {
  const [pnrNumber, setPnrNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pnrNumber || pnrNumber.trim().length < 8) {
      setError('Please enter a valid PNR number');
      return;
    }

    setIsLoading(true);
    setError('');
    setTicketData(null);

    try {
      const response = await fetch(`/api/tickets?pnr=${pnrNumber.trim()}`);
      const result = await response.json();
      
      if (!result.success) {
        setError(result.error || 'Failed to fetch PNR details');
        setTicketData(null);
      } else {
        setTicketData(result.data);
        setError('');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    if (!status) return 'bg-gray-500';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('confirm') || statusLower === 'cnf') return 'bg-green-500';
    if (statusLower.includes('rac')) return 'bg-yellow-500';
    if (statusLower.includes('wl') || statusLower.includes('wait')) return 'bg-red-500';
    if (statusLower.includes('cancel')) return 'bg-red-700';
    return 'bg-blue-500';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string | null): string => {
    if (!timeString) return 'N/A';
    
    // Handle datetime strings
    if (timeString.includes('T') || timeString.includes(' ')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Handle time-only strings (HH:MM:SS)
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">PNR Status Checker</h1>
            <p className="text-xl text-blue-100 mb-6 animate-fadeIn" style={{animationDelay: '200ms'}}>
              Track your ticket status and journey details with your PNR number
            </p>
          </div>
        </div>
      </div>
      
      {/* PNR Form */}
      <div className="container mx-auto px-4 -mt-10 z-10 relative">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fadeIn" style={{animationDelay: '300ms'}}>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="pnr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter PNR Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTicketAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="pnr"
                    value={pnrNumber}
                    onChange={(e) => setPnrNumber(e.target.value)}
                    placeholder="Enter your 10-digit PNR number"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="self-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    <>
                      <FaSearch className="mr-2" />
                      Check Status
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mt-6 rounded-lg shadow-md flex items-center animate-fadeIn">
            <FaSadTear className="mr-3 flex-shrink-0 text-xl" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Ticket Details */}
        {ticketData && (
          <div className="my-8 animate-fadeIn" style={{animationDelay: '200ms'}}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6">
                <div className="flex flex-wrap justify-between items-center mb-4">
                  <div className="flex items-center mb-2 md:mb-0">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <FaTicketAlt className="text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">PNR: {ticketData.pnr_number}</h2>
                      <p className="text-blue-100 text-sm">Booked on {formatDate(ticketData.booking_date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full text-white ${getStatusColor(ticketData.booking_status)}`}>
                    {ticketData.booking_status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="flex items-start">
                    <FaTrain className="mr-3 mt-1 flex-shrink-0 text-blue-300" />
                    <div>
                      <div className="text-sm text-blue-200">Train Number/Name</div>
                      <div className="font-medium">{ticketData.train_number} - {ticketData.train_name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCalendarAlt className="mr-3 mt-1 flex-shrink-0 text-blue-300" />
                    <div>
                      <div className="text-sm text-blue-200">Journey Date</div>
                      <div className="font-medium">{formatDate(ticketData.journey_date)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <div className="flex items-center justify-between text-sm text-blue-200 mb-1">
                      <span>From</span>
                      <span>To</span>
                    </div>
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium">{ticketData.source_station}</div>
                        <div className="text-sm text-blue-200">{ticketData.source_code}</div>
                      </div>
                      
                      <div className="flex-1 mx-4 border-t border-dashed border-blue-300/60 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full p-1">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14"></path>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{ticketData.destination_station}</div>
                        <div className="text-sm text-blue-200">{ticketData.destination_code}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <FaClock className="mr-2 mt-1 flex-shrink-0 text-blue-300" size={14} />
                      <div>
                        <div className="text-sm text-blue-200">Departure</div>
                        <div className="font-medium">{formatTime(ticketData.source_departure_time)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaClock className="mr-2 mt-1 flex-shrink-0 text-blue-300" size={14} />
                      <div>
                        <div className="text-sm text-blue-200">Arrival</div>
                        <div className="font-medium">{formatTime(ticketData.destination_arrival_time)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger List */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Passenger Details
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Passenger</th>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age/Gender</th>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Seat/Berth</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {ticketData.passengers.map((passenger, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 mr-3">
                                <FaUser size={14} />
                              </div>
                              <span>{passenger.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {passenger.age} / {passenger.gender.charAt(0).toUpperCase() + passenger.gender.slice(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              passenger.status.toLowerCase().includes('confirm') || passenger.status.toLowerCase() === 'cnf'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : passenger.status.toLowerCase().includes('rac')
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : passenger.status.toLowerCase().includes('wl') || passenger.status.toLowerCase().includes('wait')
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {passenger.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {passenger.seat_number ? (
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">{passenger.seat_number}</span>
                                {passenger.berth_type && (
                                  <span className="text-xs ml-2">({passenger.berth_type.replace('_', ' ')})</span>
                                )}
                              </div>
                            ) : (
                              passenger.waitlist_number ? `WL ${passenger.waitlist_number}` : 'Not Assigned'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Fare Details */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Fare Details</h3>
                    <div className="flex items-center">
                      <FaRupeeSign className="text-gray-500 dark:text-gray-400 mr-1" />
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{ticketData.total_fare}</span>
                    </div>
                  </div>
                  
                  {ticketData.class_name && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Class: <span className="font-medium text-gray-700 dark:text-gray-300">{ticketData.class_name} ({ticketData.class_code})</span>
                    </div>
                  )}
                </div>
                
                {/* Train Route and Timings */}
                {ticketData.station_timings && ticketData.station_timings.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Journey Route</h3>
                    
                    <div className="space-y-4">
                      {ticketData.station_timings.map((station, idx) => (
                        <div key={idx} className="flex relative">
                          {/* Timeline connector */}
                          {idx < ticketData.station_timings!.length - 1 && (
                            <div className="absolute top-6 left-3 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-900"></div>
                          )}
                          
                          {/* Station dot */}
                          <div 
                            className={`z-10 flex-shrink-0 w-6 h-6 rounded-full mt-1 mr-4 flex items-center justify-center ${
                              station.station_code === ticketData.source_code 
                                ? 'bg-green-500' 
                                : station.station_code === ticketData.destination_code
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                          >
                            <span className="text-white text-xs font-bold">{idx + 1}</span>
                          </div>
                          
                          {/* Station details */}
                          <div className="flex-1 pb-8">
                            <div className="flex flex-wrap justify-between items-center">
                              <div>
                                <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                  {station.station_name}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {station.station_code}
                                  {station.distance_from_source !== undefined && (
                                    <span className="ml-2">{station.distance_from_source} km</span>
                                  )}
                                </p>
                              </div>
                              
                              <div className="text-right">
                                {station.scheduled_arrival && (
                                  <div className="text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Arr: </span>
                                    <span className="text-gray-900 dark:text-white font-medium">{formatTime(station.scheduled_arrival)}</span>
                                  </div>
                                )}
                                {station.scheduled_departure && (
                                  <div className="text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Dep: </span>
                                    <span className="text-gray-900 dark:text-white font-medium">{formatTime(station.scheduled_departure)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 