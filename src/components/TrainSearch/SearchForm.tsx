'use client';

import { useState } from 'react';
import { MdLocationOn, MdDateRange, MdSwapVert, MdAirlineSeatReclineNormal, MdPerson } from 'react-icons/md';

export default function SearchForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [travelClass, setTravelClass] = useState('');
  const [quota, setQuota] = useState('GN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ from, to, date, travelClass, quota });
    // Submit functionality here
    window.location.href = `/trains?from=${from}&to=${to}&date=${date}&class=${travelClass}&quota=${quota}`;
  };

  const swapStations = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="p-6 lg:p-8">
      <h2 className="text-xl font-semibold text-white mb-6 bg-blue-700 p-3 rounded-lg shadow-sm animate-pulse">Find Trains</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4">
          {/* From Station */}
          <div className="md:col-span-5 animate-fadeIn" style={{animationDelay: '100ms'}}>
            <label htmlFor="from" className="block text-sm font-medium text-gray-800 mb-1.5">
              From
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLocationOn className="h-5 w-5 text-blue-600" />
              </div>
              <input
                type="text"
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 transition-all duration-300 hover:border-blue-400"
                placeholder="Enter city or station"
                required
              />
            </div>
          </div>
          
          {/* Swap Button */}
          <div className="md:col-span-2 flex items-end justify-center pb-0.5 animate-fadeIn" style={{animationDelay: '200ms'}}>
            <button
              type="button"
              onClick={swapStations}
              className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
              aria-label="Swap departure and arrival stations"
            >
              <MdSwapVert className="h-5 w-5 text-blue-700" />
            </button>
          </div>
          
          {/* To Station */}
          <div className="md:col-span-5 animate-fadeIn" style={{animationDelay: '300ms'}}>
            <label htmlFor="to" className="block text-sm font-medium text-gray-800 mb-1.5">
              To
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLocationOn className="h-5 w-5 text-blue-600" />
              </div>
              <input
                type="text"
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 transition-all duration-300 hover:border-blue-400"
                placeholder="Enter city or station"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4">
          {/* Date Selection */}
          <div className="md:col-span-4 animate-fadeIn" style={{animationDelay: '400ms'}}>
            <label htmlFor="date" className="block text-sm font-medium text-gray-800 mb-1.5">
              Journey Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdDateRange className="h-5 w-5 text-blue-600" />
              </div>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-300 hover:border-blue-400"
                required
              />
            </div>
          </div>
          
          {/* Travel Class */}
          <div className="md:col-span-4 animate-fadeIn" style={{animationDelay: '500ms'}}>
            <label htmlFor="class" className="block text-sm font-medium text-gray-800 mb-1.5">
              Travel Class
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdAirlineSeatReclineNormal className="h-5 w-5 text-blue-600" />
              </div>
              <select
                id="class"
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-900 bg-white transition-all duration-300 hover:border-blue-400"
              >
                <option value="" className="text-gray-900">All Classes</option>
                <option value="SL" className="text-gray-900">Sleeper (SL)</option>
                <option value="3A" className="text-gray-900">AC 3 Tier (3A)</option>
                <option value="2A" className="text-gray-900">AC 2 Tier (2A)</option>
                <option value="1A" className="text-gray-900">AC First Class (1A)</option>
                <option value="CC" className="text-gray-900">Chair Car (CC)</option>
                <option value="EC" className="text-gray-900">Executive Class (EC)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Quota */}
          <div className="md:col-span-4 animate-fadeIn" style={{animationDelay: '600ms'}}>
            <label htmlFor="quota" className="block text-sm font-medium text-gray-800 mb-1.5">
              Quota
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdPerson className="h-5 w-5 text-blue-600" />
              </div>
              <select
                id="quota"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-900 bg-white transition-all duration-300 hover:border-blue-400"
              >
                <option value="GN" className="text-gray-900">General</option>
                <option value="TQ" className="text-gray-900">Tatkal</option>
                <option value="LD" className="text-gray-900">Ladies</option>
                <option value="PT" className="text-gray-900">Premium Tatkal</option>
                <option value="SS" className="text-gray-900">Senior Citizen</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-2 animate-fadeIn" style={{animationDelay: '700ms'}}>
          <button
            type="submit"
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Trains
          </button>
        </div>
      </form>
    </div>
  );
} 