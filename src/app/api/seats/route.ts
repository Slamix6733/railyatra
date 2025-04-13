import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

type QueryRow = Record<string, any>;
type QueryResult = QueryRow[] | { insertId: number; affectedRows: number };

// GET: Check seat availability for a journey in a specific class
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const journey_id = searchParams.get('journey_id');
    const class_id = searchParams.get('class_id');
    const train_id = searchParams.get('train_id');
    
    // Validate parameters
    if (!journey_id && !train_id) {
      return NextResponse.json(
        { success: false, error: 'Either journey_id or train_id is required' },
        { status: 400 }
      );
    }
    
    if (train_id && !class_id) {
      // Fetch all seat configurations for a train
      const seatConfigs = await query(
        `SELECT sc.*, c.class_name, c.class_code 
         FROM SEAT_CONFIGURATION sc
         JOIN CLASS c ON sc.class_id = c.class_id
         WHERE sc.train_id = ?`,
        [train_id]
      );
      
      return NextResponse.json({
        success: true,
        data: seatConfigs
      });
    }
    
    if (journey_id && !class_id) {
      // Get journey details first
      const journeyDetails = await query(
        `SELECT j.*, s.train_id 
         FROM JOURNEY j 
         JOIN SCHEDULE s ON j.schedule_id = s.schedule_id 
         WHERE j.journey_id = ?`,
        [journey_id]
      );
      
      if (!Array.isArray(journeyDetails) || journeyDetails.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Journey not found' },
          { status: 404 }
        );
      }
      
      const journey = journeyDetails[0] as QueryRow;
      
      // Fetch all seat configurations and availability for all classes in this journey
      const seatAvailability = await query(
        `SELECT 
           sc.config_id, sc.class_id, sc.train_id, sc.total_seats, sc.fare_per_km,
           c.class_name, c.class_code,
           COUNT(CASE WHEN pt.status = 'CONFIRMED' THEN 1 END) as confirmed_count,
           COUNT(CASE WHEN pt.status = 'RAC' THEN 1 END) as rac_count,
           COUNT(CASE WHEN pt.status = 'WAITLISTED' THEN 1 END) as waitlist_count,
           MAX(CASE WHEN pt.status = 'WAITLISTED' THEN pt.waitlist_number ELSE 0 END) as last_waitlist_number
         FROM SEAT_CONFIGURATION sc
         JOIN CLASS c ON sc.class_id = c.class_id
         LEFT JOIN TICKET t ON t.journey_id = ?
         LEFT JOIN PASSENGER_TICKET pt ON pt.ticket_id = t.ticket_id
         WHERE sc.train_id = ?
         GROUP BY sc.config_id, sc.class_id, sc.train_id, sc.total_seats, sc.fare_per_km, c.class_name, c.class_code`,
        [journey_id, journey.train_id]
      );
      
      // Calculate available seats for each class
      const result = Array.isArray(seatAvailability) ? seatAvailability.map((sc: QueryRow) => {
        const confirmed = Number(sc.confirmed_count) || 0;
        const rac = Number(sc.rac_count) || 0;
        const waitlist = Number(sc.waitlist_count) || 0;
        const totalSeats = Number(sc.total_seats) || 0;
        const available = totalSeats - confirmed - rac;
        
        return {
          ...sc,
          confirmed_count: confirmed,
          rac_count: rac,
          waitlist_count: waitlist,
          total_seats: totalSeats,
          available_seats: available > 0 ? available : 0,
          booking_status: available > 0 ? 'AVAILABLE' : (waitlist > 0 ? 'WAITLIST' : 'RAC')
        };
      }) : [];
      
      return NextResponse.json({
        success: true,
        data: result
      });
    }
    
    // Check availability for a specific journey and class
    if (journey_id && class_id) {
      // Get journey details
      const journeyDetails = await query(
        `SELECT j.*, s.train_id 
         FROM JOURNEY j 
         JOIN SCHEDULE s ON j.schedule_id = s.schedule_id 
         WHERE j.journey_id = ?`,
        [journey_id]
      );
      
      if (!Array.isArray(journeyDetails) || journeyDetails.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Journey not found' },
          { status: 404 }
        );
      }
      
      const journey = journeyDetails[0] as QueryRow;
      
      // Get seat configuration for the specified class
      const seatConfig = await query(
        `SELECT sc.*, c.class_name, c.class_code
         FROM SEAT_CONFIGURATION sc
         JOIN CLASS c ON sc.class_id = c.class_id
         WHERE sc.train_id = ? AND sc.class_id = ?`,
        [journey.train_id, class_id]
      );
      
      if (!Array.isArray(seatConfig) || seatConfig.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Seat configuration not found for this class' },
          { status: 404 }
        );
      }
      
      // Get booked seats for this journey and class
      const bookedSeats = await query(
        `SELECT 
           COUNT(CASE WHEN pt.status = 'CONFIRMED' THEN 1 END) as confirmed_count,
           COUNT(CASE WHEN pt.status = 'RAC' THEN 1 END) as rac_count,
           COUNT(CASE WHEN pt.status = 'WAITLISTED' THEN 1 END) as waitlist_count,
           MAX(CASE WHEN pt.status = 'WAITLISTED' THEN pt.waitlist_number ELSE 0 END) as last_waitlist_number
         FROM TICKET t
         LEFT JOIN PASSENGER_TICKET pt ON pt.ticket_id = t.ticket_id
         WHERE t.journey_id = ?`,
        [journey_id]
      );
      
      if (!Array.isArray(bookedSeats) || bookedSeats.length === 0) {
        // No bookings yet, all seats available
        const config = seatConfig[0] as QueryRow;
        return NextResponse.json({
          success: true,
          data: {
            ...config,
            confirmed_count: 0,
            rac_count: 0,
            waitlist_count: 0,
            available_seats: Number(config.total_seats) || 0,
            booking_status: 'AVAILABLE',
            last_waitlist_number: 0
          }
        });
      }
      
      const config = seatConfig[0] as QueryRow;
      const booked = bookedSeats[0] as QueryRow;
      
      const confirmed = Number(booked.confirmed_count) || 0;
      const rac = Number(booked.rac_count) || 0;
      const waitlist = Number(booked.waitlist_count) || 0;
      const totalSeats = Number(config.total_seats) || 0;
      const availableSeats = totalSeats - confirmed - rac;
      
      return NextResponse.json({
        success: true,
        data: {
          ...config,
          confirmed_count: confirmed,
          rac_count: rac,
          waitlist_count: waitlist,
          available_seats: availableSeats > 0 ? availableSeats : 0,
          booking_status: availableSeats > 0 ? 'AVAILABLE' : (waitlist > 0 ? 'WAITLIST' : 'RAC'),
          last_waitlist_number: Number(booked.last_waitlist_number) || 0
        }
      });
    }
    
  } catch (error) {
    console.error('Error checking seat availability:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Rest of the code remains unchanged
export async function POST(request: NextRequest) {
  // Existing code
}

export async function DELETE(request: NextRequest) {
  // Existing code
}