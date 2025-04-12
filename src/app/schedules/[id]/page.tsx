'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaLongArrowAltRight, FaTrain, FaMapMarkedAlt, FaClock, FaCalendarAlt } from 'react-icons/fa';

interface StationTiming {
  station_id: number;
  station_name: string;
  station_code: string;
  city: string;
  sequence_number: number;
  distance_from_source: number;
  arrival_time: string | null;
  departure_time: string | null;
  scheduled_arrival: string | null;
  scheduled_departure: string | null;
  platform_number: number | null;
  halt_time: number | null;
  day_count: number;
}

interface Schedule {
  schedule_id: number;
  train_id: number;
  train_number: string;
  train_name: string;
  train_type: string;
  journey_date: string;
  status: string;
  source_station: string;
  source_code: string;
  destination_station: string;
  destination_code: string;
  standard_departure_time: string;
  standard_arrival_time: string;
  run_days: string;
  journey_duration: number;
  station_timings: StationTiming[];
}

export default function ScheduleDetailPage() {
  const params = useParams();
  const scheduleId = params.id;
  
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`/api/schedules?id=${scheduleId}`);
        const data = await response.json();
        
        if (data.success) {
          setSchedule(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch schedule details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      fetchSchedule();
    }
  }, [scheduleId]);

  const formatTime = (time: string | null) => {
    if (!time) return 'N/A';
    
    try {
      // Handle HH:MM:SS format
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
      }
      return time;
    } catch (err) {
      return time;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  const formatRunDays = (runDays: string) => {
    if (!runDays) return 'Not available';
    
    const days = {
      '1': 'Mon',
      '2': 'Tue',
      '3': 'Wed',
      '4': 'Thu',
      '5': 'Fri',
      '6': 'Sat',
      '7': 'Sun'
    };
    
    try {
      return runDays.split('').map(day => days[day as keyof typeof days]).join(', ');
    } catch (err) {
      return runDays;
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-700 border-r-transparent"></div>
          <p className="mt-2 text-gray-900 dark:text-gray-300">Loading schedule details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto">
          <Link href="/schedules" className="flex items-center text-gray-900 dark:text-blue-400 hover:text-blue-800 mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Schedules
          </Link>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>Error: {error}</p>
            <p className="mt-2">Please try again later or go back to the schedules page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto">
          <Link href="/schedules" className="flex items-center text-gray-900 dark:text-blue-400 hover:text-blue-800 mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Schedules
          </Link>
          
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <p>Schedule not found. It may have been removed or is no longer available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <Link href="/schedules" className="flex items-center text-gray-900 dark:text-blue-400 hover:text-blue-800 mb-6">
          <FaArrowLeft className="mr-2" />
          Back to Schedules
        </Link>
        
        {/* Schedule Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{schedule.train_name} ({schedule.train_number})</h1>
                <div className="flex items-center mt-1">
                  <span className="bg-black text-xs text-white px-2 py-1 rounded-full">
                    {schedule.train_type}
                  </span>
                  <span className="ml-3 text-blue-100 text-sm">
                    Runs on: {formatRunDays(schedule.run_days)}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 md:mt-0 text-white">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  <span>{formatDate(schedule.journey_date)}</span>
                </div>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    schedule.status === 'On Time' ? 'bg-gray-500' : 
                    schedule.status === 'Delayed' ? 'bg-gray-500' : 
                    schedule.status === 'Cancelled' ? 'bg-gray-500' : 
                    'bg-gray-500'
                  }`}>
                    {schedule.status || 'Scheduled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="col-span-1 md:col-span-2">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="text-gray-500 text-sm">From</div>
                    <div className="text-xl font-bold text-gray-800">{schedule.source_station}</div>
                    <div className="text-gray-600 text-sm">{schedule.source_code}</div>
                    <div className="text-gray-600 mt-1">
                      <div className="flex items-center">
                        <FaClock className="mr-1 text-blue-500" />
                        <span>{formatTime(schedule.standard_departure_time)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="my-4 md:my-0 md:mx-6">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-black"></div>
                      <div className="flex-1 border-t-2 border-dashed border-gray-300 w-16 mx-2"></div>
                      <FaLongArrowAltRight className="text-gray-400 mx-2" />
                      <div className="flex-1 border-t-2 border-dashed border-gray-300 w-16 mx-2"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    </div>
                    <div className="text-center text-gray-500 text-sm mt-2">
                      {formatDuration(schedule.journey_duration || 0)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-gray-500 text-sm">To</div>
                    <div className="text-xl font-bold text-gray-800">{schedule.destination_station}</div>
                    <div className="text-gray-600 text-sm">{schedule.destination_code}</div>
                    <div className="text-gray-600 mt-1">
                      <div className="flex items-center">
                        <FaClock className="mr-1 text-blue-500" />
                        <span>{formatTime(schedule.standard_arrival_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-l border-gray-200 pl-6 hidden md:block">
                <div className="text-gray-500 text-sm">Train Type</div>
                <div className="text-gray-800 font-medium">{schedule.train_type}</div>
                
                <div className="text-gray-500 text-sm mt-3">Running Days</div>
                <div className="text-gray-800 font-medium">{formatRunDays(schedule.run_days)}</div>
              </div>
              
              <div className="border-l border-gray-200 pl-6 hidden md:block">
                <div className="text-gray-500 text-sm">Status</div>
                <div className="text-gray-800 font-medium">{schedule.status || 'Scheduled'}</div>
                
                <div className="text-gray-500 text-sm mt-3">Journey Duration</div>
                <div className="text-gray-800 font-medium">{formatDuration(schedule.journey_duration || 0)}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Station Timings */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Complete Schedule</h2>
            <p className="text-gray-600 text-sm mt-1">
              Departure and arrival times at all stations on the route
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrives
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departs
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Halt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedule.station_timings && schedule.station_timings.map((station, index) => (
                  <tr key={station.station_id} className={
                    station.station_code === schedule.source_code ? 'bg-green-50' :
                    station.station_code === schedule.destination_code ? 'bg-red-50' :
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {station.day_count || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{station.station_name}</div>
                          <div className="text-sm text-gray-500">{station.station_code}, {station.city}</div>
                        </div>
                        {station.station_code === schedule.source_code && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Source</span>
                        )}
                        {station.station_code === schedule.destination_code && (
                          <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Destination</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {station.sequence_number === 1 ? '-' : formatTime(station.arrival_time || station.scheduled_arrival)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {station.station_code === schedule.destination_code ? '-' : formatTime(station.departure_time || station.scheduled_departure)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {station.halt_time ? `${station.halt_time} min` : 
                       (station.sequence_number === 1 || station.station_code === schedule.destination_code) ? '-' : '2 min'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {station.platform_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {station.distance_from_source} km
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Train Information</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">About this Train</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <FaTrain className="text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Train Number</div>
                      <div className="text-gray-600">{schedule.train_number}</div>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <FaMapMarkedAlt className="text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Route</div>
                      <div className="text-gray-600">{schedule.source_station} to {schedule.destination_station}</div>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <FaClock className="text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Total Duration</div>
                      <div className="text-gray-600">{formatDuration(schedule.journey_duration || 0)}</div>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Amenities & Services</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-black">
                    To check available amenities and book tickets for this train, please proceed to the booking page.
                  </p>
                  <Link 
                    href={`/booking?train_id=${schedule.train_id}&date=${schedule.journey_date}&source=${schedule.source_code}&destination=${schedule.destination_code}`}
                    className="mt-3 inline-block bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Check Availability & Book
                  </Link>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Note</h4>
                  <p className="text-gray-600 text-sm">
                    Schedule information is subject to change. Please check the latest information before planning your journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 