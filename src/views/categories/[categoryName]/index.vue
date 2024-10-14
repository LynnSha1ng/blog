<template>
  <PostList
    item-style="brief"
    :on-page-change="fetchPostsByCategory"
    with-criterion />
</template>

<script setup lang="ts">
import PostList from '@/layouts/PostList.vue';

import { fetchPostsByCategory } from '@/api';
</script>
