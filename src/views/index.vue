<template>
  <main class="blog-content-home">
    <PostCover />
    <div class="content-main">
      <SideCards />
      <RouterView v-slot="{ Component }">
        <template v-if="Component">
          <Transition name="fade-slide-y" mode="out-in">
            <component :is="Component" class="main-right" />
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
.blog-content-home {
  min-height: $scr-h-main-content;
}

.content-main {
  @include flex;
  column-gap: $gap;
  margin-top: $gap;
  padding: 0 $gap;
  border-radius: $gap;
}

.main-right {
  flex: 1;
}
</style>
