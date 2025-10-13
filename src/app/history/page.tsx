import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getHistorySummary } from '@/lib/history';
import { HistoryClient } from './history-client';

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const summary = await getHistorySummary(user.id, 30);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Nhật ký kiểu tóc</h1>
        <p className="text-muted-foreground">
          Theo dõi các lần thử nghiệm, ghi chú cảm nhận và xem lại các phân tích của AI.
        </p>
      </div>
      <HistoryClient
        summary={summary.map(item => ({
          _id: item._id.toString(),
          summary: item.summary ?? undefined,
          hairstyleName: item.hairstyleName ?? undefined,
          createdAt: item.createdAt?.toString() ?? new Date().toISOString(),
          details: {
            compatibilityLabel: item.details?.compatibilityLabel ?? undefined,
            productSuggestions:
              item.details?.productSuggestions
                ?.filter(product => !!product?.name)
                .map(product => ({ name: product!.name })),
          },
          stats: { rating: item.stats?.rating ?? undefined },
        }))}
      />
    </div>
  );
}
