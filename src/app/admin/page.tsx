'use client';

import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaCalendarAlt, FaChair, FaUsers, FaUserClock, FaMoneyBillWave, FaExchangeAlt, FaRoute, FaFileInvoiceDollar } from 'react-icons/fa';
import Link from 'next/link';

interface StatCard {
  title: string;
  query: string;
  icon: React.ReactNode;
  description: string;
  bgColor: string;
  endpoint: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('logs');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    end: new Date().toISOString().split('T')[0]
  });

  const statCards: StatCard[] = [
    {
      title: "PNR Status Tracking",
      query: "pnr",
      icon: <FaTicketAlt className="text-white text-2xl" />,
      description: "Track status for a given ticket",
      bgColor: "bg-blue-600",
      endpoint: "/api/tickets"
    },
    {
      title: "Train Schedule Lookup",
      query: "schedule",
      icon: <FaCalendarAlt className="text-white text-2xl" />,
      description: "Lookup schedule for a given train",
      bgColor: "bg-blue-600",
      endpoint: "/api/trains"
    },
    {
      title: "Available Seats Query",
      query: "seats",
      icon: <FaChair className="text-white text-2xl" />,
      description: "Check seats for a specific train, date and class",
      bgColor: "bg-blue-600",
      endpoint: "/api/availability"
    },
    {
      title: "Passengers By Train",
      query: "passengers",
      icon: <FaUsers className="text-white text-2xl" />,
      description: "List all passengers on a specific train on a given date",
      bgColor: "bg-blue-600",
      endpoint: "/api/passengers"
    },
    {
      title: "Waitlisted Passengers",
      query: "waitlisted",
      icon: <FaUserClock className="text-white text-2xl" />,
      description: "Retrieve all waitlisted passengers for a particular train",
      bgColor: "bg-blue-600",
      endpoint: "/api/waitlist"
    },
    {
      title: "Refund Amount Calculator",
      query: "refunds",
      icon: <FaMoneyBillWave className="text-white text-2xl" />,
      description: "Find total amount that needs to be refunded for cancelling a train",
      bgColor: "bg-blue-600",
      endpoint: "/api/refunds"
    },
    {
      title: "Revenue Analysis",
      query: "revenue",
      icon: <FaMoneyBillWave className="text-white text-2xl" />,
      description: "Total revenue generated from ticket bookings over a specified period",
      bgColor: "bg-blue-600",
      endpoint: "/api/analytics/revenue"
    },
    {
      title: "Cancellation Records",
      query: "cancellations",
      icon: <FaExchangeAlt className="text-white text-2xl" />,
      description: "Cancellation records with refund status",
      bgColor: "bg-blue-600",
      endpoint: "/api/cancellations"
    },
    {
      title: "Busiest Routes",
      query: "routes",
      icon: <FaRoute className="text-white text-2xl" />,
      description: "Find the busiest route based on passenger count",
      bgColor: "bg-blue-600",
      endpoint: "/api/analytics/routes"
    },
    {
      title: "Itemized Bill Generator",
      query: "bill",
      icon: <FaFileInvoiceDollar className="text-white text-2xl" />,
      description: "Generate an itemized bill for a ticket including all charges",
      bgColor: "bg-blue-600",
      endpoint: "/api/bills"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch data from the analytics API
        const response = await fetch(`/api/analytics?start_date=${dateRange.start}&end_date=${dateRange.end}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('Fetched analytics data:', data.data);
          setStats(data.data);
        } else {
          console.error('API returned error:', data.error || 'Unknown error');
          throw new Error(data.error || 'Failed to load statistics');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-xl text-blue-100">Monitor and analyze rail system performance</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 z-10 relative">
        {/* Date Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'logs'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                System Logs & Stats
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Advanced Analytics
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('trains')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'trains'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Train Management
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading statistics...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : (
              <>
                {activeTab === 'logs' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-8 text-gray-900 dark:text-white">System Statistics</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {statCards.map((card) => (
                        <div key={card.query} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                          <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 flex justify-between items-center">
                            <h3 className="text-white font-semibold">{card.title}</h3>
                            <div className="rounded-full bg-white/20 p-2">
                              {card.icon}
                            </div>
                          </div>
                          <div className="p-5">
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{card.description}</p>
                            
                            {card.query === 'pnr' && stats.pnr && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Tickets:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.pnr.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Confirmed:</span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">{formatNumber(stats.pnr.confirmed)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Waitlisted:</span>
                                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{formatNumber(stats.pnr.waitlisted)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Cancelled:</span>
                                  <span className="font-semibold text-red-600 dark:text-red-400">{formatNumber(stats.pnr.cancelled)}</span>
                                </div>
                              </div>
                            )}
                            
                            {card.query === 'schedule' && stats.schedule && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Schedules:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.schedule.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">On Time:</span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">{formatNumber(stats.schedule.onTime)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Delayed:</span>
                                  <span className="font-semibold text-orange-600 dark:text-orange-400">{formatNumber(stats.schedule.delayed)}</span>
                                </div>
                              </div>
                            )}
                            
                            {card.query === 'seats' && stats.seats && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Capacity:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.seats.totalCapacity)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Booked:</span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">{formatNumber(stats.seats.booked)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Available:</span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">{formatNumber(stats.seats.available)}</span>
                                </div>
                                <div className="mt-3 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{width: `${stats.seats.utilization}%`}}></div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                                  {stats.seats.utilization}% utilized
                                </div>
                              </div>
                            )}
                            
                            {card.query === 'passengers' && stats.passengers && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Passengers:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.passengers.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Avg Per Train:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.passengers.avgPerTrain)}</span>
                                </div>
                              </div>
                            )}
                            
                            {card.query === 'waitlisted' && stats.waitlisted && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Waitlisted:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.waitlisted.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Cleared:</span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">{formatNumber(stats.waitlisted.cleared)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                                  <span className="font-semibold text-orange-600 dark:text-orange-400">{formatNumber(stats.waitlisted.remaining)}</span>
                                </div>
                              </div>
                            )}
                            
                            {card.query === 'refunds' && stats.refunds && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Refunds:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.refunds.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Processed:</span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(stats.refunds.processed)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                                  <span className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(stats.refunds.pending)}</span>
                                </div>
                              </div>
                            )}
                            
                            {card.query === 'revenue' && stats.revenue && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.revenue.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Yesterday:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.revenue.yesterday)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">This Month:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.revenue.thisMonth)}</span>
                                </div>
                              </div>
                            )}
                            
                            {card.query === 'cancellations' && stats.cancellations && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Cancellations:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.cancellations.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Refunded:</span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">{formatNumber(stats.cancellations.refunded)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                                  <span className="font-semibold text-orange-600 dark:text-orange-400">{formatNumber(stats.cancellations.pending)}</span>
                                </div>
                              </div>
                            )}
                            
                            {card.query === 'routes' && stats.routes && (
                              <div className="space-y-3">
                                <p className="font-medium mb-2 text-gray-800 dark:text-gray-200">Top Routes:</p>
                                {stats.routes.map((route: any, index: number) => (
                                  <div key={index} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span className="text-gray-600 dark:text-gray-400 truncate">{route.route}:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(route.count)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {card.query === 'bill' && stats.bill && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Total Bills Generated:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.bill.totalGenerated)}</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-5">
                              <Link 
                                href={`/admin/${card.query}`}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center"
                              >
                                View Details
                                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'analytics' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-8 text-gray-900 dark:text-white">Advanced Analytics</h2>
                    
                    {/* Revenue by Train Type */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm p-6 mb-8">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue by Train Type</h3>
                      
                      {stats.revenue_by_train_type && stats.revenue_by_train_type.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Train Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tickets Sold</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Revenue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Percentage</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {stats.revenue_by_train_type.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.train_type}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatNumber(item.ticket_count)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">{formatCurrency(item.total_revenue)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                                      </div>
                                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{item.percentage}%</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No revenue data available by train type.</p>
                      )}
                    </div>
                    
                    {/* Peak Travel Times */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm p-6 mb-8">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Peak Travel Times</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Hourly Distribution */}
                        <div>
                          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">Hourly Distribution</h4>
                          {stats.peak_travel_times && stats.peak_travel_times.hourly ? (
                            <div className="relative">
                              <div className="h-64 flex items-end space-x-2">
                                {stats.peak_travel_times.hourly.map((hour: any, index: number) => {
                                  // Find the max value to calculate percentage height
                                  const maxValue = Math.max(...stats.peak_travel_times.hourly.map((h: any) => h.passenger_count));
                                  const percentage = maxValue > 0 ? (hour.passenger_count / maxValue) * 100 : 0;
                                  
                                  return (
                                    <div key={index} className="flex flex-col items-center flex-1">
                                      <div 
                                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-sm cursor-pointer transition-all"
                                        style={{ height: `${percentage}%` }}
                                        title={`${hour.hour_formatted}: ${formatNumber(hour.passenger_count)} passengers`}
                                      ></div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hour.hour}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Hour of Day</div>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No hourly data available.</p>
                          )}
                        </div>
                        
                        {/* Weekly Distribution */}
                        <div>
                          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">Day of Week Distribution</h4>
                          {stats.peak_travel_times && stats.peak_travel_times.weekday ? (
                            <div className="relative">
                              <div className="h-64 flex items-end space-x-2">
                                {stats.peak_travel_times.weekday.map((day: any, index: number) => {
                                  // Find the max value to calculate percentage height
                                  const maxValue = Math.max(...stats.peak_travel_times.weekday.map((d: any) => d.passenger_count));
                                  const percentage = maxValue > 0 ? (day.passenger_count / maxValue) * 100 : 0;
                                  
                                  return (
                                    <div key={index} className="flex flex-col items-center flex-1">
                                      <div 
                                        className="w-full bg-green-500 hover:bg-green-600 rounded-t-sm cursor-pointer transition-all"
                                        style={{ height: `${percentage}%` }}
                                        title={`${day.day_name}: ${formatNumber(day.passenger_count)} passengers`}
                                      ></div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{day.day_name.substring(0, 3)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Day of Week</div>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No weekday data available.</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Passenger Demographics */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm p-6 mb-8">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Passenger Demographics</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Age Distribution */}
                        <div>
                          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">Age Groups</h4>
                          {stats.passenger_demographics && stats.passenger_demographics.age_distribution ? (
                            <div className="space-y-3">
                              {stats.passenger_demographics.age_distribution.map((age: any, index: number) => {
                                // Calculate percentage for the progress bar
                                const totalCount = stats.passenger_demographics.age_distribution.reduce((sum: number, item: any) => sum + item.count, 0);
                                const percentage = totalCount > 0 ? (age.count / totalCount) * 100 : 0;
                                
                                return (
                                  <div key={index}>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{age.age_group}</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(age.count)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No age data available.</p>
                          )}
                        </div>
                        
                        {/* Gender Distribution */}
                        <div>
                          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">Gender Distribution</h4>
                          {stats.passenger_demographics && stats.passenger_demographics.gender_distribution ? (
                            <div className="space-y-3">
                              {stats.passenger_demographics.gender_distribution.map((gender: any, index: number) => {
                                // Calculate percentage for the progress bar
                                const totalCount = stats.passenger_demographics.gender_distribution.reduce((sum: number, item: any) => sum + item.count, 0);
                                const percentage = totalCount > 0 ? (gender.count / totalCount) * 100 : 0;
                                
                                // Determine color based on gender
                                const barColor = gender.gender.toLowerCase() === 'male' ? 'bg-blue-600' : 
                                                gender.gender.toLowerCase() === 'female' ? 'bg-pink-500' : 'bg-gray-500';
                                
                                return (
                                  <div key={index}>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{gender.gender}</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(gender.count)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                      <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No gender data available.</p>
                          )}
                        </div>
                        
                        {/* Concession Categories */}
                        <div>
                          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">Concession Categories</h4>
                          {stats.passenger_demographics && stats.passenger_demographics.concession_distribution ? (
                            <div className="space-y-3">
                              {stats.passenger_demographics.concession_distribution.map((category: any, index: number) => {
                                // Calculate percentage for the progress bar
                                const totalCount = stats.passenger_demographics.concession_distribution.reduce((sum: number, item: any) => sum + item.count, 0);
                                const percentage = totalCount > 0 ? (category.count / totalCount) * 100 : 0;
                                
                                return (
                                  <div key={index}>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.category}</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(category.count)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                      <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No concession data available.</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Analytics */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm p-6 mb-8">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment Analytics</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Revenue by Payment Method */}
                        <div>
                          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">Revenue by Payment Method</h4>
                          {stats.payment_analytics && stats.payment_analytics.by_method ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transactions</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Share</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                  {stats.payment_analytics.by_method.map((item: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.payment_method || item.method}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatNumber(item.transaction_count)}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                        {formatCurrency(item.total_amount)}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div 
                                              className="bg-blue-600 h-2.5 rounded-full" 
                                              style={{ width: `${item.percentage}%` }}
                                            ></div>
                                          </div>
                                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{item.percentage}%</span>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No payment method data available.</p>
                          )}
                        </div>
                        
                        {/* Processing Times */}
                        <div>
                          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">Average Processing Time</h4>
                          {stats.payment_analytics && stats.payment_analytics.processing_times ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg. Time</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                  {stats.payment_analytics.processing_times.map((item: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.payment_mode}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {item.avg_formatted}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No processing time data available.</p>
                          )}
                          
                          {/* Monthly Trends */}
                          <h4 className="text-md font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">Recent Monthly Trends</h4>
                          {stats.payment_analytics && stats.payment_analytics.monthly_trends && stats.payment_analytics.monthly_trends.length > 0 ? (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                <span className="font-medium">Last Month:</span> {stats.payment_analytics.monthly_trends[stats.payment_analytics.monthly_trends.length-1].month}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {stats.payment_analytics.monthly_trends[stats.payment_analytics.monthly_trends.length-1].methods.map((method: any, idx: number) => (
                                  <div key={idx} className="bg-white dark:bg-gray-800 rounded p-2 text-xs">
                                    <div className="font-medium">{method.payment_method || method.method}</div>
                                    <div className="text-gray-600 dark:text-gray-400">{formatCurrency(method.amount)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No monthly trend data available.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'users' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">User Management</h2>
                    <p className="text-gray-600 dark:text-gray-400">This section is under development.</p>
                  </div>
                )}
                
                {activeTab === 'trains' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Train Management</h2>
                    <p className="text-gray-600 dark:text-gray-400">This section is under development.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 