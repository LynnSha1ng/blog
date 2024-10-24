import type { Collection, InsertType, PromiseExtended } from 'dexie';
import type { ResponseWithCancelFn } from '@/utils/tool';

import { db } from '@/plugins/db';
import {
  randomIntInRange,
  localStorageUtils,
  promiseWithCancelFn,
} from '@/utils/tool';

const currentResVer = parseInt(import.meta.env.VITE_RESOURCE_VER);
const LIMIT = parseInt(import.meta.env.VITE_LIST_LIMIT);

function _fetch<T>(url: string): ResponseWithCancelFn<T> {
  const controller = new AbortController();
  const { signal } = controller;
  const response = fetch(import.meta.env.BASE_URL + url, { signal })
    .then(res => {
      if (!res.ok) {
        throw new Error(`请求'${url}'失败, 状态: ${res.status}`);
      }

      const contentType = res.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        return res.json() as Promise<T>;
      } else {
        throw new Error(`意外的Content-Type: ${contentType}`);
      }
    })
    .catch((err: Error) => {
      if (err.name === 'AbortError') {
        console.log(`${url}：取消请求`);
      } else {
        console.error(err);
      }
      return void 0;
    });
  return {
    response,
    cancel: () => controller.abort(),
  };
}

function _isLatestVer(verKey: string): boolean {
  const verObj = localStorageUtils.getItem('ver');
  if (!verObj) return false;
  return verObj[verKey] === currentResVer;
}

function _updateToLatestVer(verKey: string): void {
  const verObj = localStorageUtils.getItem('ver') ?? {};
  verObj[verKey] = currentResVer;
  localStorageUtils.setItem('ver', verObj);
}

interface FetchOptions {
  localSrc: 'LocalStorage' | 'IndexedDB';
  storageKey?: string;
  query?: () => PromiseExtended;
  resAffected?: 'meta' | 'cont';
}

function _fetchData<T>(
  url: string,
  options?: FetchOptions,
): ResponseWithCancelFn<T> {
  if (!options) return _fetch<T>(url);

  const { localSrc, storageKey, query, resAffected } = options;
  const verKeyDB = (resAffected + 'Ver') as Blog.Post.VerKey;

  if (localSrc === 'LocalStorage') {
    if (_isLatestVer(storageKey!)) {
      // console.log('使用localStorage');
      const latestData = localStorageUtils.getItem(storageKey!);
      return promiseWithCancelFn(new Promise(resolve => resolve(latestData)));
    }

    // console.log('localStorage数据不存在或非最新，使用fetch');
    const { response, cancel } = _fetch<T>(url);
    return {
      response: response.then(data => {
        localStorageUtils.setItem(storageKey!, data);
        _updateToLatestVer(storageKey!);
        return data;
      }),
      cancel,
    };
  }
  //IndexedDB
  return promiseWithCancelFn<T>(
    query!().then(
      (postObj: T & { id: number } & { [K in Blog.Post.VerKey]?: number }) => {
        if (postObj && postObj[verKeyDB] === currentResVer) {
          // console.log('使用最新IndexedDB数据');
          const { id, metaVer, contVer, ...data } = postObj;
          return <T>data;
        }
        // console.log('Indexed数据不存在或非最新，使用fetch');
        const { response } = _fetch<T>(url);
        return response.then(async data => {
          if (!data) return void 0;

          let dataToStore: T & { [K in Blog.Post.VerKey]?: number };
          if (postObj) {
            dataToStore = Object.assign(postObj, data);
          } else {
            dataToStore = data;
          }
          dataToStore[verKeyDB] = currentResVer;
          await db.post.put(
            dataToStore as unknown as InsertType<Blog.Post.DBItem, 'id'>,
          );
          return data;
        });
      },
    ),
    // () => console.log('取消IndexedDB查询'),
  );
}

async function _checkAndInitDB(
  total: number,
  pageCount: number,
): Promise<void> {
  const latestCount = await db.post
    .where('metaVer')
    .equals(currentResVer)
    .count();
  if (latestCount < total) {
    for (let i = 1; i <= pageCount; i++) {
      const { response: listRes } = _fetchData<string[]>(
        `data/stat/list-${i}.json`,
      );
      const postNameList = await listRes;
      if (!postNameList) {
        throw new Error(
          `无法初始化IndexedDB，因为请求第${i}批postNameList失败`,
        );
      }
      const infoPromises = postNameList.map(
        name => _fetchPostMeta(name).response,
      );
      await Promise.all(infoPromises);
    }

    await db.post.where('metaVer').below(currentResVer).delete();
  }
}

