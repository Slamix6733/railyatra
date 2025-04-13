import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

type QueryRow = Record<string, any>;
type QueryResult = QueryRow[] | { insertId: number; affectedRows: number };

// GET: Fetch all concessions or a specific concession by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const category = searchParams.get('category');

    // If ID is provided, fetch a specific concession
    if (id) {
      const result = await query('SELECT * FROM CONCESSION WHERE concession_id = ?', [id]);
      
      if (!Array.isArray(result) || result.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Concession not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: result[0] });
    }

    // If category is provided, fetch by category name
    if (category) {
      const result = await query('SELECT * FROM CONCESSION WHERE category = ?', [category]);
      
      if (!Array.isArray(result) || result.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Concession category not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: result[0] });
    }

    // Fetch all concessions
    const results = await query('SELECT * FROM CONCESSION ORDER BY category');
    
    return NextResponse.json({
      success: true,
      count: Array.isArray(results) ? results.length : 0,
      data: results
    });
  } catch (error) {
    console.error('Error fetching concessions:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new concession category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.category || body.discount_percentage === undefined) {
      return NextResponse.json(
        { success: false, error: 'category and discount_percentage are required' },
        { status: 400 }
      );
    }
    
    // Validate discount percentage range
    if (body.discount_percentage < 0 || body.discount_percentage > 100) {
      return NextResponse.json(
        { success: false, error: 'discount_percentage must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    // Check if category already exists
    const exists = await query('SELECT * FROM CONCESSION WHERE category = ?', [body.category]);
    if (Array.isArray(exists) && exists.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Concession category already exists' },
        { status: 400 }
      );
    }
    
    // Insert new concession category
    const result = await query(
      'INSERT INTO CONCESSION (category, discount_percentage, description) VALUES (?, ?, ?)',
      [body.category, body.discount_percentage, body.description || '']
    );
    
    const concessionId = !Array.isArray(result) ? result.insertId : 0;
    
    return NextResponse.json({
      success: true,
      message: 'Concession category created successfully',
      data: {
        concession_id: concessionId,
        category: body.category,
        discount_percentage: body.discount_percentage,
        description: body.description || ''
      }
    });
  } catch (error) {
    console.error('Error creating concession:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update an existing concession category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.concession_id) {
      return NextResponse.json(
        { success: false, error: 'concession_id is required' },
        { status: 400 }
      );
    }
    
    // Check if concession exists
    const exists = await query('SELECT * FROM CONCESSION WHERE concession_id = ?', [body.concession_id]);
    if (!Array.isArray(exists) || exists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Concession not found' },
        { status: 404 }
      );
    }
    
    // Validate discount percentage range if provided
    if (body.discount_percentage !== undefined && (body.discount_percentage < 0 || body.discount_percentage > 100)) {
      return NextResponse.json(
        { success: false, error: 'discount_percentage must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    // Build update fields
    const updates = [];
    const params = [];
    
    if (body.category !== undefined) {
      updates.push('category = ?');
      params.push(body.category);
    }
    
    if (body.discount_percentage !== undefined) {
      updates.push('discount_percentage = ?');
      params.push(body.discount_percentage);
    }
    
    if (body.description !== undefined) {
      updates.push('description = ?');
      params.push(body.description);
    }
    
    // If no fields to update
    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Add concession_id to params
    params.push(body.concession_id);
    
    // Update concession
    await query(
      `UPDATE CONCESSION SET ${updates.join(', ')} WHERE concession_id = ?`,
      params
    );
    
    // Get updated concession
    const updated = await query('SELECT * FROM CONCESSION WHERE concession_id = ?', [body.concession_id]);
    
    return NextResponse.json({
      success: true,
      message: 'Concession updated successfully',
      data: Array.isArray(updated) && updated.length > 0 ? updated[0] : null
    });
  } catch (error) {
    console.error('Error updating concession:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Remove a concession category
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'concession_id is required' },
        { status: 400 }
      );
    }
    
    // Check if concession exists
    const exists = await query('SELECT * FROM CONCESSION WHERE concession_id = ?', [id]);
    if (!Array.isArray(exists) || exists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Concession not found' },
        { status: 404 }
      );
    }
    
    // Delete concession
    await query('DELETE FROM CONCESSION WHERE concession_id = ?', [id]);
    
    return NextResponse.json({
      success: true,
      message: 'Concession deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting concession:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 