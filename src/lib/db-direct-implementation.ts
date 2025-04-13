import { query } from './db';
import { RowDataPacket } from 'mysql2';

/**
 * Get PNR status for a ticket
 * @param pnrNumber The PNR number to check
 */
export async function getPnrStatus(pnrNumber: string) {
  // This function directly queries ticket information without using MySQL function
  const ticketData = await query(`
    SELECT 
      t.ticket_id, 
      t.pnr_number,
      t.booking_status,
      tr.train_number,
      tr.train_name,
      s.journey_date,
      src.station_name as source_station,
      dest.station_name as destination_station,
      rs_src.standard_departure_time as departure_time,
      rs_dest.standard_arrival_time as arrival_time
    FROM TICKET t
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
    JOIN TRAIN tr ON s.train_id = tr.train_id
    JOIN STATION src ON j.source_station_id = src.station_id
    JOIN STATION dest ON j.destination_station_id = dest.station_id
    JOIN ROUTE_SEGMENT rs_src ON tr.train_id = rs_src.train_id AND j.source_station_id = rs_src.station_id
    JOIN ROUTE_SEGMENT rs_dest ON tr.train_id = rs_dest.train_id AND j.destination_station_id = rs_dest.station_id
    WHERE t.pnr_number = ?
  `, [pnrNumber]);

  if (!Array.isArray(ticketData) || ticketData.length === 0) {
    return null;
  }

  const ticket = ticketData[0] as RowDataPacket;
  
  // Get passenger details for the ticket
  const passengerData = await query(`
    SELECT 
      p.passenger_id,
      p.name,
      p.age,
      pt.seat_number,
      pt.berth_type,
      pt.status,
      pt.waitlist_number
    FROM PASSENGER_TICKET pt
    JOIN PASSENGER p ON pt.passenger_id = p.passenger_id
    WHERE pt.ticket_id = ?
  `, [ticket.ticket_id]);

  // Organize the data in the same format as the MySQL function would return
  return {
    ticket_id: ticket.ticket_id,
    pnr_number: ticket.pnr_number,
    booking_status: ticket.booking_status,
    journey_details: {
      train_number: ticket.train_number,
      train_name: ticket.train_name,
      journey_date: ticket.journey_date,
      source_station: ticket.source_station,
      destination_station: ticket.destination_station,
      departure_time: ticket.departure_time,
      arrival_time: ticket.arrival_time
    },
    passengers: Array.isArray(passengerData) ? passengerData : []
  };
}

/**
 * Get available seats for a journey and class
 * @param journeyId The journey ID
 * @param classId The class ID
 */
export async function getAvailableSeats(journeyId: number, classId: number) {
  // Get total seats
  const seatConfig = await query(`
    SELECT sc.total_seats
    FROM JOURNEY j
    JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
    JOIN SEAT_CONFIGURATION sc ON s.train_id = sc.train_id AND sc.class_id = ?
    WHERE j.journey_id = ?
  `, [classId, journeyId]);

  if (!Array.isArray(seatConfig) || seatConfig.length === 0) {
    return null;
  }

  const totalSeats = (seatConfig[0] as any).total_seats;

  // Get booked seats counts
  const bookedInfo = await query(`
    SELECT 
      COUNT(CASE WHEN pt.status = 'CONFIRMED' THEN 1 END) as confirmed_count,
      COUNT(CASE WHEN pt.status = 'WAITLISTED' THEN 1 END) as waitlisted_count,
      COUNT(CASE WHEN pt.status = 'RAC' THEN 1 END) as rac_count
    FROM PASSENGER_TICKET pt
    JOIN TICKET t ON pt.ticket_id = t.ticket_id
    WHERE t.journey_id = ?
    AND t.booking_status != 'Cancelled'
  `, [journeyId]);

  if (!Array.isArray(bookedInfo) || bookedInfo.length === 0) {
    return null;
  }

  const bookedSeats = (bookedInfo[0] as any).confirmed_count || 0;
  const waitlistedCount = (bookedInfo[0] as any).waitlisted_count || 0;
  const racCount = (bookedInfo[0] as any).rac_count || 0;
  const availableSeats = totalSeats - bookedSeats;

  return {
    journey_id: journeyId,
    class_id: classId,
    total_seats: totalSeats,
    booked_seats: bookedSeats,
    available_seats: availableSeats,
    rac_count: racCount,
    waitlisted_count: waitlistedCount
  };
}

