import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Here you would normally:
      // 1. Check if user already exists in Database
      // 2. Create the user if they don't exist
      // 3. Set their subscription plan to the one in the token (STARTER_TRIAL)
      // 4. Create a session or return auth cookies
      
      // Since we are mocking the DB, we just return success and the decoded data
      return NextResponse.json({ 
        success: true, 
        message: 'Email verified successfully',
        user: decoded 
      }, { status: 200 });

    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
