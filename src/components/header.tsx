import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Scissors } from 'lucide-react';
import { AuthButtons } from './auth-buttons';
import { getCurrentUser } from '@/lib/auth';

export async function Header() {
  const user = await getCurrentUser();

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/generator', label: 'Trải nghiệm' },
    ...(user
      ? [
          { href: '/history', label: 'Nhật ký' },
          { href: '/favorites', label: 'Kiểu yêu thích' },
          { href: '/recommendations', label: 'Gợi ý kiểu tóc' },
          { href: '/community', label: 'Cộng đồng' },
          { href: '/profile', label: 'Hồ sơ' },
          { href: '/settings', label: 'Cài đặt' },
        ]
      : []),
  ];

  const renderNavLinks = (isMobile = false) =>
    navLinks.map((link) => (
      <Button
        key={link.href}
        variant="ghost"
        asChild
        className={isMobile ? 'w-full justify-start text-base' : 'text-sm font-medium'}
      >
        <Link href={link.href}>{link.label}</Link>
      </Button>
    ));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Mở menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <SheetHeader className="px-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Scissors className="h-6 w-6 text-primary" />
                    <span className="font-headline text-lg font-semibold">Studio Tóc AI</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                  <div className="flex flex-col space-y-3">{renderNavLinks(true)}</div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" className="hidden md:flex items-center gap-2">
            <Scissors className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Studio Tóc AI</span>
          </Link>

          <Link href="/" className="md:hidden flex items-center gap-2">
            <Scissors className="h-6 w-6 text-primary" />
            <span className="font-bold">Studio Tóc AI</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-4">
          {renderNavLinks()}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
