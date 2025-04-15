import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2';
import { z } from 'zod';

// Create a simple direct connection function that doesn't use the connection pool or promises
function executeQuery(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    // Create a fresh connection each time
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    connection.connect((err) => {
      if (err) {
        connection.end();
        return reject(err);
      }

      connection.query(sql, params, (error, results) => {
        // Always close the connection
        connection.end();
        
        if (error) {
          return reject(error);
        }
        
        resolve(results as any[]);
      });
    });
  });
}

// Define types for database results
interface TicketDetail {
  ticket_id: number;
  booking_status: string;
  total_fare: number;
  journey_date: string;
  [key: string]: any; // Allow additional properties
}

interface PassengerTicket {
  name: string;
  email?: string;
  status: string;
  [key: string]: any; // Allow additional properties
}

// Helper function to verify table structure
async function verifyTableStructure(conn: mysql.Connection, queryFn: (sql: string, values?: any[]) => Promise<any>): Promise<boolean> {
  console.log('Verifying database table structure...');
  
  try {
    // Check TICKET table structure
    const ticketColumns = await queryFn("SHOW COLUMNS FROM TICKET");
    console.log('TICKET table columns:', JSON.stringify(ticketColumns, null, 2));
    
    // Check PASSENGER_TICKET table structure
    const passengerTicketColumns = await queryFn("SHOW COLUMNS FROM PASSENGER_TICKET");
    console.log('PASSENGER_TICKET table columns:', JSON.stringify(passengerTicketColumns, null, 2));
    
    // Check CANCELLATION table structure
    const cancellationColumns = await queryFn("SHOW COLUMNS FROM CANCELLATION");
    console.log('CANCELLATION table columns:', JSON.stringify(cancellationColumns, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error verifying table structure:', error);
    return false;
  }
}

// POST: Cancel a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received cancellation request for PNR:', body.pnr);
    
    // Validate required fields
    if (!body.pnr) {
      return NextResponse.json(
        { success: false, error: 'PNR number is required' },
        { status: 400 }
      );
    }

    // 1. Get ticket and check if it exists and can be cancelled
    const ticketResults = await executeQuery(
      "SELECT t.ticket_id, t.booking_status, t.total_fare, " +
      "s.journey_date FROM TICKET t " +
      "JOIN JOURNEY j ON t.journey_id = j.journey_id " +
      "JOIN SCHEDULE s ON j.schedule_id = s.schedule_id " +
      "WHERE t.pnr_number = ?",
      [body.pnr]
    );

    if (!ticketResults || ticketResults.length === 0) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const ticket = ticketResults[0] as any;
    
    // 2. Check cancellation eligibility
    if (ticket.booking_status === 'Cancelled') {
      return NextResponse.json({ success: false, error: 'Booking is already cancelled' }, { status: 400 });
    }

    const journeyDate = new Date(ticket.journey_date);
    const currentDate = new Date();
    
    if (journeyDate < currentDate) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel a booking for a journey that has already departed' },
        { status: 400 }
      );
    }

    // 3. Get passenger information
    const passengerResults = await executeQuery(
      "SELECT pt.passenger_ticket_id, p.name, p.email " +
      "FROM PASSENGER_TICKET pt " +
      "JOIN PASSENGER p ON pt.passenger_id = p.passenger_id " +
      "WHERE pt.ticket_id = ?",
      [ticket.ticket_id]
    );

    if (!passengerResults || passengerResults.length === 0) {
      return NextResponse.json({ success: false, error: 'No passengers found for this booking' }, { status: 404 });
    }

    // 4. Calculate refund
    const hoursBeforeJourney = Math.max(0, (journeyDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60));
    const refundPercentage = hoursBeforeJourney >= 24 ? 100 : 50;
    const totalFare = ticket.total_fare;
    const refundAmount = Math.floor(totalFare * refundPercentage / 100);
    const cancellationCharges = totalFare - refundAmount;
    
    try {
      // 5. Create cancellation record first
      await executeQuery(
        "INSERT INTO CANCELLATION (ticket_id, cancellation_date, reason, refund_amount, cancellation_charges, refund_status) " +
        "VALUES (?, NOW(), ?, ?, ?, ?)",
        [ticket.ticket_id, body.reason || 'Customer requested cancellation', refundAmount, cancellationCharges, 'Pending']
      );
      
      // 6. Update passenger tickets status
      await executeQuery(
        "UPDATE PASSENGER_TICKET SET status = 'Cancelled' WHERE ticket_id = ?", 
        [ticket.ticket_id]
      );
      
      // 7. Update ticket status last
      await executeQuery(
        "UPDATE TICKET SET booking_status = 'Cancelled' WHERE ticket_id = ?", 
        [ticket.ticket_id]
      );
      
      // 8. Return success response
      return NextResponse.json({
        success: true,
        message: 'Ticket cancelled successfully',
        data: {
          pnr: body.pnr,
          refund_amount: refundAmount,
          refund_percentage: refundPercentage,
          cancellation_charges: cancellationCharges,
          cancelled_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error during cancellation process:', error);
      throw new Error(`Failed to cancel ticket: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    
    let errorMessage = 'An error occurred while cancelling the booking';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 