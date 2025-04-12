import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch all stations or search by name/city
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const city = searchParams.get('city');
    const id = searchParams.get('id');
    
    // If id is provided, fetch a specific station
    if (id) {
      const station = await query('SELECT * FROM STATION WHERE station_id = ?', [id]);
      if (!Array.isArray(station) || station.length === 0) {
        return NextResponse.json({ success: false, error: 'Station not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: station[0] });
    }
    
    let sql = 'SELECT * FROM STATION';
    const params: any[] = [];
    
    if (name && city) {
      sql = `
        SELECT * FROM STATION 
        WHERE station_name LIKE ? 
        AND city LIKE ?
      `;
      params.push(`%${name}%`, `%${city}%`);
    } else if (name) {
      sql = `SELECT * FROM STATION WHERE station_name LIKE ?`;
      params.push(`%${name}%`);
    } else if (city) {
      sql = `SELECT * FROM STATION WHERE city LIKE ?`;
      params.push(`%${city}%`);
    }
    
    const stations = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      count: Array.isArray(stations) ? stations.length : 0,
      data: stations 
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new station
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['station_code', 'station_name', 'city', 'state', 'number_of_platforms', 'zone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate number of platforms
    if (body.number_of_platforms <= 0) {
      return NextResponse.json(
        { success: false, error: 'Number of platforms must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Check if station_code already exists
    const existingStation = await query('SELECT * FROM STATION WHERE station_code = ?', [body.station_code]);
    if (Array.isArray(existingStation) && existingStation.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Station code already exists' },
        { status: 400 }
      );
    }
    
    // Insert new station
    const result = await query(
      `INSERT INTO STATION 
       (station_code, station_name, city, state, number_of_platforms, zone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        body.station_code,
        body.station_name,
        body.city,
        body.state,
        body.number_of_platforms,
        body.zone
      ]
    );
    
    // Fetch the created station
    const newStation = await query('SELECT * FROM STATION WHERE station_id = ?', [
      (result as any).insertId
    ]);
    
    return NextResponse.json(
      { success: true, data: Array.isArray(newStation) && newStation.length > 0 ? newStation[0] : null },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating station:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update an existing station
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.station_id) {
      return NextResponse.json(
        { success: false, error: 'station_id is required' },
        { status: 400 }
      );
    }
    
    // Check if station exists
    const existingStation = await query('SELECT * FROM STATION WHERE station_id = ?', [body.station_id]);
    if (!Array.isArray(existingStation) || existingStation.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }
    
    // Validate number of platforms if provided
    if (body.number_of_platforms !== undefined && body.number_of_platforms <= 0) {
      return NextResponse.json(
        { success: false, error: 'Number of platforms must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Check if station_code already exists for another station
    if (body.station_code) {
      const codeExists = await query(
        'SELECT * FROM STATION WHERE station_code = ? AND station_id != ?', 
        [body.station_code, body.station_id]
      );
      if (Array.isArray(codeExists) && codeExists.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Station code already exists for another station' },
          { status: 400 }
        );
      }
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    
    for (const [key, value] of Object.entries(body)) {
      if (key !== 'station_id' && value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
    
    // Add station_id to params
    params.push(body.station_id);
    
    // Update the station
    if (updates.length > 0) {
      await query(
        `UPDATE STATION SET ${updates.join(', ')} WHERE station_id = ?`,
        params
      );
    }
    
    // Fetch the updated station
    const updatedStation = await query('SELECT * FROM STATION WHERE station_id = ?', [body.station_id]);
    
    return NextResponse.json({ 
      success: true, 
      data: Array.isArray(updatedStation) && updatedStation.length > 0 ? updatedStation[0] : null 
    });
  } catch (error) {
    console.error('Error updating station:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a station
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Station ID is required' },
        { status: 400 }
      );
    }
    
    // Check if station exists
    const existingStation = await query('SELECT * FROM STATION WHERE station_id = ?', [id]);
    if (!Array.isArray(existingStation) || existingStation.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }
    
    // Check if station is referenced in TRAIN_ENDPOINTS
    const trainEndpointCheck = await query(
      'SELECT * FROM TRAIN_ENDPOINTS WHERE source_station_id = ? OR destination_station_id = ? LIMIT 1',
      [id, id]
    );
    
    if (Array.isArray(trainEndpointCheck) && trainEndpointCheck.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete station as it is used as a source or destination for trains'
      }, { status: 400 });
    }
    
    // Check if station is referenced in ROUTE_SEGMENT
    const routeSegmentCheck = await query(
      'SELECT * FROM ROUTE_SEGMENT WHERE station_id = ? LIMIT 1',
      [id]
    );
    
    if (Array.isArray(routeSegmentCheck) && routeSegmentCheck.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete station as it is used in train routes'
      }, { status: 400 });
    }
    
    // Delete the station
    await query('DELETE FROM STATION WHERE station_id = ?', [id]);
    
    return NextResponse.json({ 
      success: true, 
      message: `Station with ID ${id} has been deleted` 
    });
  } catch (error) {
    console.error('Error deleting station:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 