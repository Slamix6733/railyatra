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
        
        // Set mock data for demonstration in case of error
        setStats({
          pnr: {
            total: 1250,
            confirmed: 980,
            waitlisted: 180,
            cancelled: 90
          },
          schedule: {
            total: 750,
            onTime: 650,
            delayed: 100
          },
          seats: {
            totalCapacity: 15000,
            booked: 12350,
            available: 2650
          },
          passengers: {
            total: 14500,
            avgPerTrain: 425
          },
          waitlisted: {
            total: 580,
            cleared: 380,
            remaining: 200
          },
          refunds: {
            total: 95000.00,
            pending: 15000.00,
            processed: 80000.00
          },
          revenue: {
            total: 2450000.00,
            yesterday: 85000.00,
            thisMonth: 850000.00
          },
          cancellations: {
            total: 320,
            refunded: 290,
            pending: 30
          },
          routes: [
            { route: "New Delhi - Mumbai Central", count: 4500 },
            { route: "Chennai Central - Bangalore", count: 3800 },
            { route: "Howrah - New Delhi", count: 4200 }
          ],
          bill: {
            totalGenerated: 14500
          }
        });
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