/**
 * Calculate refund amount for cancelling a train
 * @param scheduleId The schedule ID of the train
 */
export async function calculateRefundAmount(scheduleId: number) {
  const result = await query(`
    SELECT SUM(t.total_fare) as total_refund
    FROM TICKET t
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    WHERE j.schedule_id = ?
    AND t.booking_status != 'Cancelled'
  `, [scheduleId]);

  if (Array.isArray(result) && result.length > 0) {
    return (result[0] as any).total_refund || 0;
  }
  return 0;
}

/**
 * Calculate total revenue over a period
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function calculateRevenue(startDate: string, endDate: string) {
  const result = await query(`
    SELECT SUM(t.total_fare) as total_revenue
    FROM TICKET t
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
    WHERE s.journey_date BETWEEN ? AND ?
    AND t.booking_status != 'Cancelled'
  `, [startDate, endDate]);

  if (Array.isArray(result) && result.length > 0) {
    return (result[0] as any).total_revenue || 0;
  }
  return 0;
}

/**
 * Generate an itemized bill for a ticket
 * @param ticketId The ticket ID
 */
export async function generateItemizedBill(ticketId: number) {
  // Get ticket and journey details
  const ticketDetails = await query(`
    SELECT 
      t.ticket_id,
      t.pnr_number,
      t.booking_date,
      t.total_fare,
      j.journey_id,
      s.journey_date,
      tr.train_number,
      tr.train_name,
      src.station_name as source_station,
      dest.station_name as destination_station,
      c.class_name,
      ABS(rs_dest.distance_from_source - rs_src.distance_from_source) as journey_distance,
      sc.fare_per_km
    FROM TICKET t
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
    JOIN TRAIN tr ON s.train_id = tr.train_id
    JOIN STATION src ON j.source_station_id = src.station_id
    JOIN STATION dest ON j.destination_station_id = dest.station_id
    JOIN CLASS c ON j.class_id = c.class_id
    JOIN SEAT_CONFIGURATION sc ON s.train_id = sc.train_id AND j.class_id = sc.class_id
    JOIN ROUTE_SEGMENT rs_src ON tr.train_id = rs_src.train_id AND j.source_station_id = rs_src.station_id
    JOIN ROUTE_SEGMENT rs_dest ON tr.train_id = rs_dest.train_id AND j.destination_station_id = rs_dest.station_id
    WHERE t.ticket_id = ?
  `, [ticketId]);

  if (!Array.isArray(ticketDetails) || ticketDetails.length === 0) {
    return null;
  }

  // Get passenger details
  const passengerDetails = await query(`
    SELECT 
      p.passenger_id,
      p.name,
      p.age,
      pt.seat_number,
      pt.berth_type,
      pt.status
    FROM PASSENGER_TICKET pt
    JOIN PASSENGER p ON pt.passenger_id = p.passenger_id
    WHERE pt.ticket_id = ?
  `, [ticketId]);

  const ticket = ticketDetails[0] as any;
  const passengerCount = Array.isArray(passengerDetails) ? passengerDetails.length : 0;
  const journeyDistance = ticket.journey_distance;
  
  // Calculate fare components
  const baseFare = Math.ceil(journeyDistance * ticket.fare_per_km * passengerCount);
  const reservationFee = 60.00 * passengerCount;
  const fuelSurcharge = baseFare * 0.05;
  const cateringCharges = journeyDistance > 500 ? 250.00 : 0;
  const superfastCharge = 75.00 * passengerCount;
  const gstAmount = (baseFare + reservationFee + fuelSurcharge + superfastCharge) * 0.05;
  const totalFare = baseFare + reservationFee + fuelSurcharge + cateringCharges + superfastCharge + gstAmount;

  return {
    ticket_id: ticket.ticket_id,
    pnr_number: ticket.pnr_number,
    booking_date: ticket.booking_date,
    journey_details: {
      train_number: ticket.train_number,
      train_name: ticket.train_name,
      journey_date: ticket.journey_date,
      source_station: ticket.source_station,
      destination_station: ticket.destination_station,
      class_name: ticket.class_name,
      journey_distance: journeyDistance
    },
    passenger_count: passengerCount,
    fare_details: {
      base_fare: baseFare,
      reservation_fee: reservationFee,
      fuel_surcharge: fuelSurcharge,
      catering_charges: cateringCharges,
      superfast_charge: superfastCharge,
      gst: gstAmount,
      total_fare: totalFare
    },
    passengers: passengerDetails
  };
}

