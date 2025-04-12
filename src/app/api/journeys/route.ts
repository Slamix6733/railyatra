import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch all journeys or a specific journey
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const schedule_id = searchParams.get('schedule_id');
    const source = searchParams.get('source');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    const class_id = searchParams.get('class_id');
    
    // If id is provided, fetch a specific journey with availability details
    if (id) {
      // Get journey details
      const journey = await query(
        `SELECT j.*, 
          s.journey_date, s.status as train_status, s.delay_time,
          t.train_id, t.train_number, t.train_name, t.train_type, t.run_days,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          c.class_name, c.class_code,
          sc.total_seats, sc.fare_per_km,
          rs_src.distance_from_source as src_distance,
          rs_dest.distance_from_source as dest_distance,
          (rs_dest.distance_from_source - rs_src.distance_from_source) as journey_distance,
          rs_src.standard_departure_time as departure_time,
          rs_dest.standard_arrival_time as arrival_time
        FROM JOURNEY j
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN TRAIN t ON s.train_id = t.train_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN SEAT_CONFIGURATION sc ON s.train_id = sc.train_id AND j.class_id = sc.class_id
        JOIN ROUTE_SEGMENT rs_src ON t.train_id = rs_src.train_id AND j.source_station_id = rs_src.station_id
        JOIN ROUTE_SEGMENT rs_dest ON t.train_id = rs_dest.train_id AND j.destination_station_id = rs_dest.station_id
        WHERE j.journey_id = ?`,
        [id]
      );
      
      if (!Array.isArray(journey) || journey.length === 0) {
        return NextResponse.json({ success: false, error: 'Journey not found' }, { status: 404 });
      }
      
      // Get RAC and waitlist info
      const racInfo = await query('SELECT * FROM RAC WHERE journey_id = ?', [id]);
      const waitlistInfo = await query('SELECT * FROM WAITLIST WHERE journey_id = ?', [id]);
      
      // Get ticket count (to calculate availability)
      const ticketCount = await query(
        `SELECT COUNT(*) as total_bookings
         FROM TICKET t
         JOIN PASSENGER_TICKET pt ON t.ticket_id = pt.ticket_id
         WHERE t.journey_id = ? AND t.booking_status = 'Confirmed' AND pt.status = 'Confirmed'`,
        [id]
      );
      
      // Get RAC count
      const racCount = await query(
        `SELECT COUNT(*) as total_rac
         FROM TICKET t
         JOIN PASSENGER_TICKET pt ON t.ticket_id = pt.ticket_id
         WHERE t.journey_id = ? AND pt.status = 'RAC'`,
        [id]
      );
      
      // Get Waitlist count
      const waitlistCount = await query(
        `SELECT COUNT(*) as total_waitlist
         FROM TICKET t
         JOIN PASSENGER_TICKET pt ON t.ticket_id = pt.ticket_id
         WHERE t.journey_id = ? AND pt.status = 'Waitlisted'`,
        [id]
      );
      
      // Calculate availability
      const journeyData = journey[0] as any;
      const totalSeats = journeyData.total_seats;
      const bookedSeats = Array.isArray(ticketCount) && ticketCount.length > 0 ? (ticketCount[0] as any).total_bookings : 0;
      const availableSeats = Math.max(0, totalSeats - bookedSeats);
      
      // Calculate current RAC and waitlist positions
      const racData = Array.isArray(racInfo) && racInfo.length > 0 ? racInfo[0] : null;
      const waitlistData = Array.isArray(waitlistInfo) && waitlistInfo.length > 0 ? waitlistInfo[0] : null;
      const racMax = racData ? (racData as any).max_rac : 0;
      const waitlistMax = waitlistData ? (waitlistData as any).max_waitlist : 0;
      const racUsed = Array.isArray(racCount) && racCount.length > 0 ? (racCount[0] as any).total_rac : 0;
      const waitlistUsed = Array.isArray(waitlistCount) && waitlistCount.length > 0 ? (waitlistCount[0] as any).total_waitlist : 0;
      
      // Combine all data
      const journeyDetails = {
        ...journeyData,
        availability: {
          total_seats: totalSeats,
          booked_seats: bookedSeats,
          available_seats: availableSeats,
          rac: {
            max: racMax,
            used: racUsed,
            available: Math.max(0, racMax - racUsed),
            current_position: racUsed + 1
          },
          waitlist: {
            max: waitlistMax,
            used: waitlistUsed,
            available: Math.max(0, waitlistMax - waitlistUsed),
            current_position: waitlistUsed + 1
          }
        }
      };
      
      return NextResponse.json({ success: true, data: journeyDetails });
    }
    
    // If schedule_id is provided, fetch journeys for a specific schedule
    if (schedule_id) {
      const journeys = await query(
        `SELECT j.*, 
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          c.class_name, c.class_code,
          sc.total_seats, sc.fare_per_km
        FROM JOURNEY j
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN SEAT_CONFIGURATION sc ON s.train_id = sc.train_id AND j.class_id = sc.class_id
        WHERE j.schedule_id = ?`,
        [schedule_id]
      );
      
      return NextResponse.json({ 
        success: true, 
        count: Array.isArray(journeys) ? journeys.length : 0,
        data: journeys 
      });
    }
    
    // Search for journeys between source and destination on a specific date and class
    if (source && destination && date) {
      let sql = `
        SELECT j.*, 
          s.journey_date, s.status as train_status, s.delay_time,
          t.train_id, t.train_number, t.train_name, t.train_type, t.run_days,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          c.class_name, c.class_code,
          sc.total_seats, sc.fare_per_km,
          rs_src.distance_from_source as src_distance,
          rs_dest.distance_from_source as dest_distance,
          (rs_dest.distance_from_source - rs_src.distance_from_source) as journey_distance,
          rs_src.standard_departure_time as departure_time,
          rs_dest.standard_arrival_time as arrival_time
        FROM JOURNEY j
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN TRAIN t ON s.train_id = t.train_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN SEAT_CONFIGURATION sc ON s.train_id = sc.train_id AND j.class_id = sc.class_id
        JOIN ROUTE_SEGMENT rs_src ON t.train_id = rs_src.train_id AND j.source_station_id = rs_src.station_id
        JOIN ROUTE_SEGMENT rs_dest ON t.train_id = rs_dest.train_id AND j.destination_station_id = rs_dest.station_id
        WHERE s.journey_date = ?
        AND (src.station_id = ? OR src.station_code = ? OR src.station_name LIKE ?)
        AND (dest.station_id = ? OR dest.station_code = ? OR dest.station_name LIKE ?)
        AND rs_src.sequence_number < rs_dest.sequence_number
        AND s.status != 'Cancelled'
      `;
      
      const params: any[] = [
        date, 
        source, source, `%${source}%`,
        destination, destination, `%${destination}%`
      ];
      
      if (class_id) {
        sql += ` AND j.class_id = ?`;
        params.push(class_id);
      }
      
      sql += ` ORDER BY s.journey_date, rs_src.standard_departure_time`;
      
      const journeys = await query(sql, params);
      
      return NextResponse.json({ 
        success: true, 
        count: Array.isArray(journeys) ? journeys.length : 0,
        data: journeys 
      });
    }
    
    // Default: return limited set of journeys for upcoming dates
    const journeys = await query(
      `SELECT j.journey_id, j.schedule_id, j.source_station_id, j.destination_station_id, j.class_id,
        s.journey_date, s.status as train_status,
        t.train_number, t.train_name,
        src.station_name as source_station, src.station_code as source_code,
        dest.station_name as destination_station, dest.station_code as destination_code,
        c.class_name, c.class_code
      FROM JOURNEY j
      JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
      JOIN TRAIN t ON s.train_id = t.train_id
      JOIN STATION src ON j.source_station_id = src.station_id
      JOIN STATION dest ON j.destination_station_id = dest.station_id
      JOIN CLASS c ON j.class_id = c.class_id
      WHERE s.journey_date >= CURDATE()
      ORDER BY s.journey_date
      LIMIT 100`
    );
    
    return NextResponse.json({ 
      success: true, 
      count: Array.isArray(journeys) ? journeys.length : 0,
      data: journeys 
    });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new journey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.schedule_id || !body.source_station_id || !body.destination_station_id || !body.class_id) {
      return NextResponse.json(
        { success: false, error: 'schedule_id, source_station_id, destination_station_id, and class_id are required' },
        { status: 400 }
      );
    }
    
    // Check if schedule exists
    const scheduleExists = await query('SELECT * FROM SCHEDULE WHERE schedule_id = ?', [body.schedule_id]);
    if (!Array.isArray(scheduleExists) || scheduleExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 400 }
      );
    }
    
    // Check if source and destination are different
    if (body.source_station_id === body.destination_station_id) {
      return NextResponse.json(
        { success: false, error: 'Source and destination stations must be different' },
        { status: 400 }
      );
    }
    
    // Check if source station exists
    const sourceExists = await query('SELECT * FROM STATION WHERE station_id = ?', [body.source_station_id]);
    if (!Array.isArray(sourceExists) || sourceExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Source station not found' },
        { status: 400 }
      );
    }
    
    // Check if destination station exists
    const destExists = await query('SELECT * FROM STATION WHERE station_id = ?', [body.destination_station_id]);
    if (!Array.isArray(destExists) || destExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Destination station not found' },
        { status: 400 }
      );
    }
    
    // Check if class exists
    const classExists = await query('SELECT * FROM CLASS WHERE class_id = ?', [body.class_id]);
    if (!Array.isArray(classExists) || classExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 400 }
      );
    }
    
    // Check if journey already exists
    const journeyExists = await query(
      'SELECT * FROM JOURNEY WHERE schedule_id = ? AND source_station_id = ? AND destination_station_id = ? AND class_id = ?', 
      [body.schedule_id, body.source_station_id, body.destination_station_id, body.class_id]
    );
    
    if (Array.isArray(journeyExists) && journeyExists.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Journey already exists for the given schedule, source, destination, and class' },
        { status: 400 }
      );
    }
    
    // Get train ID from schedule
    const scheduleData = scheduleExists[0] as any;
    const trainId = scheduleData.train_id;
    
    // Check if the train serves both stations in correct order
    const routeSegments = await query(
      `SELECT station_id, sequence_number FROM ROUTE_SEGMENT 
       WHERE train_id = ? AND station_id IN (?, ?) 
       ORDER BY sequence_number`,
      [trainId, body.source_station_id, body.destination_station_id]
    );
    
    if (!Array.isArray(routeSegments) || routeSegments.length < 2) {
      return NextResponse.json(
        { success: false, error: 'The train does not serve both the source and destination stations' },
        { status: 400 }
      );
    }
    
    // Check if source comes before destination in the route
    const segmentMap = new Map();
    for (const segment of routeSegments) {
      segmentMap.set((segment as any).station_id, (segment as any).sequence_number);
    }
    
    if (segmentMap.get(parseInt(body.source_station_id)) >= segmentMap.get(parseInt(body.destination_station_id))) {
      return NextResponse.json(
        { success: false, error: 'Source station must come before destination station in the train route' },
        { status: 400 }
      );
    }
    
    // Check if train has the requested class
    const classConfig = await query(
      'SELECT * FROM SEAT_CONFIGURATION WHERE train_id = ? AND class_id = ?',
      [trainId, body.class_id]
    );
    
    if (!Array.isArray(classConfig) || classConfig.length === 0) {
      return NextResponse.json(
        { success: false, error: 'The train does not offer the requested class' },
        { status: 400 }
      );
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Insert journey
      const journeyResult = await query(
        'INSERT INTO JOURNEY (schedule_id, source_station_id, destination_station_id, class_id) VALUES (?, ?, ?, ?)',
        [body.schedule_id, body.source_station_id, body.destination_station_id, body.class_id]
      );
      
      const journeyId = (journeyResult as any).insertId;
      
      // Insert RAC entry
      await query(
        'INSERT INTO RAC (journey_id, current_rac_number, max_rac) VALUES (?, ?, ?)',
        [journeyId, 1, body.max_rac || 20]
      );
      
      // Insert waitlist entry
      await query(
        'INSERT INTO WAITLIST (journey_id, current_waitlist_number, max_waitlist) VALUES (?, ?, ?)',
        [journeyId, 1, body.max_waitlist || 50]
      );
      
      // Commit transaction
      await query('COMMIT');
      
      // Fetch the created journey
      const newJourney = await query(
        `SELECT j.*, 
          s.journey_date, s.status as train_status,
          t.train_number, t.train_name,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          c.class_name, c.class_code,
          sc.total_seats, sc.fare_per_km
        FROM JOURNEY j
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN TRAIN t ON s.train_id = t.train_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN SEAT_CONFIGURATION sc ON t.train_id = sc.train_id AND j.class_id = sc.class_id
        WHERE j.journey_id = ?`,
        [journeyId]
      );
      
      return NextResponse.json(
        { 
          success: true, 
          data: Array.isArray(newJourney) && newJourney.length > 0 ? newJourney[0] : null 
        },
        { status: 201 }
      );
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating journey:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update a journey's waitlist and RAC numbers
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.journey_id) {
      return NextResponse.json(
        { success: false, error: 'journey_id is required' },
        { status: 400 }
      );
    }
    
    // Check if journey exists
    const journeyExists = await query('SELECT * FROM JOURNEY WHERE journey_id = ?', [body.journey_id]);
    if (!Array.isArray(journeyExists) || journeyExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Journey not found' },
        { status: 404 }
      );
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Update RAC 
      if (body.rac_update) {
        // Get RAC record
        const racExists = await query('SELECT * FROM RAC WHERE journey_id = ?', [body.journey_id]);
        
        if (Array.isArray(racExists) && racExists.length > 0) {
          const updates: string[] = [];
          const params: any[] = [];
          
          if (body.rac_update.current_rac_number !== undefined) {
            if (body.rac_update.current_rac_number < 1) {
              await query('ROLLBACK');
              return NextResponse.json(
                { success: false, error: 'Current RAC number must be greater than 0' },
                { status: 400 }
              );
            }
            updates.push('current_rac_number = ?');
            params.push(body.rac_update.current_rac_number);
          }
          
          if (body.rac_update.max_rac !== undefined) {
            if (body.rac_update.max_rac < 1) {
              await query('ROLLBACK');
              return NextResponse.json(
                { success: false, error: 'Max RAC must be greater than 0' },
                { status: 400 }
              );
            }
            updates.push('max_rac = ?');
            params.push(body.rac_update.max_rac);
          }
          
          if (updates.length > 0) {
            params.push(body.journey_id);
            await query(
              `UPDATE RAC SET ${updates.join(', ')} WHERE journey_id = ?`,
              params
            );
          }
        } else {
          // Create RAC if it doesn't exist
          await query(
            'INSERT INTO RAC (journey_id, current_rac_number, max_rac) VALUES (?, ?, ?)',
            [
              body.journey_id, 
              body.rac_update.current_rac_number || 1, 
              body.rac_update.max_rac || 20
            ]
          );
        }
      }
      
      // Update Waitlist
      if (body.waitlist_update) {
        // Get Waitlist record
        const waitlistExists = await query('SELECT * FROM WAITLIST WHERE journey_id = ?', [body.journey_id]);
        
        if (Array.isArray(waitlistExists) && waitlistExists.length > 0) {
          const updates: string[] = [];
          const params: any[] = [];
          
          if (body.waitlist_update.current_waitlist_number !== undefined) {
            if (body.waitlist_update.current_waitlist_number < 1) {
              await query('ROLLBACK');
              return NextResponse.json(
                { success: false, error: 'Current waitlist number must be greater than 0' },
                { status: 400 }
              );
            }
            updates.push('current_waitlist_number = ?');
            params.push(body.waitlist_update.current_waitlist_number);
          }
          
          if (body.waitlist_update.max_waitlist !== undefined) {
            if (body.waitlist_update.max_waitlist < 1) {
              await query('ROLLBACK');
              return NextResponse.json(
                { success: false, error: 'Max waitlist must be greater than 0' },
                { status: 400 }
              );
            }
            updates.push('max_waitlist = ?');
            params.push(body.waitlist_update.max_waitlist);
          }
          
          if (updates.length > 0) {
            params.push(body.journey_id);
            await query(
              `UPDATE WAITLIST SET ${updates.join(', ')} WHERE journey_id = ?`,
              params
            );
          }
        } else {
          // Create Waitlist if it doesn't exist
          await query(
            'INSERT INTO WAITLIST (journey_id, current_waitlist_number, max_waitlist) VALUES (?, ?, ?)',
            [
              body.journey_id, 
              body.waitlist_update.current_waitlist_number || 1, 
              body.waitlist_update.max_waitlist || 50
            ]
          );
        }
      }
      
      // Commit transaction
      await query('COMMIT');
      
      // Fetch the updated journey with RAC and waitlist details
      const journey = await query(
        `SELECT j.*, 
          s.journey_date, s.status as train_status,
          t.train_number, t.train_name,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          c.class_name, c.class_code,
          sc.total_seats, sc.fare_per_km
        FROM JOURNEY j
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN TRAIN t ON s.train_id = t.train_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN SEAT_CONFIGURATION sc ON t.train_id = sc.train_id AND j.class_id = sc.class_id
        WHERE j.journey_id = ?`,
        [body.journey_id]
      );
      
      const rac = await query('SELECT * FROM RAC WHERE journey_id = ?', [body.journey_id]);
      const waitlist = await query('SELECT * FROM WAITLIST WHERE journey_id = ?', [body.journey_id]);
      
      return NextResponse.json({ 
        success: true, 
        data: {
          ...(Array.isArray(journey) && journey.length > 0 ? journey[0] : {}),
          rac: Array.isArray(rac) && rac.length > 0 ? rac[0] : null,
          waitlist: Array.isArray(waitlist) && waitlist.length > 0 ? waitlist[0] : null
        }
      });
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating journey:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a journey
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Journey ID is required' },
        { status: 400 }
      );
    }
    
    // Check if journey exists
    const journeyExists = await query('SELECT * FROM JOURNEY WHERE journey_id = ?', [id]);
    if (!Array.isArray(journeyExists) || journeyExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Journey not found' },
        { status: 404 }
      );
    }
    
    // Check if journey has any tickets
    const tickets = await query('SELECT * FROM TICKET WHERE journey_id = ? LIMIT 1', [id]);
    if (Array.isArray(tickets) && tickets.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete journey as it has associated tickets'
      }, { status: 400 });
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Delete RAC entries
      await query('DELETE FROM RAC WHERE journey_id = ?', [id]);
      
      // Delete waitlist entries
      await query('DELETE FROM WAITLIST WHERE journey_id = ?', [id]);
      
      // Delete the journey
      await query('DELETE FROM JOURNEY WHERE journey_id = ?', [id]);
      
      // Commit transaction
      await query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: `Journey with ID ${id} has been deleted` 
      });
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting journey:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 