import { readFile, writeFile } from 'node:fs/promises';
import { join as pathJoin } from 'node:path';
import { parse as yamlParse } from 'yaml';

const DATA_DIR = process.env.DATA_DIR!;

export async function genLinkData() {
  try {
    const dataRaw = await readFile('./public/link-exchange.yaml', 'utf-8');
    const data = yamlParse(dataRaw);
    await writeFile(
      pathJoin(DATA_DIR, 'links.json'),
      JSON.stringify(data.links, null, 2),
    );
    console.log('成功生成links友链数据。');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
