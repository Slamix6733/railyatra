import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch all schedules or search by dates, trains, stations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const train_id = searchParams.get('train_id');
    const date = searchParams.get('date');
    const source = searchParams.get('source');
    const destination = searchParams.get('destination');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    
    // If id is provided, fetch a specific schedule with detailed timings
    if (id) {
      // Get schedule details
      const schedule = await query(
        `SELECT s.*, 
          t.train_number, t.train_name, t.train_type, t.run_days
        FROM SCHEDULE s
        JOIN TRAIN t ON s.train_id = t.train_id
        WHERE s.schedule_id = ?`,
        [id]
      );
      
      if (!Array.isArray(schedule) || schedule.length === 0) {
        return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 });
      }
      
      // Get station timings for this schedule
      const stationTimings = await query(
        `SELECT sst.*, 
          st.station_id, st.station_name, st.station_code, st.city, 
          rs.sequence_number, rs.distance_from_source,
          rs.standard_arrival_time as scheduled_arrival,
          rs.standard_departure_time as scheduled_departure
        FROM SCHEDULE_STATION_TIMING sst
        JOIN STATION st ON sst.station_id = st.station_id
        JOIN ROUTE_SEGMENT rs ON st.station_id = rs.station_id AND rs.train_id = ?
        WHERE sst.schedule_id = ?
        ORDER BY rs.sequence_number`,
        [Array.isArray(schedule) && schedule.length > 0 ? (schedule[0] as any).train_id : null, id]
      );
      
      // Get journeys available for this schedule
      const journeys = await query(
        `SELECT j.*, 
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          c.class_name, c.class_code,
          sc.total_seats, sc.fare_per_km,
          rac.current_rac_number, rac.max_rac,
          wl.current_waitlist_number, wl.max_waitlist
        FROM JOURNEY j
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN SEAT_CONFIGURATION sc ON j.class_id = sc.class_id AND sc.train_id = ?
        LEFT JOIN RAC rac ON j.journey_id = rac.journey_id
        LEFT JOIN WAITLIST wl ON j.journey_id = wl.journey_id
        WHERE j.schedule_id = ?`,
        [Array.isArray(schedule) && schedule.length > 0 ? (schedule[0] as any).train_id : null, id]
      );
      
      // Combine all data
      const scheduleData = {
        ...(schedule[0]),
        station_timings: stationTimings,
        available_journeys: journeys
      };
      
      return NextResponse.json({ success: true, data: scheduleData });
    }
    
    // Search for trains between source and destination on a specific date
    if (source && destination && date) {
      // First, get trains with existing schedules for the date
      const trainSchedules = await query(
        `SELECT DISTINCT s.*, 
          t.train_number, t.train_name, t.train_type, t.run_days,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          rs_src.standard_departure_time, rs_dest.standard_arrival_time,
          rs_src.distance_from_source as src_distance,
          rs_dest.distance_from_source as dest_distance,
          (rs_dest.distance_from_source - rs_src.distance_from_source) as journey_distance
        FROM SCHEDULE s
        JOIN TRAIN t ON s.train_id = t.train_id
        JOIN ROUTE_SEGMENT rs_src ON t.train_id = rs_src.train_id
        JOIN ROUTE_SEGMENT rs_dest ON t.train_id = rs_dest.train_id
        JOIN STATION src ON rs_src.station_id = src.station_id
        JOIN STATION dest ON rs_dest.station_id = dest.station_id
        WHERE s.journey_date = ?
        AND (src.station_id = ? OR src.station_code = ? OR src.station_name LIKE ?)
        AND (dest.station_id = ? OR dest.station_code = ? OR dest.station_name LIKE ?)
        AND rs_src.sequence_number < rs_dest.sequence_number
        AND s.status != 'Cancelled'`,
        [
          date, 
          source, source, `%${source}%`,
          destination, destination, `%${destination}%`
        ]
      );
      
      // Get the day of week from the date (0 = Sunday, 1 = Monday, etc.)
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[dayOfWeek];
      
      console.log(`API: Finding trains for ${date} (${dayName})`);
      
      // Now, find trains that run between these stations on this day of week
      // even if they don't have a schedule entry for this specific date
      const potentialTrains = await query(
        `SELECT DISTINCT 
          t.train_id, t.train_number, t.train_name, t.train_type, t.run_days,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          te.standard_departure_time, te.standard_arrival_time,
          src.station_id as source_station_id, dest.station_id as destination_station_id
        FROM TRAIN t
        JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
        JOIN STATION src ON te.source_station_id = src.station_id
        JOIN STATION dest ON te.destination_station_id = dest.station_id
        LEFT JOIN SCHEDULE s ON t.train_id = s.train_id AND s.journey_date = ?
        WHERE 
          (src.station_id = ? OR src.station_code = ? OR src.station_name LIKE ?)
          AND (dest.station_id = ? OR dest.station_code = ? OR dest.station_name LIKE ?)
          AND s.schedule_id IS NULL
          AND (t.run_days = 'Daily' OR t.run_days LIKE ?)`,
        [
          date,
          source, source, `%${source}%`,
          destination, destination, `%${destination}%`,
          `%${dayName}%`
        ]
      );
      
      console.log(`API: Found ${Array.isArray(trainSchedules) ? trainSchedules.length : 0} trains with schedules`);
      console.log(`API: Found ${Array.isArray(potentialTrains) ? potentialTrains.length : 0} potential trains without schedules`);
      
      // Create virtual schedule entries for the potential trains
      let virtualSchedules: any[] = [];
      if (Array.isArray(potentialTrains) && potentialTrains.length > 0) {
        virtualSchedules = potentialTrains.map((train: any) => {
          // Create a virtual schedule entry
          return {
            schedule_id: `virtual_${train.train_id}_${date}`,
            train_id: train.train_id,
            journey_date: date,
            status: 'On Time',
            delay_time: 0,
            train_number: train.train_number,
            train_name: train.train_name,
            train_type: train.train_type,
            run_days: train.run_days,
            source_station: train.source_station,
            source_code: train.source_code,
            destination_station: train.destination_station,
            destination_code: train.destination_code,
            standard_departure_time: train.standard_departure_time,
            standard_arrival_time: train.standard_arrival_time,
            source_station_id: train.source_station_id,
            destination_station_id: train.destination_station_id,
            // Calculate journey distance if needed
            journey_distance: 0 // Placeholder
          };
        });
      }
      
      // Combine actual schedules with virtual ones
      const combinedSchedules = [
        ...(Array.isArray(trainSchedules) ? trainSchedules : []),
        ...virtualSchedules
      ];
      
      return NextResponse.json({ 
        success: true, 
        count: combinedSchedules.length,
        data: combinedSchedules 
      });
    }
    
    // If train_id is provided, fetch schedules for a specific train
    if (train_id) {
      let sql = `
        SELECT s.*,
          t.train_number, t.train_name,
          te.source_station_id, te.destination_station_id,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code
        FROM SCHEDULE s
        JOIN TRAIN t ON s.train_id = t.train_id
        JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
        JOIN STATION src ON te.source_station_id = src.station_id
        JOIN STATION dest ON te.destination_station_id = dest.station_id
        WHERE s.train_id = ?
      `;
      
      const params: any[] = [train_id];
      
      // Filter by date range if provided
      if (from_date && to_date) {
        sql += ` AND s.journey_date BETWEEN ? AND ?`;
        params.push(from_date, to_date);
      } else if (date) {
        sql += ` AND s.journey_date = ?`;
        params.push(date);
      } else {
        sql += ` AND s.journey_date >= CURDATE()`;
      }
      
      sql += ` ORDER BY s.journey_date`;
      
      const schedules = await query(sql, params);
      
      return NextResponse.json({ 
        success: true, 
        count: Array.isArray(schedules) ? schedules.length : 0,
        data: schedules 
      });
    }
    
    // Build query based on filters
    let sql = `
      SELECT s.*,
        t.train_number, t.train_name,
        te.source_station_id, te.destination_station_id,
        src.station_name as source_station, src.station_code as source_code,
        dest.station_name as destination_station, dest.station_code as destination_code
      FROM SCHEDULE s
      JOIN TRAIN t ON s.train_id = t.train_id
      JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
      JOIN STATION src ON te.source_station_id = src.station_id
      JOIN STATION dest ON te.destination_station_id = dest.station_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filter by date
    if (date) {
      sql += ` AND s.journey_date = ?`;
      params.push(date);
    } else if (from_date && to_date) {
      sql += ` AND s.journey_date BETWEEN ? AND ?`;
      params.push(from_date, to_date);
    } else {
      sql += ` AND s.journey_date >= CURDATE()`;
    }
    
    // Order and limit
    sql += ` ORDER BY s.journey_date, t.train_number LIMIT 100`;
    
    const schedules = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      count: Array.isArray(schedules) ? schedules.length : 0,
      data: schedules 
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.train_id || !body.journey_date) {
      return NextResponse.json(
        { success: false, error: 'train_id and journey_date are required' },
        { status: 400 }
      );
    }
    
    // Check if train exists
    const trainExists = await query('SELECT * FROM TRAIN WHERE train_id = ?', [body.train_id]);
    if (!Array.isArray(trainExists) || trainExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Train not found' },
        { status: 400 }
      );
    }
    
    // Check if schedule already exists for this train on this date
    const scheduleExists = await query(
      'SELECT * FROM SCHEDULE WHERE train_id = ? AND journey_date = ?', 
      [body.train_id, body.journey_date]
    );
    
    if (Array.isArray(scheduleExists) && scheduleExists.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Schedule already exists for this train on the specified date' },
        { status: 400 }
      );
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Insert schedule
      const scheduleResult = await query(
        `INSERT INTO SCHEDULE (train_id, journey_date, status, delay_time) 
         VALUES (?, ?, ?, ?)`,
        [
          body.train_id,
          body.journey_date,
          body.status || 'On Time',
          body.delay_time || 0
        ]
      );
      
      const scheduleId = (scheduleResult as any).insertId;
      
      // Insert station timings if provided
      if (body.station_timings && Array.isArray(body.station_timings)) {
        for (const timing of body.station_timings) {
          if (!timing.station_id) {
            await query('ROLLBACK');
            return NextResponse.json(
              { success: false, error: 'station_id is required for each station timing' },
              { status: 400 }
            );
          }
          
          // Check if station exists
          const stationExists = await query('SELECT * FROM STATION WHERE station_id = ?', [timing.station_id]);
          if (!Array.isArray(stationExists) || stationExists.length === 0) {
            await query('ROLLBACK');
            return NextResponse.json(
              { success: false, error: `Station with ID ${timing.station_id} not found` },
              { status: 400 }
            );
          }
          
          await query(
            `INSERT INTO SCHEDULE_STATION_TIMING (schedule_id, station_id, actual_arrival_time, actual_departure_time) 
             VALUES (?, ?, ?, ?)`,
            [
              scheduleId,
              timing.station_id,
              timing.actual_arrival_time || null,
              timing.actual_departure_time || null
            ]
          );
        }
      } else {
        // If no station timings provided, create default entries based on route segments
        const routeSegments = await query(
          `SELECT rs.*, 
            CONCAT(?, ' ', TIME_FORMAT(rs.standard_arrival_time, '%H:%i:%s')) as arrival_datetime,
            CONCAT(?, ' ', TIME_FORMAT(rs.standard_departure_time, '%H:%i:%s')) as departure_datetime
          FROM ROUTE_SEGMENT rs
          WHERE rs.train_id = ?
          ORDER BY rs.sequence_number`,
          [body.journey_date, body.journey_date, body.train_id]
        );
        
        if (Array.isArray(routeSegments)) {
          for (const segment of routeSegments) {
            const rs = segment as any;
            await query(
              `INSERT INTO SCHEDULE_STATION_TIMING (schedule_id, station_id, actual_arrival_time, actual_departure_time) 
               VALUES (?, ?, ?, ?)`,
              [
                scheduleId,
                rs.station_id,
                rs.arrival_datetime || null,
                rs.departure_datetime || null
              ]
            );
          }
        }
      }
      
      // Create journeys for this schedule if requested
      if (body.create_journeys) {
        // Get source and destination from train endpoints
        const endpoints = await query(
          'SELECT * FROM TRAIN_ENDPOINTS WHERE train_id = ?',
          [body.train_id]
        );
        
        if (Array.isArray(endpoints) && endpoints.length > 0) {
          const ep = endpoints[0] as any;
          
          // Get available classes for this train
          const classes = await query(
            'SELECT sc.*, c.class_id FROM SEAT_CONFIGURATION sc JOIN CLASS c ON sc.class_id = c.class_id WHERE sc.train_id = ?',
            [body.train_id]
          );
          
          if (Array.isArray(classes)) {
            for (const cls of classes) {
              const c = cls as any;
              
              // Create journey
              const journeyResult = await query(
                `INSERT INTO JOURNEY (schedule_id, source_station_id, destination_station_id, class_id) 
                 VALUES (?, ?, ?, ?)`,
                [
                  scheduleId,
                  ep.source_station_id,
                  ep.destination_station_id,
                  c.class_id
                ]
              );
              
              const journeyId = (journeyResult as any).insertId;
              
              // Create RAC entry
              await query(
                'INSERT INTO RAC (journey_id, current_rac_number, max_rac) VALUES (?, ?, ?)',
                [journeyId, 1, body.max_rac || 20]
              );
              
              // Create waitlist entry
              await query(
                'INSERT INTO WAITLIST (journey_id, current_waitlist_number, max_waitlist) VALUES (?, ?, ?)',
                [journeyId, 1, body.max_waitlist || 50]
              );
            }
          }
        }
      }
      
      // Commit transaction
      await query('COMMIT');
      
      // Fetch the created schedule
      const newSchedule = await query(
        `SELECT s.*, 
          t.train_number, t.train_name, t.train_type,
          te.source_station_id, te.destination_station_id,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code
        FROM SCHEDULE s
        JOIN TRAIN t ON s.train_id = t.train_id
        JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
        JOIN STATION src ON te.source_station_id = src.station_id
        JOIN STATION dest ON te.destination_station_id = dest.station_id
        WHERE s.schedule_id = ?`,
        [scheduleId]
      );
      
      return NextResponse.json(
        { 
          success: true, 
          data: Array.isArray(newSchedule) && newSchedule.length > 0 ? newSchedule[0] : null 
        },
        { status: 201 }
      );
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update a schedule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.schedule_id) {
      return NextResponse.json(
        { success: false, error: 'schedule_id is required' },
        { status: 400 }
      );
    }
    
    // Check if schedule exists
    const scheduleExists = await query('SELECT * FROM SCHEDULE WHERE schedule_id = ?', [body.schedule_id]);
    if (!Array.isArray(scheduleExists) || scheduleExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Update schedule status and delay
      const updates: string[] = [];
      const params: any[] = [];
      
      if (body.status !== undefined) {
        if (!['On Time', 'Delayed', 'Cancelled', 'Completed'].includes(body.status)) {
          await query('ROLLBACK');
          return NextResponse.json(
            { success: false, error: 'Invalid status value' },
            { status: 400 }
          );
        }
        updates.push('status = ?');
        params.push(body.status);
      }
      
      if (body.delay_time !== undefined) {
        if (body.delay_time < 0) {
          await query('ROLLBACK');
          return NextResponse.json(
            { success: false, error: 'Delay time cannot be negative' },
            { status: 400 }
          );
        }
        updates.push('delay_time = ?');
        params.push(body.delay_time);
      }
      
      if (updates.length > 0) {
        params.push(body.schedule_id);
        await query(
          `UPDATE SCHEDULE SET ${updates.join(', ')} WHERE schedule_id = ?`,
          params
        );
      }
      
      // Update station timings if provided
      if (body.station_timings && Array.isArray(body.station_timings)) {
        for (const timing of body.station_timings) {
          if (!timing.station_id) {
            await query('ROLLBACK');
            return NextResponse.json(
              { success: false, error: 'station_id is required for each station timing' },
              { status: 400 }
            );
          }
          
          // Check if timing entry exists
          const timingExists = await query(
            'SELECT * FROM SCHEDULE_STATION_TIMING WHERE schedule_id = ? AND station_id = ?',
            [body.schedule_id, timing.station_id]
          );
          
          if (Array.isArray(timingExists) && timingExists.length > 0) {
            // Update existing timing
            await query(
              `UPDATE SCHEDULE_STATION_TIMING 
               SET actual_arrival_time = ?, actual_departure_time = ? 
               WHERE schedule_id = ? AND station_id = ?`,
              [
                timing.actual_arrival_time || null,
                timing.actual_departure_time || null,
                body.schedule_id,
                timing.station_id
              ]
            );
          } else {
            // Insert new timing
            await query(
              `INSERT INTO SCHEDULE_STATION_TIMING (schedule_id, station_id, actual_arrival_time, actual_departure_time) 
               VALUES (?, ?, ?, ?)`,
              [
                body.schedule_id,
                timing.station_id,
                timing.actual_arrival_time || null,
                timing.actual_departure_time || null
              ]
            );
          }
        }
      }
      
      // Commit transaction
      await query('COMMIT');
      
      // Fetch the updated schedule
      const updatedSchedule = await query(
        `SELECT s.*, 
          t.train_number, t.train_name, t.train_type,
          te.source_station_id, te.destination_station_id,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code
        FROM SCHEDULE s
        JOIN TRAIN t ON s.train_id = t.train_id
        JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
        JOIN STATION src ON te.source_station_id = src.station_id
        JOIN STATION dest ON te.destination_station_id = dest.station_id
        WHERE s.schedule_id = ?`,
        [body.schedule_id]
      );
      
      // Get station timings for this schedule
      const stationTimings = await query(
        `SELECT sst.*, st.station_name, st.station_code
         FROM SCHEDULE_STATION_TIMING sst
         JOIN STATION st ON sst.station_id = st.station_id
         WHERE sst.schedule_id = ?
         ORDER BY st.station_name`,
        [body.schedule_id]
      );
      
      return NextResponse.json({ 
        success: true, 
        data: {
          ...(Array.isArray(updatedSchedule) && updatedSchedule.length > 0 ? updatedSchedule[0] : {}),
          station_timings: stationTimings
        }
      });
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a schedule
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }
    
    // Check if schedule exists
    const scheduleExists = await query('SELECT * FROM SCHEDULE WHERE schedule_id = ?', [id]);
    if (!Array.isArray(scheduleExists) || scheduleExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    // Check if schedule has any tickets
    const journeys = await query('SELECT * FROM JOURNEY WHERE schedule_id = ?', [id]);
    if (Array.isArray(journeys) && journeys.length > 0) {
      const journeyIds = journeys.map((j: any) => j.journey_id);
      
      if (journeyIds.length > 0) {
        const tickets = await query(
          `SELECT * FROM TICKET 
           WHERE journey_id IN (${journeyIds.map(() => '?').join(',')})
           LIMIT 1`,
          journeyIds
        );
        
        if (Array.isArray(tickets) && tickets.length > 0) {
          return NextResponse.json({
            success: false,
            error: 'Cannot delete schedule as it has associated tickets'
          }, { status: 400 });
        }
      }
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Delete related records first
      
      // Delete station timings
      await query('DELETE FROM SCHEDULE_STATION_TIMING WHERE schedule_id = ?', [id]);
      
      // Get all journey IDs for this schedule
      const journeyResult = await query('SELECT journey_id FROM JOURNEY WHERE schedule_id = ?', [id]);
      
      if (Array.isArray(journeyResult) && journeyResult.length > 0) {
        const journeyIds = journeyResult.map((j: any) => j.journey_id);
        
        // Delete RAC entries
        await query(
          `DELETE FROM RAC WHERE journey_id IN (${journeyIds.map(() => '?').join(',')})`,
          journeyIds
        );
        
        // Delete waitlist entries
        await query(
          `DELETE FROM WAITLIST WHERE journey_id IN (${journeyIds.map(() => '?').join(',')})`,
          journeyIds
        );
        
        // Delete journeys
        await query('DELETE FROM JOURNEY WHERE schedule_id = ?', [id]);
      }
      
      // Delete the schedule
      await query('DELETE FROM SCHEDULE WHERE schedule_id = ?', [id]);
      
      // Commit transaction
      await query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: `Schedule with ID ${id} has been deleted` 
      });
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 