import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'age', 'gender', 'contactNumber'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength (at least 8 characters)
    if (body.password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
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
    
    // Check if email already exists
    const existingEmail = await query('SELECT * FROM PASSENGER WHERE email = ?', [body.email]);
    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Check if contact number already exists
    const existingContact = await query('SELECT * FROM PASSENGER WHERE contact_number = ?', [body.contactNumber]);
    if (Array.isArray(existingContact) && existingContact.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Contact number already registered' },
        { status: 400 }
      );
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Insert new passenger according to the schema
    const result = await query(
      `INSERT INTO PASSENGER 
       (name, age, gender, contact_number, email, address, id_proof_type, id_proof_number, concession_category, password) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.age,
        body.gender,
        body.contactNumber,
        body.email,
        body.address || null,
        body.idProofType || null,
        body.idProofNumber || null,
        body.concessionCategory || 'None',
        hashedPassword
      ]
    );
    
    // Fetch the created passenger (without password)
    const newPassenger = await query(
      'SELECT passenger_id, name, age, gender, contact_number, email, address, id_proof_type, id_proof_number, concession_category FROM PASSENGER WHERE passenger_id = ?',
      [(result as any).insertId]
    );
    
    return NextResponse.json(
      { success: true, data: Array.isArray(newPassenger) && newPassenger.length > 0 ? newPassenger[0] : null },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 