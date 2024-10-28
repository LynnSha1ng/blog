import { readFile, writeFile } from 'node:fs/promises';
import { join as pathJoin } from 'node:path';
import { doGenDataWork } from './_template.js';

const DATA_DIR = process.env.DATA_DIR!;
const INFO_DIR = process.env.INFO_DATA_DIR!;

export async function genStatData() {
  const cateStatMap = new Map<string, number>();
  const tagStatMap = new Map<string, number>();

  const postTotal = await doGenDataWork({
    sourceDir: INFO_DIR,

    async work(batch) {
      const readPromises = batch.map(async filename => {
        const raw = await readFile(pathJoin(INFO_DIR, filename), 'utf8');
        const { category, tag } = JSON.parse(raw);
        return {
          category,
          tag,
        };
      });
      const readResults = await Promise.all(readPromises);

      for (const { category, tag: tags } of readResults) {
        if (!cateStatMap.has(category)) {
          cateStatMap.set(category, 0);
        }
        cateStatMap.set(category, cateStatMap.get(category) + 1);

        for (const tag of tags) {
          if (!tagStatMap.has(tag)) {
            tagStatMap.set(tag, 0);
          }
          tagStatMap.set(tag, tagStatMap.get(tag) + 1);
        }
      }
    },
  });

  await writeFile(
    pathJoin(DATA_DIR, 'stat.json'),
    JSON.stringify(
      {
        total: {
          post: postTotal,
          cate: cateStatMap.size,
          tag: tagStatMap.size,
        },
        cate: Object.fromEntries(cateStatMap),
        tag: Object.fromEntries(tagStatMap),
      },
      null,
      2,
    ),
  );

  console.log('成功生成postStat帖子统计数据。');
}
