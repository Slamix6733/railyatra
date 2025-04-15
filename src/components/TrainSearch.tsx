'use client';

import { useState, useEffect } from 'react';
import { Train } from '@/lib/models';
import Link from 'next/link';
import { isDateInFuture, filterTrainsByRunDay } from '@/lib/utils';
import TrainRunDaysDisplay from '@/components/TrainRunDaysDisplay';

export default function TrainSearch() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<{station_name: string, city: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [travelClass, setTravelClass] = useState('');
  const [activeTab, setActiveTab] = useState('search');

  // Fetch stations for dropdown
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        const result = await response.json();
        
        if (result.success) {
          setStations(result.data);
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };
    
    fetchStations();

    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
  }, []);

  // Search trains based on source and destination
  const searchTrains = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!source || !destination) {
      setError('Please select both source and destination stations');
      return;
    }

    if (!date) {
      setError('Please select journey date');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      if (source) queryParams.append('source', source);
      if (destination) queryParams.append('destination', destination);
      if (date) queryParams.append('date', date);
      
      // Debug search parameters
      console.log('Search params:', {
        source,
        destination,
        date,
        url: `/api/schedules?${queryParams.toString()}`
      });
      
      // Use the schedules API which properly checks route segments
      const response = await fetch(`/api/schedules?${queryParams.toString()}`);
      const result = await response.json();
      
      console.log('API response:', result);
      
      if (result.success) {
        // Check if the selected date is in the future
        const selectedDate = new Date(date);
        let filteredTrains = result.data;
        
        // Debug all trains returned from API
        console.log('All trains from API:', filteredTrains);
        
        // If the date is in the future, filter trains based on their run_days
        if (isDateInFuture(selectedDate)) {
          // Check day of week for debugging
          const dayOfWeek = selectedDate.getDay();
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          console.log(`Selected date ${date} is ${dayNames[dayOfWeek]}`);
          
          // Log each train's run_days before filtering
          filteredTrains.forEach((train: any) => {
            console.log(`Train ${train.train_name} (${train.train_id}) runs on: ${train.run_days || 'Daily (undefined)'}`);
          });
          
          // Apply run days filtering
          filteredTrains = filterTrainsByRunDay(result.data, selectedDate);
          
          // Log filter results
          console.log('Before filtering:', result.data.length);
          console.log('After filtering:', filteredTrains.length);
          
          // Log each filtered train
          filteredTrains.forEach((train: any) => {
            console.log(`Filtered in: ${train.train_name} (${train.train_id})`);
          });
        }
        
        // Set the filtered trains
        setTrains(filteredTrains);
        
        if (filteredTrains.length === 0) {
          setError('No trains found for this route on the selected date. Please check browser console for debugging information.');
        } else {
          // If trains found, switch to results tab
          setActiveTab('results');
        }
      } else {
        setError(result.error || 'Failed to fetch trains');
        console.error('API returned error:', result.error);
      }
    } catch (error) {
      setError('Error connecting to the server');
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-8 bg-white rounded-xl shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-6 py-3 text-sm font-medium transition-all duration-300 ${
            activeTab === 'search'
              ? 'border-b-2 border-blue-600 text-blue-800 font-semibold'
              : 'text-gray-700 hover:text-blue-700'
          }`}
          onClick={() => setActiveTab('search')}
        >
          Search Trains
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium transition-all duration-300 ${
            activeTab === 'results'
              ? 'border-b-2 border-blue-600 text-blue-800 font-semibold'
              : 'text-gray-700 hover:text-blue-700'
          }`}
          onClick={() => setActiveTab('results')}
          disabled={trains.length === 0}
        >
          Search Results
        </button>
      </div>
      
      {/* Search Form */}
      {activeTab === 'search' && (
        <div className="p-6 md:p-8 animate-fadeIn">
          <h1 className="text-2xl font-bold text-white mb-6 bg-blue-700 p-3 rounded-lg shadow-sm animate-slideInDown">Find Your Train</h1>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded border border-red-200">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <form onSubmit={searchTrains} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="source" className="block text-sm font-medium text-gray-800">
                  From Station
                </label>
                <div className="relative">
                  <svg className="h-5 w-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <select
                    id="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white appearance-none transition-all duration-300 hover:border-blue-500"
                  >
                    <option value="" className="text-gray-900">Select source station</option>
                    {stations.map((station, index) => (
                      <option key={`source-${index}`} value={station.station_name} className="text-gray-900">
                        {station.station_name} ({station.city})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="destination" className="block text-sm font-medium text-gray-800">
                  To Station
                </label>
                <div className="relative">
                  <svg className="h-5 w-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <select
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white appearance-none transition-all duration-300 hover:border-blue-500"
                  >
                    <option value="" className="text-gray-900">Select destination station</option>
                    {stations.map((station, index) => (
                      <option key={`dest-${index}`} value={station.station_name} className="text-gray-900">
                        {station.station_name} ({station.city})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-gray-800">
                  Journey Date
                </label>
                <div className="relative">
                  <svg className="h-5 w-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // Today or later
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-300 hover:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="class" className="block text-sm font-medium text-gray-800">
                  Travel Class
                </label>
                <div className="relative">
                  <svg className="h-5 w-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <select
                    id="class"
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white appearance-none transition-all duration-300 hover:border-blue-500"
                  >
                    <option value="" className="text-gray-900">All Classes</option>
                    <option value="SL" className="text-gray-900">Sleeper (SL)</option>
                    <option value="3A" className="text-gray-900">AC 3 Tier (3A)</option>
                    <option value="2A" className="text-gray-900">AC 2 Tier (2A)</option>
                    <option value="1A" className="text-gray-900">AC First Class (1A)</option>
                    <option value="CC" className="text-gray-900">Chair Car (CC)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="quota" className="block text-sm font-medium text-gray-800">
                  Quota
                </label>
                <div className="relative">
                  <svg className="h-5 w-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <select
                    id="quota"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white appearance-none transition-all duration-300 hover:border-blue-500"
                  >
                    <option value="GN" className="text-gray-900">General</option>
                    <option value="TQ" className="text-gray-900">Tatkal</option>
                    <option value="LD" className="text-gray-900">Ladies</option>
                    <option value="PT" className="text-gray-900">Premium Tatkal</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-6 py-3 w-full md:w-auto bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Trains
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Results */}
      {activeTab === 'results' && (
        <div className="p-6 md:p-8 animate-fadeIn">
          <h1 className="text-2xl font-bold text-white mb-6 bg-blue-700 p-3 rounded-lg shadow-sm animate-slideInDown">Search Results</h1>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded border border-red-200">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {trains.length} {trains.length === 1 ? 'Train' : 'Trains'} Found
                </h2>
                <p className="text-sm text-gray-600">
                  From <span className="font-medium">{source}</span> to <span className="font-medium">{destination}</span> on <span className="font-medium">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </p>
              </div>
              
              <div className="mt-3 md:mt-0">
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Click on a train to view details
                </span>
              </div>
            </div>
          </div>
          
          {trains.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train Details</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Running Days</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trains.map((train, index) => (
                    <tr key={train.train_id ?? train.schedule_id} className="hover:bg-gray-50 transition-colors duration-200 animate-fadeIn" style={{animationDelay: `${index * 100}ms`}}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 animate-slideInRight" style={{animationDelay: `${index * 100 + 50}ms`}}>{train.train_name}</div>
                        <div className="text-sm text-gray-500 animate-slideInRight" style={{animationDelay: `${index * 100 + 100}ms`}}>Train #{train.train_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 animate-slideInRight" style={{animationDelay: `${index * 100 + 150}ms`}}>{train.standard_departure_time || "06:45 AM"}</div>
                        <div className="text-sm text-gray-500 animate-slideInRight" style={{animationDelay: `${index * 100 + 200}ms`}}>{train.source_station}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 animate-slideInRight" style={{animationDelay: `${index * 100 + 250}ms`}}>{train.standard_arrival_time || "09:30 PM"}</div>
                        <div className="text-sm text-gray-500 animate-slideInRight" style={{animationDelay: `${index * 100 + 300}ms`}}>{train.destination_station}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 animate-slideInRight" style={{animationDelay: `${index * 100 + 350}ms`}}>
                          {train.journey_distance ? `${Math.round(train.journey_distance)} km` : "14h 45m"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TrainRunDaysDisplay runDays={train.run_days} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <Link
                          href={`/booking/passengers?train=${train.train_id}&class=${travelClass || 'SL'}&date=${date}&from=${train.source_station}&to=${train.destination_station}`}
                          className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-md animate-slideInRight"
                          style={{animationDelay: `${index * 100 + 400}ms`}}
                        >
                          Book Now
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg animate-fadeIn">
              <p className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                No trains found for this route and date combination.
              </p>
              <p className="mt-2 text-sm">
                Try another date or different stations.
              </p>
            </div>
          )}
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setActiveTab('search')}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 animate-slideInUp"
              style={{animationDelay: '400ms'}}
            >
              Modify Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 