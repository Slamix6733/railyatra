import { NextRequest, NextResponse } from 'next/server';
import { executeFunction } from '@/lib/api-functions';

// POST: Execute a function by name or ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.function) {
      return NextResponse.json(
        { success: false, error: 'Function identifier is required' },
        { status: 400 }
      );
    }
    
    // Get parameters and request body
    const params = body.parameters || {};
    const requestBody = body.body || undefined;
    
    // Execute the function
    try {
      const result = await executeFunction(
        body.function,
        params,
        requestBody,
        request
      );
      
      return NextResponse.json({
        success: true,
        execution_time: result.executionTime,
        status_code: result.statusCode,
        data: result.data
      });
    } catch (executionError: any) {
      return NextResponse.json(
        { 
          success: false, 
          error: executionError.message || 'Function execution failed',
          params,
          body: requestBody
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in function execution endpoint:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 