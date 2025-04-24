'use client';

import { useState, useEffect } from 'react';
import { getTrainClassDetails } from '@/lib/train-utils';
import type { TrainClassDetails as TrainClassDetailsType } from '@/lib/train-class-model';
import { FaChartLine, FaCalendarAlt, FaClock, FaUsers, FaChair, FaMoneyBillWave, FaTag } from 'react-icons/fa';

interface TrainClassDetailsProps {
  trainId: number | string;
  scheduleId?: number | string;
  date?: string;
}

export default function TrainClassDetails({ trainId, scheduleId, date }: TrainClassDetailsProps) {
  const [classDetails, setClassDetails] = useState<TrainClassDetailsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('availability');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await getTrainClassDetails(trainId, scheduleId, date);
        
        if (response.success && response.data) {
          setClassDetails(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch train class details');
          setClassDetails(null);
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [trainId, scheduleId, date]);

  // Format number as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading class details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <p className="font-medium">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
        <p>No class details available for this train.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Train Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 text-white">
        <h2 className="text-xl font-bold">{classDetails.train.train_name}</h2>
        <p className="text-sm">
          {classDetails.train.train_number} • {classDetails.train.train_type} • {classDetails.train.run_days}
        </p>
        <div className="flex justify-between mt-2 text-sm">
          <div>
            <p className="text-blue-100">From</p>
            <p className="font-semibold">{classDetails.train.source_station_name} ({classDetails.train.source_station_code})</p>
          </div>
          <div>
            <p className="text-blue-100">To</p>
            <p className="font-semibold">{classDetails.train.destination_station_name} ({classDetails.train.destination_station_code})</p>
          </div>
          <div>
            <p className="text-blue-100">Distance</p>
            <p className="font-semibold">{classDetails.train.journey_distance || '—'} km</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'availability'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaChair className="inline-block mr-1" /> Availability
          </button>
          <button
            onClick={() => setActiveTab('fares')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'fares'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaTag className="inline-block mr-1" /> Fares
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaChartLine className="inline-block mr-1" /> Statistics
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'revenue'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaMoneyBillWave className="inline-block mr-1" /> Revenue
          </button>
        </nav>
      </div>

      {/* Class Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3">Available Classes</h3>
        
        <div className="space-y-4">
          {classDetails.class_details.map((classItem) => (
            <div key={classItem.class_id} className="border rounded-lg overflow-hidden">
              {/* Class Header */}
              <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800">{classItem.class_name}</span>
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {classItem.class_code}
                  </span>
                  {classItem.class_description && (
                    <span className="ml-2 text-xs text-gray-500">{classItem.class_description}</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Seats</p>
                  <p className="font-semibold">{classItem.total_seats}</p>
                </div>
              </div>
              
              {/* Class Body based on active tab */}
              <div className="p-3">
                {/* Availability Tab */}
                {activeTab === 'availability' && classItem.seat_stats && (
                  <div>
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Seat Availability</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-gray-600">Available:</p>
                          <p className="font-medium text-green-700">{classItem.seat_stats.available_seats}</p>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <p className="text-gray-600">RAC:</p>
                          <p className="font-medium text-yellow-700">{classItem.seat_stats.rac_seats}</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded">
                          <p className="text-gray-600">Waitlisted:</p>
                          <p className="font-medium text-red-700">{classItem.seat_stats.waitlisted_seats}</p>
                        </div>
                      </div>
                      
                      {/* Current Status */}
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Current RAC:</p>
                          <p className="font-medium text-gray-700">{classItem.seat_stats.current_rac}/{classItem.seat_stats.max_rac}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Current WL:</p>
                          <p className="font-medium text-gray-700">{classItem.seat_stats.current_waitlist}/{classItem.seat_stats.max_waitlist}</p>
                        </div>
                      </div>
                      
                      {/* Occupancy bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Occupancy Rate</span>
                          <span>{classItem.seat_stats.occupancy_rate}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full bg-blue-600" 
                            style={{ width: classItem.seat_stats.occupancy_rate }}
                          ></div>
                        </div>
                      </div>

                      {/* Demand Information */}
                      {classItem.demand_info && (
                        <div className="mt-3 p-2 bg-purple-50 rounded text-sm">
                          <p className="text-purple-800 font-medium">Peak Demand: {classItem.demand_info.peak_day}</p>
                          <p className="text-purple-600 text-xs">Highest bookings: {classItem.demand_info.peak_booking_count}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Fares Tab */}
                {activeTab === 'fares' && classItem.fare_details && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Fare Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-gray-600 mb-1">Base Fare</p>
                        <p className="text-xl font-medium text-blue-700">{formatCurrency(classItem.fare_details.base_fare)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {classItem.fare_details.fare_per_km} ₹/km × {classItem.fare_details.journey_distance_km} km
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-gray-600 mb-1">Total Fare</p>
                        <p className="text-xl font-medium text-blue-700">{formatCurrency(classItem.fare_details.total_fare)}</p>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Service: +{formatCurrency(classItem.fare_details.service_charge)}</span>
                          <span>GST: +{formatCurrency(classItem.fare_details.gst || 0)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-50 rounded flex justify-between items-center text-sm">
                      <div>
                        <p className="text-gray-600">Stations</p>
                        <p className="font-medium text-gray-800">{classItem.fare_details.stations_count || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Distance</p>
                        <p className="font-medium text-gray-800">{classItem.fare_details.journey_distance_km} km</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fare/km</p>
                        <p className="font-medium text-gray-800">₹{classItem.fare_details.fare_per_km}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Stats Tab */}
                {activeTab === 'stats' && classItem.booking_stats && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Booking Statistics</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Total Journeys:</p>
                        <p className="font-medium text-gray-800">{classItem.journey_count || classItem.booking_stats.total_journeys}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Total Tickets:</p>
                        <p className="font-medium text-gray-800">{classItem.booking_stats.total_tickets}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Passengers:</p>
                        <p className="font-medium text-gray-800">{classItem.booking_stats.total_passengers}</p>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mt-3 mb-2">Recent Booking Trends</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">Today:</p>
                        <p className="font-medium text-blue-700">{classItem.booking_stats.bookings_today || 0}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">This Week:</p>
                        <p className="font-medium text-blue-700">{classItem.booking_stats.bookings_week || 0}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">This Month:</p>
                        <p className="font-medium text-blue-700">{classItem.booking_stats.bookings_month || 0}</p>
                      </div>
                    </div>
                    
                    {classItem.seat_stats && (
                      <div className="mt-3 bg-gray-50 p-2 rounded">
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-gray-600">Confirmed:</p>
                            <p className="font-medium text-green-700">{classItem.seat_stats.confirmed_seats}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Cancellations:</p>
                            <p className="font-medium text-red-700">{classItem.seat_stats.cancellations}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Last WL #:</p>
                            <p className="font-medium text-yellow-700">{classItem.seat_stats.last_waitlist || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Revenue Tab */}
                {activeTab === 'revenue' && classItem.revenue_stats && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue Details</h4>
                    <div className="bg-green-50 p-3 rounded mb-3">
                      <p className="text-gray-600 text-sm">Total Revenue</p>
                      <p className="text-2xl font-semibold text-green-700 mb-1">
                        {formatCurrency(classItem.revenue_stats.total_revenue)}
                      </p>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Avg. Ticket: {formatCurrency(classItem.revenue_stats.avg_fare)}</span>
                        <span>Per Seat: {formatCurrency(classItem.revenue_stats.revenue_per_seat)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Per KM Revenue:</p>
                        <p className="font-medium text-gray-800">
                          {formatCurrency(classItem.revenue_stats.total_revenue / (classItem.fare_details?.journey_distance_km || 1))}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Occupancy:</p>
                        <p className="font-medium text-gray-800">{classItem.seat_stats?.occupancy_rate || '0%'}</p>
                      </div>
                    </div>
                    
                    {/* Comparison with other classes if more than one class */}
                    {classDetails.class_details.length > 1 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Revenue Comparison</p>
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block text-blue-600">
                                This Class
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-blue-600">
                                {Math.round((classItem.revenue_stats.total_revenue / 
                                  classDetails.class_details.reduce((sum, cls) => 
                                    sum + (cls.revenue_stats?.total_revenue || 0), 0)) * 100)}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                            <div
                              style={{ 
                                width: `${Math.round((classItem.revenue_stats.total_revenue / 
                                  classDetails.class_details.reduce((sum, cls) => 
                                    sum + (cls.revenue_stats?.total_revenue || 0), 0)) * 100)}%` 
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 