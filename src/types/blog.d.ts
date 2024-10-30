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
  toc: {
    level: number;
    title: string;
  }[];
  ver: {
    meta?: number;
    cont?: number;
    toc?: number;
  };
}

declare global {
  namespace Blog {
    namespace Post {
      type DBItem = Optional<_PostDataAll, 'cont' | 'toc'>;

      type Whole = Omit<_PostDataAll, 'id' | 'toc' | 'ver'>;

      type Meta = Omit<Whole, 'cont'>;

      type Toc = _PostDataAll['toc'];

      type VerRec = _PostDataAll['ver'];

      type VerKey = keyof VerRec;
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
