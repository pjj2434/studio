// lib/email.ts
import nodemailer from 'nodemailer';

// Update the interface to handle nullable values
interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  packageName: string | null;  // Allow null
  date: string;
  startTime: string;
  endTime: string;
  price: number | null;        // Allow null
  duration: number;
  message?: string;
  adminNotes?: string;
}

// Add debugging
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true,
  logger: true
});

export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server connection successful');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
};

export const sendBookingRequestEmail = async (data: BookingEmailData) => {
  try {
    console.log('📧 Attempting to send booking request email...');
    
    // Handle null values with fallbacks
    const packageName = data.packageName || 'Unknown Package';
    const price = data.price || 0;
    
    console.log('Email data:', {
      to: [process.env.ADMIN_EMAIL, data.customerEmail],
      from: process.env.SMTP_FROM,
      packageName,
      price
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL environment variable is not set');
    }

    // Email to admin
    console.log('Sending email to admin...');
    const adminResult = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: adminEmail,
      subject: `New Booking Request - ${packageName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Booking Request</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Package:</strong> ${packageName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.startTime} - ${data.endTime} (${data.duration} hours)</p>
            <p><strong>Price:</strong> $${price}</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
          </div>
          
          <p>Please log in to your admin panel to approve or deny this request.</p>
        </div>
      `,
    });
    console.log('✅ Admin email sent:', adminResult.messageId);

    // Email to customer
    console.log('Sending email to customer...');
    const customerResult = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.customerEmail,
      subject: 'Booking Request Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Booking Request Received</h2>
          
          <p>Hi ${data.customerName},</p>
          
          <p>Thank you for your booking request! We've received your request and will review it shortly.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Booking Details</h3>
            <p><strong>Package:</strong> ${packageName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
            <p><strong>Duration:</strong> ${data.duration} hours</p>
            <p><strong>Price:</strong> $${price}</p>
          </div>
          
          <p>You'll receive another email once we've reviewed your request.</p>
          
          <p>Best regards,<br>Your Photography Team</p>
        </div>
      `,
    });
    console.log('✅ Customer email sent:', customerResult.messageId);

    return { success: true, adminMessageId: adminResult.messageId, customerMessageId: customerResult.messageId };
  } catch (error) {
    console.error('❌ Failed to send booking request email:', error);
    throw error;
  }
};

export const sendBookingApprovedEmail = async (data: BookingEmailData) => {
  try {
    console.log('📧 Sending booking approved email...');
    
    const packageName = data.packageName || 'Unknown Package';
    const price = data.price || 0;
    
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.customerEmail,
      subject: 'Booking Approved! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Booking Approved! 🎉</h2>
          
          <p>Hi ${data.customerName},</p>
          
          <p>Great news! Your booking request has been approved.</p>
          
          <div style="background: #dcfce7; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #15803d;">Confirmed Booking Details</h3>
            <p><strong>Package:</strong> ${packageName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
            <p><strong>Duration:</strong> ${data.duration} hours</p>
            <p><strong>Price:</strong> $${price}</p>
          </div>
          
          ${data.adminNotes ? `
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
              <h4 style="margin-top: 0;">Additional Notes:</h4>
              <p>${data.adminNotes}</p>
            </div>
          ` : ''}
          
          <p>We're looking forward to working with you! If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>Your Photography Team</p>
        </div>
      `,
    });
    console.log('✅ Approval email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Failed to send approval email:', error);
    throw error;
  }
};

export const sendBookingDeniedEmail = async (data: BookingEmailData) => {
  try {
    console.log('📧 Sending booking denied email...');
    
    const packageName = data.packageName || 'Unknown Package';
    
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.customerEmail,
      subject: 'Booking Request Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Booking Request Update</h2>
          
          <p>Hi ${data.customerName},</p>
          
          <p>Thank you for your interest in our services. Unfortunately, we're unable to accommodate your booking request at this time.</p>
          
          <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc2626;">Requested Booking Details</h3>
            <p><strong>Package:</strong> ${packageName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          </div>
          
          ${data.adminNotes ? `
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
              <h4 style="margin-top: 0;">Reason:</h4>
              <p>${data.adminNotes}</p>
            </div>
          ` : ''}
          
          <p>Please feel free to check our availability for other dates or contact us directly to discuss alternative options.</p>
          
          <p>Best regards,<br>Your Photography Team</p>
        </div>
      `,
    });
    console.log('✅ Denial email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Failed to send denial email:', error);
    throw error;
  }
};
