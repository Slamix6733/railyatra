import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Simple test query to check connection
    const result = await query('SELECT 1 + 1 AS result');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful', 
      data: result 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 