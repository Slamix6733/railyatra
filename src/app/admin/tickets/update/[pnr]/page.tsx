'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TicketUpdateForm from '@/components/TicketUpdateForm';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function UpdateTicketPage() {
  const params = useParams();
  const router = useRouter();
  const pnr = params?.pnr as string;
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<any>(null);
  
  useEffect(() => {
    // Check if the user is admin first
    const checkAdmin = () => {
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'admin') {
        router.push('/'); // Redirect non-admin users
        return false;
      }
      return true;
    };
    
    const fetchTicket = async () => {
      if (!checkAdmin()) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/booking/${pnr}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ticket details');
        }
        const data = await response.json();
        setTicketData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (pnr) {
      fetchTicket();
    }
  }, [pnr, router]);
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ticket information...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!ticketData) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Ticket Not Found</h2>
          <p className="text-yellow-600 mb-4">The ticket with PNR {pnr} could not be found.</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back
        </button>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Update Ticket: PNR {pnr}</h1>
      
      <TicketUpdateForm
        pnr={pnr}
        currentTrain={{
          number: ticketData?.train_number,
          name: ticketData?.train_name
        }}
        currentJourneyDate={ticketData?.journey_date}
        currentSource={ticketData?.source_station}
        currentDestination={ticketData?.destination_station}
      />
    </div>
  );
} 