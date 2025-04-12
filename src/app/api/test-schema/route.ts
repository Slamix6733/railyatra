import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // First test to see if the connection works
    const connectionTest = await query('SELECT 1 + 1 AS result');
    
    // Test queries for different tables in the schema
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful', 
      data: {
        connectionTest,
        tables
      }
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