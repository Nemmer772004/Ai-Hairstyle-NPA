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
import { RegisterForm } from '@/components/auth/register-form';
import { getCurrentUser } from '@/lib/auth';

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Đăng ký</CardTitle>
          <CardDescription>Tạo tài khoản để lưu lại lịch sử kiểu tóc và sản phẩm yêu thích.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <RegisterForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            Đã có tài khoản?{' '}
            <Link href="/login" className="underline text-primary hover:text-primary/80">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
