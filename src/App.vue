<template>
  <BlogNav :title :itemsMid />

  <Suspense>
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <Transition name="fade" mode="out-in" :duration="150">
          <component :is="Component" />
        </Transition>
      </template>
    </RouterView>
    <template #fallback> 加载中... </template>
  </Suspense>
</template>

<script setup lang="ts">
import BlogNav from '@/components/BlogNav.vue';

const title = "LynnSha1ng's Blog";
const itemsMid = [
  {
    label: '分类',
    iconClass: 'icon-boxtag-fill',
    to: { name: 'categories' },
  },
  {
    label: '标签',
    iconClass: 'icon-24gf-tags2',
    to: { name: 'tags' },
  },
  {
    label: '友链',
    iconClass: 'icon-youlian-f',
    to: { name: 'link-exchange' },
  },
  {
    label: '关于',
    iconClass: 'icon-guanyu',
    to: { name: 'aboutView' },
  },
];
</script>
