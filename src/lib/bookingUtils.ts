/**
 * Utility functions for ticket booking and management
 */

/**
 * Updates an existing ticket with new train, journey date, and/or source/destination stations
 * 
 * @param pnr The PNR number of the ticket to update
 * @param trainNumber The new train number
 * @param trainId The new train ID 
 * @param journeyDate Optional new journey date in format 'YYYY-MM-DD'
 * @param sourceStation Optional new source station name
 * @param destinationStation Optional new destination station name
 * @returns Promise with the API response
 */
export async function updateTicket(
  pnr: string, 
  trainNumber?: string, 
  trainId?: number, 
  journeyDate?: string,
  sourceStation?: string,
  destinationStation?: string
) {
  if (!trainNumber && !trainId) {
    throw new Error('Either train number or train ID must be provided');
  }

  try {
    const response = await fetch('/api/booking/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pnr,
        train_number: trainNumber,
        train_id: trainId,
        journey_date: journeyDate,
        source_station: sourceStation,
        destination_station: destinationStation,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update ticket');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
}

/**
 * Formats a date string for display
 * 
 * @param dateStr Date string to format
 * @returns Formatted date string (e.g., "Tue Apr 15 2025")
 */
export function formatJourneyDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
} 