'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Scissors } from 'lucide-react';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // This is a mock login state. In a real app, this would come from a context or session.
  // We use useEffect to avoid hydration mismatch.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/generator', label: 'Generator' },
    ...(isLoggedIn ? [{ href: '/history', label: 'History' }] : []),
  ];

  const renderNavLinks = (isMobile = false) =>
    navLinks.map((link) => (
      <Button key={link.href} variant="ghost" asChild className={isMobile ? 'w-full justify-start' : ''}>
        <Link href={link.href}>{link.label}</Link>
      </Button>
    ));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <Scissors className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">AI Hairstyle Studio</span>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center space-x-2 px-4">
                <Scissors className="h-6 w-6 text-primary" />
                <span className="font-bold">AI Hairstyle Studio</span>
              </Link>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">{renderNavLinks(true)}</div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {renderNavLinks()}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {hasMounted && (
            isLoggedIn ? (
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
            )
          )}
        </div>
      </div>
    </header>
  );
}
