import { query } from './db';
import { NextRequest, NextResponse } from 'next/server';

// Define types for function management
export type ApiFunction = {
  id?: number;
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  parameters: Record<string, any>;
  body_schema?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  invocation_count?: number;
  last_invoked?: string;
};

// Type for function execution
export type FunctionExecutionLog = {
  id?: number;
  function_id: number;
  parameters: Record<string, any>;
  request_body?: Record<string, any>;
  response?: Record<string, any>;
  status_code?: number;
  execution_time?: number;
  executed_at?: string;
  user_id?: string;
  ip_address?: string;
  success?: boolean;
  error_message?: string;
};

// Function to register a new API function in the database
export async function registerFunction(functionData: ApiFunction): Promise<number> {
  try {
    const result = await query(
      `INSERT INTO API_FUNCTIONS 
      (name, description, endpoint, method, parameters, body_schema, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        functionData.name,
        functionData.description,
        functionData.endpoint,
        functionData.method,
        JSON.stringify(functionData.parameters),
        functionData.body_schema ? JSON.stringify(functionData.body_schema) : null,
        functionData.is_active !== false
      ]
    );

    // Return the ID of the newly created function
    return !Array.isArray(result) ? result.insertId : 0;
  } catch (error) {
    console.error('Error registering API function:', error);
    throw error;
  }
}

// Function to get a registered function by ID or name
export async function getFunction(identifier: number | string): Promise<ApiFunction | null> {
  try {
    let sql = '';
    let params: any[] = [];

    if (typeof identifier === 'number') {
      sql = 'SELECT * FROM API_FUNCTIONS WHERE id = ?';
      params = [identifier];
    } else {
      sql = 'SELECT * FROM API_FUNCTIONS WHERE name = ?';
      params = [identifier];
    }

    const result = await query(sql, params);

    if (Array.isArray(result) && result.length > 0) {
      const func = result[0] as any;
      return {
        ...func,
        parameters: JSON.parse(func.parameters),
        body_schema: func.body_schema ? JSON.parse(func.body_schema) : undefined
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting API function:', error);
    throw error;
  }
}

// Function to update an existing function
export async function updateFunction(id: number, updates: Partial<ApiFunction>): Promise<boolean> {
  const allowedUpdates = [
    'name', 'description', 'endpoint', 'method',
    'parameters', 'body_schema', 'is_active'
  ];

  try {
    const updateEntries = Object.entries(updates)
      .filter(([key]) => allowedUpdates.includes(key));

    if (updateEntries.length === 0) {
      return false;
    }

    const setClause = updateEntries
      .map(([key]) => `${key} = ?`)
      .join(', ');

    const values = updateEntries.map(([_, value]) => {
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
    });

    const result = await query(
      `UPDATE API_FUNCTIONS SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return !Array.isArray(result) && result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating API function:', error);
    throw error;
  }
}

// Function to execute an API function
export async function executeFunction(
  functionIdOrName: number | string,
  params: Record<string, any>,
  requestBody?: Record<string, any>,
  request?: NextRequest
): Promise<{ data: any; statusCode: number; executionTime: number }> {
  const startTime = Date.now();
  let functionData: ApiFunction | null = null;
  
  try {
    // Get function details
    functionData = await getFunction(functionIdOrName);
    
    if (!functionData) {
      throw new Error(`Function with identifier ${functionIdOrName} not found`);
    }

    if (functionData.is_active === false) {
      throw new Error(`Function ${functionData.name} is not active`);
    }

    // Validate parameters
    const requiredParams = Object.entries(functionData.parameters)
      .filter(([_, config]) => (config as any).required)
      .map(([key]) => key);

    for (const param of requiredParams) {
      if (params[param] === undefined) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }

    // Build the endpoint with parameter substitutions
    let endpoint = functionData.endpoint;
    for (const [key, value] of Object.entries(params)) {
      endpoint = endpoint.replace(`:${key}`, encodeURIComponent(String(value)));
    }

    // Add query parameters for GET requests
    if (functionData.method === 'GET') {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (!endpoint.includes(`:${key}`)) {
          queryParams.append(key, String(value));
        }
      }
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
    }

    // Execute the function via internal API call
    const fetchOptions: RequestInit = {
      method: functionData.method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Function-Call': 'true'
      }
    };

    if (['POST', 'PUT', 'PATCH'].includes(functionData.method) && requestBody) {
      fetchOptions.body = JSON.stringify(requestBody);
    }

    // Here we're making an internal call to the API endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const fullUrl = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const response = await fetch(fullUrl, fetchOptions);
    const responseData = await response.json();
    const executionTime = Date.now() - startTime;

    // Log function execution
    await logFunctionExecution({
      function_id: typeof functionData.id === 'number' ? functionData.id : 0,
      parameters: params,
      request_body: requestBody,
      response: responseData,
      status_code: response.status,
      execution_time: executionTime,
      executed_at: new Date().toISOString(),
      user_id: request?.headers.get('x-user-id') || undefined,
      ip_address: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      success: response.ok,
      error_message: response.ok ? undefined : responseData.error || 'Unknown error'
    });

    // Update invocation count
    if (functionData.id) {
      await query(
        `UPDATE API_FUNCTIONS 
         SET invocation_count = invocation_count + 1, last_invoked = NOW() 
         WHERE id = ?`,
        [functionData.id]
      );
    }

    return {
      data: responseData,
      statusCode: response.status,
      executionTime
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('Error executing API function:', error);

    // Still log the failed execution
    if (functionData && functionData.id) {
      await logFunctionExecution({
        function_id: functionData.id,
        parameters: params,
        request_body: requestBody,
        execution_time: executionTime,
        executed_at: new Date().toISOString(),
        user_id: request?.headers.get('x-user-id') || undefined,
        ip_address: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
        success: false,
        error_message: error.message || 'Unknown error'
      });
    }

    throw error;
  }
}

