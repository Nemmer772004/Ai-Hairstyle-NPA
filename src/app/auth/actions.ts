'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import UserModel, { type User } from '@/models/User';
import {
  createSession,
  deleteSession,
  getSessionCookieName,
} from '@/lib/auth';

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<'username' | 'email' | 'password', string>>;
};

const registerSchema = z.object({
  username: z
    .string({ required_error: 'Vui lòng nhập tên người dùng.' })
    .trim()
    .min(3, 'Tên người dùng phải dài ít nhất 3 ký tự.')
    .max(32, 'Tên người dùng tối đa 32 ký tự.'),
  email: z
    .string({ required_error: 'Vui lòng nhập email.' })
    .trim()
    .toLowerCase()
    .email('Email không hợp lệ, vui lòng kiểm tra lại.'),
  password: z
    .string({ required_error: 'Vui lòng nhập mật khẩu.' })
    .min(8, 'Mật khẩu cần ít nhất 8 ký tự.'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng nhập email.' })
    .trim()
    .toLowerCase()
    .email('Email không hợp lệ, vui lòng kiểm tra lại.'),
  password: z
    .string({ required_error: 'Vui lòng nhập mật khẩu.' })
    .min(1, 'Mật khẩu không được bỏ trống.'),
});

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      error: 'Vui lòng kiểm tra lại thông tin.',
      fieldErrors: {
        username: fieldErrors.username?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const { username, email, password } = parsed.data;

  await dbConnect();

  const existingUser = await UserModel.findOne({
    $or: [{ email }, { username }],
  })
    .lean<User>()
    .exec();

  if (existingUser) {
    const fieldErrors: AuthFormState['fieldErrors'] = {};
    if (existingUser.email === email) {
      fieldErrors.email = 'Email này đã được đăng ký.';
    }
    if (existingUser.username === username) {
      fieldErrors.username = 'Tên người dùng đã được sử dụng.';
    }
    return {
      error: 'Tài khoản đã tồn tại.',
      fieldErrors,
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    console.error('registerAction create user error:', error);
    if (
      error instanceof Error &&
      error.message.includes('db already exists with different case')
    ) {
      return {
        error:
          'MongoDB đang hoạt động trên hệ thống tệp không phân biệt hoa thường. Hãy đổi tên hoặc xoá cơ sở dữ liệu trùng trước khi đăng ký.',
      };
    }

    return {
      error: 'Không thể tạo tài khoản, vui lòng thử lại.',
    };
  }

  redirect('/login?registered=1');
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      error: 'Vui lòng kiểm tra lại thông tin.',
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  try {
    await dbConnect();

    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return {
        error: 'Email hoặc mật khẩu không chính xác.',
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        error: 'Email hoặc mật khẩu không chính xác.',
      };
    }

    await createSession(user._id.toString());
  } catch (error) {
    console.error('loginAction error:', error);
    return {
      error: 'Hiện không thể đăng nhập, vui lòng thử lại sau.',
    };
  }

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  await deleteSession(token);
  redirect('/login');
}
