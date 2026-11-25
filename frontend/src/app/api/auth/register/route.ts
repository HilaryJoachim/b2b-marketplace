import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, companyName, country, phone } = body;

    if (!email || !companyName || !country || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Generate a verification token with user details
    const token = jwt.sign(
      { email, companyName, country, phone, plan: 'STARTER_TRIAL' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 2. Setup nodemailer transport using environment variables
    // For local dev without env vars, this will fail or we can use ethereal email
    // but the user requested real SMTP.
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP Credentials missing. Check .env.local');
      // For development purposes, if credentials are missing, we still succeed so UI works
      // but log a warning. You can remove this fallback for strict production behavior.
      return NextResponse.json({ message: 'Registration received, but SMTP is not configured.', simulated: true });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3. Construct the verification link
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyLink = `${origin}/verify-email?token=${token}`;

    // 4. Send the email
    await transporter.sendMail({
      from: `"KifaruTrade" <${process.env.SMTP_USER}>`, // sender address
      to: email, // list of receivers
      subject: "Verify your KifaruTrade Seller Account", // Subject line
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #002d1b;">Welcome to KifaruTrade!</h2>
          <p>Hi ${companyName},</p>
          <p>Thank you for registering. You are just one step away from starting your <strong>31-day Starter Trial</strong> and reaching global buyers.</p>
          <p>Please click the button below to verify your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #f36a1b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email & Activate Account</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 12px;">${verifyLink}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });

  } catch (error: any) {
    console.error('Registration/Email error:', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
