import { ref, shallowReactive } from 'vue';
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

  const infoLoaded = ref(false);
  const postInfo = shallowReactive<Blog.Post.Meta>({ ..._postInfoDefault });

  function setPostInfo(newVal: Blog.Post.Meta) {
    Object.assign(postInfo, newVal);
    infoLoaded.value = true;
  }

  async function resetPostInfo() {
    await sleep(350); // 等待过渡动画结束
    Object.assign(postInfo, _postInfoDefault);
    infoLoaded.value = false;
  }

  return {
    infoLoaded,
    postInfo,
    setPostInfo,
    resetPostInfo,
  };
});
