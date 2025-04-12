'use client';

import { useState } from 'react';
import { FaTrain, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaSadTear } from 'react-icons/fa';

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
    <div className="bg-white dark:bg-gray-900 min-h-screen py-10">
      <div className="container mx-auto px-4">                       
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">PNR Status</h1>
          
          {/* PNR Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="pnr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter PNR Number
                </label>
                <input
                  type="text"
                  id="pnr"
                  value={pnrNumber}
                  onChange={(e) => setPnrNumber(e.target.value)}
                  placeholder="10-digit PNR number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  maxLength={10}
                />
              </div>
              <div className="self-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Checking...' : 'Check Status'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-8 rounded-md flex items-center">
              <FaSadTear className="mr-3 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {/* Ticket Details */}
          {ticketData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              {/* Ticket Header */}
              <div className="bg-blue-700 text-white p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">PNR: {ticketData.pnr_number}</h2>
                  <span className={`text-sm px-3 py-1 rounded-full text-white ${getStatusColor(ticketData.booking_status)}`}>
                    {ticketData.booking_status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <FaTrain className="mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-blue-200">Train Number/Name</div>
                      <div>{ticketData.train_number} - {ticketData.train_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-blue-200">Journey Date</div>
                      <div>{formatDate(ticketData.journey_date)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Journey Details */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-4 md:mb-0">
                    <div className="text-sm text-gray-500 dark:text-gray-400">From</div>
                    <div className="font-semibold text-lg text-gray-900 dark:text-white">{ticketData.source_station}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{ticketData.source_code}</div>
                    {ticketData.source_departure_time && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        <span className="font-medium">Dept:</span> {formatTime(ticketData.source_departure_time)}
                      </div>
                    )}
                  </div>
                  
                  <div className="hidden md:block flex-1 px-4">
                    <div className="relative flex items-center justify-center">
                      <div className="h-0.5 bg-blue-500 w-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white dark:bg-gray-800 px-2">
                          <FaTrain className="text-blue-700 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">To</div>
                    <div className="font-semibold text-lg text-gray-900 dark:text-white">{ticketData.destination_station}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{ticketData.destination_code}</div>
                    {ticketData.destination_arrival_time && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        <span className="font-medium">Arr:</span> {formatTime(ticketData.destination_arrival_time)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Fare Details */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Booking Date</div>
                    <div className="text-gray-900 dark:text-gray-100">{formatDate(ticketData.booking_date)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Class</div>
                    <div className="text-gray-900 dark:text-gray-100">{ticketData.class_name || 'N/A'}{ticketData.class_code ? ` (${ticketData.class_code})` : ''}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Fare</div>
                    <div className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                      <FaRupeeSign className="mr-1 h-4 w-4" />
                      {ticketData.total_fare}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Train Status */}
              {ticketData.train_status && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      ticketData.train_status.toLowerCase() === 'on time' ? 'bg-green-500' : 
                      ticketData.train_status.toLowerCase() === 'delayed' ? 'bg-yellow-500' :
                      ticketData.train_status.toLowerCase() === 'cancelled' ? 'bg-red-600' : 'bg-blue-500'
                    }`}></div>
                    <h3 className="font-semibold">Train Status: {ticketData.train_status}</h3>
                  </div>
                </div>
              )}
              
              {/* Station Schedule */}
              {ticketData.station_timings && ticketData.station_timings.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Travel Schedule</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Station
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Arrival
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Departure
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {ticketData.station_timings.map((station, index) => (
                          <tr key={index} className={
                            station.station_code === ticketData.source_code ? 'bg-green-100 dark:bg-green-900/30' :
                            station.station_code === ticketData.destination_code ? 'bg-red-100 dark:bg-red-900/30' : ''
                          }>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{station.station_name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{station.station_code}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {station.station_code === ticketData.source_code ? '-' : 
                                formatTime(station.actual_arrival_time || station.scheduled_arrival)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {station.station_code === ticketData.destination_code ? '-' : 
                                formatTime(station.actual_departure_time || station.scheduled_departure)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Passengers Details */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Passenger Details</h3>
                {ticketData.passengers && ticketData.passengers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Age/Gender
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Seat/Berth
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {ticketData.passengers.map((passenger, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <FaUser className="flex-shrink-0 mr-2 text-gray-400 dark:text-gray-500" />
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{passenger.name}</div>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {passenger.age} / {passenger.gender.charAt(0)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(passenger.status)}`}>
                                {passenger.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {passenger.seat_number ? (
                                <>
                                  {passenger.seat_number}
                                  {passenger.berth_type ? ` (${passenger.berth_type})` : ''}
                                </>
                              ) : (
                                passenger.waitlist_number ? `WL ${passenger.waitlist_number}` : 'N/A'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No passenger information available</p>
                )}
              </div>
            </div>
          )}
          
          {/* Information Section */}
          {!ticketData && !isLoading && !error && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How to Check PNR Status</h3>
              <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-400">
                <li>Enter your 10-digit PNR number in the field above</li>
                <li>PNR can be found on your ticket or booking confirmation</li>
                <li>Click on "Check Status" to view your ticket details</li>
                <li>View passenger status, train details, and journey information</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 