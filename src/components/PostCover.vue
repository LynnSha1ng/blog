<template>
  <div
    :class="{
      'post-banner': true,
      '--shown': $route.name === ':postName',
    }">
    <img class="cover-img" :src="postInfo.coverUrl" />

    <div class="banner-mask"></div>

    <header class="post-info" v-show="infoLoaded">
      <h1 class="post-title">{{ postInfo.title }}</h1>

      <div class="post-meta">
        <div class="meta-line">
          <span class="publish-time">
            <i class="meta-icon iconfont icon-calendar"></i>
            <time :datetime="postInfo.birthTime">
              {{ publishTimeTip }}
            </time>
          </span>

          <span class="last-modify-time">
            <i class="meta-icon iconfont icon-edit"></i>
            <time :datetime="postInfo.birthTime">
              {{ mTimeTip }}
            </time>
          </span>
        </div>

        <div class="meta-line">
          <span class="post-length">
            <i class="meta-icon iconfont icon-text"></i>
            <span>共字</span>
          </span>

          <span class="read-time">
            <i class="meta-icon iconfont icon-time"></i>
            <span>读完大约需要</span>
          </span>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePostStore } from '@/stores';
import { formatDate } from '@/utils/tool';

const postStore = usePostStore();
const { postInfo } = postStore;
const { infoLoaded } = storeToRefs(postStore);

const publishTimeTip = computed(() => {
  if (postInfo.birthTime !== '') {
    return `发表于${formatDate(postInfo.birthTime)}`;
  }
  return void 0;
});
const mTimeTip = computed(() => {
  if (postInfo.mTime !== '') {
    return `最后修改于${formatDate(postInfo.mTime)}`;
  }
  return void 0;
});
</script>

<style lang="scss" scoped>
.post-banner {
  position: relative;
  overflow: hidden;
  opacity: 0;
  height: 0;
  @include transition((height, opacity), 0.35s);
  will-change: height, opacity;

  &.--shown {
    opacity: 1;
    height: 400px;
  }
}

.cover-img {
  object-fit: cover;
}

.banner-mask {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.15);

  @media (prefers-color-scheme: dark) {
    background-color: rgba(0, 0, 0, 0.45);
  }
}

.post-info {
  @include flex(center, center, column);
  position: absolute;
  inset: 0;
  color: var(--text-white);
}

.post-meta {
  margin-block-start: 1em;
  text-align: center;
}

.meta-line {
  @include inline-separator('|', $gap-sm, var(--text-white));
}

.meta-icon {
  margin-inline-end: 4px;
}
</style>
