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
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  const params = searchParams ? await searchParams : undefined;

  const registered = params?.registered ? true : false;
  const logout = params?.logout ? true : false;

  const successMessage = registered
    ? 'Tạo tài khoản thành công. Vui lòng đăng nhập.'
    : logout
      ? 'Bạn đã đăng xuất.'
      : undefined;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Đăng nhập</CardTitle>
          <CardDescription>Nhập email của bạn để truy cập tài khoản.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <LoginForm successMessage={successMessage} />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="underline text-primary hover:text-primary/80">
              Đăng ký ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
