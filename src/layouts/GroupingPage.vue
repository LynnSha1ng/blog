<template>
  <section
    :class="['c-grouping-page', `--${nameMap[criterion][0]}`]"
    v-if="$route.name === nameMap[criterion][0]"
    v-show="mounted">
    <h1 class="c-page-title">
      所有{{ nameMap[criterion][2] }}
      <hr class="c-border-grey" />
    </h1>

    <ul class="items">
      <RouterLink
        v-for="(total, label) in stat[nameMap[criterion][3] as keyof Blog.Stat]"
        :key="`grouping-item-${label}`"
        custom
        :to="{
          name: nameMap[criterion][1],
          params: getRouteParams(criterion, label),
        }"
        v-slot="{ navigate }">
        <li class="item" @click="navigate" role="link">
          <span class="label">{{ label }}</span>
          <span class="total">（{{ total }}）</span>
        </li>
      </RouterLink>
    </ul>
  </section>

  <RouterView v-else-if="$route.name === nameMap[criterion][1]" />
</template>

<script setup lang="ts">
defineProps<{
  criterion: 'category' | 'tag';
}>();

import { fetchStat } from '@/api';
import { useMountedForTransition } from '@/utils/composable';

const { mounted } = useMountedForTransition();

const nameMap = {
  category: ['categories', ':categoryName', '分类', 'cate'],
  tag: ['tags', ':tagName', '标签', 'tag'],
};

const getRouteParams = (criterion: 'category' | 'tag', value: any) => {
  const params: Record<string, any> = {};
  const key: string = nameMap[criterion][1].substring(1);
  params[key] = value;
  return params;
};

const stat = await fetchStat();
</script>

<style lang="scss" scoped>
.items {
  display: grid;
  grid-template-columns: repeat(2, minmax(5em, 1fr));

  @include screenBelow($xs2) {
    grid-template-columns: 1fr;
  }
}

.item {
  @include flex(null, center);
  padding: $gap;
  border-radius: $gap;
  font-size: large;
  @include transition((background-color, color), 0.25s);

  &:hover {
    background-color: var(--bg-3);
    color: var(--primary);
  }
}

.label {
  @include line-clamp(2);
  text-wrap: balance;
}

.total {
  margin-inline-start: 0.5em;
}
</style>
