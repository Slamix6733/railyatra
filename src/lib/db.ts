import mysql, { PoolOptions, SslOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database connection configuration
const dbConfig: PoolOptions = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'REQUIRED' ? 
    { rejectUnauthorized: false } as SslOptions : 
    undefined
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to execute SQL queries
export async function query(sql: string, params?: any[]) {
  try {
    // Certain commands like 'START TRANSACTION', 'COMMIT', and 'ROLLBACK' are not supported
    // in the prepared statement protocol, so we need to handle them differently
    if (['START TRANSACTION', 'COMMIT', 'ROLLBACK'].includes(sql.toUpperCase())) {
      const [results] = await pool.query(sql);
      return results;
    } else {
      const [results] = await pool.execute(sql, params);
      return results;
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Export the connection pool for direct use if needed
export default pool; 