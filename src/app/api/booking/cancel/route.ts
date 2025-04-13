import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST: Cancel a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.pnr) {
      return NextResponse.json(
        { success: false, error: 'PNR number is required' },
        { status: 400 }
      );
    }
    
    // Get ticket details
    const ticketDetails = await query(
      `SELECT t.*, j.*, s.journey_date
       FROM TICKET t
       JOIN JOURNEY j ON t.journey_id = j.journey_id
       JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
       WHERE t.pnr_number = ?`,
      [body.pnr]
    );
    
    if (!Array.isArray(ticketDetails) || ticketDetails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    const ticket = ticketDetails[0] as any;
    const ticketId = ticket.ticket_id;
    
    // Check if the booking is already cancelled
    if (ticket.booking_status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }
    
    // Check if the journey date has passed
    const journeyDate = new Date(ticket.journey_date);
    const currentDate = new Date();
    
    if (journeyDate < currentDate) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel a booking for a journey that has already departed' },
        { status: 400 }
      );
    }
    
    // Get passenger tickets
    const passengerTickets = await query(
      `SELECT pt.*, p.name
       FROM PASSENGER_TICKET pt
       JOIN PASSENGER p ON pt.passenger_id = p.passenger_id
       WHERE pt.ticket_id = ?`,
      [ticketId]
    );
    
    if (!Array.isArray(passengerTickets) || passengerTickets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No passengers found for this booking' },
        { status: 404 }
      );
    }
    
    // Calculate refund amount based on cancellation policy
    // For example: Full refund if cancelled 24+ hours before journey, 50% refund otherwise
    const hoursBeforeJourney = Math.max(0, (journeyDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60));
    const refundPercentage = hoursBeforeJourney >= 24 ? 100 : 50;
    
    // Start transaction
    await query('START TRANSACTION');
    
    try {
      // Update ticket status to cancelled
      await query(
        'UPDATE TICKET SET booking_status = ? WHERE ticket_id = ?',
        ['CANCELLED', ticketId]
      );
      
      // Update passenger tickets status to cancelled
      await query(
        'UPDATE PASSENGER_TICKET SET status = ? WHERE ticket_id = ?',
        ['CANCELLED', ticketId]
      );
      
      // Create cancellation record
      const totalFare = ticket.total_fare;
      const refundAmount = Math.floor(totalFare * refundPercentage / 100);
      
      await query(
        `INSERT INTO CANCELLATION (ticket_id, cancelled_date, refund_amount, reason)
         VALUES (?, NOW(), ?, ?)`,
        [ticketId, refundAmount, body.reason || 'User requested cancellation']
      );
      
      // Process waitlisted tickets if there were confirmed tickets in this booking
      const confirmedTickets = Array.isArray(passengerTickets) ? 
        passengerTickets.filter(pt => (pt as any).status === 'CONFIRMED') : [];
      
      if (confirmedTickets.length > 0) {
        // Identify waitlisted passengers who can now be confirmed
        const waitlistedPassengers = await query(
          `SELECT pt.*, t.journey_id
           FROM PASSENGER_TICKET pt
           JOIN TICKET t ON pt.ticket_id = t.ticket_id
           WHERE t.journey_id = ? AND pt.status = 'WAITLISTED'
           ORDER BY pt.waitlist_number
           LIMIT ?`,
          [ticket.journey_id, confirmedTickets.length]
        );
        
        if (Array.isArray(waitlistedPassengers) && waitlistedPassengers.length > 0) {
          for (let i = 0; i < waitlistedPassengers.length; i++) {
            const waitlistedPassenger = waitlistedPassengers[i] as any;
            const confirmedSeat = confirmedTickets[i] as any;
            
            // Update waitlisted passenger to confirmed
            await query(
              `UPDATE PASSENGER_TICKET 
               SET status = ?, waitlist_number = NULL, seat_number = ?, berth_type = ?
               WHERE passenger_ticket_id = ?`,
              ['CONFIRMED', confirmedSeat.seat_number, confirmedSeat.berth_type, waitlistedPassenger.passenger_ticket_id]
            );
            
            // Update the ticket status if needed
            await query(
              `UPDATE TICKET t
               SET booking_status = 
                 CASE 
                   WHEN NOT EXISTS (
                     SELECT 1 FROM PASSENGER_TICKET pt 
                     WHERE pt.ticket_id = t.ticket_id AND pt.status = 'WAITLISTED'
                   ) THEN 'CONFIRMED'
                   ELSE 'PARTIALLY_CONFIRMED'
                 END
               WHERE ticket_id = ?`,
              [waitlistedPassenger.ticket_id]
            );
          }
        }
      }
      
      // Commit transaction
      await query('COMMIT');
      
      // Return cancellation details
      return NextResponse.json({
        success: true,
        data: {
          pnr_number: body.pnr,
          ticket_id: ticketId,
          cancelled_at: new Date().toISOString(),
          total_fare: totalFare,
          refund_amount: refundAmount,
          refund_percentage: refundPercentage,
          passengers: passengerTickets.map((pt: any) => ({
            passenger_id: pt.passenger_id,
            name: pt.name,
            was_status: pt.status,
            was_seat: pt.seat_number,
          }))
        }
      });
    } catch (transactionError) {
      // Rollback in case of any error
      await query('ROLLBACK');
      throw transactionError;
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while cancelling the booking' },
      { status: 500 }
    );
  }
} 