# LynnSha1ng's Blog

从零开始搭建的纯前端个人博客。

# 功能特性（与相应技术栈）

- 本地构建时运行 Node.js 脚本，根据帖子的 Markdown 文件生成 front matter 与正文内容的JSON数据。
- 简单的仿 Nuxt.js 文件系统路由。
- 分别使用 LocalStorage 和 IndexedDB 存储统计数据和帖子数据，使用 `Dexie.js` 以便操作 IndexedDB。
- 自动切换浅/深色模式，UI风格 参考了 Hexo 的 Butterfly 主题。
- 使用 `Marked.js` 渲染帖子，并添加 `marked-highlight` 与 `marked-emoji` 插件以支持代码高亮和 emoji 显示。