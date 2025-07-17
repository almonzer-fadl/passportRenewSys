// Mock email service for development
// In production, this would integrate with services like SendGrid, AWS SES, etc.

class EmailService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@passport.gov.sd';
    this.appName = 'Sudan Passport System';
  }

  // Send email (mock implementation)
  async sendEmail({ to, subject, html, text }) {
    if (this.isProduction) {
      // In production, integrate with real email service
      throw new Error('Email service not configured for production');
    } else {
      // Mock email sending for development
      console.log('\n📧 EMAIL SENT (MOCK):');
      console.log('═'.repeat(50));
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`From: ${this.fromEmail}`);
      console.log('─'.repeat(30));
      console.log(text || 'No text version provided');
      console.log('═'.repeat(50));
      
      return {
        success: true,
        messageId: `mock_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Application submission confirmation
  async sendApplicationSubmissionEmail(application, user) {
    const subject = `Application Submitted - ${application.application_number}`;
    
    const text = `
Dear ${user.first_name} ${user.last_name},

Your passport application has been successfully submitted.

Application Details:
- Application Number: ${application.application_number}
- Type: ${application.application_type}
- Processing Speed: ${application.processing_speed}
- Status: ${application.status}
- Submitted: ${new Date(application.created_at).toLocaleDateString()}

What's Next:
1. Your application is being reviewed by our team
2. You will receive updates via email as your application progresses
3. Expected processing time: ${application.processing_speed === 'express' ? '5-7 business days' : '10-15 business days'}

Important Information:
- Keep your application number for reference: ${application.application_number}
- You can check your application status online anytime
- Ensure your contact information is up to date

If you have any questions, please contact us at support@passport.gov.sd

Best regards,
Sudan Passport Office Team
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1e40af; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .application-number { font-size: 24px; font-weight: bold; color: #1e40af; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Application Submitted Successfully</h1>
        </div>
        <div class="content">
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>Your passport application has been successfully submitted.</p>
            
            <div class="details">
                <h3>Application Details</h3>
                <p><strong>Application Number:</strong> <span class="application-number">${application.application_number}</span></p>
                <p><strong>Type:</strong> ${application.application_type}</p>
                <p><strong>Processing Speed:</strong> ${application.processing_speed}</p>
                <p><strong>Status:</strong> ${application.status}</p>
                <p><strong>Submitted:</strong> ${new Date(application.created_at).toLocaleDateString()}</p>
            </div>

            <h3>What's Next:</h3>
            <ol>
                <li>Your application is being reviewed by our team</li>
                <li>You will receive updates via email as your application progresses</li>
                <li>Expected processing time: <strong>${application.processing_speed === 'express' ? '5-7 business days' : '10-15 business days'}</strong></li>
            </ol>

            <div class="details">
                <h3>Important Information</h3>
                <ul>
                    <li>Keep your application number for reference: <strong>${application.application_number}</strong></li>
                    <li>You can check your application status online anytime</li>
                    <li>Ensure your contact information is up to date</li>
                </ul>
            </div>
        </div>
        <div class="footer">
            <p>If you have any questions, please contact us at support@passport.gov.sd</p>
            <p>Best regards,<br>Sudan Passport Office Team</p>
        </div>
    </div>
</body>
</html>
`;

    return this.sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  }

  // Application status update notification
  async sendStatusUpdateEmail(application, user, oldStatus, newStatus) {
    const subject = `Application Update - ${application.application_number}`;
    
    const statusMessages = {
      'under_review': 'Your application is now under review by our team.',
      'approved': 'Congratulations! Your application has been approved.',
      'rejected': 'We regret to inform you that your application has been rejected.',
      'completed': 'Your passport is ready for collection!'
    };

    const nextSteps = {
      'under_review': 'Our team is reviewing your documents. No action required from your side.',
      'approved': 'Your passport will be processed and you will be notified when ready for collection.',
      'rejected': 'Please check the notes for reasons and resubmit if necessary.',
      'completed': 'Please visit our office with your ID to collect your passport.'
    };

    const text = `
Dear ${user.first_name} ${user.last_name},

Your passport application status has been updated.

Application Number: ${application.application_number}
Previous Status: ${oldStatus}
New Status: ${newStatus}

${statusMessages[newStatus] || 'Your application status has been updated.'}

Next Steps:
${nextSteps[newStatus] || 'Please check your application dashboard for more details.'}

You can always check your application status online using your application number.

Best regards,
Sudan Passport Office Team
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-update { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1e40af; }
        .status { font-size: 18px; font-weight: bold; padding: 5px 10px; border-radius: 5px; }
        .status.approved { background: #dcfce7; color: #166534; }
        .status.rejected { background: #fef2f2; color: #dc2626; }
        .status.under_review { background: #fef3c7; color: #d97706; }
        .status.completed { background: #dbeafe; color: #1d4ed8; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Application Status Update</h1>
        </div>
        <div class="content">
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>Your passport application status has been updated.</p>
            
            <div class="status-update">
                <h3>Application Number: ${application.application_number}</h3>
                <p><strong>Previous Status:</strong> <span class="status ${oldStatus}">${oldStatus}</span></p>
                <p><strong>New Status:</strong> <span class="status ${newStatus}">${newStatus}</span></p>
            </div>

            <p><strong>${statusMessages[newStatus] || 'Your application status has been updated.'}</strong></p>

            <h3>Next Steps:</h3>
            <p>${nextSteps[newStatus] || 'Please check your application dashboard for more details.'}</p>

            <p>You can always check your application status online using your application number.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>Sudan Passport Office Team</p>
        </div>
    </div>
</body>
</html>
`;

    return this.sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  }

  // Payment confirmation email
  async sendPaymentConfirmationEmail(application, user, payment) {
    const subject = `Payment Confirmation - ${application.application_number}`;
    
    const text = `
Dear ${user.first_name} ${user.last_name},

Your payment has been successfully processed.

Payment Details:
- Application Number: ${application.application_number}
- Payment ID: ${payment.paymentId}
- Transaction ID: ${payment.transactionId}
- Amount: $${payment.amount.toFixed(2)}
- Payment Method: ${payment.paymentMethod}
- Date: ${new Date(payment.processedAt).toLocaleDateString()}

Your application is now being processed. You will receive updates as your application progresses.

Best regards,
Sudan Passport Office Team
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .payment-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #16a34a; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .amount { font-size: 24px; font-weight: bold; color: #16a34a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Confirmed</h1>
        </div>
        <div class="content">
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>Your payment has been successfully processed.</p>
            
            <div class="payment-details">
                <h3>Payment Details</h3>
                <p><strong>Application Number:</strong> ${application.application_number}</p>
                <p><strong>Payment ID:</strong> ${payment.paymentId}</p>
                <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
                <p><strong>Amount:</strong> <span class="amount">$${payment.amount.toFixed(2)}</span></p>
                <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
                <p><strong>Date:</strong> ${new Date(payment.processedAt).toLocaleDateString()}</p>
            </div>

            <p>Your application is now being processed. You will receive updates as your application progresses.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>Sudan Passport Office Team</p>
        </div>
    </div>
</body>
</html>
`;

    return this.sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Sudan Passport System';
    
    const text = `
Dear ${user.first_name} ${user.last_name},

Welcome to the Sudan Passport System! Your account has been successfully created.

You can now:
- Apply for new passports
- Renew existing passports
- Replace lost or damaged passports
- Track your application status
- Update your personal information

Get started by visiting our website and logging in with your email address.

If you have any questions or need assistance, please don't hesitate to contact our support team at support@passport.gov.sd

Best regards,
Sudan Passport Office Team
`;

    return this.sendEmail({
      to: user.email,
      subject,
      text,
      html: `<p>Dear ${user.first_name},</p><p>Welcome to the Sudan Passport System!</p><p>Your account has been successfully created.</p>`
    });
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService; 