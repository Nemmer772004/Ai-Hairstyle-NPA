import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getHistoryDetails } from '@/lib/history';

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const history = await getHistoryDetails(user.id, id);
  if (!history) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(history);
}
