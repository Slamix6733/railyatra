export interface TrainData {
  train_id: number;
  train_number: string;
  train_name: string;
  train_type: string;
  run_days: string;
  source_station_name: string;
  source_station_code: string;
  destination_station_name: string;
  destination_station_code: string;
  standard_departure_time: string;
  standard_arrival_time: string;
  journey_distance?: number;
}

export interface BookingStats {
  total_journeys: number;
  total_tickets: number;
  total_passengers: number;
  bookings_today?: number;
  bookings_week?: number;
  bookings_month?: number;
}

export interface SeatStats {
  total_seats: number;
  confirmed_seats: number;
  available_seats: number;
  rac_seats: number;
  waitlisted_seats: number;
  cancellations: number;
  last_waitlist: number;
  current_rac?: number;
  max_rac?: number;
  current_waitlist?: number;
  max_waitlist?: number;
  occupancy_rate: string;
}

export interface FareDetails {
  journey_distance_km: number;
  stations_count?: number;
  fare_per_km: number;
  base_fare: number;
  service_charge: number;
  gst?: number;
  total_fare: number;
}

export interface RevenueStats {
  total_revenue: number;
  avg_fare: number;
  revenue_per_seat: number;
}

export interface DemandInfo {
  peak_day: string;
  peak_booking_count: number;
}

export interface ClassDetail {
  config_id: number;
  train_id: number;
  class_id: number;
  class_name: string;
  class_code: string;
  class_description?: string;
  total_seats: number;
  fare_per_km: number;
  journey_count?: number;
  booking_stats?: BookingStats;
  seat_stats?: SeatStats;
  fare_details?: FareDetails;
  revenue_stats?: RevenueStats;
  demand_info?: DemandInfo;
}

export interface TrainClassDetails {
  train: TrainData;
  class_details: ClassDetail[];
}

export interface TrainClassResponse {
  success: boolean;
  data?: TrainClassDetails;
  error?: string;
} 