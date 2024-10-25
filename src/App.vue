<template>
  <BlogNav :title :itemsMid />

  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <Transition name="fade" mode="out-in" :duration="150">
        <Suspense>
          <component :is="Component" />
          <template #fallback>
            <div class="loading">
              <h1>加载中...</h1>
            </div>
          </template>
        </Suspense>
      </Transition>
    </template>
  </RouterView>
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

<style lang="scss">
  .loading{
    @include flex(center,center);
    position: absolute;
    inset:0;
    background-color: rgba(0,0,0,0.5);
  }
</style>
