// Database models based on the schema

// Train model
export interface Train {
  train_id: number;
  train_name: string;
  source_station: string;
  destination_station: string;
  schedule_id?: number;         // From schedules API
  train_number?: string;        // From schedules API
  standard_departure_time?: string;  // From schedules API
  standard_arrival_time?: string;    // From schedules API
  journey_distance?: number;     // From schedules API
}

// Train Information model
export interface TrainInformation {
  id: number;
  train_id: number;
  arrival_time: string;
  departure_time: string;
  total_seats: number;
  date: string;
}

// Station model
export interface Station {
  station_id: number;
  station_name: string;
  city: string;
  state: string;
  address: string;
}

// Schedule model
export interface Schedule {
  id: number;
  train_id: number;
  station_id: number;
  arrival_time: string;
  departure_time: string;
}

// Route Journey model
export interface RouteJourney {
  id: number;
  from_station: number;
  to_station: number;
  train_id: number;
  duration: string;
  distance: number;
  fare: number;
}

// Class model
export interface Class {
  id: number;
  class_name: string;
  description: string;
  price_factor: number;
}

// Ticket model
export interface Ticket {
  ticket_id: number;
  passenger_id: number;
  train_id: number;
  schedule_id: number;
  booking_date: string;
  journey_date: string;
  seat_number: number;
  ticket_price: number;
  status: string;
}

// Passenger model
export interface Passenger {
  passenger_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

// Passenger Ticket model
export interface PassengerTicket {
  id: number;
  ticket_id: number;
  passenger_name: string;
  age: number;
  gender: string;
  seat_no: string;
  status: string;
  boarding_point: string;
}

// Payment model
export interface Payment {
  id: number;
  passenger_id: number;
  ticket_id: number;
  amount: number;
  payment_date: string;
  payment_status: string;
}

// Cancellation model
export interface Cancellation {
  id: number;
  ticket_id: number;
  cancelled_date: string;
  refund_amount: number;
  reason: string;
}

// Wallet model
export interface Wallet {
  id: number;
  passenger_id: number;
  balance: number;
  last_updated: string;
}

// PNR model
export interface PNR {
  id: number;
  ticket_id: number;
  pnr_number: string;
}

// User model
export interface User {
  id: number;
  username: string;
  password_hash: string;
  email: string;
  role: string;
  created_at: string;
} 