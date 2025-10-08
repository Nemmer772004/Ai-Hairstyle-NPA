import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Scissors } from 'lucide-react';
import { AuthButtons } from './auth-buttons';
import { getCurrentUser } from '@/lib/auth';

export async function Header() {
  const user = await getCurrentUser();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/generator', label: 'Generator' },
    ...(user ? [{ href: '/history', label: 'History' }] : []),
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
            <AuthButtons />
        </div>
      </div>
    </header>
  );
}
