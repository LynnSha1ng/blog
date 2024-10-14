import { marked } from 'marked';

import { markedHighlight } from 'marked-highlight';
import hljs from './hljs';

import { markedEmoji } from 'marked-emoji';
import { Octokit } from '@octokit/rest';

const markedEmojiOptions = await (async () => {
  const octokit = new Octokit();
  const emojiRes = await octokit.rest.emojis.get();
  const emojis = emojiRes.data;
  return {
    emojis,
    renderer: (token: { name: string; emoji: string }) =>
      `<img alt="${token.name}" src="${token.emoji}" class="marked-emoji" />`,
  };
})();

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
  markedEmoji(markedEmojiOptions),
);

export { marked };
