<template>
  <transition
    name="page"
    mode="out-in"
    @before-leave="beforeLeave"
    @enter="enter"
    @after-enter="afterEnter"
  >
    <slot></slot>
  </transition>
</template>

<script setup>
const beforeLeave = (el) => {
  el.style.position = 'absolute'
  el.style.width = '100%'
}

const enter = (el) => {
  el.style.position = 'absolute'
  el.style.width = '100%'
}

const afterEnter = (el) => {
  el.style.position = ''
  el.style.width = ''
}
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style> 