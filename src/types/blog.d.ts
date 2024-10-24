interface _PostDataAll {
  id: number;
  name: string;
  title: string;
  description: string;
  coverUrl: string;
  category: string;
  tag: string[];
  birthTime: string;
  mTime: string;
  cont: string;
  metaVer: number;
  contVer: number;
}

declare global {
  namespace Blog {
    namespace Post {
      type VerKey = 'metaVer' | 'contVer';

      type DBItem = Optional<_PostDataAll, 'cont' | 'contVer'>;

      type Whole = Omit<_PostDataAll, 'id' | VerKey>;

      type Meta = Omit<Whole, 'cont'>;
    }

    interface Pagination {
      mark: string;
      index: number;
      firstEntry: string;
      ver: number;
    }

    interface Stat {
      total: {
        post: number | undefined;
        cate: number | undefined;
        tag: number | undefined;
      };
      cate: Record<string, number>;
      tag: Record<string, number>;
    }

    interface FriendLink {
      name: string;
      tagline: string;
      url: string;
      logo: string;
      color: string;
    }
  }
}

export {};
