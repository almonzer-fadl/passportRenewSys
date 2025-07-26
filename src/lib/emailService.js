import nodemailer from 'nodemailer';

// Create transporter (for development, we'll use a mock transporter)
const createTransporter = () => {
  // Check if email configuration is available
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Mock transporter for development
    console.warn('Email configuration not found, using mock email service');
    return {
      sendMail: async (options) => {
        console.log('📧 Mock Email Sent:', {
          to: options.to,
          subject: options.subject,
          text: options.text?.substring(0, 100) + '...',
        });
        return { messageId: 'mock-message-id' };
      },
    };
  }
};

// Email templates
const emailTemplates = {
  applicationConfirmation: (data) => ({
    subject: `Application Confirmation - ${data.applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Sudan Passport Renewal System</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Republic of Sudan - Ministry of Interior</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1e40af;">Application Confirmation</h2>
          
          <p>Dear ${data.fullName},</p>
          
          <p>Your passport renewal application has been successfully submitted and is now under review.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Application Details</h3>
            <p><strong>Application Number:</strong> ${data.applicationNumber}</p>
            <p><strong>Application Type:</strong> ${data.applicationType}</p>
            <p><strong>Processing Speed:</strong> ${data.processingType}</p>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <h3 style="color: #1e40af;">Next Steps</h3>
          <ol>
            <li>Your application will be reviewed within 2-3 business days</li>
            <li>You'll receive an email notification once the review is complete</li>
            <li>If approved, you'll be notified to complete payment</li>
            <li>Schedule your biometric appointment at the passport office</li>
            <li>Collect your new passport when ready</li>
          </ol>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Important:</strong> Please keep this application number safe. You'll need it to track your application status.</p>
          </div>
          
          <p>You can track your application status by logging into your account at any time.</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>
          Sudan Passport Renewal System</p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `
      Sudan Passport Renewal System - Application Confirmation
      
      Dear ${data.fullName},
      
      Your passport renewal application has been successfully submitted and is now under review.
      
      Application Details:
      - Application Number: ${data.applicationNumber}
      - Application Type: ${data.applicationType}
      - Processing Speed: ${data.processingType}
      - Submission Date: ${new Date().toLocaleDateString()}
      
      Next Steps:
      1. Your application will be reviewed within 2-3 business days
      2. You'll receive an email notification once the review is complete
      3. If approved, you'll be notified to complete payment
      4. Schedule your biometric appointment at the passport office
      5. Collect your new passport when ready
      
      Important: Please keep this application number safe. You'll need it to track your application status.
      
      You can track your application status by logging into your account at any time.
      
      If you have any questions, please contact our support team.
      
      Best regards,
      Sudan Passport Renewal System
    `,
  }),

  statusUpdate: (data) => ({
    subject: `Application Status Update - ${data.applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Sudan Passport Renewal System</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Republic of Sudan - Ministry of Interior</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1e40af;">Application Status Update</h2>
          
          <p>Dear ${data.fullName},</p>
          
          <p>Your passport renewal application status has been updated.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Application Details</h3>
            <p><strong>Application Number:</strong> ${data.applicationNumber}</p>
            <p><strong>New Status:</strong> <span style="color: ${data.status === 'approved' ? '#059669' : data.status === 'rejected' ? '#dc2626' : '#1e40af'}">${data.status.toUpperCase()}</span></p>
            <p><strong>Updated Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>
          
          ${data.status === 'approved' ? `
            <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">🎉 Application Approved!</h3>
              <p>Your application has been approved. Please complete the payment to proceed with passport processing.</p>
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Complete payment through your dashboard</li>
                <li>Schedule biometric appointment</li>
                <li>Visit passport office for biometric collection</li>
                <li>Collect your new passport</li>
              </ol>
            </div>
          ` : data.status === 'rejected' ? `
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">❌ Application Rejected</h3>
              <p>Your application has been rejected. Please review the notes above and submit a new application with corrected information.</p>
            </div>
          ` : `
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Application Under Review</h3>
              <p>Your application is currently being reviewed by our team. We'll notify you once the review is complete.</p>
            </div>
          `}
          
          <p>You can track your application status by logging into your account at any time.</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>
          Sudan Passport Renewal System</p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `
      Sudan Passport Renewal System - Application Status Update
      
      Dear ${data.fullName},
      
      Your passport renewal application status has been updated.
      
      Application Details:
      - Application Number: ${data.applicationNumber}
      - New Status: ${data.status.toUpperCase()}
      - Updated Date: ${new Date().toLocaleDateString()}
      ${data.notes ? `- Notes: ${data.notes}` : ''}
      
      ${data.status === 'approved' ? `
      🎉 Application Approved!
      Your application has been approved. Please complete the payment to proceed with passport processing.
      
      Next Steps:
      1. Complete payment through your dashboard
      2. Schedule biometric appointment
      3. Visit passport office for biometric collection
      4. Collect your new passport
      ` : data.status === 'rejected' ? `
      ❌ Application Rejected
      Your application has been rejected. Please review the notes above and submit a new application with corrected information.
      ` : `
      Application Under Review
      Your application is currently being reviewed by our team. We'll notify you once the review is complete.
      `}
      
      You can track your application status by logging into your account at any time.
      
      If you have any questions, please contact our support team.
      
      Best regards,
      Sudan Passport Renewal System
    `,
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset Request - Sudan Passport System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Sudan Passport Renewal System</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Republic of Sudan - Ministry of Interior</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1e40af;">Password Reset Request</h2>
          
          <p>Dear ${data.fullName},</p>
          
          <p>We received a request to reset your password for your Sudan Passport Renewal System account.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <a href="${data.resetUrl}" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          
          <p><strong>Reset Link:</strong> <a href="${data.resetUrl}">${data.resetUrl}</a></p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.</p>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>
          Sudan Passport Renewal System</p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `
      Sudan Passport Renewal System - Password Reset Request
      
      Dear ${data.fullName},
      
      We received a request to reset your password for your Sudan Passport Renewal System account.
      
      Reset Link: ${data.resetUrl}
      
      Important: This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
      
      If you have any questions, please contact our support team.
      
      Best regards,
      Sudan Passport Renewal System
    `,
  }),
};

// Email service functions
export const emailService = {
  // Send application confirmation email
  async sendApplicationConfirmation(userData, applicationData) {
    const transporter = createTransporter();
    const template = emailTemplates.applicationConfirmation({
      fullName: `${userData.firstName} ${userData.lastName}`,
      applicationNumber: applicationData.applicationNumber,
      applicationType: applicationData.applicationType,
      processingType: applicationData.processingType,
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@passport.gov.sd',
        to: userData.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      
      console.log('✅ Application confirmation email sent to:', userData.email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send application confirmation email:', error);
      return false;
    }
  },

  // Send status update email
  async sendStatusUpdate(userData, applicationData, status, notes = '') {
    const transporter = createTransporter();
    const template = emailTemplates.statusUpdate({
      fullName: `${userData.firstName} ${userData.lastName}`,
      applicationNumber: applicationData.applicationNumber,
      status,
      notes,
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@passport.gov.sd',
        to: userData.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      
      console.log('✅ Status update email sent to:', userData.email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send status update email:', error);
      return false;
    }
  },

  // Send password reset email
  async sendPasswordReset(userData, resetToken) {
    const transporter = createTransporter();
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    const template = emailTemplates.passwordReset({
      fullName: `${userData.firstName} ${userData.lastName}`,
      resetUrl,
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@passport.gov.sd',
        to: userData.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      
      console.log('✅ Password reset email sent to:', userData.email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  },

  // Send welcome email for new users
  async sendWelcomeEmail(userData) {
    const transporter = createTransporter();
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@passport.gov.sd',
        to: userData.email,
        subject: 'Welcome to Sudan Passport Renewal System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Sudan Passport Renewal System</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Republic of Sudan - Ministry of Interior</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8fafc;">
              <h2 style="color: #1e40af;">Welcome!</h2>
              
              <p>Dear ${userData.firstName} ${userData.lastName},</p>
              
              <p>Welcome to the Sudan Passport Renewal System! Your account has been successfully created.</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Account Details</h3>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Account Created:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>You can now:</p>
              <ul>
                <li>Start a new passport renewal application</li>
                <li>Track existing applications</li>
                <li>Update your profile information</li>
                <li>View application history</li>
              </ul>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>
              Sudan Passport Renewal System</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `,
        text: `
          Sudan Passport Renewal System - Welcome!
          
          Dear ${userData.firstName} ${userData.lastName},
          
          Welcome to the Sudan Passport Renewal System! Your account has been successfully created.
          
          Account Details:
          - Email: ${userData.email}
          - Account Created: ${new Date().toLocaleDateString()}
          
          You can now:
          - Start a new passport renewal application
          - Track existing applications
          - Update your profile information
          - View application history
          
          If you have any questions, please contact our support team.
          
          Best regards,
          Sudan Passport Renewal System
        `,
      });
      
      console.log('✅ Welcome email sent to:', userData.email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  },
};

export default emailService; 