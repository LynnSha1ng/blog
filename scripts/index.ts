import { genPostData } from './post.js';
import { genStatData } from './stat.js';
import { genLinkData } from './link.js';

await genPostData();
await genStatData();

genLinkData();
