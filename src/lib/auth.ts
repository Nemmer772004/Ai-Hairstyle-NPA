import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import dbConnect from '@/lib/db';
import SessionModel, { type Session } from '@/models/Session';
import UserModel from '@/models/User';

const SESSION_COOKIE_NAME = 'sessionToken';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function createSession(userId: string) {
  await dbConnect();

  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await SessionModel.create({
    userId,
    token,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return { token, expiresAt };
}

export async function deleteSession(token?: string | null) {
  if (!token) {
    return;
  }

  await dbConnect();
  await SessionModel.deleteOne({ token });

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  await dbConnect();

  const session = await SessionModel.findOne({ token }).lean<Session>();
  if (!session) {
    // Clean up cookie if session not found
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await SessionModel.deleteOne({ token });
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  const user = await UserModel.findById(session.userId).select(
    'username email createdAt updatedAt'
  );

  if (!user) {
    await SessionModel.deleteOne({ token });
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
