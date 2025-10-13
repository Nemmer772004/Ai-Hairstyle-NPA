import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import UserModel from '@/models/User';
import UserNotificationModel from '@/models/UserNotification';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  updateSettingsSilentAction,
  requestDataDeletionSilentAction,
  toggleTwoFactorSilentAction,
} from './actions';

const notificationTypeLabels: Record<string, string> = {
  reward: 'Phần thưởng',
  reminder: 'Nhắc nhở',
  system: 'Hệ thống',
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [record, notifications] = await Promise.all([
    UserModel.findById(user.id).select('settings email username stats').lean(),
    UserNotificationModel.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Cài đặt &amp; Quyền riêng tư</h1>
        <p className="text-muted-foreground">
          Quản lý tuỳ chọn chia sẻ, bảo mật và quyền riêng tư của bạn.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Tuỳ chọn chung</CardTitle>
          <CardDescription>
            Chúng tôi sử dụng các tuỳ chọn này để tối ưu gợi ý và trải nghiệm cộng đồng của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={updateSettingsSilentAction} className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="allowPublicSharing"
                defaultChecked={record?.settings?.allowPublicSharing ?? false}
                className="h-4 w-4"
              />
              <span className="text-sm text-foreground">Cho phép chia sẻ công khai các kết quả của tôi</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="emailNotifications"
                defaultChecked={record?.settings?.emailNotifications ?? true}
                className="h-4 w-4"
              />
              <span className="text-sm text-foreground">Nhận thông báo qua email về điểm thưởng và gợi ý mới</span>
            </label>
            <Button type="submit">Lưu cài đặt</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Bảo mật</CardTitle>
          <CardDescription>
            Bật xác thực hai bước để bảo vệ tài khoản tốt hơn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={toggleTwoFactorSilentAction} className="flex items-center gap-4">
            <input type="hidden" name="enable" value={record?.settings?.twoFactorEnabled ? 'false' : 'true'} />
            <Button type="submit" variant={record?.settings?.twoFactorEnabled ? 'outline' : 'default'}>
              {record?.settings?.twoFactorEnabled ? 'Tắt xác thực hai bước' : 'Bật xác thực hai bước'}
            </Button>
            {record?.settings?.twoFactorEnabled ? (
              <span className="text-sm text-muted-foreground">
                Đã bật 2FA. Dùng mã đã lưu trong ứng dụng xác minh của bạn.
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Chúng tôi sẽ cung cấp mã bí mật để bạn thêm vào ứng dụng xác minh.
              </span>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-destructive">Quyền riêng tư</CardTitle>
          <CardDescription className="text-destructive/80">
            Yêu cầu xoá dữ liệu cá nhân nếu bạn không muốn chúng tôi lưu trữ lịch sử, yêu thích và bài chia sẻ nữa.
          </CardDescription>
        </CardHeader>
        <Separator className="bg-destructive/20" />
        <CardFooter>
          <form action={requestDataDeletionSilentAction} className="flex flex-col gap-2">
            <Button type="submit" variant="destructive">
              Yêu cầu xoá dữ liệu sau 30 ngày
            </Button>
            <span className="text-xs text-muted-foreground">
              Tất cả dữ liệu sẽ được ẩn ngay lập tức và xoá vĩnh viễn sau 30 ngày theo chính sách.
            </span>
          </form>
        </CardFooter>
      </Card>

      {notifications.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline">Thông báo gần đây</CardTitle>
            <CardDescription>
              Nhắc nhở, huy hiệu và mã bảo mật gần đây sẽ xuất hiện tại đây.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map(note => (
              <div key={note._id.toString()} className="rounded-md border bg-muted/40 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    {notificationTypeLabels[note.type] ?? note.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.createdAt ?? Date.now()).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground">{note.message}</p>
                {note.metadata?.secret ? (
                  <p className="mt-1 text-xs font-mono text-primary">
                    Mã 2FA: {note.metadata.secret}
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
