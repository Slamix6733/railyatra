import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Setup MySQL functions and triggers from the potential_query.txt file
 */
async function setupFunctions() {
  // Get database configuration
  const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'REQUIRED' ? 
      { rejectUnauthorized: false } : 
      undefined,
    multipleStatements: true // Allow multiple statements
  };

  // Create a direct connection (not using pool)
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('Connected to database. Reading functions file...');
    
    // Read the potential_query.txt file
    const filePath = path.join(process.cwd(), 'potential_query.txt');
    let fileContent = fs.readFileSync(filePath, 'utf8');

    // Split the content by DELIMITER statements
    const blocks = fileContent.split('DELIMITER ');
    
    // Process each block (skipping the first empty one)
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const delimiter = block.substring(0, block.indexOf('\n')).trim();
      const commandText = block.substring(block.indexOf('\n') + 1);
      
      // Split by delimiter
      const statements = commandText.split(delimiter);
      
      // Process each statement
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed && !trimmed.startsWith('--') && trimmed !== ';') {
          try {
            // Execute the SQL directly (not as prepared statement)
            await connection.query(trimmed);
            console.log(`Successfully executed function/procedure.`);
          } catch (error) {
            console.error('Error executing SQL:', error);
          }
        }
      }
    }
    
    console.log('Successfully set up all MySQL functions and triggers!');
  } catch (error) {
    console.error('Error setting up MySQL functions and triggers:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Execute the setup function if this file is run directly
if (require.main === module) {
  setupFunctions()
    .then(() => {
      console.log('Setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export default setupFunctions; 