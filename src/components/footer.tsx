import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto py-6 px-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Studio Tóc AI. Đã đăng ký bản quyền.</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <p>Ảnh sẽ được xoá sau 24 giờ để bảo vệ quyền riêng tư.</p>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Chính sách bảo mật
          </Link>
        </div>
      </div>
    </footer>
  );
}
