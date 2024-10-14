<template>
  <BlogNav :="navConfig" />

  <main class="blog-main">
    <Suspense>
      <RouterView />
      <template #fallback> 加载中... </template>
    </Suspense>
  </main>
</template>

<script setup lang="ts">
import BlogNav, { type NavConfig } from '@/components/BlogNav.vue';

const navConfig: NavConfig = {
  title: "LynnSha1ng's Blog",
  items: {
    labeled: [
      {
        label: '标签',
        iconClass: 'icon-24gf-tags2',
        to: { name: 'tags' },
      },
      {
        label: '分类',
        iconClass: 'icon-boxtag-fill',
        to: { name: 'categories' },
      },
    ],
    unlabeled: [
      {
        label: '测试',
        iconClass: 'icon-boxtag-fill',
        to: { name: 'tags' },
      },
    ],
  },
};
</script>

<style lang="scss">
.blog-main {
  min-height: $scr-h-without-top-nav;
}
</style>
