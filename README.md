# Indian Railway Ticket Reservation System (RailYatra)

![Railway Ticket Reservation System](public/railyatra-logo.png)

## Project Overview

RailYatra is a comprehensive railway ticket reservation system built as part of CS202 Mini Project. It provides a realistic train booking experience with advanced features such as real-time seat availability, waitlist management, and dynamic pricing.

The application is built with Next.js, TypeScript, Tailwind CSS, and MySQL, offering a modern and responsive user interface while maintaining robust backend functionality.

## Team Members

- Shreyas Jaiswal (2301CS52)
- Rakshit Singhal (2301CS38)
- Anurag Nath (2301CS07)
- Harshit (2301CS18)

## Key Features

- **User Management**

  - Registration and authentication system
  - User profiles with booking history
  - Admin interface for system management

- **Ticket Booking**

  - Real-time seat availability checking
  - Flexible search options (date, class, quota)
  - Seat/berth preference selection
  - Multiple passenger bookings in one transaction
  - Dynamic fare calculation

- **Reservation System**

  - Confirmed, RAC, and Waitlist ticket management
  - Automatic berth allocation
  - Quota management (Senior Citizen, Ladies, etc.)
  - Concession categories

- **Cancellation System**

  - Ticket cancellation with refund processing
  - Refund amount calculation based on cancellation time
  - Automatic waitlist clearing upon cancellation

- **PNR Status & Tracking**

  - PNR generation and status tracking
  - Journey details with coach/seat information
  - Email notifications for booking, cancellation, and status updates

- **Admin Dashboard**
  - Comprehensive analytics and reporting
  - Train scheduling and management
  - User management and support
  - Revenue analytics and cancellation records

## Technology Stack

- **Frontend**

  - Next.js 13+ (App Router)
  - TypeScript
  - Tailwind CSS
  - React Icons
  - Recharts for data visualization

- **Backend**

  - Next.js API Routes
  - MySQL Database
  - Node.js

- **Authentication**
  - Custom auth implementation with JWT

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- MySQL 8.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/railyatra.git
   cd railyatra
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:

   ```
   DATABASE_URL=mysql://username:password@localhost:3306/railyatra
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

4. Initialize the database:

   ```bash
   npm run db:init
   # or
   yarn db:init
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The database follows a normalized relational schema with the following key tables:

- **PASSENGER**: Stores passenger details including name, age, gender, and contact information
- **STATION**: Contains information about railway stations including code, name, city, and platforms
- **TRAIN**: Manages train details including number, name, and type
- **TRAIN_ENDPOINTS**: Defines the source and destination stations for each train
- **ROUTE_SEGMENT**: Maps the sequence of stations in a train's route
- **CLASS**: Contains different train classes (1AC, 2AC, 3AC, SL, etc.)
- **SEAT_CONFIGURATION**: Defines seat availability and pricing for each class in a train
- **SCHEDULE**: Manages train schedules for specific dates
- **JOURNEY**: Represents specific journeys between stations on a scheduled train
- **TICKET**: Stores booking information with PNR and fare details
- **PASSENGER_TICKET**: Maps passengers to tickets with seat allocation
- **PAYMENT**: Records payment transactions
- **CANCELLATION**: Tracks ticket cancellations and refund status
- **WAITLIST**: Manages waitlist queue for journeys
- **RAC**: Tracks Reservation Against Cancellation status

## System Architecture

The application follows a modern web architecture:

1. **Client Layer**: Next.js with React components and Tailwind CSS
2. **API Layer**: RESTful API endpoints using Next.js API routes
3. **Service Layer**: Business logic and data processing
4. **Data Access Layer**: Database interactions and queries
5. **Database**: MySQL relational database

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is created for educational purposes as part of the CS202 Mini Project.

## Acknowledgments

- Indian Railways for inspiration
- Our course instructors for guidance and support
- Open-source community for tools and libraries
