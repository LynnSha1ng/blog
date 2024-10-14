<template>
  <Transition appear name="side-card-appear">
    <TransitionGroup name="card-toggle" tag="aside" class="side-info">
      <div class="info-card --blogger" key="side-card-blogger">
        <img class="avatar" src="/images/avatar.jpg" alt="头像" />
        <h3 class="blogger-name">临郢夏望</h3>
        <span class="bio">谦逊对待未知</span>
        <ul class="post-stats">
          <li
            class="stat-item"
            v-for="(label, key) of statMap"
            :key="`side-card-stat-${key}`">
            <div class="stat-label">{{ label }}</div>
            <div class="stat-total">{{ total[key] ?? '*' }}</div>
          </li>
        </ul>
        <ul class="contacts">
          <li class="contact-icon iconfont icon-QQ"></li>
          <li class="contact-icon iconfont icon-mail"></li>
          <li class="contact-icon iconfont icon-github"></li>
          <li class="contact-icon iconfont icon-tuite"></li>
        </ul>
      </div>

      <div
        class="info-card"
        v-show="$route.name !== 'categories'"
        key="side-card-categories">
        <h3>
          <i class="title-icon iconfont icon-wenjianjia"></i>
          <span class="card-title">分类</span>
        </h3>
        <ul class="categories" v-if="cate">
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

          <li class="category-item">
            <span class="category-label">
              测试超级长的分类名字测试超极长的分类名字
            </span>
            <span class="category-total">（10）</span>
          </li>
        </ul>
        <RouterLink
          :to="{ name: 'categories' }"
          class="has-more"
          v-show="cateHasMore">
          查看更多
        </RouterLink>
      </div>

      <div
        class="info-card"
        v-show="$route.name !== 'tags'"
        key="side-card-tags">
        <h3>
          <i class="title-icon iconfont icon-24gf-tags2"></i>
          <span class="card-title">标签</span>
        </h3>
        <ul class="tags" v-if="tag">
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
        <RouterLink :to="{ name: 'tags' }" class="has-more" v-show="tagHasMore">
          查看更多
        </RouterLink>
      </div>

      <div class="info-card" key="side-card-link-exchange">
        <h3>
          <i class="title-icon iconfont icon-youlian-f"></i>
          <span class="card-title">友链</span>
        </h3>
      </div>

      <div class="info-card" key="side-card-title">
        <h3>
          <i class="title-icon iconfont icon-caidan"></i>
          <span class="card-title">标题</span>
        </h3>
      </div>
    </TransitionGroup>
  </Transition>
</template>

<script setup lang="ts">
import { fetchStat } from '@/api';

const statMap = {
  post: '文章',
  cate: '分类',
  tag: '标签',
};

const { total, cate, tag } = await fetchStat();
const getShownData = (raw: Record<string, number>, shownCount: number) => {
  let shownData: [string, number][] | undefined = void 0;
  let hasMore: boolean = false;
  if (raw) {
    const rawEntries = Object.entries(raw);
    shownData = rawEntries.slice(0, shownCount);
    hasMore = rawEntries.length > shownCount;
  }
  return {
    shownData,
    hasMore,
  };
};
const { shownData: cateShown, hasMore: cateHasMore } = getShownData(cate, 5);
const { shownData: tagShown, hasMore: tagHasMore } = getShownData(tag, 2);
</script>

<style lang="scss" scoped>
.side-info {
  @include flex(null, null, column);
  flex-shrink: 0;
  row-gap: 12px;
  position: relative;
  width: 300px;
  @include screenBelow($lg) {
    display: none;
  }
}

.info-card {
  @include flex(null, null, column);
  row-gap: 16px;
  width: 100%;
  padding: 20px;
  border-radius: 12px;
  background-color: var(--bg-2);

  &.--blogger {
    align-items: center;
  }
}

.card-title {
  margin-inline-start: 4px;
}

.title-icon {
  font-size: 1.08em;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.bio {
  color: var(--text-grey);
  font-size: small;
}

.post-stats {
  @include flex(space-around);
  width: 100%;
  margin-top: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  margin-block-end: 8px;
  font-size: small;
}

.stat-total {
  font-size: large;
  font-weight: bold;
}

.contacts {
  @include flex;
  gap: 20px;
}

.contact-icon {
  font-size: 1.5em;
  cursor: pointer;
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
  transition: background-color 0.25s;
  cursor: pointer;

  &:hover {
    background-color: var(--bg-3);
  }
}

.category-label {
  @include line-clamp(1);
}

.tags {
  @include flex(null, null, row wrap);
  gap: 8px;
}

.tag-item {
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.25s;
  cursor: pointer;

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
$card-count: 5;
$child-duration: 0.5s;
$child-delay: 0.1s;

.side-card-appear-enter-active,
.side-card-appear-leave-active {
  transition-property: transform;
  @include staggered-transition-time-manage(
    'root',
    $card-count,
    $child-duration,
    $child-delay
  );

  .info-card {
    transition-property: opacity, transform;
    @include staggered-transition-time-manage(
      'child',
      $card-count,
      $child-duration,
      $child-delay
    );
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
  transition-property: opacity, transform;
  transition-duration: 0.5s;
}

.card-toggle-enter-from,
.card-toggle-leave-to {
  opacity: 0;
  transform: scale(0);
}

// 从文档流中移除离开的元素以保障move动画
.card-toggle-leave-active {
  position: absolute;
}
</style>
