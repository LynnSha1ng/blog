<template>
  <div class="content-main-page friend-links" v-show="mounted">
    <h1 class="page-title">
      <span class="title-label">友情链接</span>
      <hr class="border-grey" />
    </h1>

    <ul class="links">
      <li class="link" v-for="link in data" :key="`friend-link-${link.name}`">
        <a
          class="link-item"
          :style="{
            '--bg-color': link.color,
          }"
          :href="link.url"
          target="_blank"
          rel="noopener">
          <div
            class="item-bg"
            :style="{
              backgroundColor: link.color,
            }"></div>
          <img class="logo-img" :src="link.logo" :alt="link.name" />
          <div class="link-info">
            <h3 class="name" :title="link.name">{{ link.name }}</h3>
            <span class="tagline" :title="link.tagline">
              {{ link.tagline }}
            </span>
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { fetchLinkExchange } from '@/api';
import { useMountedForTransition } from '@/utils/composable';

const { mounted } = useMountedForTransition();

const data = await fetchLinkExchange();
</script>

<style lang="scss" scoped>
$item-padding: 8px;
$logo-size: 60px;
$logo-ml: 16px;
$logo-border-w: 4px;

$trans-duration: 0.5s;
$trans-delay: 0.2s;

$bg-size: $logo-size + 2 * $logo-border-w;
$bg-pos-l: $item-padding + ($logo-ml - $logo-border-w);
$w-left-all: $bg-size + $bg-pos-l;

$info-abs-w: calc(100% - 2 * $item-padding - $bg-pos-l - $bg-size);
$info-abs-w-max: calc(100% - 2 * $item-padding);

$bg-hover-w: calc(100% + $w-left-all);

@mixin set-transition($property...) {
  @include transition($property, $trans-duration, $trans-delay);
}

.links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @include screenBelow($xl) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include screenBelow($xs) {
    grid-template-columns: 1fr;
  }
}

.link {
  overflow: hidden;
  height: 128px;
  border: 3px solid var(--bg-3);
  border-radius: 12px;

  &:hover {
    .item-bg {
      left: 0;
      width: calc(100% + 90px);
      height: 100%;
      border-radius: 0;
    }

    .logo-img {
      transform: translateX(-$w-left-all) rotate(-180deg);
    }

    .link-info {
      width: $info-abs-w-max;
    }
  }

  &:not(:hover) {
    .item-bg {
      animation: bounce-back $trans-duration * 2 ease $trans-delay backwards;
    }

    .logo-img {
      animation: rotate-back $trans-duration * 2 ease $trans-delay backwards;
    }
  }
}

@include screenBelow($lg) {
  .link:hover {
    .link-item {
      background-color: var(--bg-color, var(--bg-3));
    }

    .logo-img {
      transform: translate(0, 0);
      filter: blur(0);
    }
  }
}

.link-item {
  @include flex(null, center);
  position: relative;
  height: 100%;
  padding: $item-padding;
  contain: content;

  @include screenBelow($lg) {
    @include set-transition(background-color);
  }
}

.item-bg {
  position: absolute;
  left: $bg-pos-l;
  z-index: -1;
  width: $bg-size;
  height: $bg-size;
  border-radius: 50%;
  background-color: var(--bg-color, var(--bg-3));
  @include set-transition(left, width, height, border-radius);

  @include screenBelow($lg) {
    display: none;
  }
}

.logo-img {
  width: $logo-size;
  height: $logo-size;
  margin-left: $logo-ml;
  border-radius: 50%;
  @include set-transition(transform, filter);

  @include screenBelow($lg) {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100px;
    height: 100px;
    border-radius: 12px;
    transform: translate(20px, 20px);
    filter: blur(16px);
    animation: none !important;
  }
}

.link-info {
  position: absolute;
  right: $item-padding;
  width: $info-abs-w;
  @include set-transition(width);
  mix-blend-mode: difference;

  @include screenBelow($lg) {
    position: static;
    width: 100%;
    transition: none;
  }
}

.name,
.tagline {
  @include line-clamp(1);
}

.tagline {
  margin-block-start: 12px;
}

@keyframes bounce-back {
  0% {
    transform: translateX(-$w-left-all);
  }
  50% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes rotate-back {
  0% {
    transform: translateX(-$w-left-all) rotate(-180deg);
  }
  50% {
    transform: translateX(10px) rotate(20deg);
  }
  100% {
    transform: translateX(0) rotate(0);
  }
}
</style>
