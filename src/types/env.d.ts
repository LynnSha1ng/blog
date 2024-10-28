/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REPO_NAME: string;
  readonly VITE_RESOURCE_VER: string;
  readonly VITE_LIST_LIMIT: string;
  readonly VITE_BATCH_SIZE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
