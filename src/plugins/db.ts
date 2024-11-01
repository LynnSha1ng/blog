import type { EntityTable, Table } from 'dexie';

import Dexie from 'dexie';

const db = new Dexie('Blog') as Dexie & {
  post: EntityTable<Blog.Post.DBItem, 'id'>;
  pagination: Table<Blog.Pagination, [string, number]>;
};

db.version(1).stores({
  post: '++id, &name, category, *tag, birthTime, ver.meta',
  pagination: '[mark+index], firstEntry, ver',
});

export { db };

/* 清空IndexedDB，调试用

try {
  const DBs = await indexedDB.databases();
  for (const db of DBs) {
    const name = db.name;
    if (name) {
      indexedDB.deleteDatabase(name);
      console.log(`已删除数据库: ${name}`);
    }
  }
} catch (err) {
  console.error(err);
}

*/
