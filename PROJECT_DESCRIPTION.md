# CS202 Mini Project: Indian Railway Ticket Reservation System

**Date:** 30th Apr 2025

## Project Overview

The goal of this mini-project is to provide a realistic experience in conceptual design, logical design, implementation, normalization, and a small relational database for an Indian Railway Ticket Reservation System.

## Application Description

RailYatra is a railway ticket reservation system that allows passengers to book, modify, and cancel tickets for train journeys. The system provides a comprehensive solution for the railway sector, with advanced features for both passengers and administrators.

## Key Features

### For Passengers

- Passengers can book tickets for available trains.
- Tickets are issued with all necessary information (PNR, Train No., AC/Sleeper, etc.).
- Seat availability and berth preference options.
- Realtime PNR status tracking.
- Waitlist and RAC (Reservation Against Cancellation) system.
- Cancellation and refund processing.
- Concession categories for senior citizens, students, and disabled passengers.

### For Administrators

- Train schedule management.
- Seat configuration and fare determination.
- Passenger data management.
- Cancellation records and refund status tracking.
- Revenue and performance analytics.

## Project Requirements

### 1. E-R Model

- Construct an E-R diagram representing the conceptual design of the database.
- Identify entities such as Passenger, Train, Ticket, Payment, Station, Seat, and Class.
- Specify primary keys, foreign keys, relationships, cardinalities, and constraints.

### 2. Relational Model

- Convert the E-R diagram into relational schemas.
- Normalize relations to eliminate redundancy in relations.
- Implement the relations in MySQL.
- Define keys, indexes, triggers, procedures, functions, and constraints as necessary.

### 3. Population of Database

- Populate the database with enough sample data to test the system.
- Ensure data integrity using scripts if needed.

### 4. Potential Queries

We need to implement various queries that provide valuable insights into the railway ticket system. Some examples include:

- **PNR Status**: Track status for a given ticket.
- **Train Schedule**: Lookup schedule for a given train.
- **Available Seats**: Check seats for a specific train, date, and class.
- **Passenger List**: List all passengers on a specific train on a given date.
- **Waitlisted Passengers**: Retrieve all waitlisted passengers for a particular train.
- **Refund Amount**: Calculate refund for a cancelled ticket.
- **Revenue Analysis**: Calculate total revenue generated from ticket bookings over a specified period.
- **Cancellation Records**: Retrieve cancellation records with refund status.
- **Popular Routes**: Find the busiest route based on passenger count.
- **Fare Calculation**: Generate an itemized bill including all charges.

## Advantages of Our Database Schema

Our database schema design offers several key advantages that enhance the system's functionality, performance, and maintainability:

1. **Normalized Structure**: The schema follows normalization principles (up to 3NF) to eliminate data redundancy, which helps maintain data integrity and reduces storage requirements.

2. **Separation of Concerns**: Clear separation between different aspects of the railway system:

   - Train management (TRAIN, ROUTE_SEGMENT)
   - Scheduling (SCHEDULE, SCHEDULE_STATION_TIMING)
   - Journey planning (JOURNEY)
   - Ticketing (TICKET, PASSENGER_TICKET)
   - Payment processing (PAYMENT, CANCELLATION)

3. **Flexible Train Route Management**: The ROUTE_SEGMENT table allows complete flexibility in defining train routes with any number of intermediate stations, enabling support for all types of train services.

4. **Comprehensive Seat Management**: The SEAT_CONFIGURATION table provides class-wise seat management with fare calculations, allowing different pricing strategies for different train types and classes.

5. **Robust Waitlist and RAC System**: The dedicated WAITLIST and RAC tables allow for efficient management of the waitlist and RAC queues, supporting automatic seat allocation when cancellations occur.

6. **Advanced Booking Tracking**: The schema tracks all aspects of bookings from initial reservation to payment processing and potential cancellations and refunds.

7. **Constraint Enforcement**: Extensive use of constraints (CHECK, FOREIGN KEY, UNIQUE) ensures data integrity and prevents invalid data entry.

8. **Scalability**: The design can easily scale to accommodate more trains, routes, and passengers without structural changes.

9. **Analytical Support**: The schema supports complex analytical queries for business intelligence, allowing administrators to analyze trends, optimize routes, and make data-driven decisions.

10. **Extensibility**: The modular design allows for future extensions like adding new features (e.g., meal preferences, special services) without disrupting the existing structure.

