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
    <div class="pagination">
      <PaginationButton
        icon-class="icon-arrow-double-left"
        :disabled="isFirstPage"
        @click="currentPage = 1" />
      <PaginationButton
        icon-class="icon-arrow-left-bold"
        :disabled="isFirstPage"
        @click="prev" />
      {{ currentPage }}
      <PaginationButton
        icon-class="icon-arrow-right-bold"
        :disabled="isLastPage"
        @click="next" />
      <PaginationButton
        icon-class="icon-arrow-double-right"
        :disabled="isLastPage"
        @click="currentPage = pageCount" />
    </div>
  </div>
</template>

<script setup lang="tsx">
/* global Blog */
import type { ComputedRef, MaybeRefOrGetter, FunctionalComponent } from 'vue';
import type { ResponseWithCancelFn } from '@/utils/tool';

const { withCriterion, onPageChange } = defineProps<{
  itemStyle: 'detailed' | 'brief';
  withCriterion?: boolean;
  onPageChange: (...args: any[]) => ResponseWithCancelFn<Blog.Post.DBItem[]>;
}>();

import PostListItem from '@/components/PostListItem.vue';

import { ref, computed, watchEffect, toValue, onWatcherCleanup } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { useOffsetPagination, useSessionStorage } from '@vueuse/core';
import { fetchStat } from '@/api';
import { sessionStorageUtils } from '@/utils/tool';

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
let _fetchWrapperFn: (params: {
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

  _fetchWrapperFn = ({ index, total, criterionName }) =>
    onPageChange(criterionName, index, total);
} else {
  currentTotal = stat.total.post ?? 0;

  _fetchWrapperFn = ({ index, total }) => onPageChange(index, total);
}

const fetchPage = async (index: number, init = false) => {
  const { response, cancel } = _fetchWrapperFn({
    index,
    total: toValue(currentTotal),
    criterionName: toValue(currentCriterionName),
  });
  if (!init) onWatcherCleanup(cancel);
  const pageData = await response;
  if (pageData) data.value = pageData;
};

const data = ref<Blog.Post.DBItem[]>();
const indexRecord = useSessionStorage('lastPageIndex', 1, {
  mergeDefaults: true,
});

const { currentPage, pageCount, isFirstPage, isLastPage, prev, next } =
  useOffsetPagination({
    total: currentTotal,
    page: indexRecord,
    pageSize: parseInt(import.meta.env.VITE_LIST_LIMIT),
    onPageChange: async ({ currentPage }) => {
      await fetchPage(currentPage);
      indexRecord.value = currentPage;
    },
  });
watchEffect(async () => {
  await fetchPage(toValue(indexRecord));
});
onBeforeRouteLeave(to => {
  if (to.name !== ':postName') {
    sessionStorageUtils.setItem('lastPageIndex', 1);
  }
});

const PaginationButton: FunctionalComponent<
  { iconClass: string; disabled: boolean; label?: string },
  { click(): void }
> = (props, { emit }) => {
  return (
    <button
      class={[
        'pagination-btn',
        'iconfont',
        props.iconClass,
        props.disabled ? '--disabled' : '',
      ]}
      onClick={() => emit('click')}>
      {props.label}
    </button>
  );
};
PaginationButton.props = {
  iconClass: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: true,
  },
  label: String,
};
PaginationButton.emits = ['click'];
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

.pagination {
  @include flex(center, center, wrap);
  gap: 8px;
  margin: 12px 0;
}

.pagination-btn {
  padding: 12px;
  border-radius: 12px;
  background-color: var(--bg-3);
  color: var(--text-regular);
  transition-property: background-color, color;
  transition-duration: 0.35s;

  &.--disabled {
    background-color: var(--bg-1);
    border: 2px solid var(--bg-2);
    color: var(--text-grey);
    cursor: not-allowed;
  }

  &:not(.--disabled):hover {
    background-color: var(--bg-4);
  }
}
</style>
