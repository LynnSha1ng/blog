<template>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <PostCover />
      <div class="blog-content">
        <SideCard />
        <Transition name="fade-slide-y" mode="out-in">
          <component :is="Component" class="pos-right-fill"></component>
        </Transition>
      </div>
    </template>
  </RouterView>
</template>

<script setup lang="ts">
import PostCover from '@/components/PostCover.vue';
import SideCard from '@/components/SideCard.vue';
</script>

<style lang="scss">
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
