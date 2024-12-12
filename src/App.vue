<template>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <BlogNav :title :itemsMid />

      <Transition name="fade" mode="out-in">
        <Suspense>
          <component :is="Component" />
          <template #fallback>
            <div class="loading-wrapper">
              <div class="loading-placeholder"></div>
              <div class="loading">
                <h1>加载中...</h1>
              </div>
            </div>
          </template>
        </Suspense>
      </Transition>

      <BlogFooter />
    </template>
  </RouterView>
</template>

<script setup lang="ts">
import BlogNav from '@/components/BlogNav.vue';
import BlogFooter from './components/BlogFooter.vue';

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

<style lang="scss">
.loading-placeholder {
  height: $scr-h-main-content;
  margin-top: $gap;
}

.loading {
  @include flex(center, center);
  position: fixed;
  inset: 0;
  z-index: 1200;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
