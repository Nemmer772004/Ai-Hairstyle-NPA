import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { getRecommendationsForUser } from '@/lib/recommendations';
import { hairstyles } from '@/lib/placeholder-images';
import { translateHairstyleCategory } from '@/lib/labels';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RecommendationActions } from './recommendation-actions';

export default async function RecommendationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const recommendations = await getRecommendationsForUser(user.id);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Gợi ý dành riêng cho bạn</h1>
        <p className="text-muted-foreground">
          Chúng tôi dựa trên hồ sơ, lịch sử và yêu thích của bạn để chọn ra những phong cách phù hợp nhất.
        </p>
      </div>
      {recommendations.length === 0 ? (
        <Card className="border-dashed border-muted-foreground/40 bg-muted/30">
          <CardContent className="py-10 text-center text-muted-foreground">
            Chưa có gợi ý nào. Hãy cập nhật hồ sơ và thêm một vài kiểu tóc yêu thích để hệ thống hiểu bạn hơn.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, index) => {
            const hairstyle = hairstyles.find(item => item.id === rec.hairstyleId);
            const imageUrl =
              hairstyle?.imageUrl ??
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80';
            return (
              <Card key={`${rec.hairstyleId}-${index}`} className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">{rec.hairstyleName}</CardTitle>
                  <CardDescription>
                    Điểm phù hợp: <span className="font-semibold text-primary">{Math.round(rec.score)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image src={imageUrl} alt={rec.hairstyleName} fill className="object-cover" />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="capitalize">
                      {translateHairstyleCategory(rec.category)}
                    </Badge>
                    {rec.tags.slice(0, 4).map(tag => (
                      <Badge key={tag} variant="outline">#{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
                <Separator />
                <CardFooter>
                  <RecommendationActions
                    hairstyleId={rec.hairstyleId}
                    hairstyleName={rec.hairstyleName}
                  />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