/**
 * Find the busiest route based on passenger count
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function getBusiestRoute(startDate: string, endDate: string) {
  // Get the busiest route
  const routeInfo = await query(`
    SELECT 
      src.station_name as source_station,
      dest.station_name as destination_station,
      COUNT(pt.passenger_id) as passenger_count,
      COUNT(DISTINCT tr.train_id) as train_count,
      j.source_station_id,
      j.destination_station_id
    FROM PASSENGER_TICKET pt
    JOIN TICKET t ON pt.ticket_id = t.ticket_id
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
    JOIN TRAIN tr ON s.train_id = tr.train_id
    JOIN STATION src ON j.source_station_id = src.station_id
    JOIN STATION dest ON j.destination_station_id = dest.station_id
    WHERE s.journey_date BETWEEN ? AND ?
    AND t.booking_status != 'Cancelled'
    GROUP BY j.source_station_id, j.destination_station_id
    ORDER BY COUNT(pt.passenger_id) DESC
    LIMIT 1
  `, [startDate, endDate]);

  if (!Array.isArray(routeInfo) || routeInfo.length === 0) {
    return null;
  }

  const route = routeInfo[0] as any;

  // Find the most popular train for this route
  const popularTrain = await query(`
    SELECT 
      tr.train_id,
      tr.train_number,
      tr.train_name,
      COUNT(pt.passenger_id) as passenger_count
    FROM PASSENGER_TICKET pt
    JOIN TICKET t ON pt.ticket_id = t.ticket_id
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
    JOIN TRAIN tr ON s.train_id = tr.train_id
    WHERE j.source_station_id = ? AND j.destination_station_id = ?
    AND s.journey_date BETWEEN ? AND ?
    GROUP BY tr.train_id
    ORDER BY COUNT(pt.passenger_id) DESC
    LIMIT 1
  `, [route.source_station_id, route.destination_station_id, startDate, endDate]);

  return {
    source_station: route.source_station,
    destination_station: route.destination_station,
    passenger_count: route.passenger_count,
    train_count: route.train_count,
    most_popular_train: Array.isArray(popularTrain) && popularTrain.length > 0 
      ? popularTrain[0] 
      : null
  };
}

/**
 * Cancel a train and automatically mark tickets as cancelled
 * @param scheduleId The schedule ID
 */
export async function cancelTrainSchedule(scheduleId: number, reason: string = 'Operational reasons') {
  // Update schedule status
  await query(
    'UPDATE SCHEDULE SET status = ?, cancellation_reason = ? WHERE schedule_id = ?',
    ['Cancelled', reason, scheduleId]
  );

  // Mark all tickets as cancelled
  await query(`
    UPDATE TICKET t
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    SET t.booking_status = 'Cancelled', 
        t.cancellation_reason = 'Train cancelled by railways'
    WHERE j.schedule_id = ?
    AND t.booking_status != 'Cancelled'
  `, [scheduleId]);

  // Calculate refund amount
  return await calculateRefundAmount(scheduleId);
}

/**
 * List all passengers on a specific train for a given date
 * @param trainId The train ID
 * @param journeyDate The journey date (YYYY-MM-DD)
 */
