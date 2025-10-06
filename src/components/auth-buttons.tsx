
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // In a real app, you'd check a token or session from an auth provider.
    // We'll simulate this client-side check.
  }, []);

  if (!hasMounted) {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-10 w-24" />
        </div>
    )
  }

  return (
    <>
      {isLoggedIn ? (
        <>
          <span className="hidden md:inline">Welcome, User!</span>
          <Button onClick={() => setIsLoggedIn(false)}>Logout</Button>
        </>
      ) : (
        <>
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </>
      )}
    </>
  );
}
