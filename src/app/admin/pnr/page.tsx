'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { FaTicketAlt, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { downloadTicketAsPDF } from '@/lib/pdfUtils';

export default function PnrTrackingPage() {
  const [pnrNumber, setPnrNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pnrNumber.trim()) {
      setError('Please enter a PNR number');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch ticket data from the API
      const response = await fetch(`/api/tickets?pnr=${pnrNumber}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(`No ticket found with PNR ${pnrNumber}. Try 1234567890 for a sample response.`);
        } else {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('Fetched ticket data:', data.data);
        setTicketData(data.data);
      } else {
        // Try the demo PNR
        if (pnrNumber === '1234567890') {
          setTicketData({
            pnr_number: pnrNumber,
            booking_date: '2023-08-15',
            booking_status: 'Confirmed',
            journey_date: '2023-08-25',
            train_number: '12301',
            train_name: 'Rajdhani Express',
            source_station: 'New Delhi',
            destination_station: 'Mumbai Central',
            class_name: 'AC 3 Tier',
            departure_time: '16:55',
            arrival_time: '08:15',
            passengers: [
              {
                name: 'John Doe',
                age: 35,
                gender: 'Male',
                seat_number: 'B2-34',
                status: 'Confirmed'
              },
              {
                name: 'Jane Doe',
                age: 32,
                gender: 'Female',
                seat_number: 'B2-35',
                status: 'Confirmed'
              }
            ]
          });
        } else {
          setError(data.error || 'No ticket found with the provided PNR number. Try 1234567890 for a sample response.');
        }
      }
    } catch (err) {
      console.error('Error fetching ticket data:', err);
      
      // Try the demo PNR as fallback
      if (pnrNumber === '1234567890') {
        setTicketData({
          pnr_number: pnrNumber,
          booking_date: '2023-08-15',
          booking_status: 'Confirmed',
          journey_date: '2023-08-25',
          train_number: '12301',
          train_name: 'Rajdhani Express',
          source_station: 'New Delhi',
          destination_station: 'Mumbai Central',
          class_name: 'AC 3 Tier',
          departure_time: '16:55',
          arrival_time: '08:15',
          passengers: [
            {
              name: 'John Doe',
              age: 35,
              gender: 'Male',
              seat_number: 'B2-34',
              status: 'Confirmed'
            },
            {
              name: 'Jane Doe',
              age: 32,
              gender: 'Female',
              seat_number: 'B2-35',
              status: 'Confirmed'
            }
          ]
        });
      } else {
        setError('Failed to fetch ticket information. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <Link href="/admin" className="text-white mr-4 hover:text-blue-200">
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">PNR Status Tracking</h1>
              <p className="text-blue-100">Track status for any ticket by PNR number</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="pnr" className="block text-sm font-medium text-gray-700 mb-1">
                PNR Number
              </label>
              <input
                type="text"
                id="pnr"
                placeholder="Enter 10-digit PNR number"
                value={pnrNumber}
                onChange={(e) => setPnrNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={10}
              />
            </div>
            <div className="self-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-blue-600 text-white px-6 py-2 rounded-md font-medium flex items-center justify-center ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <FaSearch className="mr-2" />
                    Track PNR
                  </>
                )}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
              {error}
            </div>
          )}
        </div>

        {ticketData && (
          <div ref={ticketRef} className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
            <div className="bg-blue-600 p-4 text-white flex items-center">
              <FaTicketAlt className="text-xl mr-3" />
              <h2 className="text-xl font-semibold">Ticket Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">PNR Number</h3>
                  <p className="text-lg font-medium">{ticketData.pnr_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Booking Date</h3>
                  <p className="text-lg font-medium">{new Date(ticketData.booking_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Status</h3>
                  <p className="text-lg font-medium">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full">
                      {ticketData.booking_status}
                    </span>
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Train</h3>
                  <p className="text-lg font-medium">
                    {ticketData.train_name} ({ticketData.train_number})
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Class</h3>
                  <p className="text-lg font-medium">{ticketData.class_name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Journey Date</h3>
                  <p className="text-lg font-medium">{new Date(ticketData.journey_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">From</h3>
                  <div>
                    <p className="text-lg font-medium">{ticketData.source_station}</p>
                    <p className="text-sm text-gray-600">{ticketData.departure_time}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">To</h3>
                  <div>
                    <p className="text-lg font-medium">{ticketData.destination_station}</p>
                    <p className="text-sm text-gray-600">{ticketData.arrival_time}</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mt-6 mb-4">Passenger Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">No.</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Name</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Age</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Gender</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Seat</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ticketData.passengers.map((passenger: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{index + 1}</td>
                        <td className="py-3 px-4 text-sm font-medium">{passenger.name}</td>
                        <td className="py-3 px-4 text-sm">{passenger.age}</td>
                        <td className="py-3 px-4 text-sm">{passenger.gender}</td>
                        <td className="py-3 px-4 text-sm font-medium">{passenger.seat_number}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            passenger.status === 'Confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : passenger.status === 'Waitlisted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {passenger.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => downloadTicketAsPDF(ticketRef.current, ticketData.pnr_number)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md font-medium mr-3 hover:bg-blue-200"
                >
                  Print Ticket
                </button>
                <Link 
                  href={`/admin/passengers?train=${ticketData.train_number}&date=${ticketData.journey_date}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
                >
                  View All Passengers
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 