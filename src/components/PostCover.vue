<template>
  <section
    :class="{
      'post-banner': true,
      '--shown': atPostPage,
    }">
    <img class="cover-img" :src="postInfo.coverUrl" />

    <div class="banner-mask"></div>

    <header class="post-info" v-show="ready">
      <h1 class="post-title">{{ postInfo.title }}</h1>

      <div class="post-meta">
        <div class="date-related">
          <span class="publish-time">
            <i class="meta-icon iconfont icon-calendar"></i>
            <time class="meta-txt" :datetime="postInfo.birthTime">
              {{ publishTimeTip }}
            </time>
          </span>

          <span class="last-modify-time">
            <i class="meta-icon iconfont icon-edit"></i>
            <time class="meta-txt" :datetime="postInfo.birthTime">
              {{ mTimeTip }}
            </time>
          </span>
        </div>

        <div class="cont-related">
          <span class="post-length">
            <i class="meta-icon iconfont icon-text"></i>
            <span class="meta-txt">共字</span>
          </span>

          <span class="read-time">
            <i class="meta-icon iconfont icon-time"></i>
            <span class="meta-txt">读完大约需要</span>
          </span>
        </div>
      </div>
    </header>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePostStore } from '@/stores';
import { formatDate } from '@/utils/tool';

const postStore = usePostStore();
const { postInfo } = postStore;
const { ready, atPostPage } = storeToRefs(postStore);

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
  @include transition((height, opacity), 0.45s, -0.1s);
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

  @include onDarkMode {
    background-color: rgba(0, 0, 0, 0.35);
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

  > * {
    @include inline-separator('|', 8px, var(--text-white));
  }
}

.meta-icon {
  margin-inline-end: 4px;
}

.meta-txt {
  font-size: 1rem;
}
</style>
