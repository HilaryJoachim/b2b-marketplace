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

    // 4. Send the email with both Plain Text and Transactional HTML
    const currentYear = new Date().getFullYear();

    await transporter.sendMail({
      from: `"KifaruTrade" <${process.env.SMTP_USER}>`,
      replyTo: `"KifaruTrade Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Confirm your email address - KifaruTrade",
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
      text: `Hi ${companyName},\n\nThank you for registering your business with KifaruTrade.\n\nPlease confirm your email address by opening the link below to set your password and activate your account:\n\n${verifyLink}\n\nThis verification link is valid for 24 hours.\n\nIf you did not create an account on KifaruTrade, you can safely ignore this email.\n\nBest regards,\nThe KifaruTrade Team\nsupport@kifarutrade.com`,
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your email address</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f7f9fa; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background-color: #002d1b; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">KifaruTrade</h1>
              <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.7); font-size: 13px;">B2B Marketplace</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 32px 28px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #002d1b; font-size: 18px; font-weight: 700;">Confirm your email address</h2>
              <p style="margin: 0 0 14px 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                Hi <strong>${companyName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                Thank you for registering with KifaruTrade. Please click the button below to verify your email address, choose your password, and activate your seller profile:
              </p>
              
              <!-- Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyLink}" target="_blank" style="display: inline-block; background-color: #f36a1b; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; text-align: center;">
                      Verify Email &amp; Activate Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 8px 0; color: #718096; font-size: 13px; line-height: 1.5;">
                If the button above does not open, copy and paste this link into your web browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.4; word-break: break-all;">
                <a href="${verifyLink}" style="color: #f36a1b; text-decoration: underline;">${verifyLink}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #edf2f7; margin: 24px 0;" />
              <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
                This link will expire in 24 hours. If you did not sign up for a KifaruTrade account, you can safely ignore this message.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #edf2f7; text-align: center;">
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                &copy; ${currentYear} KifaruTrade. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });

  } catch (error: any) {
    console.error('Registration/Email error:', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
