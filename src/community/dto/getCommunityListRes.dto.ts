export class GetCommunityListResDto {
  communityList: Community[];
  totalCount: number;
  totalPage: number;
  currentPage: number;
}

class Community {
  id: number;
  title: string;
  views: number;
  likes: number;
  createdAt: Date;
  authorNickname: string;
  category: string;
}
