import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_REPO_NAME');
  return {
    base: `/${env.VITE_REPO_NAME}/`,
    plugins: [
      vue(),
      vueJsx(),
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/highlight.js/styles/github(-dark)?.min.css',
            dest: 'assets',
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/util" as *;',
        },
      },
    },
    build: {
      // 大致在2023上半年
      target: ['es2022', 'edge114', 'chrome114', 'firefox113', 'safari16'],
    },
  };
});
