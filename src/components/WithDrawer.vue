<template>
  <slot></slot>

  <Teleport to="body">
    <Transition name="fade">
      <div class="drawer" v-show="open">
        <div class="screen-mask" @click="open = false"></div>

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
  if (enterFrom === 'top') return '0, -100%';
  else if (enterFrom === 'bottom') return '0, 100%';
  else if (enterFrom === 'left') return '-100%, 0';
  else if (enterFrom === 'right') return '100%, 0';
  return '100%, 0';
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
  padding: 12px;
  border-radius: 12px;
  background-color: var(--bg-2);
  transform: translate(0, 0);

  &.--from-top {
    top: 0;
    width: 100%;
  }

  &.--from-bottom {
    bottom: 0;
    width: 100%;
  }

  &.--from-left {
    left: 0;
    height: 100%;
  }

  &.--from-right {
    right: 0;
    height: 100%;
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
