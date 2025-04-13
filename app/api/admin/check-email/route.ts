import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    // Create a test transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify the connection
    await transporter.verify();
    
    return NextResponse.json({ status: "up" });
  } catch (error) {
    console.error("Email service check failed:", error);
    return NextResponse.json({ status: "down" });
  }
} 