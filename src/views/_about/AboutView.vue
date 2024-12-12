<template>
  <main class="blog-content-about">
    <div>about 1</div>
    <div>about 2</div>
  </main>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.blog-content-about {
  @include flex(null, null, column);
  row-gap: $gap;
  min-height: $scr-h-main-content;
  margin-top: $gap;
  padding: 0 $gap;
}
</style>
