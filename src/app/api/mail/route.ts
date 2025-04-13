import { NextRequest, NextResponse } from 'next/server';

// This is a mock email service for demonstration
// In production, you would integrate with a real email provider like SendGrid, Mailgun, etc.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.to || !body.subject) {
      return NextResponse.json(
        { success: false, error: 'Email recipient and subject are required' },
        { status: 400 }
      );
    }
    
    console.log('Sending email with the following details:');
    console.log(`To: ${body.to}`);
    console.log(`Subject: ${body.subject}`);
    console.log(`Content: ${body.content ? body.content.substring(0, 100) + '...' : 'No content'}`);
    
    // In a real implementation, you would call your email service provider's API here
    // For example, with SendGrid:
    // await sendgrid.send({
    //   to: body.to,
    //   from: 'tickets@railyatra.com',
    //   subject: body.subject,
    //   html: body.content,
    // });
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${body.to}`,
      data: {
        messageId: `mock-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        to: body.to,
        subject: body.subject
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 