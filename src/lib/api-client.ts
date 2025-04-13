/**
 * API client utility for making calls to the rail-functions API endpoints
 * This makes it easy to access MySQL functions from the frontend
 */

/**
 * Get PNR status for a ticket
 * @param pnrNumber The PNR number to check
 */
export async function getPnrStatus(pnrNumber: string) {
  const response = await fetch(`/api/rail-functions?action=pnr_status&pnr=${pnrNumber}`);
  return response.json();
}

/**
 * Get train schedule for a given train
 * @param trainIdOrNumber The train ID or number
 */
export async function getTrainSchedule(trainIdOrNumber: string | number) {
  const response = await fetch(`/api/rail-functions?action=train_schedule&train_id=${trainIdOrNumber}`);
  return response.json();
}

/**
 * Get available seats for a journey and class
 * @param journeyId The journey ID
 * @param classId The class ID
 */
export async function getAvailableSeats(journeyId: number, classId: number) {
  const response = await fetch(
    `/api/rail-functions?action=available_seats&journey_id=${journeyId}&class_id=${classId}`
  );
  return response.json();
}

/**
 * List all passengers on a specific train for a given date
 * @param trainId The train ID
 * @param journeyDate The journey date (YYYY-MM-DD)
 */
export async function listTrainPassengers(trainId: number, journeyDate: string) {
  const response = await fetch(
    `/api/rail-functions?action=train_passengers&train_id=${trainId}&journey_date=${journeyDate}`
  );
  return response.json();
}

/**
 * Get all waitlisted passengers for a train
 * @param trainId The train ID
 * @param journeyDate The journey date (YYYY-MM-DD)
 */
export async function getWaitlistedPassengers(trainId: number, journeyDate: string) {
  const response = await fetch(
    `/api/rail-functions?action=waitlisted_passengers&train_id=${trainId}&journey_date=${journeyDate}`
  );
  return response.json();
}

/**
 * Calculate refund amount for cancelling a train
 * @param scheduleId The schedule ID of the train
 */
export async function calculateRefundAmount(scheduleId: number) {
  const response = await fetch(`/api/rail-functions?action=refund_amount&schedule_id=${scheduleId}`);
  return response.json();
}

/**
 * Calculate total revenue over a period
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function calculateRevenue(startDate: string, endDate: string) {
  const response = await fetch(
    `/api/rail-functions?action=revenue&start_date=${startDate}&end_date=${endDate}`
  );
  return response.json();
}

/**
 * Get cancellation records with refund status
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function getCancellationRecords(startDate: string, endDate: string) {
  const response = await fetch(
    `/api/rail-functions?action=cancellation_records&start_date=${startDate}&end_date=${endDate}`
  );
  return response.json();
}

/**
 * Find the busiest route based on passenger count
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function getBusiestRoute(startDate: string, endDate: string) {
  const response = await fetch(
    `/api/rail-functions?action=busiest_route&start_date=${startDate}&end_date=${endDate}`
  );
  return response.json();
}

/**
 * Generate an itemized bill for a ticket
 * @param ticketId The ticket ID
 */
export async function generateItemizedBill(ticketId: number) {
  const response = await fetch(`/api/rail-functions?action=itemized_bill&ticket_id=${ticketId}`);
  return response.json();
}

/**
 * Cancel a train and automatically mark tickets as cancelled
 * @param scheduleId The schedule ID
 * @param reason Cancellation reason
 */
export async function cancelTrainSchedule(scheduleId: number, reason: string = 'Operational reasons') {
  const response = await fetch('/api/rail-functions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'cancel_train',
      schedule_id: scheduleId,
      reason,
    }),
  });
  return response.json();
}

/**
 * Cancel a ticket and trigger automatic RAC and waitlist updates
 * @param ticketId The ticket ID
 * @param reason Cancellation reason
 */
export async function cancelTicket(ticketId: number, reason: string = 'Cancelled by user') {
  const response = await fetch('/api/rail-functions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'cancel_ticket',
      ticket_id: ticketId,
      reason,
    }),
  });
  return response.json();
} 