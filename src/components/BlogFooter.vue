<template>
  <footer class="blog-footer">
    <div class="footer-title">
      <h3>LynnSha1ng's Blog</h3>
      <span>&copy;2022 - {{ currentYear }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<style lang="scss">
.blog-footer {
  @include flex(center, center);
  height: $h-footer;
  margin-top: $gap;
  background-color: var(--bg-2);
}

.footer-title {
  @include inline-separator('|', $gap-sm);
}
</style>
