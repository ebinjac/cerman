import nodemailer from 'nodemailer';

interface EmailTemplate {
  subject: string;
  html: string;
}

const createExpiringCertificateTemplate = (
  certificateName: string,
  expiryDate: string,
  daysUntilExpiry: number
): EmailTemplate => ({
  subject: `Certificate Expiry Alert: ${certificateName}`,
  html: `
    <h2>Certificate Expiry Alert</h2>
    <p>The certificate <strong>${certificateName}</strong> will expire in ${daysUntilExpiry} days.</p>
    <p>Expiry Date: ${expiryDate}</p>
    <p>Please take necessary action to renew this certificate.</p>
  `,
});

const createExpiringServiceIdTemplate = (
  serviceId: string,
  expiryDate: string,
  daysUntilExpiry: number
): EmailTemplate => ({
  subject: `Service ID Expiry Alert: ${serviceId}`,
  html: `
    <h2>Service ID Expiry Alert</h2>
    <p>The Service ID <strong>${serviceId}</strong> will expire in ${daysUntilExpiry} days.</p>
    <p>Expiry Date: ${expiryDate}</p>
    <p>Please take necessary action to renew this service ID.</p>
  `,
});

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  } : undefined,
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
      throw new Error('SMTP configuration is missing. Please check your environment variables.');
    }

    console.log('SMTP Configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      from: process.env.SMTP_FROM,
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    };

    console.log('Sending email with options:', mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export async function sendTestEmail(to: string): Promise<void> {
  const subject = 'Test Email from Notification System';
  const html = `
    <h2>Test Email</h2>
    <p>This is a test email from the notification system.</p>
    <p>If you received this, the email service is working correctly.</p>
  `;
  
  await sendEmail(to, subject, html);
} 