import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date') || getDateDaysAgo(30);
    const endDate = url.searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    
    console.log(`Fetching detailed revenue data from ${startDate} to ${endDate}`);
    
    const revenueData = await getDetailedRevenueStats(startDate, endDate);
    
    return NextResponse.json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch revenue data'
    }, { status: 500 });
  }
}

async function getDetailedRevenueStats(startDate: string, endDate: string) {
  try {
    // Get revenue summaries
    const summaryQuery = `
      SELECT 
        SUM(total_fare) as total_revenue,
        COUNT(*) as total_bookings,
        SUM(total_fare) / COUNT(*) as average_ticket_price
      FROM TICKET
      WHERE booking_status != 'Cancelled' 
      AND booking_date BETWEEN ? AND ?
    `;
    
    // Get revenue by class
    const revenueByClassQuery = `
      SELECT 
        c.class_name,
        SUM(t.total_fare) as revenue,
        COUNT(*) as bookings,
        SUM(t.total_fare) / COUNT(*) as average_fare
      FROM TICKET t
      JOIN JOURNEY j ON t.journey_id = j.journey_id
      JOIN CLASS c ON j.class_id = c.class_id
      WHERE t.booking_status != 'Cancelled'
      AND t.booking_date BETWEEN ? AND ?
      GROUP BY c.class_name
      ORDER BY revenue DESC
    `;
    
    // Get revenue trend (by day)
    const dailyTrendQuery = `
      SELECT 
        DATE(booking_date) as date,
        SUM(total_fare) as revenue,
        COUNT(*) as bookings
      FROM TICKET
      WHERE booking_status != 'Cancelled'
      AND booking_date BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date
    `;
    
    // Get revenue trend (by month)
    const monthlyTrendQuery = `
      SELECT 
        CONCAT(YEAR(booking_date), '-', MONTH(booking_date)) as month,
        SUM(total_fare) as revenue,
        COUNT(*) as bookings
      FROM TICKET
      WHERE booking_status != 'Cancelled'
      AND booking_date BETWEEN ? AND ?
      GROUP BY YEAR(booking_date), MONTH(booking_date)
      ORDER BY YEAR(booking_date), MONTH(booking_date)
    `;
    
    // Get top revenue routes
    const topRoutesQuery = `
      SELECT 
        CONCAT(src.station_name, ' - ', dst.station_name) as \`route\`,
        SUM(t.total_fare) as revenue,
        COUNT(*) as bookings,
        SUM(t.total_fare) / COUNT(*) as average_fare
      FROM TICKET t
      JOIN JOURNEY j ON t.journey_id = j.journey_id
      JOIN STATION src ON j.source_station_id = src.station_id
      JOIN STATION dst ON j.destination_station_id = dst.station_id
      WHERE t.booking_status != 'Cancelled'
      AND t.booking_date BETWEEN ? AND ?
      GROUP BY src.station_id, dst.station_id
      ORDER BY revenue DESC
      LIMIT 10
    `;
    
    // Get revenue by booking source
    const bookingSourceQuery = `
      SELECT 
        booking_type as source,
        SUM(total_fare) as revenue,
        COUNT(*) as bookings
      FROM TICKET
      WHERE booking_status != 'Cancelled'
      AND booking_date BETWEEN ? AND ?
      GROUP BY booking_type
      ORDER BY revenue DESC
    `;
    
    const [summaryResults, byClassResults, dailyResults, monthlyResults, topRoutesResults, bySourceResults] = await Promise.all([
      query(summaryQuery, [startDate, endDate]),
      query(revenueByClassQuery, [startDate, endDate]),
      query(dailyTrendQuery, [startDate, endDate]),
      query(monthlyTrendQuery, [startDate, endDate]),
      query(topRoutesQuery, [startDate, endDate]),
      query(bookingSourceQuery, [startDate, endDate])
    ]);
    
    const summary = (summaryResults as RowDataPacket[])[0] || {
      total_revenue: 0,
      total_bookings: 0,
      average_ticket_price: 0
    };
    
    const byClass = byClassResults as RowDataPacket[];
    const dailyTrend = dailyResults as RowDataPacket[];
    const monthlyTrend = monthlyResults as RowDataPacket[];
    const topRoutes = topRoutesResults as RowDataPacket[];
    const bySource = bySourceResults as RowDataPacket[];
    
    // Calculate year-over-year growth if possible
    let yoyGrowth = 0;
    if (monthlyTrend.length > 12) {
      const currentMonth = monthlyTrend[monthlyTrend.length - 1];
      const lastYearMonth = monthlyTrend.find(m => {
        const [currentYear, currentMonthNum] = currentMonth.month.split('-');
        const [year, monthNum] = m.month.split('-');
        return Number(year) === Number(currentYear) - 1 && Number(monthNum) === Number(currentMonthNum);
      });
      
      if (lastYearMonth && lastYearMonth.revenue > 0) {
        yoyGrowth = Math.round(((currentMonth.revenue - lastYearMonth.revenue) / lastYearMonth.revenue) * 100);
      }
    }
    
    return {
      summary: {
        ...summary,
        total_revenue: summary.total_revenue || 0,
        total_bookings: summary.total_bookings || 0,
        average_ticket_price: summary.average_ticket_price || 0,
        yoy_growth: yoyGrowth
      },
      by_class: byClass,
      daily_trend: dailyTrend,
      monthly_trend: monthlyTrend,
      top_routes: topRoutes,
      by_source: bySource
    };
  } catch (error) {
    console.error('Error getting detailed revenue stats:', error);
    return {
      summary: {
        total_revenue: 0,
        total_bookings: 0,
        average_ticket_price: 0,
        yoy_growth: 0
      },
      by_class: [],
      daily_trend: [],
      monthly_trend: [],
      top_routes: [],
      by_source: []
    };
  }
}

// Helper function to get date from n days ago
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
} 