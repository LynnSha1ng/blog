<template>
  <BlogNav :title :itemsMid />

  <main class="blog-main">
    <Suspense>
      <RouterView />
      <template #fallback> 加载中... </template>
    </Suspense>
  </main>
</template>

<script setup lang="ts">
import BlogNav from '@/components/BlogNav.vue';

const title = "LynnSha1ng's Blog";
const itemsMid = [
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
];
</script>

<style lang="scss">
.blog-main {
  overflow: hidden;
  min-height: $scr-h-without-top-nav;
}
</style>
