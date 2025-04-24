import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

type QueryRow = Record<string, any>;
type QueryResult = QueryRow[] | { insertId: number; affectedRows: number };

// POST: Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.journey_id || !body.passenger_details || !body.class_id) {
      return NextResponse.json(
        { success: false, error: 'journey_id, passenger_details, and class_id are required' },
        { status: 400 }
      );
    }

    // Ensure passenger_details is an array
    if (!Array.isArray(body.passenger_details) || body.passenger_details.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one passenger is required' },
        { status: 400 }
      );
    }

    // Check if journey exists
    const journeyCheck = await query(
      'SELECT j.*, s.train_id, s.journey_date FROM JOURNEY j JOIN SCHEDULE s ON j.schedule_id = s.schedule_id WHERE j.journey_id = ?',
      [body.journey_id]
    );
    
    if (!Array.isArray(journeyCheck) || journeyCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Journey not found' },
        { status: 404 }
      );
    }

    const journey = journeyCheck[0] as QueryRow;
    const train_id = journey.train_id;
    const journey_date = journey.journey_date;
    const class_id = body.class_id;

    // Get seat configuration
    const seatConfigCheck = await query(
      'SELECT * FROM SEAT_CONFIGURATION WHERE train_id = ? AND class_id = ?',
      [train_id, class_id]
    );

    if (!Array.isArray(seatConfigCheck) || seatConfigCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Seat configuration not found for the selected train and class' },
        { status: 404 }
      );
    }

    const seatConfig = seatConfigCheck[0] as QueryRow;
    const totalSeats = seatConfig.total_seats;
    const farePerKm = seatConfig.fare_per_km;

    // Calculate distance between source and destination stations
    const distanceCheck = await query(
      `SELECT 
        ABS(dest.distance_from_source - src.distance_from_source) as journey_distance
      FROM ROUTE_SEGMENT src
      JOIN ROUTE_SEGMENT dest
      WHERE src.train_id = ? AND dest.train_id = ?
        AND src.station_id = ? AND dest.station_id = ?`,
      [train_id, train_id, journey.source_station_id, journey.destination_station_id]
    );

    if (!Array.isArray(distanceCheck) || distanceCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not calculate distance for the journey' },
        { status: 400 }
      );
    }

    const journeyDistance = (distanceCheck[0] as QueryRow).journey_distance;
    
    // Calculate base fare
    const baseFare = Math.ceil(journeyDistance * farePerKm);

    // Check how many seats are already booked in this class for this journey
    const bookedSeatsCheck = await query(
      `SELECT COUNT(*) as booked_count
      FROM PASSENGER_TICKET pt
      JOIN TICKET t ON pt.ticket_id = t.ticket_id
      WHERE t.journey_id = ? AND pt.status IN ('CONFIRMED', 'RAC')`,
      [body.journey_id]
    );

    const bookedSeats = Array.isArray(bookedSeatsCheck) && bookedSeatsCheck.length > 0
      ? (bookedSeatsCheck[0] as QueryRow).booked_count || 0
      : 0;
      
    // Calculate thresholds for RAC and Waitlist
    const racThreshold = Math.floor(totalSeats * 0.9); // RAC starts when 90% seats are booked
    const availableConfirmedSeats = racThreshold - bookedSeats;
    const availableRacSeats = totalSeats - racThreshold;
    
    // Calculate how many passengers get confirmed, RAC, and waitlisted status
    let confirmedPassengerCount = 0;
    let racPassengerCount = 0;
    let waitlistedPassengerCount = 0;
    
    if (bookedSeats < racThreshold) {
      // Some confirmed seats are still available
      confirmedPassengerCount = Math.min(body.passenger_details.length, availableConfirmedSeats);
      // If there are more passengers than confirmed seats, they go to RAC
      racPassengerCount = Math.min(
        body.passenger_details.length - confirmedPassengerCount,
        availableRacSeats
      );
    } else if (bookedSeats < totalSeats) {
      // All confirmed seats are booked, but RAC is available
      confirmedPassengerCount = 0;
      racPassengerCount = Math.min(body.passenger_details.length, totalSeats - bookedSeats);
    } else {
      // All seats including RAC are filled
      confirmedPassengerCount = 0;
      racPassengerCount = 0;
    }
    
    // Anyone who didn't get confirmed or RAC status goes to waitlist
    waitlistedPassengerCount = body.passenger_details.length - confirmedPassengerCount - racPassengerCount;
    
    // Get the current highest waitlist number if any passengers will be waitlisted
    let currentWaitlistNumber = 0;
    if (waitlistedPassengerCount > 0) {
      const waitlistCheck = await query(
        `SELECT MAX(waitlist_number) as max_waitlist
        FROM PASSENGER_TICKET pt
        JOIN TICKET t ON pt.ticket_id = t.ticket_id
        WHERE t.journey_id = ? AND pt.status = 'WAITLISTED'`,
        [body.journey_id]
      );
      
      currentWaitlistNumber = Array.isArray(waitlistCheck) && waitlistCheck.length > 0
        ? (waitlistCheck[0] as QueryRow).max_waitlist || 0
        : 0;
    }

    // Process concessions for each passenger
    let totalFare = 0;
    const passengersWithStatus = [];
    
    for (let i = 0; i < body.passenger_details.length; i++) {
      const passenger = body.passenger_details[i];
      
      // Apply concession if applicable
      let concessionPercentage = 0;
      if (passenger.concession_category && passenger.concession_category !== 'None') {
        // Get concession rate from CONCESSION table
        const concessionCheck = await query(
          'SELECT discount_percentage FROM CONCESSION WHERE category = ?',
          [passenger.concession_category]
        );
        
        if (Array.isArray(concessionCheck) && concessionCheck.length > 0) {
          concessionPercentage = (concessionCheck[0] as QueryRow).discount_percentage || 0;
        }
      }
      
      // Apply age-based concessions
      if (passenger.age <= 12) {
        // Children discount
        concessionPercentage = Math.max(concessionPercentage, 50); // 50% discount for children
      } else if (passenger.age >= 60) {
        // Senior citizen discount
        concessionPercentage = Math.max(concessionPercentage, 30); // 30% discount for seniors
      }
      
      // Calculate fare after concession
      const discountAmount = (baseFare * concessionPercentage) / 100;
      const passengerFare = baseFare - discountAmount;
      totalFare += passengerFare;
      
      // Set passenger status based on availability
      let status = 'WAITLISTED';
      let waitlistNumber = null;
      
      if (i < confirmedPassengerCount) {
        status = 'CONFIRMED';
      } else if (i < confirmedPassengerCount + racPassengerCount) {
        status = 'RAC';
      } else {
        // This passenger is waitlisted
        currentWaitlistNumber += 1;
        waitlistNumber = currentWaitlistNumber;
      }
      
      passengersWithStatus.push({
        ...passenger,
        status,
        waitlist_number: waitlistNumber,
        fare: passengerFare
      });
    }
    
    // Create ticket entry
    const bookingStatus = confirmedPassengerCount === body.passenger_details.length 
      ? 'CONFIRMED' 
      : (confirmedPassengerCount > 0 ? 'PARTIALLY_CONFIRMED' : 'WAITLISTED');
      
    // Generate PNR number based on ticket table size
    const ticketCountResult = await query('SELECT COUNT(*) as count FROM TICKET');
    const ticketCount = Array.isArray(ticketCountResult) && ticketCountResult.length > 0 
                      ? (ticketCountResult[0] as any).count : 0;
    const pnrNumber = 1000 + ticketCount + 1;
    
    // Insert ticket
    const ticketResult = await query(
      `INSERT INTO TICKET (journey_id, pnr_number, booking_date, booking_status, total_fare) 
       VALUES (?, ?, NOW(), ?, ?)`,
      [body.journey_id, pnrNumber, bookingStatus, totalFare]
    );
    
    const ticketId = !Array.isArray(ticketResult) ? ticketResult.insertId : 0;
    
    // Insert passenger tickets
    for (const passenger of passengersWithStatus) {
      let passengerIdToUse: number;
      
      // Check if passenger already exists
      if (passenger.passenger_id) {
        passengerIdToUse = passenger.passenger_id;
      } else {
        // Create a new passenger entry
        const passengerResult = await query(
          `INSERT INTO PASSENGER (name, age, gender, contact_number, email, concession_category)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            passenger.name,
            passenger.age,
            passenger.gender,
            passenger.contact_number || '',
            passenger.email || '',
            passenger.concession_category || 'None'
          ]
        );
        
        passengerIdToUse = !Array.isArray(passengerResult) ? passengerResult.insertId : 0;
      }
      
      // Generate seat number if confirmed (simple sequential seats for this example)
      let seatNumber = null;
      let berthType = null;
      
      if (passenger.status === 'CONFIRMED') {
        // Get the next available seat number
        const seatCheck = await query(
          `SELECT MAX(CAST(seat_number AS UNSIGNED)) as last_seat
           FROM PASSENGER_TICKET pt
           JOIN TICKET t ON pt.ticket_id = t.ticket_id
           WHERE t.journey_id = ? AND pt.status = 'CONFIRMED'`,
          [body.journey_id]
        );
        
        const lastSeat = Array.isArray(seatCheck) && seatCheck.length > 0
          ? (seatCheck[0] as QueryRow).last_seat || 0
          : 0;
          
        seatNumber = lastSeat + 1;
        
        // Assign berth type (SL, 3AC, 2AC, etc.)
        const berthTypes = ['LOWER', 'MIDDLE', 'UPPER', 'SIDE LOWER', 'SIDE UPPER'];
        berthType = berthTypes[seatNumber % berthTypes.length];
      } else if (passenger.status === 'RAC') {
        // For RAC, use a special seat number format: RAC1, RAC2, etc.
        // Get the next available RAC position
        const racPositionCheck = await query(
          `SELECT MAX(SUBSTRING_INDEX(seat_number, 'RAC', -1)) as last_rac_position
           FROM PASSENGER_TICKET pt
           JOIN TICKET t ON pt.ticket_id = t.ticket_id
           WHERE t.journey_id = ? AND pt.status = 'RAC' AND seat_number LIKE 'RAC%'`,
          [body.journey_id]
        );
        
        const lastRacPosition = Array.isArray(racPositionCheck) && racPositionCheck.length > 0
          ? parseInt((racPositionCheck[0] as QueryRow).last_rac_position || '0')
          : 0;
          
        const racPosition = lastRacPosition + 1;
        seatNumber = `RAC${racPosition}`;
        
        // Assign LOWER berth to RAC passengers for better comfort
        berthType = 'LOWER';
      }
      
      // Insert passenger ticket
      await query(
        `INSERT INTO PASSENGER_TICKET 
         (ticket_id, passenger_id, seat_number, berth_type, status, waitlist_number, fare)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ticketId,
          passengerIdToUse,
          seatNumber,
          berthType,
          passenger.status,
          passenger.waitlist_number,
          passenger.fare
        ]
      );
    }
    
    // Return success with ticket details
    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: {
        ticket_id: ticketId,
        pnr_number: pnrNumber,
        booking_status: bookingStatus,
        total_fare: totalFare,
        confirmed_count: confirmedPassengerCount,
        waitlisted_count: waitlistedPassengerCount,
        passengers: passengersWithStatus
      }
    });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 