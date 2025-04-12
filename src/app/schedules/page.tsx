'use client';

import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaCalendarAlt, FaTrain, FaMapMarkerAlt, FaClock, FaInfoCircle, FaChevronRight } from 'react-icons/fa';

interface Station {
  station_id: number;
  station_name: string;
  station_code: string;
  city: string;
}

interface Schedule {
  schedule_id: number;
  train_id: number;
  train_number: string;
  train_name: string;
  journey_date: string;
  status: string;
  source_station: string;
  source_code: string;
  destination_station: string;
  destination_code: string;
  standard_departure_time: string;
  standard_arrival_time: string;
  journey_distance: number;
}

export default function SchedulesPage() {
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    train_number: ''
  });
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Station autocomplete state
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredSourceStations, setFilteredSourceStations] = useState<Station[]>([]);
  const [filteredDestStations, setFilteredDestStations] = useState<Station[]>([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Fetch stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        const data = await response.json();
        
        if (data.success) {
          setStations(data.data);
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
      }
    };

    fetchStations();
  }, []);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(event.target as Node)) {
        setShowSourceDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter stations based on input
  useEffect(() => {
    const filterStations = (input: string) => {
      if (!input) return [];
      const lowerInput = input.toLowerCase();
      return stations.filter(
        station => 
          station.station_name.toLowerCase().includes(lowerInput) || 
          station.station_code.toLowerCase().includes(lowerInput) ||
          station.city.toLowerCase().includes(lowerInput)
      ).slice(0, 10); // Limit to 10 results
    };

    setFilteredSourceStations(filterStations(searchParams.source));
    setFilteredDestStations(filterStations(searchParams.destination));
  }, [searchParams.source, searchParams.destination, stations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
    
    if (name === 'source') {
      setShowSourceDropdown(true);
    } else if (name === 'destination') {
      setShowDestDropdown(true);
    }
  };

  const handleStationSelect = (station: Station, type: 'source' | 'destination') => {
    setSearchParams(prev => ({
      ...prev,
      [type]: station.station_code
    }));
    
    if (type === 'source') {
      setShowSourceDropdown(false);
    } else {
      setShowDestDropdown(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearchPerformed(true);
    
    try {
      let url = '/api/schedules?';
      
      if (searchParams.train_number) {
        // Search by train number
        const trainResponse = await fetch(`/api/trains?train_number=${searchParams.train_number}`);
        const trainData = await trainResponse.json();
        
        if (trainData.success && trainData.data.length > 0) {
          url += `train_id=${trainData.data[0].train_id}`;
          if (searchParams.date) {
            url += `&date=${searchParams.date}`;
          }
        } else {
          throw new Error('Train not found');
        }
      } else if (searchParams.source && searchParams.destination && searchParams.date) {
        // Search by source, destination, date
        url += `source=${searchParams.source}&destination=${searchParams.destination}&date=${searchParams.date}`;
      } else {
        throw new Error('Please provide either train number or source, destination and date');
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSchedules(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">Train Schedules</h1>
            <p className="text-xl text-blue-100 mb-6 animate-fadeIn" style={{animationDelay: '200ms'}}>
              Find and view complete train timetables with all stops and stations
            </p>
          </div>
        </div>
      </div>
      
      {/* Search Form */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <FaSearch className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Train Schedules</h2>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source and Destination */}
                <div className="space-y-6">
                  {/* Source Station */}
                  <div className="relative" ref={sourceRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Station</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="source"
                        value={searchParams.source}
                        onChange={handleInputChange}
                        onFocus={() => setShowSourceDropdown(true)}
                        placeholder="Station name or code"
                        className="pl-10 w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-500"
                      />
                    </div>
                    
                    {/* Source Station Dropdown */}
                    {showSourceDropdown && filteredSourceStations.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
                        {filteredSourceStations.map(station => (
                          <div
                            key={station.station_id}
                            className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white transition-colors"
                            onClick={() => handleStationSelect(station, 'source')}
                          >
                            <div className="font-medium">{station.station_name} ({station.station_code})</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{station.city}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Destination Station */}
                  <div className="relative" ref={destRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Station</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="destination"
                        value={searchParams.destination}
                        onChange={handleInputChange}
                        onFocus={() => setShowDestDropdown(true)}
                        placeholder="Station name or code"
                        className="pl-10 w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-500"
                      />
                    </div>
                    
                    {/* Destination Station Dropdown */}
                    {showDestDropdown && filteredDestStations.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
                        {filteredDestStations.map(station => (
                          <div
                            key={station.station_id}
                            className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white transition-colors"
                            onClick={() => handleStationSelect(station, 'destination')}
                          >
                            <div className="font-medium">{station.station_name} ({station.station_code})</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{station.city}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Date */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Journey Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="date"
                        value={searchParams.date}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Train Number (optional) */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Train Number <span className="text-gray-500 dark:text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaTrain className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="train_number"
                        value={searchParams.train_number}
                        onChange={handleInputChange}
                        placeholder="e.g. 12301"
                        className="pl-10 w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-500"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <FaInfoCircle className="mr-1" /> Enter just the train number to view its complete timetable
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch className="mr-2" />
                      Search Schedules
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="container mx-auto px-4 my-8">
        {loading ? (
          <div className="text-center py-16 animate-pulse">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Searching for schedules...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-5 rounded-xl my-6 flex items-start">
            <FaInfoCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Search Error</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : searchPerformed && schedules.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-md px-6 py-12 border border-gray-100 dark:border-gray-700 my-6">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No schedules found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              We couldn't find any train schedules matching your search criteria. Please try different stations, dates, or train numbers.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modify Search
            </button>
          </div>
        ) : schedules.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {schedules.length} {schedules.length === 1 ? 'Train' : 'Trains'} Found
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {searchParams.train_number 
                      ? `For train ${searchParams.train_number}`
                      : `From ${searchParams.source} to ${searchParams.destination} on ${formatDate(searchParams.date)}`
                    }
                  </p>
                </div>
                <div className="mt-3 md:mt-0">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300">
                    <FaInfoCircle className="mr-1" /> Click "View Details" to see the full schedule
                  </span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Train
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      From
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Departure
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      To
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Arrival
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {schedules.map((schedule, index) => (
                    <tr key={schedule.schedule_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150" style={{animationDelay: `${index * 50}ms`}}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400">
                            <FaTrain className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {schedule.train_number}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {schedule.train_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(schedule.journey_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{schedule.source_station}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{schedule.source_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <FaClock className="mr-1 text-blue-600 dark:text-blue-400 h-3 w-3" />
                            {formatTime(schedule.standard_departure_time)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{schedule.destination_station}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{schedule.destination_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <FaClock className="mr-1 text-blue-600 dark:text-blue-400 h-3 w-3" />
                            {formatTime(schedule.standard_arrival_time)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${schedule.status === 'On Time' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                          schedule.status === 'Delayed' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                          schedule.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'}`}>
                          {schedule.status === 'On Time' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>}
                          {schedule.status === 'Delayed' && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></span>}
                          {schedule.status === 'Cancelled' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>}
                          {schedule.status === 'On Time' ? 'On Time' : 
                           schedule.status === 'Delayed' ? 'Delayed' : 
                           schedule.status === 'Cancelled' ? 'Cancelled' : 
                           schedule.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a 
                          href={`/schedules/${schedule.schedule_id}`} 
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View Details
                          <FaChevronRight className="ml-1 w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        
        {/* Additional Information */}
        {!searchPerformed && (
          <div className="mt-10 mb-12">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Everything You Need to Know</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-2">
                Find train schedules, routes, and timings with our comprehensive information system
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                    <FaTrain className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">About Train Schedules</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Train schedules provide detailed information about train timings, including departure and arrival at all stations on its route.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0 mr-3">•</span>
                    <span className="text-gray-600 dark:text-gray-300">Track the route, stops, and timings of any train in India with our comprehensive schedule data</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0 mr-3">•</span>
                    <span className="text-gray-600 dark:text-gray-300">See departure and arrival times for all stations on a train's route</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0 mr-3">•</span>
                    <span className="text-gray-600 dark:text-gray-300">Identify delays and plan your journey accordingly with real-time status updates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0 mr-3">•</span>
                    <span className="text-gray-600 dark:text-gray-300">View station information, platform details, and distances along the route</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                    <FaSearch className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Search Tips</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Use these tips to find the most accurate train schedule information:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0 mr-3">•</span>
                    <span className="text-gray-600 dark:text-gray-300">Use station name or code to find your source and destination</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0 mr-3">•</span>
                    <span className="text-gray-600 dark:text-gray-300">If you know the train number, enter it to quickly get its schedule</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0 mr-3">•</span>
                    <span className="text-gray-600 dark:text-gray-300">Search by date to find trains running on specific days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0 mr-3">•</span>
                    <span className="text-gray-600 dark:text-gray-300">Click on "View Details" for complete information about stops and timings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 