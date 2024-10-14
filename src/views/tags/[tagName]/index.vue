<template>
  <PostList
    item-style="brief"
    :on-page-change="fetchPostsByTag"
    with-criterion />
</template>

<script setup lang="ts">
import PostList from '@/layouts/PostList.vue';

import { fetchPostsByTag } from '@/api';
</script>
