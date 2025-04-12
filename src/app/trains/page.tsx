import TrainSearch from '@/components/TrainSearch';
import { MdDirectionsRailway, MdOutlineSchedule, MdOutlineChair, MdStar, MdAccessTime, MdSecurity, MdSupport } from 'react-icons/md';
import Link from 'next/link';

export default function TrainsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">Find and Book Train Tickets</h1>
            <p className="text-xl text-blue-100 mb-10 animate-fadeIn" style={{animationDelay: '200ms'}}>
              Discover the easiest way to search, compare and book train tickets across India
            </p>
          </div>
        </div>
      </div>
      
      {/* Train Search */}
      <div className="container mx-auto px-4 -mt-14 z-10 relative">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <TrainSearch />
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-20 mt-16">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Book With Us?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enjoy a seamless booking experience with features designed to make your journey planning easy and stress-free.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdStar className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Best Prices</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              We offer competitive prices with no hidden fees. Get the best deals on train tickets across all routes.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdAccessTime className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Quick Booking</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Book your tickets in minutes with our simple and fast booking process. Save time and effort.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdSecurity className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Secure Payments</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Your payment information is always secure with our state-of-the-art encryption technology.
            </p>
          </div>
        </div>
      </div>
      
      {/* Information Sections */}
      <div className="container mx-auto px-4 py-20 bg-gray-100 dark:bg-gray-800 rounded-3xl my-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Popular Trains */}
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-600">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdDirectionsRailway className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Popular Trains</h2>
            </div>
            <ul className="space-y-5">
              <li className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Rajdhani Express</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">New Delhi - Mumbai</div>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">Premium</span>
              </li>
              <li className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Shatabdi Express</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">New Delhi - Bhopal</div>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">Premium</span>
              </li>
              <li className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Duronto Express</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">Howrah - New Delhi</div>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">Premium</span>
              </li>
              <li className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Vande Bharat Express</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">New Delhi - Varanasi</div>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">New</span>
              </li>
            </ul>
            <div className="mt-8 text-center">
              <Link 
                href="/trains/popular"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
              >
                View all popular routes
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Train Schedules */}
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-600">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdOutlineSchedule className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Train Schedules</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">
              Find complete train schedules including departure and arrival times at all stations on the route.
            </p>
            <ul className="space-y-5">
              <li className="p-5 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-medium text-gray-900 dark:text-white">New Delhi</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300 font-medium">05:55</div>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 border-b border-dashed border-gray-300 dark:border-gray-500"></div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">14h 15m</div>
                  <div className="flex-1 border-b border-dashed border-gray-300 dark:border-gray-500"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900 dark:text-white">Mumbai Central</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300 font-medium">21:45</div>
                </div>
              </li>
            </ul>
            <div className="mt-8 text-center">
              <Link
                href="/schedules" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
              >
                View all schedules
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Seat Availability */}
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-600">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4">
                <MdOutlineChair className="w-7 h-7 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Seat Availability</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">
              Check real-time seat availability across different classes and quotas before booking.
            </p>
            <div className="space-y-5">
              <div className="p-5 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-gray-900 dark:text-white">Sleeper Class (SL)</div>
                  <div className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded-full">Available</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-3">General & Tatkal Quota</div>
                <div className="mt-3 h-2.5 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{width: '70%'}}></div>
                </div>
              </div>
              <div className="p-5 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-gray-900 dark:text-white">AC 3 Tier (3A)</div>
                  <div className="text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-0.5 rounded-full">Limited</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-3">General Quota</div>
                <div className="mt-3 h-2.5 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>
              <div className="p-5 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-gray-900 dark:text-white">AC 2 Tier (2A)</div>
                  <div className="text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full">Waiting List</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-3">General Quota</div>
                <div className="mt-3 h-2.5 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{width: '5%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help Section */}
      <div className="container mx-auto px-4 py-16 mb-20">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-12 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-12">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <MdSupport className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Need Help Booking Tickets?</h2>
              </div>
              <p className="text-blue-100 mb-8 max-w-xl text-base leading-relaxed">
                Our customer service team is available 24/7 to assist you with your booking needs. Get quick answers to common questions or speak with our support team.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link 
                  href="/contact" 
                  className="px-6 py-3.5 bg-white text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Contact Support
                </Link>
                <Link 
                  href="/faq" 
                  className="px-6 py-3.5 bg-blue-600 text-white text-sm font-medium rounded-lg border border-blue-500 hover:bg-blue-500 transition-colors"
                >
                  View FAQs
                </Link>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <div className="bg-white dark:bg-gray-800 p-7 rounded-xl shadow-inner">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Popular Questions</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/faq/cancellation" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      How do I cancel my ticket?
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq/refund" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      What is the refund policy?
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq/tatkal" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      How to book Tatkal tickets?
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 