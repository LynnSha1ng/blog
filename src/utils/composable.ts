import { ref, onMounted } from 'vue';

export function useMountedForTransition() {
  const mounted = ref(false);

  onMounted(() => {
    mounted.value = true;
  });

  return {
    mounted,
  };
}
