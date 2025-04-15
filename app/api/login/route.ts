import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/ldap';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  const { username, password } = await request.json();
  
  try {
    const user = await authenticateUser(username, password);
    const { session, res } = await getSession(request);
    
    session.user = {
      username: user.username,
      groups: user.groups
    };
    
    await session.save();
    
    return new NextResponse(
      JSON.stringify({ success: true }), 
      {
        status: 200,
        headers: res.headers
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}