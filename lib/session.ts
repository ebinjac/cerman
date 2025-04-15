// lib/session.ts
import { getIronSession, IronSessionData } from 'iron-session';

declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      username: string;
      groups: string[];
    };
  }
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'ldap-auth',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession(input: Request | string) {
    const res = new Response();
    
    // Handle cookie string case
    const req = typeof input === 'string' 
      ? new Request('http://localhost', { headers: { cookie: input } })
      : input;
  
    const session = await getIronSession<IronSessionData>(req, res, sessionOptions);
    return { session, res };
  }
export type Session = Awaited<ReturnType<typeof getSession>>['session'];