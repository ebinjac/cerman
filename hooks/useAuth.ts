'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/session';
import { headers } from 'next/headers';

export function useAuth(redirectTo = '/login') {
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            const headersList = headers();
            const cookie = (await headersList).get('cookie') || '';
            const session = await getSession(cookie);
            if (!session?.session?.user) {
                router.push(redirectTo);
            }
        }

        checkAuth();
    }, [router, redirectTo]);
}