<template>
  <nav
    :class="{
      'blog-nav': true,
      'shadow-bottom': showNav,
    }"
    :style="{
      '--nav-trans-y': cssNavTransY,
    }">
    <h3>
      <RouterLink :to="{ name: 'homeView' }">{{ title }}</RouterLink>
    </h3>

    <ul class="nav-items --pc-only">
      <RouterLink
        v-for="item in itemsMid"
        :key="`nav-item-labeled-${item}`"
        custom
        :to="item.to"
        v-slot="{ navigate }">
        <li class="nav-item underline-grow" @click="navigate" role="link">
          <i :class="['nav-item-icon', 'iconfont', item.iconClass]"></i>
          <span class="nav-item-label"> {{ item.label }}</span>
        </li>
      </RouterLink>
    </ul>

    <ul class="nav-items">
      <RouterLink
        custom
        :to="{
          name: ':postName',
          params: {
            postName: randomPostName,
          },
        }"
        v-slot="{ navigate }">
        <li
          class="nav-item underline-grow nav-item-icon iconfont icon-touzi"
          title="随便逛逛"
          @click="
            e => {
              if (randomPostName !== ' ') navigate(e);
              updateRandomPostName();
            }
          "
          role="link"></li>
      </RouterLink>

      <WithDrawer v-model="menuOpen" width="300px" enter-from="right">
        <li
          class="nav-item underline-grow nav-item-icon iconfont icon-caidan --mobile-only"
          @click="menuOpen = true"></li>
        <template #content>
          <Suspense>
            <BloggerCard brief />
          </Suspense>
          <hr class="c-border-grey" />
          <ul class="menu-items">
            <RouterLink
              v-for="item in itemsMid"
              :key="`nav-menu-item-${item}`"
              custom
              :to="item.to"
              v-slot="{ navigate }">
              <li
                class="menu-item"
                @click="
                  e => {
                    navigate(e);
                    menuOpen = false;
                  }
                "
                role="link">
                <i :class="['menu-item-icon', 'iconfont', item.iconClass]"></i>
                <span class="menu-item-label"> {{ item.label }}</span>
              </li>
            </RouterLink>
          </ul>
        </template>
      </WithDrawer>
    </ul>
  </nav>
  <div class="blog-nav-placeholder"></div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

interface NavItem {
  iconClass: string;
  label: string;
  to: RouteLocationRaw;
}

defineProps<{
  title: string;
  itemsMid: NavItem[];
  withPlaceholder?: boolean;
}>();

import BloggerCard from './BloggerCard.vue';
import WithDrawer from './WithDrawer.vue';

import { ref, computed, onBeforeMount } from 'vue';
import { useEventListener, useDebounceFn, useThrottleFn } from '@vueuse/core';
import { fetchRandomPostName } from '@/api';

// nav主逻辑
const showNav = ref(true);
const lastScrollY = ref(0);
const cssNavTransY = computed(() => (showNav.value ? '0' : '-100%'));

useEventListener(
  window,
  'scroll',
  useDebounceFn(() => {
    if (window.innerWidth <= 768) return;
    if (window.scrollY - lastScrollY.value < 0) {
      showNav.value = true;
    } else if (window.scrollY - lastScrollY.value > 0 && window.scrollY >= 60) {
      showNav.value = false;
    }
    lastScrollY.value = window.scrollY;
  }, 200),
);

useEventListener(
  window,
  'resize',
  useThrottleFn(() => {
    if (window.innerWidth <= 768) {
      showNav.value = true;
    }
  }, 1000),
);

// 随便逛逛
const randomPostName = ref(' ');
const updateRandomPostName = async () => {
  const name = await fetchRandomPostName();
  if (name) {
    randomPostName.value = name;
  }
};
onBeforeMount(async () => {
  await updateRandomPostName();
});

// 移动端汉堡菜单
const menuOpen = ref(false);
</script>

<style lang="scss" scoped>
.blog-nav-placeholder {
  height: $h-nav;
}

.blog-nav {
  position: fixed;
  z-index: 1145;
  @include flex(space-between, center);
  width: 100%;
  height: $h-nav;
  max-width: $scr-w-max;
  padding: 0 $gap;
  background-color: color-mix(in oklch, var(--bg-2), transparent 25%);
  transform: translateY(var(--nav-trans-y));
  @include transition((background-color, transform, box-shadow));
}

.nav-items {
  @include flex;
  gap: $gap-sm;

  &.--pc-only {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    @include screenBelow($md) {
      display: none;
    }
  }
}

.nav-item {
  --color-grow-line: var(--primary);

  padding: $gap-sm;

  &:hover {
    color: var(--primary);
  }

  &.--mobile-only {
    @include screenAbove($md) {
      display: none;
    }
  }
}

.nav-item-icon {
  font-size: 1.25rem;
}

.nav-item-label {
  margin-inline-start: $gap-sm;
}

.menu-items {
  @include flex(null, null, column);
  row-gap: $gap-sm;
  margin-top: 20px;
}

.menu-item {
  @include flex(null, center);
  padding: $gap;
  border-radius: $gap;
  background-color: var(--bg-2);
  vertical-align: middle;
  @include transition((background-color, color));

  &:hover {
    background-color: var(--bg-3);
    color: var(--primary);
  }
}

.menu-item-icon {
  font-size: 1.5rem;
}

.menu-item-label {
  margin-inline-start: 1em;
}

.shadow-bottom {
  box-shadow: 0 3px 6px -3px rgba(0, 0, 0, 0.25);
}

.underline-grow {
  --_color: var(--color-grow-line, var(--text-normal));
  background: linear-gradient(var(--_color), var(--_color)) no-repeat right
    bottom;
  background-size: 0 4px;
  @include transition((background-size, color, box-shadow), 0.5s);
  contain: content;

  &:hover {
    background-position-x: left;
    background-size: 100% 4px;
  }
}
</style>