export async function listTrainPassengers(trainId: number, journeyDate: string) {
  return await query(`
    SELECT 
      p.passenger_id,
      p.name,
      p.age,
      p.gender,
      p.contact_number,
      p.email,
      pt.seat_number,
      pt.berth_type,
      pt.status,
      c.class_name,
      c.class_code,
      t.pnr_number,
      j.journey_id,
      s.schedule_id,
      tr.train_number,
      tr.train_name,
      src.station_name as source_station,
      dst.station_name as destination_station
    FROM PASSENGER p
    JOIN PASSENGER_TICKET pt ON p.passenger_id = pt.passenger_id
    JOIN TICKET t ON pt.ticket_id = t.ticket_id
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
    JOIN TRAIN tr ON s.train_id = tr.train_id
    JOIN CLASS c ON j.class_id = c.class_id
    JOIN STATION src ON j.source_station_id = src.station_id
    JOIN STATION dst ON j.destination_station_id = dst.station_id
    WHERE tr.train_id = ?
    AND s.journey_date = ?
    AND t.booking_status != 'Cancelled'
    ORDER BY c.class_name, pt.seat_number
  `, [trainId, journeyDate]);
}

/**
 * Get all waitlisted passengers for a train
 * @param trainId The train ID
 * @param journeyDate The journey date (YYYY-MM-DD)
 */
export async function getWaitlistedPassengers(trainId: number, journeyDate: string) {
  return await query(`
    SELECT 
      p.passenger_id,
      p.name,
      p.age,
      p.gender,
      p.contact_number,
      p.email,
      pt.waitlist_number,
      c.class_name,
      c.class_code,
      t.pnr_number,
      j.journey_id,
      tr.train_number,
      tr.train_name,
      src.station_name as source_station,
      dst.station_name as destination_station
    FROM PASSENGER p
    JOIN PASSENGER_TICKET pt ON p.passenger_id = pt.passenger_id
    JOIN TICKET t ON pt.ticket_id = t.ticket_id
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
    JOIN TRAIN tr ON s.train_id = tr.train_id
    JOIN CLASS c ON j.class_id = c.class_id
    JOIN STATION src ON j.source_station_id = src.station_id
    JOIN STATION dst ON j.destination_station_id = dst.station_id
    WHERE tr.train_id = ?
    AND s.journey_date = ?
    AND pt.status = 'WAITLISTED'
    ORDER BY pt.waitlist_number
  `, [trainId, journeyDate]);
}

/**
 * Get train schedule for a given train
 * @param trainIdOrNumber The train ID or number
 */
export async function getTrainSchedule(trainIdOrNumber: string | number) {
  // Get train schedule
  const schedules = await query(`
    SELECT 
      s.schedule_id,
      s.journey_date,
      s.status,
      s.delay_time,
      t.train_id
    FROM SCHEDULE s
    JOIN TRAIN t ON s.train_id = t.train_id
    WHERE t.train_id = ? OR t.train_number = ?
  `, [trainIdOrNumber, trainIdOrNumber]);

  if (!Array.isArray(schedules) || schedules.length === 0) {
    return null;
  }

  // For each schedule, get the route stations
  const result = [];
  
  for (const schedule of schedules) {
    const routeStations = await query(`
      SELECT 
        st.station_id,
        st.station_name,
        st.station_code,
        rs.standard_arrival_time,
        rs.standard_departure_time,
        rs.distance_from_source,
        rs.sequence_number
      FROM ROUTE_SEGMENT rs
      JOIN STATION st ON rs.station_id = st.station_id
      WHERE rs.train_id = ?
      ORDER BY rs.sequence_number
    `, [(schedule as any).train_id]);

    result.push({
      schedule_id: (schedule as any).schedule_id,
      journey_date: (schedule as any).journey_date,
      status: (schedule as any).status,
      delay_time: (schedule as any).delay_time,
      route_stations: routeStations
    });
  }

  return result;
}

