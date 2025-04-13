import { NextRequest, NextResponse } from 'next/server';
import * as dbFunctions from '@/lib/db-functions';

/**
 * GET: Handle various rail system function requests
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'pnr_status': {
        const pnr = searchParams.get('pnr');
        if (!pnr) {
          return NextResponse.json(
            { success: false, error: 'Missing PNR parameter' },
            { status: 400 }
          );
        }
        const status = await dbFunctions.getPnrStatus(pnr);
        return NextResponse.json({ success: true, data: status });
      }

      case 'train_schedule': {
        const trainId = searchParams.get('train_id');
        if (!trainId) {
          return NextResponse.json(
            { success: false, error: 'Missing train_id parameter' },
            { status: 400 }
          );
        }
        const schedule = await dbFunctions.getTrainSchedule(trainId);
        return NextResponse.json({ success: true, data: schedule });
      }

      case 'available_seats': {
        const journeyId = searchParams.get('journey_id');
        const classId = searchParams.get('class_id');
        if (!journeyId || !classId) {
          return NextResponse.json(
            { success: false, error: 'Missing journey_id or class_id parameter' },
            { status: 400 }
          );
        }
        const seats = await dbFunctions.getAvailableSeats(parseInt(journeyId), parseInt(classId));
        return NextResponse.json({ success: true, data: seats });
      }

      case 'train_passengers': {
        const trainId = searchParams.get('train_id');
        const journeyDate = searchParams.get('journey_date');
        if (!trainId || !journeyDate) {
          return NextResponse.json(
            { success: false, error: 'Missing train_id or journey_date parameter' },
            { status: 400 }
          );
        }
        const passengers = await dbFunctions.listTrainPassengers(parseInt(trainId), journeyDate);
        return NextResponse.json({ success: true, data: passengers });
      }

      case 'waitlisted_passengers': {
        const trainId = searchParams.get('train_id');
        const journeyDate = searchParams.get('journey_date');
        if (!trainId || !journeyDate) {
          return NextResponse.json(
            { success: false, error: 'Missing train_id or journey_date parameter' },
            { status: 400 }
          );
        }
        const waitlisted = await dbFunctions.getWaitlistedPassengers(parseInt(trainId), journeyDate);
        return NextResponse.json({ success: true, data: waitlisted });
      }

      case 'refund_amount': {
        const scheduleId = searchParams.get('schedule_id');
        if (!scheduleId) {
          return NextResponse.json(
            { success: false, error: 'Missing schedule_id parameter' },
            { status: 400 }
          );
        }
        const refundAmount = await dbFunctions.calculateRefundAmount(parseInt(scheduleId));
        return NextResponse.json({ success: true, data: { refund_amount: refundAmount } });
      }

      case 'revenue': {
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        if (!startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'Missing start_date or end_date parameter' },
            { status: 400 }
          );
        }
        const revenue = await dbFunctions.calculateRevenue(startDate, endDate);
        return NextResponse.json({ success: true, data: { revenue } });
      }

      case 'cancellation_records': {
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        if (!startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'Missing start_date or end_date parameter' },
            { status: 400 }
          );
        }
        const records = await dbFunctions.getCancellationRecords(startDate, endDate);
        return NextResponse.json({ success: true, data: records });
      }

      case 'busiest_route': {
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        if (!startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'Missing start_date or end_date parameter' },
            { status: 400 }
          );
        }
        const route = await dbFunctions.getBusiestRoute(startDate, endDate);
        return NextResponse.json({ success: true, data: route });
      }

      case 'itemized_bill': {
        const ticketId = searchParams.get('ticket_id');
        if (!ticketId) {
          return NextResponse.json(
            { success: false, error: 'Missing ticket_id parameter' },
            { status: 400 }
          );
        }
        const bill = await dbFunctions.generateItemizedBill(parseInt(ticketId));
        return NextResponse.json({ success: true, data: bill });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in rail functions API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Handle rail system functions that modify data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'cancel_train': {
        const { schedule_id, reason } = body;
        if (!schedule_id) {
          return NextResponse.json(
            { success: false, error: 'Missing schedule_id parameter' },
            { status: 400 }
          );
        }
        await dbFunctions.cancelTrainSchedule(schedule_id, reason || 'Operational reasons');
        
        // Calculate refund amount for the cancelled train
        const refundAmount = await dbFunctions.calculateRefundAmount(schedule_id);
        
        return NextResponse.json({ 
          success: true, 
          data: { 
            message: 'Train cancelled successfully',
            refund_amount: refundAmount
          } 
        });
      }

      case 'cancel_ticket': {
        const { ticket_id, reason } = body;
        if (!ticket_id) {
          return NextResponse.json(
            { success: false, error: 'Missing ticket_id parameter' },
            { status: 400 }
          );
        }
        await dbFunctions.cancelTicket(ticket_id, reason || 'Cancelled by user');
        return NextResponse.json({ 
          success: true, 
          data: { message: 'Ticket cancelled successfully' } 
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in rail functions API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 