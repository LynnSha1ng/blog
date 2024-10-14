<template>
  <article class="post-md-content" v-html="postCont"></article>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { marked } from '@/plugins/marked';
import { fetchWholePost } from '@/api';
import { usePostStore } from '@/stores';

const route = useRoute();
const postStore = usePostStore();
const { setPostInfo, resetPostInfo } = postStore;

const { cont: postContRaw, ...postMeta } = await fetchWholePost(
  route.params.postName as string,
).catch(() => {
  return {
    cont: '',
  };
});
setPostInfo(postMeta);

const postCont = marked.parse(postContRaw);

onUnmounted(() => {
  resetPostInfo();
});
</script>

<style lang="scss">
.post-md-content {
  padding: 12px;
  border-radius: 12px;
  background-color: var(--bg-2);

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    margin: revert;
  }

  ul,
  ol {
    margin: revert;
    padding: revert;
    list-style-type: revert;
  }
}
</style>