## Key Strengths of Our Project

Our Railway Ticket Reservation System distinguishes itself through several standout features:

1. **Comprehensive Real-World Implementation**: The system closely mimics real-world railway operations with all essential functionalities required by passengers and administrators.

2. **Modern Technology Stack**: Utilizing Next.js, TypeScript, and MySQL provides a robust, type-safe development environment with excellent performance characteristics.

3. **Responsive User Interface**: The Tailwind CSS-based UI adapts to various screen sizes, making the system accessible from desktops, tablets, and mobile devices.

4. **Integrated Analytics Dashboard**: Administrators gain valuable insights through an intuitive dashboard showcasing key metrics like revenue, popular routes, and booking patterns.

5. **Advanced Booking Workflow**: The system handles complex scenarios including multiple passenger bookings, different quotas, and dynamic fare calculations.

6. **Automated Waitlist Processing**: When cancellations occur, the system automatically promotes waitlisted passengers based on priority, reducing manual intervention.

7. **Robust Security Implementation**: Custom JWT authentication protects user data while role-based access controls ensure appropriate authorization.

8. **Email Notifications**: Automated email alerts for booking confirmations, cancellations, and status changes keep passengers informed throughout their journey.

9. **Optimized Database Queries**: The system employs efficient SQL queries with proper indexing, ensuring fast response times even under heavy loads.

10. **Thorough Data Validation**: Client-side and server-side validation ensure data integrity, preventing common errors and improving the user experience.

11. **Detailed Documentation**: Comprehensive documentation facilitates maintenance and further development of the system.

12. **Realistic Test Data**: The system includes realistic test data that reflects actual train operations, enabling meaningful testing and demonstrations.

## Database Design

### Entity Relationship Diagram

Our database design follows a comprehensive ER diagram that captures the relationships between:

- **PASSENGER** ↔ **TICKET**: Many-to-many relationship through PASSENGER_TICKET
- **TRAIN** ↔ **SCHEDULE**: One-to-many relationship
- **STATION** ↔ **ROUTE_SEGMENT**: Stations in a train's route
- **TRAIN** ↔ **TRAIN_ENDPOINTS**: Source and destination stations for a train
- **SCHEDULE** ↔ **JOURNEY**: One-to-many relationship
- **JOURNEY** ↔ **TICKET**: One-to-many relationship
- **TICKET** ↔ **PAYMENT**: One-to-one relationship
- **TICKET** ↔ **CANCELLATION**: One-to-one relationship
- **JOURNEY** ↔ **WAITLIST/RAC**: One-to-one relationship

### Schema Definition

The database schema is normalized to reduce data redundancy and improve data integrity. Below are the tables with their attributes:

#### PASSENGER

| Column Name         | Data Type    | Constraints                                             | Description                      |
| ------------------- | ------------ | ------------------------------------------------------- | -------------------------------- |
| passenger_id        | INT          | PRIMARY KEY, AUTO_INCREMENT                             | Unique identifier for passenger  |
| name                | VARCHAR(100) | NOT NULL                                                | Passenger's full name            |
| age                 | INT          | NOT NULL, CHECK (age > 0)                               | Passenger's age                  |
| gender              | VARCHAR(10)  | NOT NULL, CHECK (gender IN ('Male', 'Female', 'Other')) | Passenger's gender               |
| contact_number      | VARCHAR(15)  | NOT NULL                                                | Contact phone number             |
| email               | VARCHAR(100) |                                                         | Email address                    |
| address             | VARCHAR(255) |                                                         | Residential address              |
| id_proof_type       | VARCHAR(50)  |                                                         | Type of ID document              |
| id_proof_number     | VARCHAR(50)  |                                                         | ID document number               |
| concession_category | VARCHAR(50)  |                                                         | Category for fare concession     |
| password            | VARCHAR(60)  |                                                         | Password for user authentication |

#### STATION

| Column Name         | Data Type    | Constraints                               | Description                    |
| ------------------- | ------------ | ----------------------------------------- | ------------------------------ |
| station_id          | INT          | PRIMARY KEY, AUTO_INCREMENT               | Unique identifier for station  |
| station_code        | VARCHAR(10)  | NOT NULL, UNIQUE                          | Station code (e.g., NDLS)      |
| station_name        | VARCHAR(100) | NOT NULL                                  | Full name of station           |
| city                | VARCHAR(50)  | NOT NULL                                  | City where station is located  |
| state               | VARCHAR(50)  | NOT NULL                                  | State where station is located |
| number_of_platforms | INT          | NOT NULL, CHECK (number_of_platforms > 0) | Number of platforms at station |
| zone                | VARCHAR(50)  | NOT NULL                                  | Railway zone                   |

