<template>
  <PostList item-style="detailed" :on-page-change="fetchAllPosts" />
</template>

<script setup lang="ts">
import PostList from '@/layouts/PostList.vue';

import { fetchAllPosts } from '@/api';
</script>
