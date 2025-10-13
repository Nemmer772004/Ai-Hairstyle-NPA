import Link from 'next/link';
import { logoutAction } from '@/app/auth/actions';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export async function AuthButtons() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Button variant="ghost" asChild>
          <Link href="/login">Đăng nhập</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Đăng ký</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <span className="hidden md:inline whitespace-nowrap">Xin chào, {user.username}!</span>
      <form action={logoutAction} className="inline">
        <Button type="submit">Đăng xuất</Button>
      </form>
    </>
  );
}
