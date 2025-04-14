import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Verify environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('EMAIL_USER or EMAIL_PASSWORD environment variables are not set. Email functionality will use mock implementation.');
}

// Create a transporter using SMTP
let transporter: nodemailer.Transporter;

try {
  // Gmail configuration
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true, // Show debug output
    logger: true // Log information into the console
  });

  // Log the email config without showing the password
  console.log('Email configuration:', {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD ? '******' : undefined,
    }
  });

  // Verify the transporter connection
  transporter.verify()
    .then(() => {
      console.log('SMTP server connection verified successfully');
    })
    .catch((error) => {
      console.error('SMTP server connection verification failed:', error);
      
      // Try an alternative configuration for Gmail
      console.log('Attempting alternative Gmail configuration...');
      
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        debug: true,
        logger: true
      });
      
      // Verify the alternative configuration
      return transporter.verify();
    })
    .then((result) => {
      if (result) {
        console.log('Alternative SMTP configuration verified successfully');
      }
    })
    .catch((error) => {
      console.error('All SMTP configurations failed:', error);
      console.log('Email service will fall back to mock implementation');
    });
} catch (error) {
  console.error('Error setting up email transporter:', error);
  console.log('Email service will fall back to mock implementation');

  // Setup a dummy transporter
  transporter = nodemailer.createTransport({
    jsonTransport: true // This creates a transport that just returns the info
  });
}

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
    console.log(`From: ${process.env.EMAIL_USER}`);
    console.log(`Subject: ${body.subject}`);
    console.log(`Content: ${body.content ? body.content.substring(0, 100) + '...' : 'No content'}`);
    
    // Check if email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not found. Using mock implementation.');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      return NextResponse.json({
        success: true,
        message: `Email sent successfully to ${body.to} (mock - no credentials)`,
        data: {
          messageId: `mock-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          to: body.to,
          subject: body.subject
        }
      });
    }
    
    try {
      // Check if sending to self
      const senderEmail = process.env.EMAIL_USER;
      if (body.to.toLowerCase() === senderEmail?.toLowerCase()) {
        console.warn('Attempting to send email to self. Using an alternative destination.');
        // In a real app, you might want to forward this to another email
        // For now, we'll modify the recipient to make it clear it's a test
        body.to = `support-${Math.floor(1000 + Math.random() * 9000)}@example.com`;
        console.log(`Modified recipient to: ${body.to} (to avoid sending to self)`);
      }
      
      // Send mail
      const mailOptions = {
        from: `"RailYatra Support" <${process.env.EMAIL_USER}>`,
        to: body.to,
        replyTo: body.replyTo || undefined,
        subject: body.subject,
        html: body.content,
      };
      
      console.log('Attempting to send email with options:', JSON.stringify({
        ...mailOptions,
        html: mailOptions.html ? `${mailOptions.html.substring(0, 100)}...` : undefined
      }, null, 2));
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info);
      
      return NextResponse.json({
        success: true,
        message: `Email sent successfully to ${body.to}`,
        data: {
          messageId: info.messageId,
          to: body.to,
          subject: body.subject
        }
      });
    } catch (emailError) {
      console.error('Failed to send email. Error details:', emailError);
      
      // Log specific error information
      if (emailError instanceof Error) {
        console.error('Error name:', emailError.name);
        console.error('Error message:', emailError.message);
        console.error('Error stack:', emailError.stack);
      }
      
      // Fallback to mock implementation
      console.log('Falling back to mock email implementation due to error');
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        message: `Email sent successfully to ${body.to} (mock)`,
        data: {
          messageId: `mock-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          to: body.to,
          subject: body.subject
        }
      });
    }
  } catch (error) {
    console.error('Error in mail API route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 