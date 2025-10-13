'use client';

import { useActionState } from 'react';
import { registerAction, type AuthFormState } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthFormState = {};

export function RegisterForm() {
  const action = async (state: AuthFormState, formData: FormData) => {
    const result = await registerAction(state, formData);
    return result;
  };

  const [state, formAction, isPending] = useActionState(
    action,
    initialState
  );

  const currentState = state ?? initialState;

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="username">Tên người dùng</Label>
        <Input id="username" name="username" placeholder="nguyenvana" required />
        {currentState.fieldErrors?.username ? (
          <p className="text-sm text-destructive">
            {currentState.fieldErrors.username}
          </p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ban@example.com"
          required
        />
        {currentState.fieldErrors?.email ? (
          <p className="text-sm text-destructive">
            {currentState.fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" required />
        {currentState.fieldErrors?.password ? (
          <p className="text-sm text-destructive">
            {currentState.fieldErrors.password}
          </p>
        ) : null}
      </div>
      {currentState.error ? (
        <p className="text-sm text-destructive text-center">
          {currentState.error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        Tạo tài khoản
      </Button>
    </form>
  );
}
