import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { getCurrentUser } from '@/lib/auth';

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  const registered = searchParams?.registered ? true : false;
  const logout = searchParams?.logout ? true : false;

  const successMessage = registered
    ? 'Account created successfully. Please sign in.'
    : logout
      ? 'You have been signed out.'
      : undefined;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <LoginForm successMessage={successMessage} />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline text-primary hover:text-primary/80">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
