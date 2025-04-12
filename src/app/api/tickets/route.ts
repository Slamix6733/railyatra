import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch all tickets or a specific ticket
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const pnr = searchParams.get('pnr');
    const passenger_id = searchParams.get('passenger_id');
    
    // If id is provided, fetch a specific ticket
    if (id) {
      // Get ticket details
      const ticket = await query(
        `SELECT t.*, 
          j.source_station_id, j.destination_station_id, j.class_id,
          s.train_id, s.journey_date, s.status as train_status,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          c.class_name, c.class_code,
          tr.train_number, tr.train_name
        FROM TICKET t
        JOIN JOURNEY j ON t.journey_id = j.journey_id
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN TRAIN tr ON s.train_id = tr.train_id
        WHERE t.ticket_id = ?`,
        [id]
      );
      
      if (!Array.isArray(ticket) || ticket.length === 0) {
        return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
      }
      
      // Get passengers for this ticket
      const passengers = await query(
        `SELECT pt.*, p.name, p.age, p.gender, p.contact_number, p.email, p.concession_category
         FROM PASSENGER_TICKET pt
         JOIN PASSENGER p ON pt.passenger_id = p.passenger_id
         WHERE pt.ticket_id = ?`,
        [Array.isArray(ticket) && ticket.length > 0 ? (ticket[0] as any).ticket_id : null]
      );
      
      // Get payment details
      const payment = await query(
        `SELECT * FROM PAYMENT WHERE ticket_id = ?`,
        [id]
      );
      
      // Get cancellation details if any
      const cancellation = await query(
        `SELECT * FROM CANCELLATION WHERE ticket_id = ?`,
        [id]
      );
      
      // Combine all data
      const ticketData = {
        ...ticket[0],
        passengers: passengers,
        payment: Array.isArray(payment) && payment.length > 0 ? payment[0] : null,
        cancellation: Array.isArray(cancellation) && cancellation.length > 0 ? cancellation[0] : null
      };
      
      return NextResponse.json({ success: true, data: ticketData });
    }
    
    // If PNR is provided, fetch ticket by PNR
    if (pnr) {
      const ticket = await query(
        `SELECT t.*, 
          j.source_station_id, j.destination_station_id, j.class_id,
          s.train_id, s.journey_date, s.status as train_status,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          tr.train_number, tr.train_name,
          c.class_name, c.class_code,
          rs_src.standard_departure_time as source_departure_time,
          rs_dest.standard_arrival_time as destination_arrival_time
        FROM TICKET t
        JOIN JOURNEY j ON t.journey_id = j.journey_id
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN TRAIN tr ON s.train_id = tr.train_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN ROUTE_SEGMENT rs_src ON tr.train_id = rs_src.train_id AND j.source_station_id = rs_src.station_id
        JOIN ROUTE_SEGMENT rs_dest ON tr.train_id = rs_dest.train_id AND j.destination_station_id = rs_dest.station_id
        WHERE t.pnr_number = ?`,
        [pnr]
      );
      
      if (!Array.isArray(ticket) || ticket.length === 0) {
        return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
      }
      
      // Get passengers for this ticket
      const passengers = await query(
        `SELECT pt.*, p.name, p.age, p.gender, p.contact_number, p.email
         FROM PASSENGER_TICKET pt
         JOIN PASSENGER p ON pt.passenger_id = p.passenger_id
         WHERE pt.ticket_id = ?`,
        [Array.isArray(ticket) && ticket.length > 0 ? (ticket[0] as any).ticket_id : null]
      );
      
      // Get schedule station timings
      const stationTimings = await query(
        `SELECT sst.*, 
         st.station_name, st.station_code, st.city,
         rs.sequence_number, rs.distance_from_source,
         rs.standard_arrival_time as scheduled_arrival,
         rs.standard_departure_time as scheduled_departure
         FROM SCHEDULE_STATION_TIMING sst
         JOIN STATION st ON sst.station_id = st.station_id
         JOIN JOURNEY j ON j.journey_id = ?
         JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
         JOIN ROUTE_SEGMENT rs ON st.station_id = rs.station_id AND rs.train_id = s.train_id
         WHERE sst.schedule_id = j.schedule_id
         ORDER BY rs.sequence_number`,
        [Array.isArray(ticket) && ticket.length > 0 ? (ticket[0] as any).journey_id : null]
      );
      
      return NextResponse.json({ 
        success: true, 
        data: {
          ...ticket[0],
          passengers: passengers,
          station_timings: stationTimings
        }
      });
    }
    
    // If passenger_id is provided, fetch tickets for a passenger
    if (passenger_id) {
      const tickets = await query(
        `SELECT t.*, 
          j.source_station_id, j.destination_station_id,
          s.journey_date, s.status as train_status,
          src.station_name as source_station,
          dest.station_name as destination_station,
          tr.train_number, tr.train_name,
          pt.seat_number, pt.berth_type, pt.status as passenger_status, pt.waitlist_number,
          c.class_name, c.class_code
        FROM PASSENGER_TICKET pt
        JOIN TICKET t ON pt.ticket_id = t.ticket_id
        JOIN JOURNEY j ON t.journey_id = j.journey_id
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN TRAIN tr ON s.train_id = tr.train_id
        JOIN CLASS c ON j.class_id = c.class_id
        WHERE pt.passenger_id = ?
        ORDER BY s.journey_date DESC`,
        [passenger_id]
      );
      
      return NextResponse.json({ 
        success: true, 
        count: Array.isArray(tickets) ? tickets.length : 0,
        data: tickets 
      });
    }
    
    // Get all tickets with basic details
    const tickets = await query(
      `SELECT t.ticket_id, t.pnr_number, t.booking_date, t.booking_status, t.total_fare,
        j.journey_id, s.journey_date,
        src.station_name as source_station,
        dest.station_name as destination_station,
        tr.train_number, tr.train_name,
        c.class_name
      FROM TICKET t
      JOIN JOURNEY j ON t.journey_id = j.journey_id
      JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
      JOIN STATION src ON j.source_station_id = src.station_id
      JOIN STATION dest ON j.destination_station_id = dest.station_id
      JOIN TRAIN tr ON s.train_id = tr.train_id
      JOIN CLASS c ON j.class_id = c.class_id
      ORDER BY t.booking_date DESC
      LIMIT 100`
    );
    
    return NextResponse.json({ 
      success: true, 
      count: Array.isArray(tickets) ? tickets.length : 0,
      data: tickets 
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.journey_id || !body.passengers || !body.payment) {
      return NextResponse.json(
        { success: false, error: 'journey_id, passengers and payment details are required' },
        { status: 400 }
      );
    }
    
    // Check if journey exists
    const journeyExists = await query('SELECT * FROM JOURNEY WHERE journey_id = ?', [body.journey_id]);
    if (!Array.isArray(journeyExists) || journeyExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Journey not found' },
        { status: 400 }
      );
    }
    
    // Validate passengers array
    if (!Array.isArray(body.passengers) || body.passengers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one passenger is required' },
        { status: 400 }
      );
    }
    
    // Check if passengers exist
    for (const passenger of body.passengers) {
      if (!passenger.passenger_id) {
        return NextResponse.json(
          { success: false, error: 'passenger_id is required for each passenger' },
          { status: 400 }
        );
      }
      
      const passengerExists = await query('SELECT * FROM PASSENGER WHERE passenger_id = ?', [passenger.passenger_id]);
      if (!Array.isArray(passengerExists) || passengerExists.length === 0) {
        return NextResponse.json(
          { success: false, error: `Passenger with ID ${passenger.passenger_id} not found` },
          { status: 400 }
        );
      }
    }
    
    // Validate payment details
    if (!body.payment.amount || !body.payment.payment_mode || !body.payment.transaction_id) {
      return NextResponse.json(
        { success: false, error: 'Payment amount, mode and transaction ID are required' },
        { status: 400 }
      );
    }
    
    // Check if transaction ID is unique
    const transactionExists = await query('SELECT * FROM PAYMENT WHERE transaction_id = ?', [body.payment.transaction_id]);
    if (Array.isArray(transactionExists) && transactionExists.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID already exists' },
        { status: 400 }
      );
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Generate a unique PNR
      const pnr = Math.floor(100000000 + Math.random() * 900000000).toString();
      
      // Check total fare
      if (!body.total_fare || body.total_fare <= 0) {
        // Calculate fare based on journey
        const journeyDetails = await query(
          `SELECT j.*, s.schedule_id, s.train_id, c.class_id, sc.fare_per_km,
            rs_src.distance_from_source as src_distance,
            rs_dest.distance_from_source as dest_distance
          FROM JOURNEY j
          JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
          JOIN CLASS c ON j.class_id = c.class_id
          JOIN SEAT_CONFIGURATION sc ON s.train_id = sc.train_id AND j.class_id = sc.class_id
          JOIN ROUTE_SEGMENT rs_src ON s.train_id = rs_src.train_id AND j.source_station_id = rs_src.station_id
          JOIN ROUTE_SEGMENT rs_dest ON s.train_id = rs_dest.train_id AND j.destination_station_id = rs_dest.station_id
          WHERE j.journey_id = ?`,
          [body.journey_id]
        );
        
        if (Array.isArray(journeyDetails) && journeyDetails.length > 0) {
          const journey = journeyDetails[0] as any;
          const distance = Math.abs(journey.dest_distance - journey.src_distance);
          body.total_fare = distance * journey.fare_per_km * body.passengers.length;
        } else {
          body.total_fare = 0;
        }
      }
      
      // Insert ticket
      const ticketResult = await query(
        `INSERT INTO TICKET (pnr_number, journey_id, booking_date, booking_status, total_fare, booking_type) 
         VALUES (?, ?, NOW(), ?, ?, ?)`,
        [
          pnr,
          body.journey_id,
          body.booking_status || 'Confirmed',
          body.total_fare,
          body.booking_type || 'Online'
        ]
      );
      
      const ticketId = (ticketResult as any).insertId;
      
      // Insert passenger tickets
      let hasPrimaryPassenger = false;
      for (const passenger of body.passengers) {
        // Set primary passenger if not specified
        if (!hasPrimaryPassenger && passenger.is_primary_passenger !== false) {
          passenger.is_primary_passenger = true;
          hasPrimaryPassenger = true;
        }
        
        await query(
          `INSERT INTO PASSENGER_TICKET 
           (ticket_id, passenger_id, seat_number, berth_type, status, waitlist_number, is_primary_passenger) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            ticketId,
            passenger.passenger_id,
            passenger.seat_number || null,
            passenger.berth_type || null,
            passenger.status || body.booking_status || 'Confirmed',
            passenger.waitlist_number || null,
            passenger.is_primary_passenger || false
          ]
        );
      }
      
      // Insert payment
      await query(
        `INSERT INTO PAYMENT (ticket_id, amount, payment_date, payment_mode, transaction_id, status) 
         VALUES (?, ?, NOW(), ?, ?, ?)`,
        [
          ticketId,
          body.payment.amount,
          body.payment.payment_mode,
          body.payment.transaction_id,
          body.payment.status || 'Success'
        ]
      );
      
      // Commit transaction
      await query('COMMIT');
      
      // Fetch the created ticket
      const newTicket = await query(
        `SELECT t.*, 
          j.source_station_id, j.destination_station_id, j.class_id,
          s.train_id, s.journey_date, s.status as train_status,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          c.class_name, c.class_code,
          tr.train_number, tr.train_name
        FROM TICKET t
        JOIN JOURNEY j ON t.journey_id = j.journey_id
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN TRAIN tr ON s.train_id = tr.train_id
        WHERE t.ticket_id = ?`,
        [ticketId]
      );
      
      // Get passengers for this ticket
      const passengers = await query(
        `SELECT pt.*, p.name, p.age, p.gender, p.contact_number, p.email
         FROM PASSENGER_TICKET pt
         JOIN PASSENGER p ON pt.passenger_id = p.passenger_id
         WHERE pt.ticket_id = ?`,
        [ticketId]
      );
      
      // Get payment details
      const payment = await query(
        `SELECT * FROM PAYMENT WHERE ticket_id = ?`,
        [ticketId]
      );
      
      return NextResponse.json(
        { 
          success: true, 
          data: {
            ...(Array.isArray(newTicket) && newTicket.length > 0 ? newTicket[0] : {}),
            passengers: passengers,
            payment: Array.isArray(payment) && payment.length > 0 ? payment[0] : null
          }
        },
        { status: 201 }
      );
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update a ticket's status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.ticket_id) {
      return NextResponse.json(
        { success: false, error: 'ticket_id is required' },
        { status: 400 }
      );
    }
    
    // Check if ticket exists
    const ticketExists = await query('SELECT * FROM TICKET WHERE ticket_id = ?', [body.ticket_id]);
    if (!Array.isArray(ticketExists) || ticketExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Update ticket status if provided
      if (body.booking_status) {
        if (!['Confirmed', 'RAC', 'Waitlisted', 'Cancelled'].includes(body.booking_status)) {
          await query('ROLLBACK');
          return NextResponse.json(
            { success: false, error: 'Invalid booking status' },
            { status: 400 }
          );
        }
        
        await query(
          'UPDATE TICKET SET booking_status = ? WHERE ticket_id = ?',
          [body.booking_status, body.ticket_id]
        );
        
        // If cancelling, add cancellation record
        if (body.booking_status === 'Cancelled' && !body.skip_cancellation) {
          // Calculate refund amount (simplified - in a real system this would be more complex)
          const ticketData = await query(
            'SELECT t.*, p.amount as payment_amount FROM TICKET t JOIN PAYMENT p ON t.ticket_id = p.ticket_id WHERE t.ticket_id = ?',
            [body.ticket_id]
          );
          
          if (Array.isArray(ticketData) && ticketData.length > 0) {
            const ticket = ticketData[0] as any;
            const totalFare = ticket.total_fare;
            let refundAmount = totalFare * 0.9; // 90% refund by default
            let cancellationCharges = totalFare * 0.1; // 10% cancellation charge
            
            // Add custom cancellation logic if provided
            if (body.cancellation) {
              if (body.cancellation.refund_amount !== undefined) {
                refundAmount = body.cancellation.refund_amount;
                cancellationCharges = totalFare - refundAmount;
              } else if (body.cancellation.cancellation_charges !== undefined) {
                cancellationCharges = body.cancellation.cancellation_charges;
                refundAmount = totalFare - cancellationCharges;
              }
            }
            
            await query(
              `INSERT INTO CANCELLATION 
               (ticket_id, cancellation_date, reason, refund_amount, cancellation_charges, refund_status) 
               VALUES (?, NOW(), ?, ?, ?, ?)`,
              [
                body.ticket_id,
                body.cancellation?.reason || 'User requested cancellation',
                refundAmount,
                cancellationCharges,
                body.cancellation?.refund_status || 'Pending'
              ]
            );
          }
        }
      }
      
      // Update passenger tickets status if provided
      if (body.passenger_tickets && Array.isArray(body.passenger_tickets)) {
        for (const pt of body.passenger_tickets) {
          if (!pt.passenger_ticket_id) {
            await query('ROLLBACK');
            return NextResponse.json(
              { success: false, error: 'passenger_ticket_id is required for each passenger ticket' },
              { status: 400 }
            );
          }
          
          const updates: string[] = [];
          const params: any[] = [];
          
          if (pt.seat_number !== undefined) {
            updates.push('seat_number = ?');
            params.push(pt.seat_number);
          }
          
          if (pt.berth_type !== undefined) {
            updates.push('berth_type = ?');
            params.push(pt.berth_type);
          }
          
          if (pt.status !== undefined) {
            if (!['Confirmed', 'RAC', 'Waitlisted', 'Cancelled'].includes(pt.status)) {
              await query('ROLLBACK');
              return NextResponse.json(
                { success: false, error: 'Invalid passenger ticket status' },
                { status: 400 }
              );
            }
            updates.push('status = ?');
            params.push(pt.status);
          }
          
          if (pt.waitlist_number !== undefined) {
            updates.push('waitlist_number = ?');
            params.push(pt.waitlist_number);
          }
          
          if (updates.length > 0) {
            params.push(pt.passenger_ticket_id);
            await query(
              `UPDATE PASSENGER_TICKET SET ${updates.join(', ')} WHERE passenger_ticket_id = ?`,
              params
            );
          }
        }
      }
      
      // Commit transaction
      await query('COMMIT');
      
      // Fetch the updated ticket
      const updatedTicket = await query(
        `SELECT t.*, 
          j.source_station_id, j.destination_station_id, j.class_id,
          s.train_id, s.journey_date, s.status as train_status,
          src.station_name as source_station,
          dest.station_name as destination_station,
          tr.train_number, tr.train_name
        FROM TICKET t
        JOIN JOURNEY j ON t.journey_id = j.journey_id
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN TRAIN tr ON s.train_id = tr.train_id
        WHERE t.ticket_id = ?`,
        [body.ticket_id]
      );
      
      // Get passengers for this ticket
      const passengers = await query(
        `SELECT pt.*, p.name, p.age, p.gender, p.contact_number, p.email
         FROM PASSENGER_TICKET pt
         JOIN PASSENGER p ON pt.passenger_id = p.passenger_id
         WHERE pt.ticket_id = ?`,
        [body.ticket_id]
      );
      
      // Get cancellation details if any
      const cancellation = await query(
        `SELECT * FROM CANCELLATION WHERE ticket_id = ?`,
        [body.ticket_id]
      );
      
      return NextResponse.json({ 
        success: true, 
        data: {
          ...(Array.isArray(updatedTicket) && updatedTicket.length > 0 ? updatedTicket[0] : {}),
          passengers: passengers,
          cancellation: Array.isArray(cancellation) && cancellation.length > 0 ? cancellation[0] : null
        }
      });
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Not implementing ticket deletion as it's generally not allowed in a railway system
// Tickets should be cancelled, not deleted
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Ticket deletion is not supported. Use PUT to cancel a ticket instead.' },
    { status: 405 }
  );
} 