import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

// GET: Fetch all tasks
export async function GET() {
  try {
    // Check if table exists, create if it doesn't
    await ensureTasksTable();
    
    const tasks = await query('SELECT * FROM tasks ORDER BY created_at DESC');
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new task
export async function POST(request: NextRequest) {
  try {
    // Check if table exists, create if it doesn't
    await ensureTasksTable();
    
    const { title, description = '' } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      'INSERT INTO tasks (title, description) VALUES (?, ?)',
      [title, description]
    ) as ResultSetHeader;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task created successfully',
      data: { id: result.insertId, title, description }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper function to ensure tasks table exists
async function ensureTasksTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Error creating tasks table:', error);
    throw error;
  }
} 