async function _fetchSinglePage(
  type: 'all' | 'category' | 'tag',
  total: number,
  params: {
    index: number;
    category?: string;
    tag?: string;
  },
): Promise<Blog.Post.DBItem[] | undefined> {
  try {
    const { index, category, tag } = params;
    const pageCount = Math.ceil(total / LIMIT);
    if (index > pageCount) {
      throw new Error('页数超限');
    }

    // 检查并初始化IndexedDB
    await _checkAndInitDB(total, pageCount);

    let collection: Collection<
      Blog.Post.DBItem,
      number,
      InsertType<Blog.Post.DBItem, 'id'>
    >;
    let result: Blog.Post.DBItem[];

    const mark = type === 'all' ? type : type === 'category' ? category! : tag!;
    const page = await db.pagination.get([mark, index]);

    if (!page || page.ver !== currentResVer) {
      // console.log('offset + limit传统分页');
      const commonQuery = () => db.post.orderBy('birthTime').reverse();

      if (type === 'all') {
        collection = commonQuery();
      } else if (type === 'category') {
        collection = commonQuery().and(post => post.category === category);
      } else if (type === 'tag') {
        collection = commonQuery().and(post => post.tag.includes(tag!));
      }

      result = await collection!
        .offset((index! - 1) * LIMIT)
        .limit(LIMIT)
        .toArray();

      await db.pagination.put({
        mark,
        index,
        firstEntry: result[0].birthTime,
        ver: currentResVer,
      });
    } else {
      // console.log('游标分页');
      const commonQuery = () =>
        db.post.where('birthTime').belowOrEqual(page.firstEntry);

      if (type === 'all') {
        collection = commonQuery();
      } else if (type === 'category') {
        collection = commonQuery().and(post => post.category === category);
      } else if (type === 'tag') {
        collection = commonQuery().and(post => post.tag.includes(tag!));
      }

      result = await collection!.limit(LIMIT).reverse().toArray();
    }
    return result;
  } catch (err) {
    console.error('_fetchSinglePage执行错误:', err);
  }
}

export async function fetchStat(): Promise<Blog.Stat> {
  const { response } = _fetchData<Blog.Stat>('data/stat/stat.json', {
    localSrc: 'LocalStorage',
    storageKey: 'postStat',
  });
  const _statEmpty: Blog.Stat = {
    total: {
      post: void 0,
      cate: void 0,
      tag: void 0,
    },
    cate: {},
    tag: {},
  };
  const stat = await response;
  if (!stat) return _statEmpty;
  else return stat;
}

function _fetchPostMeta(name: string) {
  return _fetchData<Blog.Post.Meta>(`data/info/${name}.json`, {
    localSrc: 'IndexedDB',
    query: () => db.post.get({ name }),
    resAffected: 'meta',
  });
}

export async function fetchWholePost(name: string): Promise<Blog.Post.Whole> {
  const { response: metaRes } = _fetchPostMeta(name);
  const info = await metaRes;
  if (!info) {
    throw new Error('postMeta意外地为undefined');
  }

  const { response: contRes } = _fetchData<{
    name: string;
    cont: string;
  }>(`data/cont/${name}.json`, {
    localSrc: 'IndexedDB',
    query: () => db.post.get({ name }),
    resAffected: 'cont',
  });
  const contData = await contRes;
  if (!contData) {
    throw new Error('未获取到文章内容');
  }
  return {
    ...info,
    cont: contData.cont,
  };
}

export async function fetchRandomPostName() {
  const { total } = await fetchStat();
  const randomPost = await db.post.get(randomIntInRange(1, total.post ?? 1));
  return randomPost?.name;
}

export function fetchAllPosts(
  index: number,
  total: number,
): ResponseWithCancelFn<Blog.Post.DBItem[]> {
  return promiseWithCancelFn(_fetchSinglePage('all', total, { index }), () =>
    console.log('all: 取消请求'),
  );
}

export function fetchPostsByTag(
  tag: string,
  index: number,
  total: number,
): ResponseWithCancelFn<Blog.Post.DBItem[]> {
  return promiseWithCancelFn(
    _fetchSinglePage('tag', total, { index, tag }),
    () => console.log('tag: 取消请求'),
  );
}

export function fetchPostsByCategory(
  category: string,
  index: number,
  total: number,
): ResponseWithCancelFn<Blog.Post.DBItem[]> {
  return promiseWithCancelFn(
    _fetchSinglePage('category', total, { index, category }),
    () => console.log('cate: 取消请求'),
  );
}

export async function fetchLinkExchange() {
  const { response } = _fetchData<Blog.FriendLink[]>('data/links.json');
  return await response;
}
