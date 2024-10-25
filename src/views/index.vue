<template>
  <main class="blog-home">
    <PostCover />
    <div class="blog-content">
      <SideCards />
      <RouterView v-slot="{ Component }">
        <template v-if="Component">
          <Transition name="fade-slide-y" mode="out-in">
            <component :is="Component" class="pos-right-fill" />
          </Transition>
        </template>
      </RouterView>
    </div>
  </main>
</template>

<script setup lang="ts">
import PostCover from '@/components/PostCover.vue';
import SideCards from '@/components/SideCards.vue';
</script>

<style lang="scss">
.blog-home {
  overflow: hidden;
  min-height: $scr-h-without-top-nav;
}

.blog-content {
  @include flex;
  column-gap: 12px;
  margin-top: 12px;
  padding: 0 12px;
  border-radius: 12px;
}

.pos-right-fill {
  flex-grow: 1;
  order: 1;

  @include screenBelow($lg) {
    width: 100%;
  }
}
</style>
