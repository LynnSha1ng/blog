export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomIntInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const _createStorageUtils = (storage: Storage) => ({
  setItem(key: string, value: any) {
    storage.setItem(key, JSON.stringify(value));
  },

  getItem(key: string) {
    const value = storage.getItem(key);
    return value !== null ? JSON.parse(value) : void 0;
  },
});

export const localStorageUtils = _createStorageUtils(localStorage);

export const sessionStorageUtils = _createStorageUtils(sessionStorage);

export type ResponseWithCancelFn<T> = {
  response: Promise<T | undefined>;
  cancel: () => void;
};

export function promiseWithCancelFn<T>(
  targetPromise: Promise<T | undefined>,
  onCanceled?: () => void,
): ResponseWithCancelFn<T> {
  const controller = new AbortController();
  const { signal } = controller;

  let rejectFn: (reason?: any) => void;

  const onAbort = () => {
    rejectFn(void 0);
    if (typeof onCanceled === 'function') onCanceled();
    signal.removeEventListener('abort', onAbort);
  };
  signal.addEventListener('abort', onAbort);

  const abortPromise = new Promise<undefined>((_, reject) => {
    rejectFn = reject;
  }).catch(() => void 0);

  return {
    response: Promise.race([
      targetPromise.then(data => {
        // 获得数据后应取消监听器，否则onCanceled始终执行
        signal.removeEventListener('abort', onAbort);
        return data;
      }),
      abortPromise,
    ]),
    cancel: () => controller.abort(),
  };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const dateTime = date.getTime();
  if (isNaN(dateTime)) {
    return dateStr;
  }

  const now = new Date();
  const diff = now.getTime() - dateTime;

  const diffInHours = Math.floor(diff / 3.6e6);
  if (diffInHours < 1) return '刚刚';

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 1) return `${diffInHours}小时前`;
  if (diffInDays < 7) return `${diffInDays}天前`;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (year === now.getFullYear()) {
    return `${month}月${day}日`;
  }

  return `${year}年${month}月${day}日`;
}

export function formatTime(ms: number) {
  const sec = 1000;
  if (ms < sec) return '不足1秒';

  const min = 60 * sec;
  if (ms < min) return `${Math.floor(ms / sec)}秒`;

  const hour = 60 * min;
  if (ms < hour) return `${Math.floor(ms / min)}分钟`;

  const day = 24 * hour;
  if (ms < day) return `${Math.floor(ms / hour)}小时`;

  const week = 7 * day;
  if (ms < week) return `${Math.floor(ms / day)}天`;

  const month = 30 * day;
  if (ms < month) return `${Math.floor(ms / week)}周`;

  const year = 12 * month;
  if (ms < year) return `${Math.floor(ms / month)}个月`;

  return `${Math.floor(ms / year)}年`;
}

export function staticResUrl(path: string) {
  return import.meta.env.BASE_URL + path.startsWith('/') ? path.slice(1) : path;
}
