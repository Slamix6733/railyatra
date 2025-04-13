import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

type QueryRow = Record<string, any>;

// GET: Fetch all passengers or a specific passenger
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const contact = searchParams.get('contact');
    const include_bookings = searchParams.get('include_bookings') === 'true';
    
    // If id is provided, fetch a specific passenger
    if (id) {
      const passenger = await query('SELECT * FROM PASSENGER WHERE passenger_id = ?', [id]);
      if (!Array.isArray(passenger) || passenger.length === 0) {
        return NextResponse.json({ success: false, error: 'Passenger not found' }, { status: 404 });
      }
      
      // Get ticket history for the passenger
      const tickets = await query(
        `SELECT pt.*, t.pnr_number, t.booking_date, t.booking_status, t.total_fare,
          j.journey_id, s.journey_date, c.class_name, c.class_code,
          src.station_name AS source_station, dest.station_name AS destination_station,
          tr.train_number, tr.train_name
        FROM PASSENGER_TICKET pt
        JOIN TICKET t ON pt.ticket_id = t.ticket_id
        JOIN JOURNEY j ON t.journey_id = j.journey_id
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        JOIN CLASS c ON j.class_id = c.class_id
        JOIN TRAIN tr ON s.train_id = tr.train_id
        JOIN STATION src ON j.source_station_id = src.station_id
        JOIN STATION dest ON j.destination_station_id = dest.station_id
        WHERE pt.passenger_id = ?
        ORDER BY s.journey_date DESC`,
        [id]
      );
      
      // Include bookings if requested
      if (include_bookings) {
        return NextResponse.json({
          success: true,
          data: {
            ...passenger[0],
            ticket_history: tickets,
            bookings: tickets
          }
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: {
          ...passenger[0],
          ticket_history: tickets
        }
      });
    }
    
    // Build query based on filters
    let sql = 'SELECT * FROM PASSENGER';
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (name) {
      conditions.push('name LIKE ?');
      params.push(`%${name}%`);
    }
    
    if (email) {
      conditions.push('email LIKE ?');
      params.push(`%${email}%`);
    }
    
    if (contact) {
      conditions.push('contact_number LIKE ?');
      params.push(`%${contact}%`);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    const passengers = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      count: Array.isArray(passengers) ? passengers.length : 0,
      data: passengers 
    });
  } catch (error) {
    console.error('Error fetching passengers:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new passenger
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'age', 'gender', 'contact_number'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate age
    if (body.age <= 0) {
      return NextResponse.json(
        { success: false, error: 'Age must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Validate gender
    if (!['Male', 'Female', 'Other'].includes(body.gender)) {
      return NextResponse.json(
        { success: false, error: 'Gender must be Male, Female, or Other' },
        { status: 400 }
      );
    }
    
    // Check if email already exists (if provided)
    if (body.email) {
      const existingEmail = await query('SELECT * FROM PASSENGER WHERE email = ?', [body.email]);
      if (Array.isArray(existingEmail) && existingEmail.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Check if contact number already exists
    const existingContact = await query('SELECT * FROM PASSENGER WHERE contact_number = ?', [body.contact_number]);
    if (Array.isArray(existingContact) && existingContact.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Contact number already exists' },
        { status: 400 }
      );
    }
    
    // Insert new passenger
    const result = await query(
      `INSERT INTO PASSENGER 
       (name, age, gender, contact_number, email, address, id_proof_type, id_proof_number, concession_category) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.age,
        body.gender,
        body.contact_number,
        body.email || null,
        body.address || null,
        body.id_proof_type || null,
        body.id_proof_number || null,
        body.concession_category || 'None'
      ]
    );
    
    // Fetch the created passenger
    const newPassenger = await query('SELECT * FROM PASSENGER WHERE passenger_id = ?', [
      (result as any).insertId
    ]);
    
    return NextResponse.json(
      { success: true, data: Array.isArray(newPassenger) && newPassenger.length > 0 ? newPassenger[0] : null },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating passenger:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update an existing passenger
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.passenger_id) {
      return NextResponse.json(
        { success: false, error: 'passenger_id is required' },
        { status: 400 }
      );
    }
    
    // Check if passenger exists
    const existingPassenger = await query('SELECT * FROM PASSENGER WHERE passenger_id = ?', [body.passenger_id]);
    if (!Array.isArray(existingPassenger) || existingPassenger.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Passenger not found' },
        { status: 404 }
      );
    }
    
    // Validate age if provided
    if (body.age !== undefined && body.age <= 0) {
      return NextResponse.json(
        { success: false, error: 'Age must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Validate gender if provided
    if (body.gender !== undefined && !['Male', 'Female', 'Other'].includes(body.gender)) {
      return NextResponse.json(
        { success: false, error: 'Gender must be Male, Female, or Other' },
        { status: 400 }
      );
    }
    
    // Check if email already exists for another passenger
    if (body.email) {
      const emailExists = await query(
        'SELECT * FROM PASSENGER WHERE email = ? AND passenger_id != ?', 
        [body.email, body.passenger_id]
      );
      if (Array.isArray(emailExists) && emailExists.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Email already exists for another passenger' },
          { status: 400 }
        );
      }
    }
    
    // Check if contact number already exists for another passenger
    if (body.contact_number) {
      const contactExists = await query(
        'SELECT * FROM PASSENGER WHERE contact_number = ? AND passenger_id != ?', 
        [body.contact_number, body.passenger_id]
      );
      if (Array.isArray(contactExists) && contactExists.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Contact number already exists for another passenger' },
          { status: 400 }
        );
      }
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    
    for (const [key, value] of Object.entries(body)) {
      if (key !== 'passenger_id' && value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
    
    // Add passenger_id to params
    params.push(body.passenger_id);
    
    // Update the passenger
    if (updates.length > 0) {
      await query(
        `UPDATE PASSENGER SET ${updates.join(', ')} WHERE passenger_id = ?`,
        params
      );
    }
    
    // Fetch the updated passenger
    const updatedPassenger = await query('SELECT * FROM PASSENGER WHERE passenger_id = ?', [body.passenger_id]);
    
    return NextResponse.json({ 
      success: true, 
      data: Array.isArray(updatedPassenger) && updatedPassenger.length > 0 ? updatedPassenger[0] : null 
    });
  } catch (error) {
    console.error('Error updating passenger:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a passenger
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Passenger ID is required' },
        { status: 400 }
      );
    }
    
    // Check if passenger exists
    const existingPassenger = await query('SELECT * FROM PASSENGER WHERE passenger_id = ?', [id]);
    if (!Array.isArray(existingPassenger) || existingPassenger.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Passenger not found' },
        { status: 404 }
      );
    }
    
    // Check if passenger has any tickets
    const passengerTickets = await query('SELECT * FROM PASSENGER_TICKET WHERE passenger_id = ? LIMIT 1', [id]);
    if (Array.isArray(passengerTickets) && passengerTickets.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete passenger as they have booking history'
      }, { status: 400 });
    }
    
    // Delete the passenger
    await query('DELETE FROM PASSENGER WHERE passenger_id = ?', [id]);
    
    return NextResponse.json({ 
      success: true, 
      message: `Passenger with ID ${id} has been deleted` 
    });
  } catch (error) {
    console.error('Error deleting passenger:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 