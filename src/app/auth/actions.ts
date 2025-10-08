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
    .string({ required_error: 'Username is required.' })
    .trim()
    .min(3, 'Username must be at least 3 characters long.')
    .max(32, 'Username must be at most 32 characters long.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters long.'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
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
      error: 'Please fix the errors below.',
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
      fieldErrors.email = 'Email is already registered.';
    }
    if (existingUser.username === username) {
      fieldErrors.username = 'Username is already taken.';
    }
    return {
      error: 'Account already exists.',
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
          'MongoDB is running on a case-insensitive filesystem. Rename the database to match "ai-hairstyle-pa" or drop the existing database before registering.',
      };
    }

    return {
      error: 'Failed to create account. Please try again.',
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
      error: 'Please fix the errors below.',
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
        error: 'Invalid email or password.',
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        error: 'Invalid email or password.',
      };
    }

    await createSession(user._id.toString());
  } catch (error) {
    console.error('loginAction error:', error);
    return {
      error: 'Unable to sign in right now. Please try again.',
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
