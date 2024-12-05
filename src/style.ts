import '@/assets/styles/theme.css';
import '@/assets/styles/font.css';
import '@/assets/styles/iconfont.css';

import '@/assets/styles/base.scss';
import '@/assets/styles/common.scss';
import '@/assets/styles/transition.scss';

function setCodeStyle() {
  const applyTheme = (dark: boolean) => {
    let link = <HTMLLinkElement | null>(
      document.getElementById('hightlight-theme')
    );
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'highlight-theme';
    }

    const cssTheme = dark
      ? '../assets/github-dark.min.css'
      : '../assets/github.min.css';
    link.href = new URL(cssTheme, import.meta.url).href;
    document.head.appendChild(link);
  };
  const mediaQueryDark = matchMedia('(prefers-color-scheme: dark)');
  applyTheme(mediaQueryDark.matches);
  mediaQueryDark.addEventListener('change', e => applyTheme(e.matches));
}
setCodeStyle();
