import { query } from './db';
import { RowDataPacket } from 'mysql2';

/**
 * Get PNR status for a ticket
 * @param pnrNumber The PNR number to check
 */
export async function getPnrStatus(pnrNumber: string) {
  const result = await query('SELECT get_pnr_status(?) AS status', [pnrNumber]);
  if (Array.isArray(result) && result.length > 0) {
    const status = (result[0] as RowDataPacket).status;
    return typeof status === 'string' ? JSON.parse(status) : status;
  }
  return null;
}

/**
 * Get train schedule for a given train
 * @param trainIdOrNumber The train ID or number
 */
export async function getTrainSchedule(trainIdOrNumber: string | number) {
  const result = await query('SELECT get_train_schedule(?) AS schedule', [trainIdOrNumber]);
  if (Array.isArray(result) && result.length > 0) {
    const schedule = (result[0] as RowDataPacket).schedule;
    return typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
  }
  return null;
}

/**
 * Get available seats for a journey and class
 * @param journeyId The journey ID
 * @param classId The class ID
 */
export async function getAvailableSeats(journeyId: number, classId: number) {
  const result = await query('SELECT get_available_seats(?, ?) AS seats', [journeyId, classId]);
  if (Array.isArray(result) && result.length > 0) {
    const seats = (result[0] as RowDataPacket).seats;
    return typeof seats === 'string' ? JSON.parse(seats) : seats;
  }
  return null;
}

/**
 * List all passengers on a specific train for a given date
 * @param trainId The train ID
 * @param journeyDate The journey date (YYYY-MM-DD)
 */
export async function listTrainPassengers(trainId: number, journeyDate: string) {
  // This uses a stored procedure
  const [rows] = await query('CALL list_train_passengers(?, ?)', [trainId, journeyDate]) as [RowDataPacket[], any];
  return rows || [];
}

/**
 * Get all waitlisted passengers for a train
 * @param trainId The train ID
 * @param journeyDate The journey date (YYYY-MM-DD)
 */
export async function getWaitlistedPassengers(trainId: number, journeyDate: string) {
  // This uses a stored procedure
  const [rows] = await query('CALL get_waitlisted_passengers(?, ?)', [trainId, journeyDate]) as [RowDataPacket[], any];
  return rows || [];
}

/**
 * Calculate refund amount for cancelling a train
 * @param scheduleId The schedule ID of the train
 */
export async function calculateRefundAmount(scheduleId: number) {
  const result = await query('SELECT calculate_refund_amount(?) AS refund_amount', [scheduleId]);
  if (Array.isArray(result) && result.length > 0) {
    return (result[0] as RowDataPacket).refund_amount || 0;
  }
  return 0;
}

/**
 * Calculate total revenue over a period
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function calculateRevenue(startDate: string, endDate: string) {
  const result = await query('SELECT calculate_revenue(?, ?) AS revenue', [startDate, endDate]);
  if (Array.isArray(result) && result.length > 0) {
    return (result[0] as RowDataPacket).revenue || 0;
  }
  return 0;
}

/**
 * Get cancellation records with refund status
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function getCancellationRecords(startDate: string, endDate: string) {
  // This uses a stored procedure
  const [rows] = await query('CALL get_cancellation_records(?, ?)', [startDate, endDate]) as [RowDataPacket[], any];
  return rows || [];
}

/**
 * Find the busiest route based on passenger count
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function getBusiestRoute(startDate: string, endDate: string) {
  const result = await query('SELECT get_busiest_route(?, ?) AS route', [startDate, endDate]);
  if (Array.isArray(result) && result.length > 0) {
    const route = (result[0] as RowDataPacket).route;
    return typeof route === 'string' ? JSON.parse(route) : route;
  }
  return null;
}

/**
 * Generate an itemized bill for a ticket
 * @param ticketId The ticket ID
 */
export async function generateItemizedBill(ticketId: number) {
  const result = await query('SELECT generate_itemized_bill(?) AS bill', [ticketId]);
  if (Array.isArray(result) && result.length > 0) {
    const bill = (result[0] as RowDataPacket).bill;
    return typeof bill === 'string' ? JSON.parse(bill) : bill;
  }
  return null;
}

/**
 * Cancel a train and automatically mark tickets as cancelled
 * This will trigger the after_train_cancelled trigger
 * @param scheduleId The schedule ID
 */
export async function cancelTrainSchedule(scheduleId: number, reason: string = 'Operational reasons') {
  return await query(
    'UPDATE SCHEDULE SET status = ?, cancellation_reason = ? WHERE schedule_id = ?',
    ['Cancelled', reason, scheduleId]
  );
}

/**
 * Cancel a ticket and trigger automatic RAC and waitlist updates
 * This will trigger the after_ticket_cancelled trigger
 * @param ticketId The ticket ID
 * @param reason Cancellation reason
 */
export async function cancelTicket(ticketId: number, reason: string = 'Cancelled by user') {
  const cancellationDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  return await query(
    'UPDATE TICKET SET booking_status = ?, cancellation_reason = ?, cancellation_date = ? WHERE ticket_id = ?',
    ['Cancelled', reason, cancellationDate, ticketId]
  );
} 