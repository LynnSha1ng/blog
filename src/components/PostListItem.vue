<template>
  <RouterLink
    custom
    :to="{
      name: ':postName',
      params: {
        postName: name,
      },
    }"
    v-slot="{ navigate }">
    <li :class="['post-item', `--${itemStyle}`]" @click="navigate" role="link">
      <div class="post-cover">
        <img
          class="cover-img"
          src="/images/cover-default.jpg"
          :alt="`cover-${name}`" />
      </div>
      <div class="post-info">
        <h3 class="post-title">
          {{ title }}
        </h3>
        <p class="post-desc">
          {{ description }}
        </p>
        <div class="post-meta">
          <span class="publish-time">
            <i class="meta-icon iconfont icon-caidan"></i>
            <span class="time-txt">发表于</span>
            <time :datetime="birthTime">{{ formatDate(birthTime) }}</time>
          </span>
          <span class="last-modify-time">
            <i class="meta-icon iconfont icon-caidan"></i>
            <span class="time-txt">最后修改于</span>
            <time :datetime="mTime">{{ formatDate(mTime) }}</time>
          </span>
          <span class="category" v-show="$route.name !== ':categoryName'">
            <i class="meta-icon iconfont icon-boxtag-fill"></i>
            {{ category }}
          </span>
          <ul class="tags" v-show="$route.name !== ':tagName'">
            <i class="meta-icon iconfont icon-24gf-tags2"></i>
            <RouterLink
              v-for="tagItem in tag"
              :key="`post-tag-${name}-${tagItem}`"
              custom
              :to="{ name: ':tagName', params: { tagName: tagItem } }"
              v-slot="{ navigate }">
              <li class="tag" @click="navigate" role="link">
                {{ tagItem }}
              </li>
            </RouterLink>
          </ul>
        </div>
      </div>
    </li>
  </RouterLink>
</template>

<script setup lang="ts">
/* global Blog */

const { data } = defineProps<{
  data: Blog.Post.Meta;
  itemStyle: 'detailed' | 'brief';
}>();

const { name, title, description, category, tag, birthTime, mTime } = data;

import { formatDate } from '@/utils/tool';
</script>

<style lang="scss" scoped>
.post-item {
  overflow: hidden;
  max-width: 520px;
  border-radius: 12px;
  background-color: var(--bg-2);

  @include screenBelow($xl2) {
    max-width: none;
  }

  &.--detailed {
    @include flex(null, null, column);
    min-height: 368px;

    @include screenBetween($sm, $xl2) {
      flex-direction: row;
      align-items: center;
      min-height: 268px;

      &:nth-child(even) {
        flex-direction: row-reverse;
      }
    }

    .post-cover {
      height: 200px;

      @include screenBetween($sm, $xl2) {
        flex-basis: 45%;
        height: 100%;
      }
    }

    .post-info {
      padding: 16px 40px;
      line-height: 2;

      @include screenBetween($sm, $xl2) {
        flex-basis: 55%;
      }
    }

    .post-desc {
      @include line-clamp(2);
      font-size: small;
    }

    .post-meta {
      @include inline-separator('|');
    }

    .tags {
      @include inline-separator('•', 6px);
    }
  }

  &.--brief {
    @include flex;
    column-gap: 8px;
    min-height: 120px;
    padding: 8px;

    .post-cover {
      flex-basis: 40%;
    }

    .cover-img {
      border-radius: 8px;
    }

    .post-info {
      flex-basis: 60%;
      line-height: 1.75;
    }

    .post-meta > * {
      display: block;
    }

    .post-desc,
    .last-modify-time,
    .time-txt {
      display: none;
    }

    .tags {
      @include flex(null, center, wrap);
      gap: 8px;
    }

    .tag {
      padding-inline: 8px;
      border-radius: 1em;
      background-color: var(--bg-3);
      transition-property: background-color, color;
      transition-duration: 0.35s;

      &:hover {
        background-color: var(--bg-4);
        color: var(--primary);
      }
    }
  }
}

.cover-img {
  object-fit: cover;
}

.post-title {
  @include line-clamp(2);
  text-wrap: balance;
}

.post-desc {
  margin: 0;
}

.post-meta {
  color: var(--text-grey);
  font-size: small;
}

.meta-icon {
  margin-inline-end: 4px;
}
</style>
