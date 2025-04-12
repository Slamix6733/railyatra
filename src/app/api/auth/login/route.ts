import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { setCookie } from 'cookies-next';
import { RowDataPacket } from 'mysql2';

interface UserData {
  passenger_id: number;
  name: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }
    
    // Check if user exists
    const results = await query(
      'SELECT passenger_id, name, email, password FROM PASSENGER WHERE email = ?',
      [email]
    );
    
    const users = results as RowDataPacket[];
    
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    const user = users[0] as UserData;
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Generate JWT token
    const token = sign(
      { id: user.passenger_id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    // Don't include password in the response
    const { password: _, ...userWithoutPassword } = user;
    
    // Create the response with user data
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: userWithoutPassword
    });
    
    // Set the auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'strict'
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 