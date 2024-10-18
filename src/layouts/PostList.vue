<template>
  <div
    class="post-list-wrapper"
    :key="`post-list-${currentCriterionName ?? 'all'}-${currentPage}`">
    <h1 v-show="listTitle">
      {{ listTitle }}
      <hr class="border-grey" />
    </h1>
    <ul :class="['post-list', `--${itemStyle}`]">
      <PostListItem
        :data="item"
        :item-style
        v-for="{ metaVer, contVer, cont, ...item } in data"
        :key="`post-${item.name}`" />
    </ul>
    <button @click="handleClick">下一页</button>
  </div>
</template>

<script setup lang="ts">
/* global Blog */
import type { ComputedRef, MaybeRefOrGetter } from 'vue';
import { type ResponseWithCancelFn } from '@/utils/tool';

const { withCriterion, onPageChange } = defineProps<{
  itemStyle: 'detailed' | 'brief';
  withCriterion?: boolean;
  onPageChange: (...args: any[]) => ResponseWithCancelFn<Blog.Post.DBItem[]>;
}>();

import PostListItem from '@/components/PostListItem.vue';

import { ref, computed, watchEffect, toValue, onWatcherCleanup } from 'vue';
import { useRoute } from 'vue-router';
import { useOffsetPagination } from '@vueuse/core';
import { fetchStat } from '@/api';

const route = useRoute();
const criterion = (() => {
  const routeName = route.name!.toString().toLowerCase();
  if (routeName.includes('category')) return 'cate';
  else if (routeName.includes('tag')) return 'tag';
  else return void 0;
})();
const stat = await fetchStat();

let currentTotal: MaybeRefOrGetter<number>;
let currentCriterionName: ComputedRef<string>;
let listTitle: string;
let fetchData: (params: {
  index: number;
  total: number;
  criterionName: string;
}) => ResponseWithCancelFn<Blog.Post.DBItem[]>;

if (withCriterion) {
  currentCriterionName = computed(
    () => route.params[route.name!.toString().substring(1)] as string,
  );

  listTitle = (() => {
    const criterionTitle =
      criterion === 'cate' ? '分类' : criterion === 'tag' ? '标签' : void 0;
    return `${criterionTitle} - ${currentCriterionName.value}`;
  })();

  currentTotal = computed(() => stat[criterion!][currentCriterionName.value]);

  fetchData = ({ index, total, criterionName }) =>
    onPageChange(criterionName, index, total);
} else {
  currentTotal = stat.total.post ?? 0;

  fetchData = ({ index, total }) => onPageChange(index, total);
}

const _fetchPage = async (index: number) => {
  data.value = void 0;
  const { response, cancel } = fetchData({
    index,
    total: toValue(currentTotal),
    criterionName: toValue(currentCriterionName),
  });
  onWatcherCleanup(cancel);
  const pageData = await response;
  if (pageData) data.value = pageData;
};

const data = ref<Blog.Post.DBItem[]>();
watchEffect(async () => {
  await _fetchPage(1);
});

const { currentPage, pageCount } = useOffsetPagination({
  total: currentTotal,
  pageSize: parseInt(import.meta.env.VITE_LIST_LIMIT),
  onPageChange: async ({ currentPage }) => {
    await _fetchPage(currentPage);
  },
});

const handleClick = () => {
  currentPage.value = (currentPage.value % pageCount.value) + 1;
};
</script>

<style lang="scss">
.post-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  &.--detailed {
    @include screenBelow($xl2) {
      grid-template-columns: 1fr;
    }
  }

  &.--brief {
    @include screenBelow($sm) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
