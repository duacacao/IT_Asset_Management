import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/jwt';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, password } = body;

    // Validate credentials (still hardcoded for now, but server-side check)
    if (email === 'admin' && password === 'admin') {
        const user = { username: 'admin', role: 'admin' };

        // Create JWT
        const token = await signJWT(user);

        const response = NextResponse.json({ success: true });

        // Set HttpOnly Cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
}