#### TRAIN

| Column Name  | Data Type    | Constraints                 | Description                     |
| ------------ | ------------ | --------------------------- | ------------------------------- |
| train_id     | INT          | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for train     |
| train_number | VARCHAR(10)  | NOT NULL, UNIQUE            | Train number                    |
| train_name   | VARCHAR(100) | NOT NULL                    | Name of the train               |
| train_type   | VARCHAR(50)  | NOT NULL                    | Type (Express, Superfast, etc.) |
| run_days     | VARCHAR(100) | NOT NULL                    | Days of week when train runs    |

#### TRAIN_ENDPOINTS

| Column Name             | Data Type | Constraints                 | Description                           |
| ----------------------- | --------- | --------------------------- | ------------------------------------- |
| train_endpoint_id       | INT       | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for endpoint record |
| train_id                | INT       | NOT NULL, FOREIGN KEY       | Reference to TRAIN                    |
| source_station_id       | INT       | NOT NULL, FOREIGN KEY       | Reference to source STATION           |
| destination_station_id  | INT       | NOT NULL, FOREIGN KEY       | Reference to destination STATION      |
| standard_departure_time | TIME      | NOT NULL                    | Scheduled departure time              |
| standard_arrival_time   | TIME      | NOT NULL                    | Scheduled arrival time                |

#### ROUTE_SEGMENT

| Column Name             | Data Type | Constraints                                 | Description                   |
| ----------------------- | --------- | ------------------------------------------- | ----------------------------- |
| segment_id              | INT       | PRIMARY KEY, AUTO_INCREMENT                 | Unique identifier for segment |
| train_id                | INT       | NOT NULL, FOREIGN KEY                       | Reference to TRAIN            |
| station_id              | INT       | NOT NULL, FOREIGN KEY                       | Reference to STATION          |
| sequence_number         | INT       | NOT NULL                                    | Order of station in route     |
| standard_arrival_time   | TIME      |                                             | Scheduled arrival time        |
| standard_departure_time | TIME      |                                             | Scheduled departure time      |
| distance_from_source    | FLOAT     | NOT NULL, CHECK (distance_from_source >= 0) | Distance from source station  |

#### CLASS

| Column Name | Data Type    | Constraints                 | Description                       |
| ----------- | ------------ | --------------------------- | --------------------------------- |
| class_id    | INT          | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for class       |
| class_name  | VARCHAR(50)  | NOT NULL                    | Name of the class                 |
| class_code  | VARCHAR(5)   | NOT NULL, UNIQUE            | Code for class (e.g., 1A, 2A, SL) |
| description | VARCHAR(255) |                             | Description of class              |

#### SEAT_CONFIGURATION

| Column Name | Data Type | Constraints                       | Description                         |
| ----------- | --------- | --------------------------------- | ----------------------------------- |
| config_id   | INT       | PRIMARY KEY, AUTO_INCREMENT       | Unique identifier for configuration |
| train_id    | INT       | NOT NULL, FOREIGN KEY             | Reference to TRAIN                  |
| class_id    | INT       | NOT NULL, FOREIGN KEY             | Reference to CLASS                  |
| total_seats | INT       | NOT NULL, CHECK (total_seats > 0) | Total seats in this class           |
| fare_per_km | FLOAT     | NOT NULL, CHECK (fare_per_km > 0) | Base fare per kilometer             |

#### SCHEDULE

| Column Name  | Data Type   | Constraints                        | Description                    |
| ------------ | ----------- | ---------------------------------- | ------------------------------ |
| schedule_id  | INT         | PRIMARY KEY, AUTO_INCREMENT        | Unique identifier for schedule |
| train_id     | INT         | NOT NULL, FOREIGN KEY              | Reference to TRAIN             |
| journey_date | DATE        | NOT NULL                           | Date of journey                |
| status       | VARCHAR(20) | NOT NULL, DEFAULT 'On Time'        | Schedule status                |
| delay_time   | INT         | DEFAULT 0, CHECK (delay_time >= 0) | Delay in minutes               |

#### SCHEDULE_STATION_TIMING

