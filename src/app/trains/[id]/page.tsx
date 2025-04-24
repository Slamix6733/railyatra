'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaTrain, FaClock, FaCalendarAlt, FaArrowRight, FaMapMarkerAlt, FaChair, FaTable } from 'react-icons/fa';
import TrainClassDetails from '@/components/TrainClassDetails';

interface ClassOption {
  class_id: number;
  class_name: string;
  class_code: string;
  total_seats: number;
  seats_available: number;
  fare_per_km: number;
  calculated_fare: number;
}

interface RouteSegment {
  station_id: number;
  station_name: string;
  station_code: string;
  sequence_number: number;
  distance_from_source: number;
  arrival_time: string | null;
  departure_time: string | null;
  halt_time: number | null;
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
  seat_configurations: ClassOption[];
  route_segments: RouteSegment[];
}

export default function TrainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showDetailedClassView, setShowDetailedClassView] = useState(false);
  
  const date = searchParams.get('date') || '';
  const trainId = params.id as string;

  useEffect(() => {
    const fetchTrainDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trains?id=${trainId}`);
        const result = await response.json();
        
        if (result.success) {
          setTrain(result.data);
          
          // Set first class as default selected if available
          if (result.data.seat_configurations && result.data.seat_configurations.length > 0) {
            setSelectedClass(result.data.seat_configurations[0].class_code);
          }
        } else {
          setError(result.error || 'Failed to load train details');
        }
      } catch (error) {
        setError('Error connecting to the server');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrainDetails();
  }, [trainId]);

  const handleClassChange = (classCode: string) => {
    setSelectedClass(classCode);
  };

  const proceedToBooking = () => {
    if (!selectedClass) {
      alert('Please select a travel class');
      return;
    }
    
    if (!date) {
      alert('Journey date is required');
      return;
    }
    
    router.push(`/booking/passengers?train=${trainId}&class=${selectedClass}&date=${date}`);
  };

  const toggleClassView = () => {
    setShowDetailedClassView(!showDetailedClassView);
  };

  // Calculate duration in hours and minutes
  const calculateDuration = (departure: string, arrival: string) => {
    const dep = new Date(`2023-01-01 ${departure}`);
    const arr = new Date(`2023-01-01 ${arrival}`);
    
    // If arrival is on next day (time is less than departure)
    let timeDiff = arr.getTime() - dep.getTime();
    if (timeDiff < 0) {
      timeDiff += 24 * 60 * 60 * 1000; // Add 24 hours
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 animate-pulse">Loading train details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-red-50 rounded-xl border border-red-200 text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-red-700 mb-2">Error Loading Train Details</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/trains" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Go Back to Train Search
        </Link>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Train Not Found</h1>
        <p className="text-gray-600 mb-4">The train you are looking for does not exist or has been removed.</p>
        <Link href="/trains" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Go Back to Train Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-8 p-4">
      {/* Train Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0 animate-slideInLeft">
              <FaTrain className="text-3xl mr-4" />
              <div>
                <h1 className="text-2xl font-bold">{train.train_name}</h1>
                <p className="text-blue-100">#{train.train_number} • {train.train_type}</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3 animate-slideInRight">
              <p className="text-sm text-blue-100">Journey Date</p>
              <div className="flex items-center text-white font-semibold">
                <FaCalendarAlt className="mr-2" />
                {date ? new Date(date).toDateString() : 'Not selected'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex-1 mb-4 md:mb-0 animate-slideInLeft" style={{animationDelay: '0.1s'}}>
              <p className="text-sm text-gray-500 mb-1">Departure</p>
              <div className="flex items-start">
                <div className="mr-3 bg-blue-100 rounded-full p-2">
                  <FaMapMarkerAlt className="text-blue-700" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{train.source_station_name}</p>
                  <p className="text-gray-600">{train.standard_departure_time}</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative w-40 h-px bg-gray-300 my-6">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center">
                  <FaArrowRight className="text-blue-500" />
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {calculateDuration(train.standard_departure_time, train.standard_arrival_time)}
              </p>
            </div>
            
            <div className="flex-1 mb-4 md:mb-0 md:text-right animate-slideInRight" style={{animationDelay: '0.1s'}}>
              <p className="text-sm text-gray-500 mb-1">Arrival</p>
              <div className="flex items-start md:flex-row-reverse">
                <div className="mr-3 md:ml-3 md:mr-0 bg-green-100 rounded-full p-2">
                  <FaMapMarkerAlt className="text-green-700" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{train.destination_station_name}</p>
                  <p className="text-gray-600">{train.standard_arrival_time}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold animate-slideInLeft" style={{animationDelay: '0.2s'}}>Available Classes</h2>
              <button 
                onClick={toggleClassView}
                className="flex items-center px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors text-sm"
              >
                {showDetailedClassView ? (
                  <>
                    <FaChair className="mr-1" /> Basic View
                  </>
                ) : (
                  <>
                    <FaTable className="mr-1" /> Detailed View
                  </>
                )}
              </button>
            </div>
            
            {showDetailedClassView ? (
              <TrainClassDetails 
                trainId={trainId} 
                date={date} 
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 stagger-animation">
                {train.seat_configurations?.map((classOption, index) => (
                  <div
                    key={classOption.class_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 animate-fadeIn ${
                      selectedClass === classOption.class_code 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleClassChange(classOption.class_code)}
                    style={{animationDelay: `${index * 0.1 + 0.3}s`}}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FaChair className={selectedClass === classOption.class_code ? "text-blue-600 mr-2" : "text-gray-500 mr-2"} />
                        <span className="font-medium text-gray-900">{classOption.class_name}</span>
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {classOption.class_code}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available: <span className="font-medium text-green-600">{classOption.seats_available} seats</span></span>
                      <span className="font-semibold text-gray-900">₹{classOption.calculated_fare}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={proceedToBooking}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 animate-slideInUp focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              style={{animationDelay: '0.5s'}}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Book Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Route Details */}
      <div className="bg-white rounded-xl shadow-md animate-fadeIn" style={{animationDelay: '0.3s'}}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Train Route</h2>
        </div>
        
        <div className="p-6">
          <div className="relative">
            {train.route_segments?.map((segment, index) => (
              <div 
                key={segment.station_id} 
                className="flex mb-8 last:mb-0 animate-fadeIn"
                style={{animationDelay: `${index * 0.1 + 0.3}s`}}
              >
                <div className="mr-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 relative ${
                    segment.station_name === train.source_station_name 
                      ? 'bg-blue-100 border-2 border-blue-500' 
                      : segment.station_name === train.destination_station_name 
                        ? 'bg-green-100 border-2 border-green-500' 
                        : 'bg-gray-100 border-2 border-gray-400'
                  }`}>
                    <span className="text-xs font-semibold">{index + 1}</span>
                  </div>
                  {index < train.route_segments.length - 1 && (
                    <div className="absolute top-8 bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-300 -z-10"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{segment.station_name}</h3>
                    <span className="text-sm bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                      {segment.station_code}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap text-sm text-gray-600 mb-2">
                    {segment.arrival_time && (
                      <div className="mr-4 flex items-center">
                        <FaClock className="text-gray-400 mr-1" />
                        <span>Arrival: {segment.arrival_time}</span>
                      </div>
                    )}
                    
                    {segment.departure_time && (
                      <div className="mr-4 flex items-center">
                        <FaClock className="text-gray-400 mr-1" />
                        <span>Departure: {segment.departure_time}</span>
                      </div>
                    )}
                    
                    {segment.halt_time !== null && segment.halt_time > 0 && (
                      <div className="flex items-center">
                        <span>Halt: {segment.halt_time} min</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Distance from source: {segment.distance_from_source} km
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 