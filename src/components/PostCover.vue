<template>
  <div
    :class="{
      'post-banner': true,
      '--shown': atPostPage,
    }">
    <img class="cover-img" :src="postInfo.coverUrl" />
    <header class="post-info">
      <h1 class="post-title">{{ postInfo.title }}</h1>
      <div class="post-meta" v-show="ready">
        <span class="publish-time">
          <i class="meta-icon iconfont icon-caidan"></i>
          <span class="time-txt">发表于</span>
          <time :datetime="postInfo.birthTime">{{
            formatDate(postInfo.birthTime)
          }}</time>
        </span>
        <span class="last-modify-time">
          <i class="meta-icon iconfont icon-caidan"></i>
          <span class="time-txt">最后修改于</span>
          <time :datetime="postInfo.mTime">
            {{ formatDate(postInfo.mTime) }}
          </time>
        </span>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePostStore } from '@/stores';
import { formatDate } from '@/utils/tool';

const postStore = usePostStore();
const { postInfo } = postStore;
const { ready, atPostPage } = storeToRefs(postStore);
</script>

<style lang="scss" scoped>
.post-banner {
  position: relative;
  overflow: hidden;
  opacity: 0;
  height: 0;
  transition-property: height, opacity;
  transition-duration: 0.45s;
  transition-delay: -0.1s;
  will-change: height, opacity;

  &.--shown {
    opacity: 1;
    height: 400px;
  }
}
.cover-img {
  object-fit: cover;
}

.post-info {
  @include flex(center, center, column);
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.25);
}

.post-meta {
  margin-block-start: 1em;
  @include inline-separator('|');
}
</style>