/**
 * Get cancellation records with refund status
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function getCancellationRecords(startDate: string, endDate: string) {
  return await query(`
    SELECT 
      t.ticket_id,
      t.pnr_number,
      t.booking_date,
      t.cancellation_date,
      t.booking_status,
      t.total_fare,
      t.refund_amount,
      t.cancellation_reason,
      tr.train_number,
      tr.train_name,
      s.journey_date,
      COUNT(pt.passenger_id) AS passenger_count
    FROM TICKET t
    JOIN JOURNEY j ON t.journey_id = j.journey_id
    JOIN SCHEDULE s ON j.schedule_id = s.schedule_id
    JOIN TRAIN tr ON s.train_id = tr.train_id
    JOIN PASSENGER_TICKET pt ON t.ticket_id = pt.ticket_id
    WHERE t.booking_status = 'Cancelled'
    AND t.cancellation_date BETWEEN ? AND ?
    GROUP BY t.ticket_id
    ORDER BY t.cancellation_date DESC
  `, [startDate, endDate]);
}

/**
 * Cancel a ticket and handle waitlist/RAC updates
 * @param ticketId The ticket ID
 * @param reason Cancellation reason
 */
export async function cancelTicket(ticketId: number, reason: string = 'Cancelled by user') {
  const cancellationDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // First get journey_id and confirmed passenger count
  const ticketInfo = await query(`
    SELECT t.journey_id,
           COUNT(CASE WHEN pt.status = 'CONFIRMED' THEN 1 END) AS confirmed_count,
           COUNT(CASE WHEN pt.status = 'RAC' THEN 1 END) AS rac_count
    FROM TICKET t
    JOIN PASSENGER_TICKET pt ON t.ticket_id = pt.ticket_id
    WHERE t.ticket_id = ?
    GROUP BY t.journey_id
  `, [ticketId]);
  
  if (!Array.isArray(ticketInfo) || ticketInfo.length === 0) {
    return false;
  }
  
  const journeyId = (ticketInfo[0] as any).journey_id;
  const confirmedCount = (ticketInfo[0] as any).confirmed_count || 0;
  const racCount = (ticketInfo[0] as any).rac_count || 0;
  
  // Update ticket status
  await query(
    'UPDATE TICKET SET booking_status = ?, cancellation_reason = ?, cancellation_date = ? WHERE ticket_id = ?',
    ['Cancelled', reason, cancellationDate, ticketId]
  );
  
  // Mark passenger tickets as cancelled
  await query(
    `UPDATE PASSENGER_TICKET SET status = 'CANCELLED' WHERE ticket_id = ?`,
    [ticketId]
  );
  
  // Promote RAC tickets to confirmed
  if (confirmedCount > 0) {
    await query(`
      UPDATE PASSENGER_TICKET pt
      JOIN TICKET t ON pt.ticket_id = t.ticket_id
      SET pt.status = 'CONFIRMED'
      WHERE t.journey_id = ?
      AND pt.status = 'RAC'
      ORDER BY pt.ticket_id
      LIMIT ?
    `, [journeyId, confirmedCount]);
  }
  
  // Promote waitlisted tickets to RAC
  if (racCount > 0 || confirmedCount > 0) {
    const promoteCount = racCount + confirmedCount;
    await query(`
      UPDATE PASSENGER_TICKET pt
      JOIN TICKET t ON pt.ticket_id = t.ticket_id
      SET pt.status = 'RAC'
      WHERE t.journey_id = ?
      AND pt.status = 'WAITLISTED'
      ORDER BY pt.waitlist_number
      LIMIT ?
    `, [journeyId, promoteCount]);
  }
  
  // Reorder waitlist numbers
  await query(`
    SET @row_number = 0;
    UPDATE PASSENGER_TICKET pt
    JOIN TICKET t ON pt.ticket_id = t.ticket_id
    SET pt.waitlist_number = (@row_number:=@row_number+1)
    WHERE t.journey_id = ?
    AND pt.status = 'WAITLISTED'
    ORDER BY pt.waitlist_number
  `, [journeyId]);
  
  return true;
} 