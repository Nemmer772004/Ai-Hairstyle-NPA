import mongoose from 'mongoose';
import CommunityPostModel from '@/models/CommunityPost';
import CommunityCommentModel from '@/models/CommunityComment';
import { compressDataUri } from '@/lib/image';
import { extractTagsFromText } from '@/lib/tags';

export async function shareCommunityPost(input: {
  userId: mongoose.Types.ObjectId | string;
  imageDataUri: string;
  description?: string;
  hairstyleId?: string;
  isPublic?: boolean;
}) {
  const compressed = await compressDataUri(input.imageDataUri, 640);
  const thumbnail = await compressDataUri(input.imageDataUri, 320);
  const tags = extractTagsFromText(`${input.description ?? ''}`);

  return CommunityPostModel.create({
    userId: input.userId,
    isPublic: Boolean(input.isPublic),
    imageUrl: compressed,
    thumbnailUrl: thumbnail,
    description: input.description,
    hairstyleId: input.hairstyleId,
    tags,
  });
}

export async function listPublicPosts(limit = 20) {
  return CommunityPostModel.find({ isPublic: true, isHidden: false })
    .select('thumbnailUrl imageUrl description reactionsCount commentsCount createdAt userId tags')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function reactToPost(
  postId: string,
  userId: mongoose.Types.ObjectId | string,
  reactionType = 'like'
) {
  const reactionField = 'reactions.$.userIds';
  const post = await CommunityPostModel.findOneAndUpdate(
    {
      _id: postId,
      isHidden: false,
      'reactions.type': reactionType,
    },
    {
      $addToSet: { [reactionField]: userId },
      $inc: { reactionsCount: 1 },
      $push: {
        interactionHistory: {
          userId,
          type: reactionType,
          at: new Date(),
        },
      },
    },
    { new: true }
  );

  if (post) {
    return post;
  }

  return CommunityPostModel.findOneAndUpdate(
    { _id: postId, isHidden: false },
    {
      $push: {
        reactions: {
          type: reactionType,
          userIds: [userId],
        },
        interactionHistory: {
          userId,
          type: reactionType,
          at: new Date(),
        },
      },
      $inc: { reactionsCount: 1 },
    },
    { new: true }
  );
}

export async function addCommentToPost(input: {
  postId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  authorName: string;
  content: string;
}) {
  const comment = await CommunityCommentModel.create({
    postId: input.postId,
    userId: input.userId,
    authorName: input.authorName,
    content: input.content,
  });

  await CommunityPostModel.updateOne(
    { _id: input.postId, isHidden: false },
    {
      $inc: { commentsCount: 1 },
      $push: {
        interactionHistory: {
          userId: input.userId,
          type: 'comment',
          at: new Date(),
          content: input.content.slice(0, 140),
        },
      },
    }
  );

  return comment;
}

export async function listCommentsForPost(
  postId: mongoose.Types.ObjectId | string,
  limit = 20
) {
  return CommunityCommentModel.find({ postId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
