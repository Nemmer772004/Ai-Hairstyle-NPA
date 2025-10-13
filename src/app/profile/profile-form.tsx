'use client';

import { useActionState, useEffect, useState } from 'react';
import Image from 'next/image';
import type { UserProfile } from '@/models/User';
import { updateProfileAction, type ProfileActionState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { hairGoalLabels } from '@/lib/validation';

type ProfileFormProps = {
  profile?: UserProfile;
  username: string;
  email: string;
};

const initialState: ProfileActionState = {};

export function ProfileForm({ profile, username, email }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | undefined>(profile?.avatarUrl ?? undefined);

  useEffect(() => {
    if (state?.error) {
      toast({ variant: 'destructive', title: 'Lỗi', description: state.error });
    } else if (state?.success) {
      toast({ title: 'Thành công', description: state.success });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="grid gap-6">
      <div className="grid gap-2">
        <Label>Tên đăng nhập</Label>
        <Input value={username} disabled />
      </div>
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div className="grid gap-2 md:grid-cols-2 md:items-center md:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="displayName">Tên hiển thị</Label>
          <Input
            id="displayName"
            name="displayName"
            defaultValue={profile?.displayName ?? ''}
            placeholder="Tên mà mọi người nhìn thấy"
            required
          />
          {state?.fieldErrors?.displayName ? (
            <p className="text-sm text-destructive">{state.fieldErrors.displayName}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="age">Tuổi</Label>
          <Input
            id="age"
            name="age"
            type="number"
            min={13}
            max={120}
            defaultValue={profile?.age ?? ''}
            required
          />
          {state?.fieldErrors?.age ? (
            <p className="text-sm text-destructive">{state.fieldErrors.age}</p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2 md:w-1/3">
        <Label htmlFor="gender">Giới tính</Label>
        <select
          id="gender"
          name="gender"
          defaultValue={profile?.gender ?? 'prefer-not-to-say'}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="female">Nữ</option>
          <option value="male">Nam</option>
          <option value="non-binary">Phi nhị giới</option>
          <option value="other">Khác</option>
          <option value="prefer-not-to-say">Không tiết lộ</option>
        </select>
      </div>
      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="avatarUrl">Ảnh đại diện (URL)</Label>
          <Input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            defaultValue={profile?.avatarUrl?.startsWith('http') ? profile.avatarUrl : ''}
            placeholder="https://..."
          />
          {state?.fieldErrors?.avatarUrl ? (
            <p className="text-sm text-destructive">{state.fieldErrors.avatarUrl}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="avatarFile">Hoặc tải ảnh</Label>
          <Input
            id="avatarFile"
            name="avatarFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Mục tiêu chăm sóc tóc</Label>
        <div className="grid gap-2 md:grid-cols-2">
          {Object.entries(hairGoalLabels).map(([value, label]) => {
            const checked = profile?.hairGoals?.includes(value);
            return (
              <label key={value} className="flex items-center gap-2 text-sm">
                <Checkbox name="hairGoals" value={value} defaultChecked={checked} />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Chọn tối đa các mục tiêu phù hợp để cá nhân hóa gợi ý kiểu tóc và sản phẩm.
        </p>
      </div>
      {preview ? (
        <div className="flex items-center gap-4">
          <Image
            src={preview}
            alt="Avatar preview"
            width={96}
            height={96}
            className="rounded-full object-cover border"
          />
          <span className="text-sm text-muted-foreground">Ảnh xem trước</span>
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="bio">Giới thiệu</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile?.bio ?? ''}
          placeholder="Chia sẻ thêm về phong cách hoặc sở thích tóc của bạn..."
          rows={5}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Đang lưu...' : 'Lưu hồ sơ'}
      </Button>
    </form>
  );
}
