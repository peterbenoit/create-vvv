<template>
  <div class="text-center space-y-4">
    <h2 class="text-2xl font-bold text-indigo-600">About</h2>
    <p class="text-gray-500 max-w-sm mx-auto">
      Built with Vue 3, Vite, Tailwind CSS v4, and deployed on Vercel.
    </p>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'

useHead({
  title: 'About',
})
</script>
