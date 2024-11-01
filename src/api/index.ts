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

function _handleDataPath(absolutePath: string) {
  const path = import.meta.env.DEV
    ? absolutePath.replace(/^\/data\//, 'data/__dev__/')
    : absolutePath.slice(1);
  return import.meta.env.BASE_URL + path;
}
/**
 * 处理生产/开发环境下请求 public 目录/根目录下 data 目录内文件的路径
 * @param absolutePath Vite 约定的资源绝对路径
 */
const _hdp = _handleDataPath;

function _fetch<T>(path: string): ResponseWithCancelFn<T> {
  const controller = new AbortController();
  const { signal } = controller;
  const response = fetch(path, { signal })
    .then(res => {
      if (!res.ok) {
        throw new Error(`请求'${path}'失败, 状态: ${res.status}`);
      }

      const contentType = res.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        return res.json();
      } else {
        throw new Error(`意外的Content-Type: ${contentType}`);
      }
    })
    .catch((err: Error) => {
      if (err.name === 'AbortError') {
        console.log(`${path}：取消请求`);
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

function _fetchData<T>(
  path: string,
  options?: {
    localSrc: 'LocalStorage' | 'IndexedDB';
    storageKey?: string;
    query?: () => PromiseExtended;
    resAffected?: Blog.Post.VerKey;
  },
): ResponseWithCancelFn<T> {
  if (!options) return _fetch<T>(path);

  const { localSrc, storageKey, query, resAffected } = options;

  if (localSrc === 'LocalStorage') {
    if (_isLatestVer(storageKey!)) {
      // console.log('使用localStorage');
      const latestData = localStorageUtils.getItem(storageKey!);
      return promiseWithCancelFn(new Promise(resolve => resolve(latestData)));
    }

    // console.log('localStorage数据不存在或非最新，使用fetch');
    const { response, cancel } = _fetch<T>(path);
    return {
      response: response.then(data => {
        localStorageUtils.setItem(storageKey!, data);
        _updateToLatestVer(storageKey!);
        return data;
      }),
      cancel,
    };
  }

  // IndexedDB
  return promiseWithCancelFn<T>(
    query!().then((postObj: Blog.Post.DBItem) => {
      if (postObj && postObj.ver[resAffected!] === currentResVer) {
        // console.log('使用最新IndexedDB数据');
        const { id, ver, ...data } = postObj;
        return data as T;
      }
      // console.log('Indexed数据不存在或非最新，使用fetch');
      return _fetch<T>(path).response.then(async data => {
        if (!data) return void 0;

        let dataToStore: T & { ver: Blog.Post.VerRec };
        if (postObj) {
          dataToStore = Object.assign(postObj, data);
        } else {
          dataToStore = {
            ...data,
            ver: {},
          };
        }
        dataToStore.ver[resAffected!] = currentResVer;
        await db.post.put(
          dataToStore as unknown as InsertType<Blog.Post.DBItem, 'id'>,
        );

        return data;
      });
    }),
    // () => console.log('取消IndexedDB查询'),
  );
}

async function _checkAndInitDB(total: number) {
  const latestCount = await db.post
    .where('ver.meta')
    .equals(currentResVer)
    .count();
  if (latestCount < total) {
    const postNameList = await _fetchData<string[]>(
      _hdp(`/data/name-list.json`),
    ).response;
    if (!postNameList) {
      throw new Error(`无法初始化IndexedDB，因为请求postNameList失败`);
    }

    const infoPromises = postNameList.map(_fetchPostMeta);
    const BATCH_SIZE = parseInt(import.meta.env.VITE_BATCH_SIZE);
    for (let i = 0; i < infoPromises.length; i += BATCH_SIZE) {
      await Promise.all(infoPromises.slice(i, i + BATCH_SIZE));
    }

    await db.post.where('ver.meta').below(currentResVer).delete();
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
) {
  try {
    const { index, category, tag } = params;
    const pageCount = Math.ceil(total / LIMIT);
    if (index > pageCount) {
      throw new Error('页数超限');
    }

    // 检查并初始化IndexedDB
    await _checkAndInitDB(total);

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

export async function fetchStat() {
  const _statEmpty: Blog.Stat = {
    total: {
      post: void 0,
      cate: void 0,
      tag: void 0,
    },
    cate: {},
    tag: {},
  };

  const stat = await _fetchData<Blog.Stat>(_hdp('/data/stat.json'), {
    localSrc: 'LocalStorage',
    storageKey: 'postStat',
  }).response;

  if (!stat) return _statEmpty;
  else return stat;
}

function _fetchPostMeta(name: string) {
  return _fetchData<Blog.Post.Meta>(_hdp(`/data/meta/${name}.json`), {
    localSrc: 'IndexedDB',
    query: () => db.post.get({ name }),
    resAffected: 'meta',
  }).response;
}

export async function fetchWholePost(name: string) {
  const info = await _fetchPostMeta(name);
  if (!info) {
    throw new Error('postMeta意外地为undefined');
  }

  const contData = await _fetchData<{
    name: string;
    cont: string;
  }>(_hdp(`/data/cont/${name}.json`), {
    localSrc: 'IndexedDB',
    query: () => db.post.get({ name }),
    resAffected: 'cont',
  }).response;
  if (!contData) {
    throw new Error('未获取到文章内容');
  }

  return {
    ...info,
    cont: contData.cont,
  } as Blog.Post.Whole;
}

export function fetchPostToc(name: string) {
  return _fetchData(_hdp(`/data/toc/${name}.json`), {
    localSrc: 'IndexedDB',
    query: () => db.post.get({ name }),
    resAffected: 'toc',
  }).response;
}

export async function fetchRandomPostName() {
  const { total } = await fetchStat();
  const randomPost = await db.post.get(randomIntInRange(1, total.post ?? 1));
  return randomPost?.name;
}

export function fetchAllPosts(index: number, total: number) {
  return promiseWithCancelFn<Blog.Post.DBItem[]>(
    _fetchSinglePage('all', total, { index }),
    () => console.log('all: 取消请求'),
  );
}

export function fetchPostsByTag(tag: string, index: number, total: number) {
  return promiseWithCancelFn<Blog.Post.DBItem[]>(
    _fetchSinglePage('tag', total, { index, tag }),
    () => console.log('tag: 取消请求'),
  );
}

export function fetchPostsByCategory(
  category: string,
  index: number,
  total: number,
) {
  return promiseWithCancelFn<Blog.Post.DBItem[]>(
    _fetchSinglePage('category', total, { index, category }),
    () => console.log('cate: 取消请求'),
  );
}

export function fetchLinkExchange() {
  return _fetchData<Blog.FriendLink[]>(_hdp('/data/links.json'), {
    localSrc: 'LocalStorage',
    storageKey: 'friendLinks',
  }).response;
}
