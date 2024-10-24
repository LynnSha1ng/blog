import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

export function genLinkData() {
  try {
    const dataRaw = readFileSync('./public/link-exchange.yaml', 'utf-8');
    const data = parse(dataRaw);
    writeFileSync(
      './public/data/links.json',
      JSON.stringify(data.links, null, 2),
    );
    console.log('成功生成link-exchange数据。');
  } catch (err) {
    console.log('生成友链数据失败：\n', err);
    process.exit(1);
  }
}
