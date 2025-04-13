-- Create tables for API Functions system

-- Table to store API functions
CREATE TABLE IF NOT EXISTS API_FUNCTIONS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  endpoint VARCHAR(255) NOT NULL,
  method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NOT NULL,
  parameters JSON NOT NULL,
  body_schema JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  invocation_count INT DEFAULT 0,
  last_invoked TIMESTAMP NULL,
  INDEX (name),
  INDEX (method),
  INDEX (is_active)
);

-- Table to log function executions
CREATE TABLE IF NOT EXISTS API_FUNCTION_LOGS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  function_id INT NOT NULL,
  parameters JSON NOT NULL,
  request_body JSON,
  response JSON,
  status_code INT,
  execution_time INT, -- in milliseconds
  executed_at TIMESTAMP NOT NULL,
  user_id VARCHAR(255),
  ip_address VARCHAR(45), -- IPv6 can be up to 45 chars
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (function_id),
  INDEX (executed_at),
  INDEX (user_id),
  INDEX (success),
  FOREIGN KEY (function_id) REFERENCES API_FUNCTIONS(id) ON DELETE CASCADE
);

-- Add some sample API functions (common operations)
INSERT INTO API_FUNCTIONS (name, description, endpoint, method, parameters, body_schema, is_active)
VALUES 
  ('getJourneyById', 'Get journey details by ID', 'journeys', 'GET', 
   JSON_OBJECT('id', JSON_OBJECT('type', 'number', 'required', true, 'description', 'Journey ID')),
   NULL, 
   TRUE),
   
  ('searchJourneys', 'Search journeys by source, destination and date', 'journeys', 'GET', 
   JSON_OBJECT(
     'source_id', JSON_OBJECT('type', 'string', 'required', true, 'description', 'Source station ID or code'),
     'destination_id', JSON_OBJECT('type', 'string', 'required', true, 'description', 'Destination station ID or code'),
     'date', JSON_OBJECT('type', 'string', 'required', true, 'description', 'Journey date (YYYY-MM-DD)'),
     'class_id', JSON_OBJECT('type', 'number', 'required', false, 'description', 'Class ID')
   ),
   NULL, 
   TRUE),
   
  ('createBooking', 'Create a new booking', 'booking', 'POST', 
   JSON_OBJECT(),
   JSON_OBJECT(
     'journey_id', JSON_OBJECT('type', 'number', 'required', true),
     'passenger_details', JSON_OBJECT('type', 'array', 'required', true),
     'class_id', JSON_OBJECT('type', 'number', 'required', true)
   ), 
   TRUE),
   
  ('getTicketByPnr', 'Get ticket details by PNR number', 'tickets/pnr', 'GET', 
   JSON_OBJECT('pnr', JSON_OBJECT('type', 'string', 'required', true, 'description', 'PNR number')),
   NULL, 
   TRUE),
   
  ('cancelTicket', 'Cancel a ticket by ID', 'tickets/:id/cancel', 'POST', 
   JSON_OBJECT('id', JSON_OBJECT('type', 'number', 'required', true, 'description', 'Ticket ID')),
   JSON_OBJECT('reason', JSON_OBJECT('type', 'string', 'required', false)), 
   TRUE); 