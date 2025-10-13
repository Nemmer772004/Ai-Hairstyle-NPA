import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { listFavorites } from '@/lib/favorites';
import { hairstyles } from '@/lib/placeholder-images';
import { translateHairstyleCategory } from '@/lib/labels';
import { removeFavoriteSilentAction } from './actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const favorites = await listFavorites(user.id);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kiểu tóc yêu thích</h1>
        <p className="text-muted-foreground">
          Lưu lại phong cách bạn thích và truy cập nhanh khi cần thử lại.
        </p>
      </div>
      {favorites.length === 0 ? (
        <Card className="border-dashed border-muted-foreground/40 bg-muted/30">
          <CardContent className="py-10 text-center text-muted-foreground">
            Bạn chưa đánh dấu kiểu tóc nào. Hãy khám phá ở mục Generator và bấm “Yêu thích”.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map(fav => {
            const hairstyle = hairstyles.find(item => item.id === fav.hairstyleId);
            const imageUrl =
              hairstyle?.imageUrl ??
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&q=80';
            return (
              <Card key={fav._id.toString()} className="flex h-full flex-col">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg font-headline">{fav.hairstyleName ?? 'Kiểu tóc đã lưu'}</CardTitle>
                  <CardDescription>
                    {new Date(fav.createdAt ?? Date.now()).toLocaleString('vi-VN')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image src={imageUrl} alt={fav.hairstyleName ?? 'favorite hairstyle'} fill className="object-cover" />
                  </div>
                  {fav.tags?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {fav.tags.map(tag => (
                        <Badge key={tag} variant="secondary">#{tag}</Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {translateHairstyleCategory(fav.category)}
                  </Badge>
                  <form action={removeFavoriteSilentAction}>
                    <input type="hidden" name="hairstyleId" value={fav.hairstyleId} />
                    <Button type="submit" size="sm" variant="outline">
                      Ẩn khỏi danh sách
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
