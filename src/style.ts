import '@/assets/styles/theme.css';
import '@/assets/styles/base.css';

import '@/assets/styles/common.scss';
import '@/assets/styles/transition.scss';

function setCodeStyle() {
  const applyTheme = (dark: boolean) => {
    let link = <HTMLLinkElement>document.getElementById('hightlight-theme');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'highlight-theme';
      document.head.appendChild(link);
    }

    const cssTheme = dark
      ? 'highlight.js/styles/github-dark.min.css'
      : 'highlight.js/styles/github.min.css';
    link.href = new URL(cssTheme, import.meta.url).href;
  };
  const mediaQueryDark = matchMedia('(prefers-color-scheme: dark)');
  applyTheme(mediaQueryDark.matches);
  mediaQueryDark.addEventListener('change', ev => applyTheme(ev.matches));
}
setCodeStyle();
