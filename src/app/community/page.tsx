import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { getCommunityFeedAction, reactCommunitySilentAction } from './actions';
import { ShareForm } from './share-form';
import UserModel from '@/models/User';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { listCommentsForPost } from '@/lib/community';
import { CommentSection } from './comment-section';

export default async function CommunityPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [settingsRecord, feed] = await Promise.all([
    UserModel.findById(user.id).select('settings').lean(),
    getCommunityFeedAction(),
  ]);

  const feedWithComments = await Promise.all(
    feed.map(async post => {
      const postId = post._id?.toString?.();
      const commentsData = postId ? await listCommentsForPost(postId, 20) : [];
      return {
        post,
        comments: commentsData.map(comment => ({
          _id: comment._id.toString(),
          authorName: comment.authorName,
          content: comment.content,
          createdAt: comment.createdAt?.toISOString() ?? new Date().toISOString(),
        })),
      };
    })
  );

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8 px-4 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold font-headline">Cộng đồng Studio Tóc AI</h1>
          <p className="text-muted-foreground text-sm">
            Chia sẻ kết quả yêu thích và khám phá phong cách từ những người dùng khác.
          </p>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline">Chia sẻ kết quả</CardTitle>
              <CardDescription>
                Đăng tải ảnh để nhận phản hồi và truyền cảm hứng cho mọi người.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShareForm allowPublicSharing={Boolean(settingsRecord?.settings?.allowPublicSharing)} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {feedWithComments.length === 0 ? (
            <Card className="border-dashed border-muted-foreground/40 bg-muted/30">
              <CardContent className="py-12 text-center text-muted-foreground">
                Chưa có bài đăng nào. Hãy là người đầu tiên chia sẻ kết quả của mình!
              </CardContent>
            </Card>
          ) : (
            feedWithComments.map(({ post, comments }) => {
              const postId = post._id?.toString?.() ?? '';
              const commentCount = Math.max(post.commentsCount ?? 0, comments.length);
              return (
                <Card key={postId || post.thumbnailUrl} className="space-y-4">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg font-headline">Bài đăng từ cộng đồng</CardTitle>
                    <CardDescription>
                      {new Date(post.createdAt ?? Date.now()).toLocaleString('vi-VN')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative h-72 w-full overflow-hidden rounded-lg">
                      <Image
                        src={post.thumbnailUrl ?? post.imageUrl ?? ''}
                        alt={post.description ?? 'bài đăng cộng đồng'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {post.tags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="outline">#{tag}</Badge>
                        ))}
                      </div>
                    ) : null}
                    {post.description ? (
                      <p className="text-sm text-foreground">{post.description}</p>
                    ) : null}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <div className="flex w-full flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                      <span>
                        {post.reactionsCount ?? 0} cảm xúc • {commentCount} bình luận
                      </span>
                      <form action={reactCommunitySilentAction} className="flex items-center gap-2">
                        <input type="hidden" name="postId" value={postId} />
                        <Button type="submit" variant="outline" size="sm">
                          Thả tim
                        </Button>
                      </form>
                    </div>
                    <CommentSection postId={postId} initialComments={comments} />
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
