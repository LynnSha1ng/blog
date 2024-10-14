export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const localStorageUtils = {
  setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getItem(key: string) {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : void 0;
  },
};

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
    return `今年${month}月${day}日`;
  }

  return `${year}年${month}月${day}日`;
}

export function staticResUrl(path: string) {
  return import.meta.env.BASE_URL + path.startsWith('/') ? path.slice(1) : path;
}
