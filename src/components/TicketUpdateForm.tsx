'use client';

import React, { useState } from 'react';
import { updateTicket } from '@/lib/bookingUtils';
import { useRouter } from 'next/navigation';

interface TicketUpdateFormProps {
  pnr: string;
  currentTrain?: {
    number: string;
    name: string;
  };
  currentJourneyDate?: string;
  currentSource?: string;
  currentDestination?: string;
}

export default function TicketUpdateForm({ 
  pnr, 
  currentTrain, 
  currentJourneyDate,
  currentSource,
  currentDestination 
}: TicketUpdateFormProps) {
  const router = useRouter();
  const [selectedTrain, setSelectedTrain] = useState<string>("");
  const [journeyDate, setJourneyDate] = useState<string>("");
  const [sourceStation, setSourceStation] = useState<string>("");
  const [destinationStation, setDestinationStation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one field is updated
    if (!selectedTrain && !journeyDate && !sourceStation && !destinationStation) {
      setError("Please update at least one detail: train, journey date, or route");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Call the update API
      await updateTicket(
        pnr,
        selectedTrain || undefined,
        undefined, // trainId not used in this form
        journeyDate || undefined,
        sourceStation || undefined,
        destinationStation || undefined
      );
      
      setSuccess(true);
      
      // Redirect after a brief success message
      setTimeout(() => {
        router.push('/admin/tickets');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Predefined options for demonstration
  const trainOptions = [
    { number: "12345", name: "Rajdhani Express" },
    { number: "22201", name: "Duronto Express" },
    { number: "12302", name: "Howrah Mail" },
    { number: "12952", name: "Mumbai Rajdhani" },
    { number: "12301", name: "Howrah Rajdhani" },
  ];
  
  const stationOptions = [
    { code: "NDLS", name: "New Delhi" },
    { code: "HWH", name: "Howrah" },
    { code: "CSTM", name: "Mumbai CST" },
    { code: "MAS", name: "Chennai Central" },
    { code: "BCT", name: "Mumbai Central" },
    { code: "SBC", name: "Bengaluru" },
    { code: "CNB", name: "Kanpur Central" },
    { code: "ALD", name: "Allahabad Jn" },
    { code: "BPL", name: "Bhopal" },
    { code: "PNBE", name: "Patna" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700 font-medium">Ticket updated successfully! Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-gray-800">Current Details</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {currentTrain && (
                <div className="px-4 py-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">Current Train</p>
                  <p className="font-medium text-gray-800">
                    {currentTrain.number} - {currentTrain.name}
                  </p>
                </div>
              )}
              
              {currentJourneyDate && (
                <div className="px-4 py-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">Current Journey Date</p>
                  <p className="font-medium text-gray-800">{new Date(currentJourneyDate).toLocaleDateString()}</p>
                </div>
              )}
              
              {currentSource && currentDestination && (
                <div className="px-4 py-3 bg-gray-50 rounded-md sm:col-span-2">
                  <p className="text-sm text-gray-500">Current Route</p>
                  <p className="font-medium text-gray-800">
                    {currentSource} to {currentDestination}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">Update Details</h2>
            
            <div>
              <label htmlFor="train" className="block text-sm font-medium text-gray-700 mb-1">
                New Train
              </label>
              <select
                id="train"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedTrain}
                onChange={(e) => setSelectedTrain(e.target.value)}
              >
                <option value="">-- Select a train --</option>
                {trainOptions.map((train) => (
                  <option key={train.number} value={train.number}>
                    {train.number} - {train.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="journeyDate" className="block text-sm font-medium text-gray-700 mb-1">
                New Journey Date
              </label>
              <input
                type="date"
                id="journeyDate"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label htmlFor="sourceStation" className="block text-sm font-medium text-gray-700 mb-1">
                New Source Station
              </label>
              <select
                id="sourceStation"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={sourceStation}
                onChange={(e) => setSourceStation(e.target.value)}
              >
                <option value="">-- Select source station --</option>
                {stationOptions.map((station) => (
                  <option key={station.code} value={station.name}>
                    {station.name} ({station.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="destinationStation" className="block text-sm font-medium text-gray-700 mb-1">
                New Destination Station
              </label>
              <select
                id="destinationStation"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={destinationStation}
                onChange={(e) => setDestinationStation(e.target.value)}
              >
                <option value="">-- Select destination station --</option>
                {stationOptions.map((station) => (
                  <option key={station.code} value={station.name}>
                    {station.name} ({station.code})
                  </option>
                ))}
              </select>
              {sourceStation && destinationStation && sourceStation === destinationStation && (
                <p className="mt-1 text-sm text-red-600">
                  Source and destination stations cannot be the same
                </p>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isSubmitting || (sourceStation !== "" && destinationStation !== "" && sourceStation === destinationStation)}
            >
              {isSubmitting ? "Updating..." : "Update Ticket"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 