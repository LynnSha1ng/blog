import { readFile, writeFile, stat } from 'node:fs/promises';
import { join as pathJoin, basename } from 'node:path';
import { parse as yamlParse } from 'yaml';
import { doGenDataWork } from './_template.js';

const POST_DIR = process.env.POST_DIR!;
const DATA_DIR = process.env.DATA_DIR!;
const INFO_DIR = process.env.INFO_DATA_DIR!;
const CONT_DIR = process.env.CONT_DATA_DIR!;

export async function genPostData() {
  const postNameAll = [];

  await doGenDataWork({
    sourceDir: POST_DIR,

    targetDir: [INFO_DIR, CONT_DIR],

    async work(batch) {
      const batchNoSuffix = batch.map(filename => basename(filename, '.md'));
      postNameAll.push(...batchNoSuffix);

      const readPromises = batch.map(async filename => {
        const content = await readFile(pathJoin(POST_DIR, filename), 'utf8');
        return {
          name: basename(filename, '.md'),
          content,
        };
      });
      const readResults = await Promise.all(readPromises);

      const writePromises = readResults.map(async ({ name, content }) => {
        const data = content.match(
          /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---[\r\n]+([\s\S]*)$/,
        );
        if (data === null) {
          throw new Error('存在格式错误的文章，请改正后再试！');
        }
        const fileStat = await stat(pathJoin(POST_DIR, `${name}.md`));
        await writeFile(
          pathJoin(INFO_DIR, `${name}.json`),
          JSON.stringify(
            {
              name,
              ...yamlParse(data[1]),
              birthTime: fileStat.birthtime,
              mTime: fileStat.mtime,
            },
            null,
            2,
          ),
        );
        await writeFile(
          pathJoin(CONT_DIR, `${name}.json`),
          JSON.stringify(
            {
              name,
              cont: data[2],
            },
            null,
            2,
          ),
        );
      });
      await Promise.all(writePromises);
    },
  });

  await writeFile(
    pathJoin(DATA_DIR, 'name-list.json'),
    JSON.stringify(postNameAll, null, 2),
  );

  console.log('成功生成postMeta帖子元数据、postCont帖子正文数据。');
}