// Log function execution details
async function logFunctionExecution(logData: FunctionExecutionLog): Promise<number> {
  try {
    const result = await query(
      `INSERT INTO API_FUNCTION_LOGS 
       (function_id, parameters, request_body, response, status_code, execution_time, 
        executed_at, user_id, ip_address, success, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logData.function_id,
        JSON.stringify(logData.parameters),
        logData.request_body ? JSON.stringify(logData.request_body) : null,
        logData.response ? JSON.stringify(logData.response) : null,
        logData.status_code || null,
        logData.execution_time || null,
        logData.executed_at || new Date().toISOString(),
        logData.user_id || null,
        logData.ip_address || null,
        logData.success !== undefined ? logData.success : null,
        logData.error_message || null
      ]
    );

    return !Array.isArray(result) ? result.insertId : 0;
  } catch (error) {
    console.error('Error logging function execution:', error);
    return 0; // Return 0 instead of throwing to prevent cascading errors
  }
}

// Function to list all registered functions
export async function listFunctions(filters?: {
  isActive?: boolean;
  method?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiFunction[]> {
  try {
    let sql = 'SELECT * FROM API_FUNCTIONS';
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters) {
      if (filters.isActive !== undefined) {
        conditions.push('is_active = ?');
        params.push(filters.isActive);
      }

      if (filters.method) {
        conditions.push('method = ?');
        params.push(filters.method);
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    if (filters?.sortBy) {
      sql += ` ORDER BY ${filters.sortBy}`;
    } else {
      sql += ' ORDER BY name ASC';
    }

    if (filters?.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);

      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const result = await query(sql, params);

    if (Array.isArray(result)) {
      return result.map((func: any) => ({
        ...func,
        parameters: JSON.parse(func.parameters),
        body_schema: func.body_schema ? JSON.parse(func.body_schema) : undefined
      }));
    }

    return [];
  } catch (error) {
    console.error('Error listing API functions:', error);
    throw error;
  }
} 