'use client';

import { useState } from 'react';
import { FaTrain, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaSadTear, FaSearch, FaTicketAlt, FaClock, FaDownload, FaShareAlt } from 'react-icons/fa';
import { getPnrStatus } from '@/lib/api-client';

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
  station_name: string;
  arrival_time: string;
  departure_time: string;
  day: number;
  distance: number;
  platform?: string;
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pnrNumber.trim()) {
      setError('Please enter a PNR number');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use our API client instead of direct fetch
      const data = await getPnrStatus(pnrNumber.trim());
      
      if (data.success && data.data) {
        // Transform the MySQL function data to match our frontend interface
        const pnrData = data.data;
        
        // Format the data to match the TicketData interface
        const formattedData: TicketData = {
          ticket_id: pnrData.ticket_id,
          pnr_number: pnrData.pnr_number,
          booking_date: pnrData.booking_date || new Date().toISOString().split('T')[0],
          booking_status: pnrData.booking_status,
          total_fare: pnrData.total_fare || 0,
          train_number: pnrData.journey_details?.train_number || '',
          train_name: pnrData.journey_details?.train_name || '',
          source_station: pnrData.journey_details?.source_station || '',
          source_code: '',  // May need to add in the MySQL function
          destination_station: pnrData.journey_details?.destination_station || '',
          destination_code: '', // May need to add in the MySQL function
          journey_date: pnrData.journey_details?.journey_date || '',
          source_departure_time: pnrData.journey_details?.departure_time || '',
          destination_arrival_time: pnrData.journey_details?.arrival_time || '',
          passengers: pnrData.passengers || [],
        };
        
        setTicketData(formattedData);
      } else {
        // Fallback to sample data for demo purposes
        if (pnrNumber === '1234567890') {
          setTicketData({
            ticket_id: 12345,
            pnr_number: pnrNumber,
            booking_date: '2023-08-15',
            booking_status: 'Confirmed',
            total_fare: 1250,
            train_number: '12301',
            train_name: 'Rajdhani Express',
            source_station: 'New Delhi',
            source_code: 'NDLS',
            destination_station: 'Mumbai Central',
            destination_code: 'MMCT',
            journey_date: '2023-08-25',
            class_name: 'AC 3 Tier',
            class_code: '3A',
            source_departure_time: '16:55',
            destination_arrival_time: '08:15',
            train_status: 'On Time',
            passengers: [
              {
                name: 'John Doe',
                age: 35,
                gender: 'Male',
                seat_number: 'B2-34',
                berth_type: 'LOWER',
                status: 'Confirmed'
              },
              {
                name: 'Jane Doe',
                age: 32,
                gender: 'Female',
                seat_number: 'B2-35',
                berth_type: 'UPPER',
                status: 'Confirmed'
              }
            ],
            station_timings: [
              {
                station_name: 'New Delhi',
                arrival_time: '',
                departure_time: '16:55',
                day: 1,
                distance: 0
              },
              {
                station_name: 'Mumbai Central',
                arrival_time: '08:15',
                departure_time: '',
                day: 2,
                distance: 1384
              }
            ]
          });
        } else {
          setError(data.error || 'No ticket found with the provided PNR number. Try 1234567890 for a sample response.');
        }
      }
    } catch (err) {
      console.error('Error fetching ticket data:', err);
      setError('Failed to fetch ticket information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to determine status color
  const getStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (status.includes('confirm')) return 'bg-green-500';
    if (status.includes('rac')) return 'bg-yellow-500';
    if (status.includes('waitlist')) return 'bg-red-500';
    if (status.includes('cancel')) return 'bg-gray-500';
    return 'bg-blue-500';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">PNR Status</h1>
        
        {/* PNR Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="pnr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter 10-digit PNR Number</label>
              <input
                type="text"
                id="pnr"
                value={pnrNumber}
                onChange={(e) => setPnrNumber(e.target.value)}
                placeholder="e.g. 1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                maxLength={10}
                pattern="[0-9]{10}"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaSearch className="mr-2" />
                  Get Status
                </span>
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-start">
              <FaSadTear className="mr-2 mt-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        {/* Ticket Details */}
        {ticketData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <FaTicketAlt className="mr-2" />
                  PNR: {ticketData.pnr_number}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticketData.booking_status)}`}>
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
              
              <div className="mt-6 flex items-center justify-between text-white">
                <div className="flex flex-col items-start">
                  <div className="text-sm opacity-75">From</div>
                  <div className="font-bold text-lg">{ticketData.source_station}</div>
                  {ticketData.source_code && <div className="text-xs opacity-75">{ticketData.source_code}</div>}
                  {ticketData.source_departure_time && (
                    <div className="flex items-center mt-1 text-sm">
                      <FaClock className="mr-1 text-blue-300" />
                      {ticketData.source_departure_time}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 px-4">
                  <div className="border-t-2 border-dashed border-blue-400 relative">
                    <div className="absolute left-0 -mt-2 w-4 h-4 rounded-full bg-white"></div>
                    <div className="absolute right-0 -mt-2 w-4 h-4 rounded-full bg-white"></div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end text-right">
                  <div className="text-sm opacity-75">To</div>
                  <div className="font-bold text-lg">{ticketData.destination_station}</div>
                  {ticketData.destination_code && <div className="text-xs opacity-75">{ticketData.destination_code}</div>}
                  {ticketData.destination_arrival_time && (
                    <div className="flex items-center mt-1 text-sm">
                      <FaClock className="mr-1 text-blue-300" />
                      {ticketData.destination_arrival_time}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Passenger Details */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                <FaUser className="inline-block mr-2 mb-1" />
                Passenger Details
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-900/50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No.</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age/Gender</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Seat/Berth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {ticketData.passengers.map((passenger, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{passenger.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {passenger.age} / {passenger.gender.charAt(0)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(passenger.status)} text-white`}>
                            {passenger.status}
                            {passenger.waitlist_number && ` (WL ${passenger.waitlist_number})`}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {passenger.seat_number ? 
                            `${passenger.seat_number}${passenger.berth_type ? ` (${passenger.berth_type})` : ''}` : 
                            '-'
                          }
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
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Train Route</h3>
                  
                  <div className="space-y-6">
                    {ticketData.station_timings.map((station, index) => (
                      <div key={index} className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                            {station.day}
                          </div>
                          {index < ticketData.station_timings!.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-700 my-1"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {station.station_name}
                          </div>
                          
                          <div className="flex mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <div className="mr-6">
                              {station.arrival_time ? (
                                <span>Arr: {station.arrival_time}</span>
                              ) : (
                                <span>Starting Point</span>
                              )}
                            </div>
                            
                            <div>
                              {station.departure_time ? (
                                <span>Dep: {station.departure_time}</span>
                              ) : (
                                <span>Destination</span>
                              )}
                            </div>
                            
                            {station.platform && (
                              <div className="ml-6">
                                Platform: {station.platform}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Distance: {station.distance} km
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <button 
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaDownload className="mr-2 -ml-1" />
                  Download E-Ticket
                </button>
                
                <button 
                  onClick={() => {
                    try {
                      navigator.share({
                        title: `PNR Status for ${ticketData.pnr_number}`,
                        text: `My ticket details for ${ticketData.train_name} (${ticketData.train_number}) on ${formatDate(ticketData.journey_date)}`,
                        url: window.location.href
                      });
                    } catch (err) {
                      console.error('Web Share API not supported', err);
                      alert('Sharing not supported on this browser');
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaShareAlt className="mr-2 -ml-1" />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 