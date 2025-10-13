import { NextResponse } from 'next/server';
import { scheduleRetentionChecks } from '@/lib/rewards';

export async function GET() {
  await scheduleRetentionChecks();
  return NextResponse.json({ message: 'Retention check completed' });
}
