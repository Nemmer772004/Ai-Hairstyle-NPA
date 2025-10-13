import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { getCachedUserProfile } from '@/lib/profile';
import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const profileData = await getCachedUserProfile(user.id);

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Card className="shadow-xl border border-border/60">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Hồ sơ cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin để nhận gợi ý chính xác hơn.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            username={user.username}
            email={user.email}
            profile={profileData?.profile ?? undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
