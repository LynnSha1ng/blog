<template>
  <section
    class="post-list-wrapper"
    :key="`post-list-${currentCriterionName ?? 'all'}-${currentPage}`"
    v-show="mounted">
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

      <input
        class="input-index"
        type="number"
        :placeholder="`${currentPage}`"
        @change="pageJump"
        @keydown.enter="pageJump" />

      <PaginationButton
        icon-class="icon-arrow-right-bold"
        :disabled="isLastPage"
        @click="next" />

      <PaginationButton
        icon-class="icon-arrow-double-right"
        :disabled="isLastPage"
        @click="currentPage = pageCount" />
    </div>
  </section>
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

import {
  shallowRef,
  computed,
  toValue,
  watch,
  watchEffect,
  onWatcherCleanup,
} from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { useOffsetPagination, useSessionStorage } from '@vueuse/core';
import { fetchStat } from '@/api';
import { sessionStorageUtils } from '@/utils/tool';
import { useMountedForTransition } from '@/utils/composable';

const { mounted } = useMountedForTransition();

const route = useRoute();
const criterion = (() => {
  const routeName = route.name!.toString().toLowerCase();
  if (routeName.includes('category')) return 'cate';
  else if (routeName.includes('tag')) return 'tag';
  else return void 0;
})();
const stat = await fetchStat();

let currentTotal: MaybeRefOrGetter<number>;
let currentCriterionName: ComputedRef<string> | undefined = void 0;
let listTitle: ComputedRef<string> | undefined = void 0;
let _fetchWrapperFn: (params: {
  index: number;
  total: number;
  criterionName?: string;
}) => ResponseWithCancelFn<Blog.Post.DBItem[]>;

if (withCriterion) {
  currentCriterionName = computed(
    () => route.params[route.name!.toString().substring(1)] as string,
  );

  listTitle = computed(() => {
    const criterionTitle =
      criterion === 'cate' ? '分类' : criterion === 'tag' ? '标签' : void 0;
    return `${criterionTitle} - ${currentCriterionName!.value}`;
  });

  currentTotal = computed(() => stat[criterion!][currentCriterionName!.value]);

  _fetchWrapperFn = ({ index, total, criterionName }) =>
    onPageChange(criterionName, index, total);
} else {
  currentTotal = stat.total.post ?? 0;

  _fetchWrapperFn = ({ index, total }) => onPageChange(index, total);
}

const fetchPage = async (index: number) => {
  const { response, cancel } = _fetchWrapperFn({
    index,
    total: toValue(currentTotal),
    criterionName: toValue(currentCriterionName),
  });
  onWatcherCleanup(cancel);
  const pageData = await response;
  if (pageData) data.value = pageData;
};

const data = shallowRef<Blog.Post.DBItem[]>([]);
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
      scroll({
        top: 0,
        behavior: 'smooth',
      });
    },
  });
const { pause, resume } = watchEffect(async () => {
  await fetchPage(toValue(indexRecord));
  pause();
});
if (currentCriterionName) {
  watch(currentCriterionName, () => {
    indexRecord.value = 1;
    resume();
  });
}
onBeforeRouteLeave(to => {
  if (to.name !== ':postName') {
    sessionStorageUtils.setItem('lastPageIndex', 1);
  }
});

// 切页按钮封装
type PaginationButtonProps = {
  iconClass: string;
  disabled?: boolean;
  label?: string;
};
type PaginationButtonEmits = {
  click(): void;
};
const PaginationButton: FunctionalComponent<
  PaginationButtonProps,
  PaginationButtonEmits
> = (props, { emit }) => (
  <button
    type='button'
    class={[
      'pagination-btn',
      'iconfont',
      props.iconClass,
      props.disabled ? '--disabled' : '',
    ]}
    onClick={() => emit('click')}>
    {props.label ?? ''}
  </button>
);
PaginationButton.props = {
  iconClass: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
  },
  label: String,
};
PaginationButton.emits = ['click'];

// 输入页数并跳转
const pageJump = (e: Event) => {
  const inputEl = e.target as HTMLInputElement;
  const destIndex = inputEl.valueAsNumber;
  if (destIndex > toValue(pageCount)) {
    // TODO 页数超限提示框
    inputEl.value = '';
    return;
  }
  currentPage.value = destIndex;

  if (e.type === 'keydown') {
    inputEl.blur();
  }
};
</script>

<style lang="scss">
.post-list-wrapper {
  overflow: hidden;
}

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
  @include flex(center, center);
  gap: 8px;
  margin: 12px 0;
}

.pagination-btn {
  padding: 12px;
  border-radius: 12px;
  background-color: var(--bg-3);
  color: var(--text-regular);
  @include transition((background-color, color));

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

.input-index {
  width: calc(12px * 2 + 2rem);
  padding: 12px;
  border: 2px solid var(--bg-2);
  border-radius: 12px;
  outline: 1px solid transparent;
  background-color: transparent;
  color: var(--text-regular);
  text-align: center;
  @include transition(outline, 0.15s);

  &::placeholder {
    color: var(--text-regular);
  }

  &:focus {
    outline: 1px solid var(--text-white);

    &::placeholder {
      color: transparent;
    }
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>
