import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Send to the admin email
      subject: "Test Email from Cerman",
      text: "This is a test email to verify that the email service is working correctly.",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify that the email service is working correctly.</p>
        <p>If you received this email, the email service is properly configured and working.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Test email failed:", error);
    return NextResponse.json({ success: false, error: "Failed to send test email" }, { status: 500 });
  }
} 