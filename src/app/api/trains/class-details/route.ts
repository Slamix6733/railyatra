import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET: Fetch detailed class-wise data for a specific train
 * This endpoint provides comprehensive information about each class of a train, including:
 * - Basic class details (name, code)
 * - Seat configuration (total seats, fare per km)
 * - Current seat availability statistics
 * - Booking statistics by class
 * - Occupancy rates by class
 * - Revenue details by class
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trainId = searchParams.get('trainId');
    const scheduleId = searchParams.get('scheduleId');
    const journeyDate = searchParams.get('date');
    
    // Validate required parameters
    if (!trainId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Train ID is required' 
      }, { status: 400 });
    }
    
    // 1. Get comprehensive train information with full route details
    const trainData = await query(
      `SELECT t.*, 
        source.station_name as source_station_name, source.station_code as source_station_code,
        destination.station_name as destination_station_name, destination.station_code as destination_station_code,
        te.standard_departure_time, te.standard_arrival_time,
        (SELECT MAX(rs.distance_from_source) FROM ROUTE_SEGMENT rs WHERE rs.train_id = t.train_id) as journey_distance
      FROM TRAIN t
      JOIN TRAIN_ENDPOINTS te ON t.train_id = te.train_id
      JOIN STATION source ON te.source_station_id = source.station_id
      JOIN STATION destination ON te.destination_station_id = destination.station_id
      WHERE t.train_id = ?`,
      [trainId]
    );
    
    if (!Array.isArray(trainData) || trainData.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Train not found' 
      }, { status: 404 });
    }
    
    // 2. Get all class configurations for this train with detailed class information
    const classConfigurations = await query(
      `SELECT sc.*, c.class_name, c.class_code, c.class_description,
       (SELECT COUNT(*) FROM JOURNEY j
        JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
        WHERE s.train_id = sc.train_id AND j.class_id = sc.class_id) as journey_count
      FROM SEAT_CONFIGURATION sc
      JOIN CLASS c ON sc.class_id = c.class_id
      WHERE sc.train_id = ?
      ORDER BY c.class_code`,
      [trainId]
    );
    
    if (!Array.isArray(classConfigurations) || classConfigurations.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No class configurations found for this train' 
      }, { status: 404 });
    }
    
    // 3. Get booking statistics for each class
    let classDetails = [...classConfigurations];
    
    // If schedule ID or journey date is provided, get availability data
    if (scheduleId || journeyDate) {
      // First get the schedule if date is provided but not scheduleId
      let scheduleIdToUse = scheduleId;
      
      if (!scheduleIdToUse && journeyDate) {
        const scheduleResult = await query(
          'SELECT schedule_id FROM SCHEDULE WHERE train_id = ? AND journey_date = ?',
          [trainId, journeyDate]
        );
        
        if (Array.isArray(scheduleResult) && scheduleResult.length > 0) {
          scheduleIdToUse = (scheduleResult[0] as any).schedule_id;
        }
      }
      
      if (scheduleIdToUse) {
        // For each class, get detailed booking statistics from journeys for this schedule
        const journeysData = await query(
          `SELECT j.class_id, 
            COUNT(DISTINCT j.journey_id) as total_journeys,
            COUNT(DISTINCT t.ticket_id) as total_tickets,
            COUNT(DISTINCT pt.passenger_id) as total_passengers,
            COUNT(CASE WHEN pt.status = 'CONFIRMED' THEN 1 END) as confirmed_seats,
            COUNT(CASE WHEN pt.status = 'RAC' THEN 1 END) as rac_seats,
            COUNT(CASE WHEN pt.status = 'WAITLISTED' THEN 1 END) as waitlisted_seats,
            MAX(CASE WHEN pt.status = 'WAITLISTED' THEN pt.waitlist_number ELSE 0 END) as last_waitlist,
            (SELECT COUNT(*) FROM CANCELLATION c JOIN TICKET t2 ON c.ticket_id = t2.ticket_id
            JOIN JOURNEY j2 ON t2.journey_id = j2.journey_id
            WHERE j2.schedule_id = j.schedule_id AND j2.class_id = j.class_id) as cancellations,
            SUM(t.total_fare) as total_revenue
          FROM JOURNEY j
          LEFT JOIN TICKET t ON j.journey_id = t.journey_id
          LEFT JOIN PASSENGER_TICKET pt ON t.ticket_id = pt.ticket_id
          WHERE j.schedule_id = ?
          GROUP BY j.class_id`,
          [scheduleIdToUse]
        );
        
        // Get additional data about RAC and Waitlist status
        const racWaitlistData = await query(
          `SELECT j.class_id,
            r.current_rac_number, r.max_rac,
            w.current_waitlist_number, w.max_waitlist
          FROM JOURNEY j 
          JOIN RAC r ON j.journey_id = r.journey_id
          JOIN WAITLIST w ON j.journey_id = w.journey_id
          WHERE j.schedule_id = ?`,
          [scheduleIdToUse]
        );
        
        // Custom query to get historical booking trends
        const historicalData = await query(
          `SELECT j.class_id,
            COUNT(CASE WHEN DATE(s.journey_date) = CURRENT_DATE() THEN 1 END) as bookings_today,
            COUNT(CASE WHEN DATE(s.journey_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) THEN 1 END) as bookings_week,
            COUNT(CASE WHEN DATE(s.journey_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) THEN 1 END) as bookings_month,
            AVG(t.total_fare) as avg_fare
          FROM JOURNEY j
          JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
          JOIN TICKET t ON j.journey_id = t.journey_id
          WHERE s.train_id = ?
          GROUP BY j.class_id`,
          [trainId]
        );
        
        // Map journey data to class configurations
        if (Array.isArray(journeysData) && journeysData.length > 0) {
          classDetails = classDetails.map(classConfig => {
            const journeyData = journeysData.find(j => (j as any).class_id === (classConfig as any).class_id);
            const racWaitlist = Array.isArray(racWaitlistData) 
              ? racWaitlistData.find(r => (r as any).class_id === (classConfig as any).class_id)
              : null;
            const historical = Array.isArray(historicalData)
              ? historicalData.find(h => (h as any).class_id === (classConfig as any).class_id)
              : null;
            
            if (journeyData) {
              const totalSeats = (classConfig as any).total_seats;
              const confirmedSeats = (journeyData as any).confirmed_seats || 0;
              const availableSeats = Math.max(0, totalSeats - confirmedSeats);
              const occupancyRate = totalSeats > 0 ? (confirmedSeats / totalSeats) * 100 : 0;
              
              return {
                ...classConfig,
                booking_stats: {
                  total_journeys: (journeyData as any).total_journeys || 0,
                  total_tickets: (journeyData as any).total_tickets || 0,
                  total_passengers: (journeyData as any).total_passengers || 0,
                  bookings_today: historical ? (historical as any).bookings_today || 0 : 0,
                  bookings_week: historical ? (historical as any).bookings_week || 0 : 0,
                  bookings_month: historical ? (historical as any).bookings_month || 0 : 0,
                },
                seat_stats: {
                  total_seats: totalSeats,
                  confirmed_seats: confirmedSeats,
                  available_seats: availableSeats,
                  rac_seats: (journeyData as any).rac_seats || 0,
                  waitlisted_seats: (journeyData as any).waitlisted_seats || 0,
                  cancellations: (journeyData as any).cancellations || 0,
                  last_waitlist: (journeyData as any).last_waitlist || 0,
                  current_rac: racWaitlist ? (racWaitlist as any).current_rac_number : 1,
                  max_rac: racWaitlist ? (racWaitlist as any).max_rac : 20,
                  current_waitlist: racWaitlist ? (racWaitlist as any).current_waitlist_number : 1,
                  max_waitlist: racWaitlist ? (racWaitlist as any).max_waitlist : 50,
                  occupancy_rate: occupancyRate.toFixed(2) + '%'
                },
                revenue_stats: {
                  total_revenue: (journeyData as any).total_revenue || 0,
                  avg_fare: historical ? (historical as any).avg_fare || 0 : 0,
                  revenue_per_seat: totalSeats > 0 ? ((journeyData as any).total_revenue || 0) / totalSeats : 0
                }
              };
            }
            
            return {
              ...classConfig,
              booking_stats: {
                total_journeys: 0,
                total_tickets: 0,
                total_passengers: 0,
                bookings_today: 0,
                bookings_week: 0,
                bookings_month: 0
              },
              seat_stats: {
                total_seats: (classConfig as any).total_seats,
                confirmed_seats: 0,
                available_seats: (classConfig as any).total_seats,
                rac_seats: 0,
                waitlisted_seats: 0,
                cancellations: 0,
                last_waitlist: 0,
                current_rac: 1,
                max_rac: 20,
                current_waitlist: 1,
                max_waitlist: 50,
                occupancy_rate: '0.00%'
              },
              revenue_stats: {
                total_revenue: 0,
                avg_fare: 0,
                revenue_per_seat: 0
              }
            };
          });
        }
      }
    }
    
    // 4. Calculate fare details for each class
    const routeData = await query(
      `SELECT 
         MIN(rs.distance_from_source) as min_distance,
         MAX(rs.distance_from_source) as max_distance,
         COUNT(DISTINCT rs.station_id) as station_count
       FROM ROUTE_SEGMENT rs 
       WHERE rs.train_id = ?`,
      [trainId]
    );
    
    if (Array.isArray(routeData) && routeData.length > 0) {
      const minDistance = (routeData[0] as any).min_distance || 0;
      const maxDistance = (routeData[0] as any).max_distance || 0;
      const journeyDistance = maxDistance - minDistance;
      const stationCount = (routeData[0] as any).station_count || 0;
      
      classDetails = classDetails.map(classConfig => {
        const farePerKm = (classConfig as any).fare_per_km || 0;
        const baseFare = farePerKm * journeyDistance;
        const serviceCharge = Math.round(baseFare * 0.05); // 5% service charge
        const gst = Math.round(baseFare * 0.12); // 12% GST
        const totalFare = Math.round(baseFare + serviceCharge + gst);
        
        return {
          ...classConfig,
          fare_details: {
            journey_distance_km: journeyDistance,
            stations_count: stationCount,
            fare_per_km: farePerKm,
            base_fare: Math.round(baseFare),
            service_charge: serviceCharge,
            gst: gst,
            total_fare: totalFare
          }
        };
      });
    }
    
    // 5. Add peak demand information based on historical data
    const peakDemandData = await query(
      `SELECT 
         j.class_id,
         DAYNAME(s.journey_date) as peak_day,
         COUNT(*) as booking_count
       FROM JOURNEY j
       JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
       JOIN TICKET t ON j.journey_id = t.journey_id
       WHERE s.train_id = ?
       GROUP BY j.class_id, DAYNAME(s.journey_date)
       ORDER BY booking_count DESC`,
      [trainId]
    );
    
    if (Array.isArray(peakDemandData) && peakDemandData.length > 0) {
      // Group by class_id to find peak day for each class
      const peaksByClass: Record<number, any> = {};
      peakDemandData.forEach(peak => {
        const classId = (peak as any).class_id;
        if (!peaksByClass[classId] || (peaksByClass[classId].booking_count < (peak as any).booking_count)) {
          peaksByClass[classId] = peak;
        }
      });
      
      classDetails = classDetails.map(classConfig => {
        const peakData = peaksByClass[(classConfig as any).class_id];
        
        return {
          ...classConfig,
          demand_info: peakData ? {
            peak_day: (peakData as any).peak_day,
            peak_booking_count: (peakData as any).booking_count
          } : null
        };
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        train: trainData[0],
        class_details: classDetails
      }
    });
  } catch (error) {
    console.error('Error fetching class details:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 