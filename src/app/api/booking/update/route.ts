import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    
    // Check if ticket exists
    const ticketResult = await query(
      `SELECT t.*, j.journey_id, j.schedule_id, j.source_station_id, j.destination_station_id, j.class_id,
       s.train_id, s.journey_date,
       src.station_name as source_station, dest.station_name as destination_station
       FROM TICKET t
       JOIN JOURNEY j ON t.journey_id = j.journey_id
       JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
       JOIN STATION src ON j.source_station_id = src.station_id
       JOIN STATION dest ON j.destination_station_id = dest.station_id
       WHERE t.pnr_number = ?`,
      [body.pnr]
    );
    
    if (!Array.isArray(ticketResult) || ticketResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    const ticket = ticketResult[0] as any;
    const currentJourneyId = ticket.journey_id;
    const currentScheduleId = ticket.schedule_id;
    const currentSourceStationId = ticket.source_station_id;
    const currentDestinationStationId = ticket.destination_station_id;
    const currentClassId = ticket.class_id;
    
    // Start transaction
    await query('START TRANSACTION');
    
    try {
      // 1. Determine train_id if train number is provided
      let trainId = body.train_id;
      if (!trainId && body.train_number) {
        const trainResult = await query(
          'SELECT train_id FROM TRAIN WHERE train_number = ?',
          [body.train_number]
        );
        
        if (Array.isArray(trainResult) && trainResult.length > 0) {
          trainId = (trainResult[0] as any).train_id;
        } else {
          await query('ROLLBACK');
          return NextResponse.json(
            { success: false, error: 'Train not found with the specified number' },
            { status: 404 }
          );
        }
      }
      
      // 2. Determine source and destination station IDs if station names are provided
      let sourceStationId = body.source_station_id || currentSourceStationId;
      let destinationStationId = body.destination_station_id || currentDestinationStationId;
      
      if (body.source_station && !body.source_station_id) {
        const sourceStationResult = await query(
          'SELECT station_id FROM STATION WHERE station_name = ?',
          [body.source_station]
        );
        
        if (Array.isArray(sourceStationResult) && sourceStationResult.length > 0) {
          sourceStationId = (sourceStationResult[0] as any).station_id;
        } else {
          await query('ROLLBACK');
          return NextResponse.json(
            { success: false, error: 'Source station not found' },
            { status: 404 }
          );
        }
      }
      
      if (body.destination_station && !body.destination_station_id) {
        const destStationResult = await query(
          'SELECT station_id FROM STATION WHERE station_name = ?',
          [body.destination_station]
        );
        
        if (Array.isArray(destStationResult) && destStationResult.length > 0) {
          destinationStationId = (destStationResult[0] as any).station_id;
        } else {
          await query('ROLLBACK');
          return NextResponse.json(
            { success: false, error: 'Destination station not found' },
            { status: 404 }
          );
        }
      }
      
      // 3. Create or update schedule with the new train_id and journey_date
      let scheduleId = currentScheduleId;
      
      if (trainId || body.journey_date) {
        // Check if we need to create a new schedule or update existing one
        if (trainId && body.journey_date) {
          // Look for an existing schedule with this train and date
          const scheduleResult = await query(
            'SELECT schedule_id FROM SCHEDULE WHERE train_id = ? AND journey_date = ?',
            [trainId, body.journey_date]
          );
          
          if (Array.isArray(scheduleResult) && scheduleResult.length > 0) {
            // Use existing schedule
            scheduleId = (scheduleResult[0] as any).schedule_id;
          } else {
            // Create new schedule
            const newScheduleResult = await query(
              'INSERT INTO SCHEDULE (train_id, journey_date, status) VALUES (?, ?, ?)',
              [trainId, body.journey_date, 'On Time']
            );
            
            if ((newScheduleResult as any)?.insertId) {
              scheduleId = (newScheduleResult as any).insertId;
            }
          }
        } else if (trainId) {
          // Just update the train_id in the existing schedule
          await query(
            'UPDATE SCHEDULE SET train_id = ? WHERE schedule_id = ?',
            [trainId, scheduleId]
          );
        } else if (body.journey_date) {
          // Just update the journey_date in the existing schedule
          await query(
            'UPDATE SCHEDULE SET journey_date = ? WHERE schedule_id = ?',
            [body.journey_date, scheduleId]
          );
        }
      }
      
      // 4. Check if a suitable journey already exists or create a new one
      let journeyId = currentJourneyId;
      const classId = body.class_id || currentClassId;
      
      // If any of the journey parameters changed, we might need a new journey
      if (scheduleId !== currentScheduleId || 
          sourceStationId !== currentSourceStationId || 
          destinationStationId !== currentDestinationStationId ||
          classId !== currentClassId) {
        
        // Check if a journey with these parameters already exists
        const journeyResult = await query(
          `SELECT journey_id FROM JOURNEY 
           WHERE schedule_id = ? AND source_station_id = ? AND destination_station_id = ? AND class_id = ?`,
          [scheduleId, sourceStationId, destinationStationId, classId]
        );
        
        if (Array.isArray(journeyResult) && journeyResult.length > 0) {
          // Use existing journey
          journeyId = (journeyResult[0] as any).journey_id;
        } else {
          // Create new journey
          const newJourneyResult = await query(
            `INSERT INTO JOURNEY (schedule_id, source_station_id, destination_station_id, class_id)
             VALUES (?, ?, ?, ?)`,
            [scheduleId, sourceStationId, destinationStationId, classId]
          );
          
          if ((newJourneyResult as any)?.insertId) {
            journeyId = (newJourneyResult as any).insertId;
          } else {
            await query('ROLLBACK');
            return NextResponse.json(
              { success: false, error: 'Failed to create new journey' },
              { status: 500 }
            );
          }
        }
      }
      
      // 5. Update the ticket with the new journey_id if it changed
      if (journeyId !== currentJourneyId) {
        await query(
          'UPDATE TICKET SET journey_id = ? WHERE ticket_id = ?',
          [journeyId, ticket.ticket_id]
        );
        
        // Also update any passenger tickets that may depend on this information
        await query(
          `UPDATE PASSENGER_TICKET pt
           JOIN TICKET t ON pt.ticket_id = t.ticket_id
           SET pt.status = 'Confirmed'
           WHERE t.pnr_number = ?`,
          [body.pnr]
        );
      }
      
      // Commit transaction
      await query('COMMIT');
      
      // Fetch the updated ticket details
      const updatedTicketResult = await query(
        `SELECT t.*, 
          j.source_station_id, j.destination_station_id, j.class_id,
          s.train_id, s.journey_date, s.status as train_status,
          src.station_name as source_station, src.station_code as source_code,
          dest.station_name as destination_station, dest.station_code as destination_code,
          tr.train_number, tr.train_name,
          c.class_name, c.class_code
         FROM TICKET t
         JOIN JOURNEY j ON t.journey_id = j.journey_id
         JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
         JOIN STATION src ON j.source_station_id = src.station_id
         JOIN STATION dest ON j.destination_station_id = dest.station_id
         JOIN TRAIN tr ON s.train_id = tr.train_id
         JOIN CLASS c ON j.class_id = c.class_id
         WHERE t.pnr_number = ?`,
        [body.pnr]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Ticket updated successfully',
        data: Array.isArray(updatedTicketResult) && updatedTicketResult.length > 0 ? updatedTicketResult[0] : null
      });
      
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating ticket journey/train:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 