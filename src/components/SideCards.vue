<template>
  <Transition name="side-card-appear">
    <aside class="side-cards" v-if="mounted">
      <BloggerCard key="side-card-blogger" ref="bloggerCard" />

      <TransitionGroup
        name="card-toggle"
        tag="div"
        class="sticky-cards"
        :style="{
          '--relative-top': relativeTop,
        }"
        @before-leave="setRelativeTop"
        v-if="mounted">
        <section class="info-card" key="side-card-announcement">
          <h3>
            <i
              class="title-icon shake-loudspeaker iconfont icon-zizhutuiguang"></i>
            <span class="title-label">公告</span>
          </h3>
          <div class="announcement-content">
            <p>欢迎来到我的个人博客！</p>
            <p>本博客还在建设中，正在积极优化浏览体验~</p>
          </div>
        </section>

        <section
          class="info-card"
          v-if="$route.name !== 'categories'"
          key="side-card-categories">
          <h3>
            <i class="title-icon iconfont icon-wenjianjia"></i>
            <span class="title-label">分类</span>
          </h3>

          <ul class="categories">
            <RouterLink
              v-for="[label, total] of cateShown"
              :key="`side-card-cate-${label}`"
              custom
              :to="{
                name: ':categoryName',
                params: {
                  categoryName: label,
                },
              }"
              v-slot="{ navigate }">
              <li class="category-item" @click="navigate" role="link">
                <span class="category-label">{{ label }}</span>
                <span class="category-total">（{{ total }}）</span>
              </li>
            </RouterLink>
          </ul>

          <RouterLink
            :to="{ name: 'categories' }"
            class="has-more"
            v-if="cateHasMore">
            查看更多
          </RouterLink>
        </section>

        <section
          class="info-card"
          v-if="$route.name !== 'tags'"
          key="side-card-tags">
          <h3>
            <i class="title-icon iconfont icon-24gf-tags2"></i>
            <span class="title-label">标签</span>
          </h3>

          <ul class="tags">
            <RouterLink
              v-for="[label, total] of tagShown"
              :key="`side-card-tag-${label}`"
              custom
              :to="{
                name: ':tagName',
                params: {
                  tagName: label,
                },
              }"
              v-slot="{ navigate }">
              <li class="tag-item" @click="navigate" role="link">
                <span class="tag-label">{{ label }}</span>
                <sup class="tag-total">{{ total }}</sup>
              </li>
            </RouterLink>
          </ul>

          <RouterLink :to="{ name: 'tags' }" class="has-more" v-if="tagHasMore">
            查看更多
          </RouterLink>
        </section>
      </TransitionGroup>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import BloggerCard from './BloggerCard.vue';

import { ref, useTemplateRef } from 'vue';

import { fetchStat } from '@/api';
import { useMountedForTransition } from '@/utils/composable';

const { mounted } = useMountedForTransition();

// 数据
const { cate, tag } = await fetchStat();

function getShownData(
  raw: Record<string, number>,
  shownCount: number,
): { shownData: [string, number][]; hasMore: boolean };
function getShownData<T>(
  raw: T[] | undefined,
  shownCount: number,
): { shownData: T[]; hasMore: boolean };
function getShownData<T>(
  raw: Record<string, number> | T[] | undefined,
  shownCount: number,
) {
  let shownData: [string, number][] | T[] = [];
  let hasMore = false;

  if (raw) {
    const rawEntries = Array.isArray(raw) ? raw : Object.entries(raw);
    shownData = rawEntries.slice(0, shownCount);
    hasMore = rawEntries.length > shownCount;
  }

  return {
    shownData,
    hasMore,
  };
}
const { shownData: cateShown, hasMore: cateHasMore } = getShownData(cate, 8);
const { shownData: tagShown, hasMore: tagHasMore } = getShownData(tag, 75);

// TransitionGroup淡出优化
// BUG 淡出的卡片下方的卡片偶尔丢失move动画
const bloggerCard = useTemplateRef('bloggerCard');
const relativeTop = ref('');
const setRelativeTop = (targetEl: Element) => {
  if (!bloggerCard.value) return;
  const bloggerCardEl = bloggerCard.value.$el as Element;

  const elH = targetEl.getBoundingClientRect().top;
  const bloggerCardH = bloggerCardEl.getBoundingClientRect().top;
  relativeTop.value = `${(elH - bloggerCardH).toFixed(4)}px`;
};
</script>

<style lang="scss" scoped>
.side-cards {
  flex-shrink: 0;
  width: $side-card-w;
  @include screenBelow($lg) {
    display: none;
  }
}

.sticky-cards {
  @include flex(null, null, column);
  row-gap: 12px;
  position: sticky;
  top: 12px;
  margin-top: 12px;
}

.info-card {
  @include flex(null, null, column);
  row-gap: 16px;
  width: 100%;
  padding: 20px;
  border-radius: 12px;
  background-color: var(--bg-2);
}

.title-icon {
  font-size: 1.08em;
}

.shake-loudspeaker {
  display: inline-block;
  color: red;
  animation: shake-quickly 1s infinite;
}

@keyframes shake-quickly {
  0%,
  25%,
  100% {
    transform: rotate(0deg);
  }
  5%,
  15% {
    transform: rotate(15deg);
  }
  10%,
  20% {
    transform: rotate(-15deg);
  }
}

.title-label {
  margin-inline-start: 8px;
}

.announcement-content {
  font-size: small;
  font-weight: bold;
  line-height: 2;
}

.categories {
  @include flex(null, null, column);
  row-gap: 8px;
}

.category-item {
  @include flex(space-between, center);
  padding: 8px;
  border-radius: 8px;
  font-weight: bold;
  @include transition(background-color, 0.25s);

  &:hover {
    background-color: var(--bg-3);
  }
}

.category-label {
  @include line-clamp(1);
}

.tags {
  @include flex(null, null, wrap);
  gap: 8px;
}

.tag-item {
  padding: 8px;
  border-radius: 8px;
  @include transition(background-color, 0.25s);

  &:hover {
    background-color: var(--bg-3);
  }
}

.tag-label {
  margin-inline-end: 4px;
  font-size: small;
  font-weight: bold;
}

.tag-total {
  color: var(--text-grey);
  font-size: x-small;
}

.has-more {
  color: var(--text-grey);
  font-size: small;
  text-align: center;
}
</style>

<!-- transition -->
<style lang="scss" scoped>
// side-card-appear
@mixin set-staggered-transition($type) {
  @include staggered-transition-time-manage($type, 5, 0.5s, 0.1s);
}

.side-card-appear-enter-active,
.side-card-appear-leave-active {
  transition-property: transform;
  @include set-staggered-transition('root');

  .info-card {
    transition-property: opacity, transform;
    @include set-staggered-transition('child');
  }
}

.side-card-appear-enter-from,
.side-card-appear-leave-to {
  transform: translateY(20px);

  .info-card {
    opacity: 0;
    transform: scale(0.8);
  }
}

// card-toggle
.card-toggle-move,
.card-toggle-enter-active,
.card-toggle-leave-active {
  @include transition((opacity, transform));
}

.card-toggle-enter-from,
.card-toggle-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

// 从文档流中移除离开的元素以保障move动画
.card-toggle-leave-active {
  position: absolute;
  top: var(--relative-top, 328px);
}
</style>
