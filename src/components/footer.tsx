import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto py-6 px-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AI Hairstyle Studio. All rights reserved.</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <p>Images are deleted after 24h for your privacy.</p>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