| Column Name           | Data Type | Constraints                 | Description                         |
| --------------------- | --------- | --------------------------- | ----------------------------------- |
| timing_id             | INT       | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for timing record |
| schedule_id           | INT       | NOT NULL, FOREIGN KEY       | Reference to SCHEDULE               |
| station_id            | INT       | NOT NULL, FOREIGN KEY       | Reference to STATION                |
| actual_arrival_time   | DATETIME  |                             | Actual arrival time                 |
| actual_departure_time | DATETIME  |                             | Actual departure time               |

#### JOURNEY

| Column Name            | Data Type | Constraints                 | Description                      |
| ---------------------- | --------- | --------------------------- | -------------------------------- |
| journey_id             | INT       | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for journey    |
| schedule_id            | INT       | NOT NULL, FOREIGN KEY       | Reference to SCHEDULE            |
| source_station_id      | INT       | NOT NULL, FOREIGN KEY       | Reference to source STATION      |
| destination_station_id | INT       | NOT NULL, FOREIGN KEY       | Reference to destination STATION |
| class_id               | INT       | NOT NULL, FOREIGN KEY       | Reference to CLASS               |

#### TICKET

| Column Name    | Data Type   | Constraints                         | Description                  |
| -------------- | ----------- | ----------------------------------- | ---------------------------- |
| ticket_id      | INT         | PRIMARY KEY, AUTO_INCREMENT         | Unique identifier for ticket |
| pnr_number     | VARCHAR(10) | NOT NULL, UNIQUE                    | PNR (Passenger Name Record)  |
| journey_id     | INT         | NOT NULL, FOREIGN KEY               | Reference to JOURNEY         |
| booking_date   | DATETIME    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date and time of booking     |
| booking_status | VARCHAR(20) | NOT NULL                            | Status of booking            |
| total_fare     | FLOAT       | NOT NULL, CHECK (total_fare >= 0)   | Total fare amount            |
| booking_type   | VARCHAR(20) | NOT NULL, DEFAULT 'Online'          | Channel of booking           |

#### PASSENGER_TICKET

| Column Name          | Data Type   | Constraints                                            | Description                            |
| -------------------- | ----------- | ------------------------------------------------------ | -------------------------------------- |
| passenger_ticket_id  | INT         | PRIMARY KEY, AUTO_INCREMENT                            | Unique identifier for passenger ticket |
| ticket_id            | INT         | NOT NULL, FOREIGN KEY                                  | Reference to TICKET                    |
| passenger_id         | INT         | NOT NULL, FOREIGN KEY                                  | Reference to PASSENGER                 |
| seat_number          | VARCHAR(10) |                                                        | Assigned seat number                   |
| berth_type           | VARCHAR(20) |                                                        | Type of berth                          |
| status               | VARCHAR(20) | NOT NULL                                               | Status of passenger booking            |
| waitlist_number      | INT         | CHECK (waitlist_number IS NULL OR waitlist_number > 0) | Position in waitlist                   |
| is_primary_passenger | BOOLEAN     | NOT NULL, DEFAULT FALSE                                | Whether passenger is primary contact   |

#### PAYMENT

| Column Name    | Data Type    | Constraints                         | Description                   |
| -------------- | ------------ | ----------------------------------- | ----------------------------- |
| payment_id     | INT          | PRIMARY KEY, AUTO_INCREMENT         | Unique identifier for payment |
| ticket_id      | INT          | NOT NULL, FOREIGN KEY               | Reference to TICKET           |
| amount         | FLOAT        | NOT NULL, CHECK (amount > 0)        | Payment amount                |
| payment_date   | DATETIME     | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date and time of payment      |
| payment_mode   | VARCHAR(50)  | NOT NULL                            | Mode of payment               |
| transaction_id | VARCHAR(100) | NOT NULL, UNIQUE                    | Transaction reference         |
| status         | VARCHAR(20)  | NOT NULL, DEFAULT 'Success'         | Payment status                |

#### CANCELLATION

