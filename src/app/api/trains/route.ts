import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch all trains or a specific train
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const trainNumber = searchParams.get('train_number');
    
    // If id is provided, fetch a specific train
    if (id) {
      const train = await query(
        `SELECT t.*, 
          source.station_name as source_station_name, 
          destination.station_name as destination_station_name 
        FROM TRAIN t
        JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
        JOIN STATION source ON te.source_station_id = source.station_id
        JOIN STATION destination ON te.destination_station_id = destination.station_id
        WHERE t.train_id = ?`,
        [id]
      );
      
      if (!Array.isArray(train) || train.length === 0) {
        return NextResponse.json({ success: false, error: 'Train not found' }, { status: 404 });
      }
      
      // Fetch seat configuration for the train
      const seatConfig = await query(
        `SELECT sc.*, c.class_name, c.class_code
         FROM SEAT_CONFIGURATION sc
         JOIN CLASS c ON sc.class_id = c.class_id
         WHERE sc.train_id = ?`,
        [id]
      );
      
      // Fetch route segments for the train
      const routeSegments = await query(
        `SELECT rs.*, s.station_name, s.station_code  
         FROM ROUTE_SEGMENT rs
         JOIN STATION s ON rs.station_id = s.station_id
         WHERE rs.train_id = ?
         ORDER BY rs.sequence_number`,
        [id]
      );
      
      // Combine all data
      const trainData = {
        ...train[0],
        seat_configurations: seatConfig,
        route_segments: routeSegments
      };
      
      return NextResponse.json({ success: true, data: trainData });
    }

    // If train number is provided, fetch train by number
    if (trainNumber) {
      const train = await query(
        `SELECT t.*, 
          source.station_name as source_station_name, 
          destination.station_name as destination_station_name 
        FROM TRAIN t
        JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
        JOIN STATION source ON te.source_station_id = source.station_id
        JOIN STATION destination ON te.destination_station_id = destination.station_id
        WHERE t.train_number = ?`,
        [trainNumber]
      );
      
      if (!Array.isArray(train) || train.length === 0) {
        return NextResponse.json({ success: false, error: 'Train not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: train[0] });
    }
    
    // Get all trains with source and destination station details
    const trains = await query(
      `SELECT t.*, 
        source.station_name as source_station_name, 
        destination.station_name as destination_station_name,
        te.standard_departure_time, te.standard_arrival_time
      FROM TRAIN t
      JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
      JOIN STATION source ON te.source_station_id = source.station_id
      JOIN STATION destination ON te.destination_station_id = destination.station_id`
    );
    
    return NextResponse.json({ 
      success: true, 
      count: Array.isArray(trains) ? trains.length : 0,
      data: trains 
    });
  } catch (error) {
    console.error('Error fetching trains:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new train with endpoints and seat configurations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate train data
    const requiredFields = ['train_number', 'train_name', 'train_type', 'run_days'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Check if train_number already exists
    const existingTrain = await query('SELECT * FROM TRAIN WHERE train_number = ?', [body.train_number]);
    if (Array.isArray(existingTrain) && existingTrain.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Train number already exists' },
        { status: 400 }
      );
    }
    
    // Validate endpoints data
    if (!body.endpoints || !body.endpoints.source_station_id || !body.endpoints.destination_station_id ||
        !body.endpoints.standard_departure_time || !body.endpoints.standard_arrival_time) {
      return NextResponse.json(
        { success: false, error: 'Train endpoints data is required' },
        { status: 400 }
      );
    }
    
    // Validate that source and destination are different
    if (body.endpoints.source_station_id === body.endpoints.destination_station_id) {
      return NextResponse.json(
        { success: false, error: 'Source and destination stations must be different' },
        { status: 400 }
      );
    }
    
    // Validate that stations exist
    const sourceStation = await query('SELECT * FROM STATION WHERE station_id = ?', [body.endpoints.source_station_id]);
    const destStation = await query('SELECT * FROM STATION WHERE station_id = ?', [body.endpoints.destination_station_id]);
    
    if (!Array.isArray(sourceStation) || sourceStation.length === 0 || 
        !Array.isArray(destStation) || destStation.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Source or destination station not found' },
        { status: 400 }
      );
    }
    
    // Validate seat configurations if provided
    if (body.seat_configurations && Array.isArray(body.seat_configurations)) {
      for (const config of body.seat_configurations) {
        if (!config.class_id || !config.total_seats || !config.fare_per_km) {
          return NextResponse.json(
            { success: false, error: 'Incomplete seat configuration data' },
            { status: 400 }
          );
        }
        
        if (config.total_seats <= 0 || config.fare_per_km <= 0) {
          return NextResponse.json(
            { success: false, error: 'Total seats and fare per km must be greater than 0' },
            { status: 400 }
          );
        }
        
        // Check if class exists
        const classExists = await query('SELECT * FROM CLASS WHERE class_id = ?', [config.class_id]);
        if (!Array.isArray(classExists) || classExists.length === 0) {
          return NextResponse.json(
            { success: false, error: `Class with ID ${config.class_id} not found` },
            { status: 400 }
          );
        }
      }
    }
    
    // Validate route segments if provided
    if (body.route_segments && Array.isArray(body.route_segments)) {
      const sequences = new Set();
      const stations = new Set();
      
      for (const segment of body.route_segments) {
        if (!segment.station_id || segment.sequence_number === undefined || segment.distance_from_source === undefined) {
          return NextResponse.json(
            { success: false, error: 'Incomplete route segment data' },
            { status: 400 }
          );
        }
        
        if (segment.distance_from_source < 0) {
          return NextResponse.json(
            { success: false, error: 'Distance from source must be non-negative' },
            { status: 400 }
          );
        }
        
        // Check for duplicate sequence numbers
        if (sequences.has(segment.sequence_number)) {
          return NextResponse.json(
            { success: false, error: 'Duplicate sequence numbers in route segments' },
            { status: 400 }
          );
        }
        sequences.add(segment.sequence_number);
        
        // Check for duplicate stations
        if (stations.has(segment.station_id)) {
          return NextResponse.json(
            { success: false, error: 'Duplicate stations in route segments' },
            { status: 400 }
          );
        }
        stations.add(segment.station_id);
        
        // Check if station exists
        const stationExists = await query('SELECT * FROM STATION WHERE station_id = ?', [segment.station_id]);
        if (!Array.isArray(stationExists) || stationExists.length === 0) {
          return NextResponse.json(
            { success: false, error: `Station with ID ${segment.station_id} not found` },
            { status: 400 }
          );
        }
      }
      
      // Make sure source and destination are in route segments
      if (!stations.has(body.endpoints.source_station_id) || !stations.has(body.endpoints.destination_station_id)) {
        return NextResponse.json(
          { success: false, error: 'Route segments must include source and destination stations' },
          { status: 400 }
        );
      }
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Insert train
      const trainResult = await query(
        'INSERT INTO TRAIN (train_number, train_name, train_type, run_days) VALUES (?, ?, ?, ?)',
        [body.train_number, body.train_name, body.train_type, body.run_days]
      );
      
      const trainId = (trainResult as any).insertId;
      
      // Insert train endpoints
      await query(
        `INSERT INTO TRAIN_ENDPOINTS 
         (train_id, source_station_id, destination_station_id, standard_departure_time, standard_arrival_time) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          trainId, 
          body.endpoints.source_station_id, 
          body.endpoints.destination_station_id,
          body.endpoints.standard_departure_time,
          body.endpoints.standard_arrival_time
        ]
      );
      
      // Insert seat configurations if provided
      if (body.seat_configurations && Array.isArray(body.seat_configurations)) {
        for (const config of body.seat_configurations) {
          await query(
            'INSERT INTO SEAT_CONFIGURATION (train_id, class_id, total_seats, fare_per_km) VALUES (?, ?, ?, ?)',
            [trainId, config.class_id, config.total_seats, config.fare_per_km]
          );
        }
      }
      
      // Insert route segments if provided
      if (body.route_segments && Array.isArray(body.route_segments)) {
        for (const segment of body.route_segments) {
          await query(
            `INSERT INTO ROUTE_SEGMENT 
             (train_id, station_id, sequence_number, standard_arrival_time, standard_departure_time, distance_from_source) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              trainId, 
              segment.station_id, 
              segment.sequence_number,
              segment.standard_arrival_time || null,
              segment.standard_departure_time || null,
              segment.distance_from_source
            ]
          );
        }
      }
      
      // Commit transaction
      await query('COMMIT');
      
      // Fetch the created train
      const newTrain = await query(
        `SELECT t.*, 
          source.station_name as source_station_name, 
          destination.station_name as destination_station_name 
        FROM TRAIN t
        JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
        JOIN STATION source ON te.source_station_id = source.station_id
        JOIN STATION destination ON te.destination_station_id = destination.station_id
        WHERE t.train_id = ?`,
        [trainId]
      );
      
      return NextResponse.json(
        { 
          success: true, 
          data: Array.isArray(newTrain) && newTrain.length > 0 ? newTrain[0] : null 
        },
        { status: 201 }
      );
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating train:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update an existing train
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.train_id) {
      return NextResponse.json(
        { success: false, error: 'train_id is required' },
        { status: 400 }
      );
    }
    
    // Check if train exists
    const existingTrain = await query('SELECT * FROM TRAIN WHERE train_id = ?', [body.train_id]);
    if (!Array.isArray(existingTrain) || existingTrain.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Train not found' },
        { status: 404 }
      );
    }
    
    // Check if train_number already exists for another train
    if (body.train_number) {
      const numberExists = await query(
        'SELECT * FROM TRAIN WHERE train_number = ? AND train_id != ?', 
        [body.train_number, body.train_id]
      );
      if (Array.isArray(numberExists) && numberExists.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Train number already exists for another train' },
          { status: 400 }
        );
      }
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Update train basic info
      const updates: string[] = [];
      const params: any[] = [];
      
      for (const key of ['train_number', 'train_name', 'train_type', 'run_days']) {
        if (body[key] !== undefined) {
          updates.push(`${key} = ?`);
          params.push(body[key]);
        }
      }
      
      if (updates.length > 0) {
        params.push(body.train_id);
        await query(
          `UPDATE TRAIN SET ${updates.join(', ')} WHERE train_id = ?`,
          params
        );
      }
      
      // Update train endpoints if provided
      if (body.endpoints) {
        const endpointUpdates: string[] = [];
        const endpointParams: any[] = [];
        
        if (body.endpoints.source_station_id) {
          endpointUpdates.push('source_station_id = ?');
          endpointParams.push(body.endpoints.source_station_id);
        }
        
        if (body.endpoints.destination_station_id) {
          endpointUpdates.push('destination_station_id = ?');
          endpointParams.push(body.endpoints.destination_station_id);
        }
        
        if (body.endpoints.standard_departure_time) {
          endpointUpdates.push('standard_departure_time = ?');
          endpointParams.push(body.endpoints.standard_departure_time);
        }
        
        if (body.endpoints.standard_arrival_time) {
          endpointUpdates.push('standard_arrival_time = ?');
          endpointParams.push(body.endpoints.standard_arrival_time);
        }
        
        if (endpointUpdates.length > 0) {
          endpointParams.push(body.train_id);
          await query(
            `UPDATE TRAIN_ENDPOINTS SET ${endpointUpdates.join(', ')} WHERE train_id = ?`,
            endpointParams
          );
        }
        
        // Validate that source and destination are different
        if (body.endpoints.source_station_id && body.endpoints.destination_station_id && 
            body.endpoints.source_station_id === body.endpoints.destination_station_id) {
          await query('ROLLBACK');
          return NextResponse.json(
            { success: false, error: 'Source and destination stations must be different' },
            { status: 400 }
          );
        }
      }
      
      // Update seat configurations if provided
      if (body.seat_configurations && Array.isArray(body.seat_configurations)) {
        // Delete existing configurations first
        if (body.replace_seat_configurations) {
          await query('DELETE FROM SEAT_CONFIGURATION WHERE train_id = ?', [body.train_id]);
        }
        
        // Add new configurations
        for (const config of body.seat_configurations) {
          if (config.config_id) {
            // Update existing config
            await query(
              'UPDATE SEAT_CONFIGURATION SET class_id = ?, total_seats = ?, fare_per_km = ? WHERE config_id = ? AND train_id = ?',
              [config.class_id, config.total_seats, config.fare_per_km, config.config_id, body.train_id]
            );
          } else {
            // Insert new config
            await query(
              'INSERT INTO SEAT_CONFIGURATION (train_id, class_id, total_seats, fare_per_km) VALUES (?, ?, ?, ?)',
              [body.train_id, config.class_id, config.total_seats, config.fare_per_km]
            );
          }
        }
      }
      
      // Update route segments if provided
      if (body.route_segments && Array.isArray(body.route_segments)) {
        // Delete existing segments first
        if (body.replace_route_segments) {
          await query('DELETE FROM ROUTE_SEGMENT WHERE train_id = ?', [body.train_id]);
          
          // Insert new segments
          for (const segment of body.route_segments) {
            await query(
              `INSERT INTO ROUTE_SEGMENT 
               (train_id, station_id, sequence_number, standard_arrival_time, standard_departure_time, distance_from_source) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                body.train_id, 
                segment.station_id, 
                segment.sequence_number,
                segment.standard_arrival_time || null,
                segment.standard_departure_time || null,
                segment.distance_from_source
              ]
            );
          }
        } else {
          // Update individual segments
          for (const segment of body.route_segments) {
            if (segment.segment_id) {
              // Update existing segment
              await query(
                `UPDATE ROUTE_SEGMENT SET
                 station_id = ?,
                 sequence_number = ?,
                 standard_arrival_time = ?,
                 standard_departure_time = ?,
                 distance_from_source = ?
                 WHERE segment_id = ? AND train_id = ?`,
                [
                  segment.station_id,
                  segment.sequence_number,
                  segment.standard_arrival_time || null,
                  segment.standard_departure_time || null,
                  segment.distance_from_source,
                  segment.segment_id,
                  body.train_id
                ]
              );
            } else {
              // Insert new segment
              await query(
                `INSERT INTO ROUTE_SEGMENT 
                 (train_id, station_id, sequence_number, standard_arrival_time, standard_departure_time, distance_from_source) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  body.train_id, 
                  segment.station_id, 
                  segment.sequence_number,
                  segment.standard_arrival_time || null,
                  segment.standard_departure_time || null,
                  segment.distance_from_source
                ]
              );
            }
          }
        }
      }
      
      // Commit transaction
      await query('COMMIT');
      
      // Fetch the updated train
      const updatedTrain = await query(
        `SELECT t.*, 
          source.station_name as source_station_name, 
          destination.station_name as destination_station_name 
        FROM TRAIN t
        JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
        JOIN STATION source ON te.source_station_id = source.station_id
        JOIN STATION destination ON te.destination_station_id = destination.station_id
        WHERE t.train_id = ?`,
        [body.train_id]
      );
      
      return NextResponse.json({ 
        success: true, 
        data: Array.isArray(updatedTrain) && updatedTrain.length > 0 ? updatedTrain[0] : null 
      });
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating train:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a train
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Train ID is required' },
        { status: 400 }
      );
    }
    
    // Check if train exists
    const existingTrain = await query('SELECT * FROM TRAIN WHERE train_id = ?', [id]);
    if (!Array.isArray(existingTrain) || existingTrain.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Train not found' },
        { status: 404 }
      );
    }
    
    // Check if train is referenced in SCHEDULE
    const scheduleCheck = await query('SELECT * FROM SCHEDULE WHERE train_id = ? LIMIT 1', [id]);
    if (Array.isArray(scheduleCheck) && scheduleCheck.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete train as it has existing schedules'
      }, { status: 400 });
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Delete associated route segments
      await query('DELETE FROM ROUTE_SEGMENT WHERE train_id = ?', [id]);
      
      // Delete associated seat configurations
      await query('DELETE FROM SEAT_CONFIGURATION WHERE train_id = ?', [id]);
      
      // Delete train endpoints
      await query('DELETE FROM TRAIN_ENDPOINTS WHERE train_id = ?', [id]);
      
      // Delete the train
      await query('DELETE FROM TRAIN WHERE train_id = ?', [id]);
      
      // Commit transaction
      await query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: `Train with ID ${id} has been deleted` 
      });
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting train:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 