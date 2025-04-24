'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TrainClassDetails from '@/components/TrainClassDetails';
import { FaArrowLeft, FaPrint, FaDownload, FaEdit, FaChartBar } from 'react-icons/fa';

export default function AdminTrainClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [trainId, setTrainId] = useState<string>('');
  const [trainInfo, setTrainInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (params.id) {
      setTrainId(params.id as string);
      fetchTrainBasicInfo(params.id as string);
    }
  }, [params.id]);
  
  const fetchTrainBasicInfo = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trains?id=${id}`);
      const result = await response.json();
      
      if (result.success) {
        setTrainInfo(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load train information');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link 
            href="/admin?tab=trains" 
            className="mr-4 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Train Class Details
          </h1>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center transition-colors"
            onClick={() => window.print()}
          >
            <FaPrint className="mr-2" /> Print
          </button>
          <button 
            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center transition-colors"
          >
            <FaDownload className="mr-2" /> Export
          </button>
          <Link 
            href={`/admin/trains/${trainId}/edit`}
            className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg flex items-center transition-colors"
          >
            <FaEdit className="mr-2" /> Edit
          </Link>
          <Link 
            href={`/admin/trains/${trainId}/analytics`}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg flex items-center transition-colors"
          >
            <FaChartBar className="mr-2" /> Analytics
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-400">Loading train details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded-xl text-center">
          <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
          <Link 
            href="/admin?tab=trains" 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-block transition-colors"
          >
            Return to Train Management
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Train Basic Info Card */}
          {trainInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Train Number</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{trainInfo.train_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Train Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{trainInfo.train_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Train Type</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{trainInfo.train_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Run Days</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{trainInfo.run_days}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Source</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {trainInfo.source_station_name} ({trainInfo.source_station_code})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Destination</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {trainInfo.destination_station_name} ({trainInfo.destination_station_code})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Distance</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {trainInfo.distance || '—'} km
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Class Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Class-wise Details</h2>
            </div>
            <div className="p-6">
              <TrainClassDetails 
                trainId={trainId} 
                date={new Date().toISOString().split('T')[0]} 
              />
            </div>
          </div>
          
          {/* Admin Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Administrative Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href={`/admin/trains/${trainId}/classes/manage`}
                  className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-3">
                    <FaEdit className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Manage Classes</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Add, edit or remove class configurations</p>
                </Link>
                
                <Link
                  href={`/admin/trains/${trainId}/pricing`}
                  className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-3">
                    <FaDownload className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Update Pricing</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Adjust fare per kilometer for each class</p>
                </Link>
                
                <Link
                  href={`/admin/trains/${trainId}/availability`}
                  className="flex flex-col items-center justify-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-3">
                    <FaChartBar className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Manage Availability</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Adjust available seats for upcoming journeys</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 