| Column Name          | Data Type    | Constraints                                 | Description                        |
| -------------------- | ------------ | ------------------------------------------- | ---------------------------------- |
| cancellation_id      | INT          | PRIMARY KEY, AUTO_INCREMENT                 | Unique identifier for cancellation |
| ticket_id            | INT          | NOT NULL, FOREIGN KEY                       | Reference to TICKET                |
| cancellation_date    | DATETIME     | NOT NULL, DEFAULT CURRENT_TIMESTAMP         | Date and time of cancellation      |
| reason               | VARCHAR(255) |                                             | Reason for cancellation            |
| refund_amount        | FLOAT        | NOT NULL, CHECK (refund_amount >= 0)        | Amount to be refunded              |
| cancellation_charges | FLOAT        | NOT NULL, CHECK (cancellation_charges >= 0) | Charges for cancellation           |
| refund_status        | VARCHAR(20)  | NOT NULL, DEFAULT 'Pending'                 | Status of refund                   |

#### CONCESSION

| Column Name         | Data Type    | Constraints                                             | Description                        |
| ------------------- | ------------ | ------------------------------------------------------- | ---------------------------------- |
| concession_id       | INT          | PRIMARY KEY, AUTO_INCREMENT                             | Unique identifier for concession   |
| concession_type     | VARCHAR(50)  | NOT NULL, UNIQUE                                        | Type of concession                 |
| discount_percentage | FLOAT        | NOT NULL, CHECK (discount_percentage BETWEEN 0 AND 100) | Discount percentage                |
| document_required   | VARCHAR(255) |                                                         | Required document for verification |

#### WAITLIST

| Column Name             | Data Type | Constraints                                              | Description                    |
| ----------------------- | --------- | -------------------------------------------------------- | ------------------------------ |
| waitlist_id             | INT       | PRIMARY KEY, AUTO_INCREMENT                              | Unique identifier for waitlist |
| journey_id              | INT       | NOT NULL, FOREIGN KEY                                    | Reference to JOURNEY           |
| current_waitlist_number | INT       | NOT NULL, DEFAULT 1, CHECK (current_waitlist_number > 0) | Current waitlist number        |
| max_waitlist            | INT       | NOT NULL, CHECK (max_waitlist > 0)                       | Maximum waitlist allowed       |

#### RAC

| Column Name        | Data Type | Constraints                                         | Description               |
| ------------------ | --------- | --------------------------------------------------- | ------------------------- |
| rac_id             | INT       | PRIMARY KEY, AUTO_INCREMENT                         | Unique identifier for RAC |
| journey_id         | INT       | NOT NULL, FOREIGN KEY                               | Reference to JOURNEY      |
| current_rac_number | INT       | NOT NULL, DEFAULT 1, CHECK (current_rac_number > 0) | Current RAC number        |
| max_rac            | INT       | NOT NULL, CHECK (max_rac > 0)                       | Maximum RAC allowed       |

## Database Triggers

The system implements several triggers to maintain data integrity and automate processes:

1. **after_ticket_cancelled**: Updates waitlist status and refunds when a ticket is cancelled
2. **after_train_cancelled**: Automatically cancels all tickets when a train is cancelled
3. **before_ticket_insert**: Generates a unique PNR number
4. **after_payment_success**: Updates ticket status once payment is confirmed

## Stored Procedures

1. **get_available_seats**: Calculates available seats for a train on a given date
2. **get_cancellation_records**: Retrieves cancellation details with refund information
3. **process_waitlist**: Processes the waitlist when seats become available
4. **calculate_fare**: Calculates fare for a journey based on class, distance, and quota

## Implementation Details

### Technology Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: Custom JWT implementation
- **Email Service**: Nodemailer for notifications

### Deployment Architecture

The application is structured with:

- Client-side components for the user interface
- Server-side API endpoints for business logic
- Database layer for data persistence
- Authentication middleware for security

## Testing and Validation

The application includes:

- Unit tests for critical functions
- Integration tests for API endpoints
- Database validation through constraints and triggers
- Manual testing scenarios for common user flows

## Future Enhancements

Potential areas for expansion include:

1. Mobile application development
2. Integration with payment gateways
3. Real-time train tracking
4. Chatbot for customer support
5. Advanced analytics dashboard
6. Multi-language support

## Supporting Files

- SQL scripts for database initialization
- Sample data generation scripts
- API documentation
- User manual

## Conclusion

The Indian Railway Ticket Reservation System demonstrates a comprehensive implementation of a relational database system with a modern web application frontend. The project showcases both the theoretical aspects of database design and the practical implementation of a real-world system.

## Team Members

- Shreyas Jaiswal (2301CS52)
- Rakshit Singhal (2301CS38)
- Anurag Nath (2301CS07)
- Harshit (2301CS18)
