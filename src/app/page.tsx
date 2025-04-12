import Link from "next/link";
import SearchForm from "@/components/TrainSearch/SearchForm";
import { FaTrain, FaTicketAlt, FaMapMarkedAlt, FaMobileAlt } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 to-blue-600 py-16 lg:py-24">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: "url('/pattern.svg')" }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Travel Smarter with RailYatra
              </h1>
              <p className="text-blue-100 text-lg mb-8 max-w-lg">
                Book train tickets easily, check PNR status, and get real-time updates for your train journey across the country.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/trains" 
                  className="px-6 py-3 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 shadow-md transition-all flex items-center"
                >
                  <FaTicketAlt className="mr-2" /> Book Tickets
                </Link>
                <Link 
                  href="/pnr" 
                  className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-all flex items-center"
                >
                  <FaTrain className="mr-2" /> PNR Status
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                <SearchForm />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white">Why Choose RailYatra</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Experience the best train booking platform with features designed for a seamless journey
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <FaTicketAlt className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Easy Booking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simple and intuitive ticket booking process with instant confirmations
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-700 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Real-Time Updates</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get live status updates for your train and journey details
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <FaMapMarkedAlt className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Extensive Coverage</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access to trains across all zones and regions throughout the country
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <FaMobileAlt className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Mobile Friendly</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Manage bookings, check status, and get updates on the go
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Routes */}
      <section className="py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white">Popular Train Routes</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Find the best trains for these frequently traveled routes across the country
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { from: 'New Delhi', to: 'Mumbai Central', trains: 12, image: 'delhi-mumbai.jpg' },
              { from: 'Chennai Central', to: 'Bangalore', trains: 10, image: 'chennai-bangalore.jpg' },
              { from: 'Howrah', to: 'New Delhi', trains: 14, image: 'howrah-delhi.jpg' },
              { from: 'Mumbai Central', to: 'Ahmedabad', trains: 8, image: 'mumbai-ahmedabad.jpg' },
              { from: 'Hyderabad', to: 'Chennai Central', trains: 7, image: 'hyderabad-chennai.jpg' },
              { from: 'Bangalore', to: 'Kochi', trains: 6, image: 'bangalore-kochi.jpg' },
            ].map((route, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-800/80 to-blue-600/80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white font-semibold mb-1">{route.from}</div>
                      <div className="flex items-center justify-center text-white opacity-80 mb-1">
                        <svg className="w-10 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                      <div className="text-white font-semibold">{route.to}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{route.trains} Trains</div>
                    <div className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">Daily</div>
                  </div>
                  <Link 
                    href={`/trains?from=${route.from}&to=${route.to}`}
                    className="block w-full text-center py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors"
                  >
                    View Trains
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Download App Section */}
      <section className="py-16 bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-3/5 mb-10 lg:mb-0">
              <h2 className="text-3xl font-bold mb-4">Download Our Mobile App</h2>
              <p className="text-blue-100 max-w-lg mb-8">
                Get the RailYatra experience on your mobile device. Book tickets, check PNR status, and receive real-time updates for your journey.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="flex items-center bg-black hover:bg-gray-900 transition-colors px-5 py-3 rounded-lg">
                  <svg className="w-7 h-7 mr-3" viewBox="0 0 24 24" fill="white">
                    <path d="M17.5227 7.39069C19.2451 7.39069 20.64 8.76008 20.64 10.4525V13.6H20.64V17.5677C20.64 19.2601 19.2451 20.6295 17.5227 20.6295H6.59773C4.87533 20.6295 3.48044 19.2601 3.48044 17.5677V6.59523C3.48044 4.90282 4.87533 3.5 6.59773 3.5H16.9559L20.64 7.18113V7.72798C20.1766 7.50595 19.6566 7.39069 19.1139 7.39069H17.5227Z" fill="white"/>
                    <path d="M7.71023 17.1631C7.02516 17.1631 6.46203 16.9217 6.03437 16.4613C5.60826 15.9989 5.3779 15.3362 5.34825 14.4683H6.38859C6.39347 14.9968 6.4841 15.3953 6.66395 15.6793C6.90997 16.0566 7.26241 16.2452 7.72486 16.2452C8.05797 16.2452 8.33068 16.1412 8.54769 15.9564C8.76553 15.7649 8.87404 15.4997 8.87404 15.1487C8.87404 14.8509 8.76866 14.6181 8.55475 14.4449C8.37653 14.3027 8.10874 14.1833 7.75062 14.0951L7.12455 13.9483C6.50336 13.8013 6.07178 13.6145 5.8239 13.3797C5.41534 13.0268 5.21199 12.5449 5.21199 11.9507C5.21199 11.3965 5.41378 10.9214 5.81684 10.5387C6.21991 10.1559 6.74888 9.96211 7.40376 9.96211C8.07495 9.96211 8.60705 10.1461 9.00064 10.5153C9.39422 10.8835 9.60112 11.3654 9.61887 11.9682H8.5955C8.57287 11.6343 8.44896 11.3615 8.24539 11.1544C8.04182 10.9454 7.76129 10.838 7.4068 10.838C7.0996 10.838 6.84761 10.9278 6.64951 11.1036C6.45141 11.2795 6.35237 11.5212 6.35237 11.8177C6.35237 12.1044 6.461 12.3295 6.67824 12.4815C6.82284 12.5836 7.08265 12.6943 7.45851 12.793L8.04965 12.9339C8.72572 13.0916 9.18649 13.2911 9.4344 13.5279C9.80695 13.8593 9.99558 14.3324 9.99558 14.9373C9.99558 15.5412 9.77462 16.0368 9.33269 16.4223C8.89232 16.8079 8.35686 17.1003 7.71023 17.1631ZM13.5522 13.6096L12.195 16.9947H11.0311L10.0378 13.6096H11.1076L11.726 15.9389L12.3459 13.6096H13.5522ZM16.4983 16.9947H15.3986V14.0599H14.5116V13.6096H17.4867V14.0599H16.5968V16.9947H16.4983Z" fill="#1C1D21"/>
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400">GET IT ON</div>
                    <div className="font-medium">Google Play</div>
                  </div>
                </a>
                <a href="#" className="flex items-center bg-black hover:bg-gray-900 transition-colors px-5 py-3 rounded-lg">
                  <svg className="w-7 h-7 mr-3" viewBox="0 0 24 24" fill="white">
                    <path d="M14.0666 7.3221C14.8252 6.3901 15.3809 5.07446 15.2366 3.77282C14.1366 3.83682 12.8486 4.52349 12.0651 5.45549C11.3501 6.27816 10.6879 7.61816 10.8559 8.8888C12.0781 8.9968 13.3079 8.25816 14.0666 7.3221Z" />
                    <path d="M15.8216 9.6119C14.2236 9.4119 12.9041 10.3629 12.1482 10.3629C11.3922 10.3629 10.1821 9.6629 8.88612 9.6869C7.22212 9.7119 5.67212 10.6992 4.83012 12.2399C3.13212 15.3139 4.36512 19.8729 5.99612 22.3869C6.80412 23.6252 7.78912 25.0019 9.09512 24.9549C10.3521 24.9069 10.8271 24.1399 12.3367 24.1399C13.8451 24.1399 14.2711 24.9549 15.5881 24.9309C16.9481 24.9069 17.8047 23.6911 18.6127 22.4511C19.5307 21.0339 19.9081 19.6629 19.9321 19.5932C19.9081 19.5699 17.3141 18.5569 17.2901 15.5279C17.2661 13.0139 19.3801 11.7992 19.5067 11.7052C18.4101 10.1042 16.7056 9.7119 15.8216 9.6119Z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400">DOWNLOAD ON THE</div>
                    <div className="font-medium">App Store</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="lg:w-2/5 flex justify-center">
              <div className="relative w-64 h-[500px] md:w-72 md:h-[550px]">
                <div className="absolute inset-0 bg-black/5 rounded-3xl"></div>
                <div className="absolute inset-2 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="h-10 bg-blue-700 w-full flex items-center justify-center">
                    <div className="w-20 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="text-blue-700 font-semibold text-sm mb-2">RailYatra Mobile</div>
                    <div className="flex-1 bg-blue-50 rounded-lg mb-4 flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-14 h-14 bg-blue-700 rounded-full mx-auto flex items-center justify-center mb-2">
                          <FaTrain className="text-white text-xl" />
                        </div>
                        <div className="text-blue-700 font-semibold text-sm">Track your train in real-time</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-10 bg-gray-100 rounded-md"></div>
                      <div className="h-10 bg-gray-100 rounded-md"></div>
                      <div className="h-10 w-3/4 bg-gray-100 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
