<template>
  <div class="blogger-card">
    <img class="avatar" src="/images/avatar.jpg" alt="头像" />
    <h3 v-show="!brief">临郢夏望</h3>
    <span class="bio" v-show="!brief">谦逊对待未知</span>
    <ul class="post-stats">
      <li
        class="stat-item"
        v-for="(label, key) of statMap"
        :key="`blogger-card-stat-${key}`">
        <span class="stat-label">{{ label }}</span>
        <div class="stat-total">{{ total[key] ?? '*' }}</div>
      </li>
    </ul>
    <ul class="contacts" v-show="!brief">
      <li class="contact-icon iconfont icon-QQ"></li>
      <li class="contact-icon iconfont icon-mail"></li>
      <li class="contact-icon iconfont icon-github"></li>
      <li class="contact-icon iconfont icon-tuite"></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  brief?: boolean;
}>();

import { fetchStat } from '@/api';

const { total } = await fetchStat();

const statMap = {
  post: '文章',
  cate: '分类',
  tag: '标签',
};
</script>

<style lang="scss" scoped>
.blogger-card {
  @include flex(null, center, column);
  row-gap: 16px;
  padding: 20px;
  border-radius: $gap;
  background-color: var(--bg-2);
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
  margin-top: $gap-sm;
}

.stat-item {
  text-align: center;
  pointer-events: none;
}

.stat-label {
  font-size: small;
}

.stat-total {
  margin-block-start: $gap-sm;
  font-size: large;
  font-weight: bold;
}

.contacts {
  @include flex;
  gap: 20px;
}

.contact-icon {
  font-size: 1.5em;
}
</style>
