<template>
  <slot></slot>

  <Teleport to="body">
    <Transition name="fade">
      <div class="dialog" v-show="open">
        <div class="c-screen-mask" @click="handleClose"></div>

        <Transition name="fade-slide-y" appear>
          <div class="dialog-main" :="$attrs">
            <div class="dialog-top">
              <h3 class="dialog-title">{{ title }}</h3>
              <button
                class="dialog-cancel-btn iconfont icon-quxiao"
                @click="handleClose"></button>
            </div>

            <div class="dialog-content">
              <slot name="content" v-if="$slots.content"></slot>
              <span v-else-if="tip">{{ tip }}</span>
            </div>

            <div class="dialog-bottom">
              <slot name="bottom"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const { beforeClose } = defineProps<{
  title?: string;
  tip?: string;
  beforeClose?: (close: () => void) => void;
}>();

const open = defineModel<boolean>({ required: true });

const close = () => {
  open.value = false;
};

const handleClose = () => {
  if (typeof beforeClose === 'function') beforeClose(close);
  else close();
};
</script>

<style lang="scss">
@use 'sass:math';

$sz-btn-icon: 16px;
$sz-cancel-btn: 25px;

.dialog {
  @include flex(center, center);
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.dialog-main {
  position: absolute;
  width: 75%;
  max-width: 600px;
  padding: $gap;
  border-radius: $gap;
  background-color: var(--bg-2);
}

.dialog-top {
  @include flex;
}

.dialog-title {
  width: calc(100% - $sz-cancel-btn);
}

.dialog-cancel-btn {
  padding: math.div($sz-cancel-btn - $sz-btn-icon, 2);
  color: var(--text-grey);
}

.dialog-content {
  margin: $gap 0;
}

.dialog-bottom {
  @include flex(flex-end, center);
}
</style>
