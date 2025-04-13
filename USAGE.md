# Rail System MySQL Functions - Usage Guide

This guide explains how to use the MySQL functions for the Rail Booking System.

## Setup Complete

You've successfully created all the MySQL functions and stored procedures in your database:

- Stored Procedures:

  - `get_cancellation_records`
  - `get_waitlisted_passengers`
  - `list_train_passengers`

- Functions:

  - `calculate_refund_amount`
  - `calculate_revenue`
  - `generate_itemized_bill`
  - `get_available_seats`
  - `get_busiest_route`
  - `get_pnr_status`
  - `get_train_schedule`

- Triggers:
  - `after_ticket_cancelled`
  - `after_train_cancelled`
  - `after_passenger_ticket_insert`

These database functions are now integrated with your Node.js backend. You can directly use them through the API endpoints or the TypeScript utility functions.

## Running the Application

Now that all the MySQL functions are set up, you can start your application:

```bash
npm run dev
```

## API Usage

The MySQL functions can be accessed through the REST API at `/api/rail-functions`. Below are the available endpoints:

### GET Endpoints

All GET requests use query parameters to specify the action and its parameters.

#### 1. PNR Status Tracking

```
GET /api/rail-functions?action=pnr_status&pnr=PNR_NUMBER
```

Example:

```
GET /api/rail-functions?action=pnr_status&pnr=ABC12345
```

#### 2. Train Schedule Lookup

```
GET /api/rail-functions?action=train_schedule&train_id=TRAIN_ID_OR_NUMBER
```

Example:

```
GET /api/rail-functions?action=train_schedule&train_id=12345
```

#### 3. Available Seats Query

```
GET /api/rail-functions?action=available_seats&journey_id=JOURNEY_ID&class_id=CLASS_ID
```

Example:

```
GET /api/rail-functions?action=available_seats&journey_id=101&class_id=2
```

#### 4. List Train Passengers

```
GET /api/rail-functions?action=train_passengers&train_id=TRAIN_ID&journey_date=YYYY-MM-DD
```

Example:

```
GET /api/rail-functions?action=train_passengers&train_id=12345&journey_date=2023-12-25
```

#### 5. List Waitlisted Passengers

```
GET /api/rail-functions?action=waitlisted_passengers&train_id=TRAIN_ID&journey_date=YYYY-MM-DD
```

Example:

```
GET /api/rail-functions?action=waitlisted_passengers&train_id=12345&journey_date=2023-12-25
```

#### 6. Calculate Refund Amount

```
GET /api/rail-functions?action=refund_amount&schedule_id=SCHEDULE_ID
```

Example:

```
GET /api/rail-functions?action=refund_amount&schedule_id=101
```

#### 7. Calculate Revenue

```
GET /api/rail-functions?action=revenue&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Example:

```
GET /api/rail-functions?action=revenue&start_date=2023-01-01&end_date=2023-12-31
```

#### 8. Get Cancellation Records

```
GET /api/rail-functions?action=cancellation_records&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Example:

```
GET /api/rail-functions?action=cancellation_records&start_date=2023-01-01&end_date=2023-12-31
```

#### 9. Find Busiest Route

```
GET /api/rail-functions?action=busiest_route&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Example:

```
GET /api/rail-functions?action=busiest_route&start_date=2023-01-01&end_date=2023-12-31
```

#### 10. Generate Itemized Bill

```
GET /api/rail-functions?action=itemized_bill&ticket_id=TICKET_ID
```

Example:

```
GET /api/rail-functions?action=itemized_bill&ticket_id=101
```

### POST Endpoints

All POST requests use JSON body to specify the action and its parameters.

#### 1. Cancel Train

```
POST /api/rail-functions
Content-Type: application/json

{
  "action": "cancel_train",
  "schedule_id": 101,
  "reason": "Operational reasons"
}
```

#### 2. Cancel Ticket

```
POST /api/rail-functions
Content-Type: application/json

{
  "action": "cancel_ticket",
  "ticket_id": 101,
  "reason": "Cancelled by user"
}
```

## Usage in Frontend Code

You can use these API endpoints in your frontend code like this:

```typescript
// Example of getting PNR status
async function checkPnrStatus(pnr: string) {
  try {
    const response = await fetch(
      `/api/rail-functions?action=pnr_status&pnr=${pnr}`
    );
    const data = await response.json();

    if (data.success) {
      // Process PNR status data
      console.log(data.data);
      return data.data;
    } else {
      console.error("Error fetching PNR status:", data.error);
    }
  } catch (error) {
    console.error("Failed to fetch PNR status:", error);
  }
}

// Example of cancelling a ticket
async function cancelTicket(ticketId: number, reason: string) {
  try {
    const response = await fetch("/api/rail-functions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "cancel_ticket",
        ticket_id: ticketId,
        reason: reason,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Ticket cancelled successfully");
      return true;
    } else {
      console.error("Error cancelling ticket:", data.error);
      return false;
    }
  } catch (error) {
    console.error("Failed to cancel ticket:", error);
    return false;
  }
}
```

## Direct Database Access in Node.js

For backend code, you can also use the helper functions directly:

```typescript
import * as dbFunctions from "@/lib/db-functions";

// Example of using the functions
async function generateReport() {
  try {
    // Get revenue for the current year
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    const revenue = await dbFunctions.calculateRevenue(startDate, endDate);
    const busiestRoute = await dbFunctions.getBusiestRoute(startDate, endDate);

    return {
      totalRevenue: revenue,
      busiestRoute: busiestRoute,
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}
```
