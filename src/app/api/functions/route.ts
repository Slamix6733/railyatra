import { NextRequest, NextResponse } from 'next/server';
import { 
  registerFunction, 
  getFunction, 
  updateFunction, 
  listFunctions,
  executeFunction,
  ApiFunction
} from '@/lib/api-functions';

// GET: List all functions or get a specific function
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    
    // Get a specific function
    if (id || name) {
      const identifier = id ? parseInt(id) : name;
      if (!identifier) {
        return NextResponse.json(
          { success: false, error: 'Invalid identifier' },
          { status: 400 }
        );
      }
      
      const func = await getFunction(identifier);
      
      if (!func) {
        return NextResponse.json(
          { success: false, error: 'Function not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: func });
    }
    
    // List functions with filters
    const isActiveParam = searchParams.get('is_active');
    const method = searchParams.get('method');
    const sortBy = searchParams.get('sort_by');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    const filters: any = {};
    
    if (isActiveParam !== null) {
      filters.isActive = isActiveParam === 'true';
    }
    
    if (method) {
      filters.method = method.toUpperCase();
    }
    
    if (sortBy) {
      filters.sortBy = sortBy;
    }
    
    if (limitParam) {
      const limit = parseInt(limitParam);
      if (!isNaN(limit) && limit > 0) {
        filters.limit = limit;
        
        if (offsetParam) {
          const offset = parseInt(offsetParam);
          if (!isNaN(offset) && offset >= 0) {
            filters.offset = offset;
          }
        }
      }
    }
    
    const functions = await listFunctions(filters);
    
    return NextResponse.json({
      success: true,
      count: functions.length,
      data: functions
    });
  } catch (error: any) {
    console.error('Error handling functions GET request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST: Create a new function
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.endpoint || !body.method) {
      return NextResponse.json(
        { success: false, error: 'name, endpoint, and method are required' },
        { status: 400 }
      );
    }
    
    // Validate method is a valid HTTP method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!validMethods.includes(body.method.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid method. Must be one of: ' + validMethods.join(', ') },
        { status: 400 }
      );
    }
    
    // Ensure parameters is an object
    if (!body.parameters || typeof body.parameters !== 'object') {
      body.parameters = {};
    }
    
    // Create the function
    const functionId = await registerFunction({
      name: body.name,
      description: body.description || '',
      endpoint: body.endpoint,
      method: body.method.toUpperCase(),
      parameters: body.parameters,
      body_schema: body.body_schema,
      is_active: body.is_active !== false
    });
    
    // Get the created function
    const createdFunction = await getFunction(functionId);
    
    return NextResponse.json(
      { success: true, data: createdFunction },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating function:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing function
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Function ID is required' },
        { status: 400 }
      );
    }
    
    const functionId = parseInt(id);
    if (isNaN(functionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid function ID' },
        { status: 400 }
      );
    }
    
    // Check if function exists
    const existingFunction = await getFunction(functionId);
    if (!existingFunction) {
      return NextResponse.json(
        { success: false, error: 'Function not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate method if provided
    if (body.method) {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      if (!validMethods.includes(body.method.toUpperCase())) {
        return NextResponse.json(
          { success: false, error: 'Invalid method. Must be one of: ' + validMethods.join(', ') },
          { status: 400 }
        );
      }
      body.method = body.method.toUpperCase();
    }
    
    // Update the function
    const updated = await updateFunction(functionId, body);
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'No changes were made' },
        { status: 400 }
      );
    }
    
    // Get the updated function
    const updatedFunction = await getFunction(functionId);
    
    return NextResponse.json({ success: true, data: updatedFunction });
  } catch (error: any) {
    console.error('Error updating function:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a function
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Function ID is required' },
        { status: 400 }
      );
    }
    
    const functionId = parseInt(id);
    if (isNaN(functionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid function ID' },
        { status: 400 }
      );
    }
    
    // Check if function exists
    const existingFunction = await getFunction(functionId);
    if (!existingFunction) {
      return NextResponse.json(
        { success: false, error: 'Function not found' },
        { status: 404 }
      );
    }
    
    // Instead of deleting, we'll just deactivate
    const updated = await updateFunction(functionId, { is_active: false });
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Could not deactivate function' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Function ${existingFunction.name} has been deactivated`
    });
  } catch (error: any) {
    console.error('Error deleting function:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 