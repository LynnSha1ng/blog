<template>
  <div class="post-wrapper" :key="`post-page-${$route.params.postName}`">
    <WithDialog
      v-model="errorDialogOpen"
      title="错误"
      :tip="errorTip"
      :before-close="cancelAndBack"
      :key="`dialog-rerender-${retryCount}`">
      <article class="post-md-content" v-html="postCont"></article>
      <template #bottom>
        <button class="error-dialog-btn --back" @click="$router.back()">
          返回
        </button>
        <button
          class="error-dialog-btn --retry"
          @click="getPostData"
          v-show="retryCount < retryAttempts">
          重试
        </button>
      </template>
    </WithDialog>
  </div>
</template>

<script setup lang="ts">
import WithDialog from '@/components/WithDialog.vue';

import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from '@/plugins/marked';
import { fetchWholePost } from '@/api';
import { usePostStore } from '@/stores';

const route = useRoute();
const router = useRouter();
const postStore = usePostStore();
const { setPostInfo, resetPostInfo } = postStore;

const postCont = ref<string>();

const errorDialogOpen = ref(false);
const retryAttempts = 5;
const retryCount = ref(-1);
const errorTip = ref('请求帖子信息失败，请重试。');
const getPostData = async () => {
  try {
    const name = route.params.postName as string;
    const { cont: postContRaw, ...postMeta } = await fetchWholePost(name);
    // throw new Error('测试errorDialog');
    setPostInfo(postMeta);
    postCont.value = marked.parse(postContRaw, {
      async: false,
    });
    errorDialogOpen.value = false;
  } catch (err) {
    errorDialogOpen.value = true;
    retryCount.value += 1;
    if (retryCount.value >= retryAttempts) {
      errorTip.value = '重试次数过多，还是先返回上一页面吧 >.<';
    }
  }
};

onMounted(getPostData);
watch(() => route.params.postName, getPostData);
onUnmounted(resetPostInfo);

const cancelAndBack = async (close: () => void) => {
  close();
  router.back();
};
</script>

<style lang="scss">
.post-md-content {
  padding: $gap;
  border-radius: $gap;
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

  code {
    font-family: 'Consolas';

    &:not([class^='hljs language-']) {
      padding: 2px 4px;
      border-radius: $gap-sm;
      background-color: var(--bg-3);
    }
  }

  .marked-emoji {
    width: 1em;
    height: 1em;
    vertical-align: middle;
    pointer-events: none;
  }
}

.error-dialog-btn {
  padding: 4px 16px;
  border-radius: $gap-sm;
  color: var(--text-white);
  line-height: 1.5;
  @include transition((background-color, color));

  &:hover {
    background-color: var(--bg-3);
  }

  &.--retry:hover {
    color: var(--error);
  }

  &.--back:hover {
    color: var(--primary);
  }
}
</style>
