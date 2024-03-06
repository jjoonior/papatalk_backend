export class GetCommunityDetailResDto {
  id: number;
  title: string;
  content: string;
  category: string;
  views: number;
  likes: number;
  liked: boolean;
  authorId: number;
  authorNickname: string;
  createdAt: Date;
}
