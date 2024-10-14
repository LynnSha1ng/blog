import { ref, shallowReactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { sleep, staticResUrl } from '@/utils/tool';

export const usePostStore = defineStore('post', () => {
  const _postInfoDefault = {
    name: '',
    title: '',
    description: '',
    coverUrl: staticResUrl('/images/cover-default.jpg'),
    category: '',
    tag: [],
    birthTime: '',
    mTime: '',
  };

  const route = useRoute();

  const ready = ref(false);
  const postInfo = shallowReactive<Blog.Post.Meta>({ ..._postInfoDefault });
  const atPostPage = computed(() => route.name === ':postName');

  function setPostInfo(newVal: Blog.Post.Meta | object) {
    Object.assign(postInfo, newVal);
    ready.value = true;
  }

  async function resetPostInfo() {
    await sleep(350); //过渡动画结束后再重置图片
    Object.assign(postInfo, _postInfoDefault);
    ready.value = false;
  }

  return {
    ready,
    postInfo,
    atPostPage,
    setPostInfo,
    resetPostInfo,
  };
});
