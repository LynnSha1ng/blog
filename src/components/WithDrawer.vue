<template>
  <slot></slot>

  <Teleport to="body">
    <Transition name="fade">
      <div class="drawer" v-show="open">
        <div class="c-screen-mask" @click="open = false"></div>

        <Transition name="drawer-open">
          <div
            :class="['drawer-main', `--from-${enterFrom}`]"
            :style="{
              '--drawer-width': width,
              '--drawer-height': height,
              '--drawer-translate-from': translateFrom,
            }"
            v-show="open">
            <slot name="content"></slot>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { enterFrom = 'right', width } = defineProps<{
  enterFrom?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  height?: string;
}>();

const open = defineModel<boolean>({ required: true });

import { computed } from 'vue';

const translateFrom = computed(() => {
  const directionMap = {
    top: '0, -100%',
    bottom: '0, 100%',
    left: '-100%, 0',
    right: '100%, 0',
  };
  return directionMap[enterFrom] || '100%, 0';
});
</script>

<style lang="scss">
.drawer {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.drawer-main {
  position: absolute;
  width: var(--drawer-width);
  height: var(--drawer-height);
  padding: $gap;
  border-radius: $gap;
  background-color: var(--bg-2);
  transform: translate(0, 0);

  @each $direction in top, bottom, left, right {
    &.--from-#{$direction} {
      #{$direction}: 0;
      @if $direction == top or $direction == bottom {
        width: 100%;
      } @else {
        height: 100%;
      }
    }
  }
}
</style>

<!-- transition -->
<style lang="scss" scoped>
.fade-leave-active {
  @include transition(opacity, 0.35s, 0.15s);
}

.drawer-open-enter-active,
.drawer-open-leave-active {
  @include transition(transform);
}

.drawer-open-enter-from,
.drawer-open-leave-to {
  transform: translate(var(--drawer-translate-from));
}
</style>
