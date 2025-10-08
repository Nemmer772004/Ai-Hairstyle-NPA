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
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Register</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <span className="hidden md:inline">Welcome, {user.username}!</span>
      <form action={logoutAction} className="inline">
        <Button type="submit">Logout</Button>
      </form>
    </>
  );
}
