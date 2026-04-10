<template>
  <div class="text-center space-y-6">
    <div>
      <img src="/favicon.svg" alt="Logo" class="w-24 h-24 mx-auto mb-4" />
      <h1 class="text-4xl font-bold text-indigo-600">Vercel + Vite + Vue</h1>
      <p class="text-lg text-gray-500 max-w-md mx-auto mt-2">
        A modern Vue 3 starter with Vite, Tailwind CSS v4, and Vercel serverless API routes.
      </p>
    </div>

    <div class="space-y-3">
      <button
        class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        :disabled="loading"
        @click="loadMessage"
      >
        {{ loading ? 'Loading...' : 'Call Test API' }}
      </button>
      <p v-if="message" class="text-gray-700 text-sm">{{ message }}</p>
    </div>

    <a
      href="https://github.com/peterbenoit/VercelViteVue"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-block text-indigo-500 hover:underline text-sm"
    >
      GitHub
    </a>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Home',
  meta: [{ name: 'description', content: 'Welcome to your Vercel + Vite + Vue app.' }],
})

const message = ref('')
const loading = ref(false)

async function loadMessage() {
  loading.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/hello`)
    const data = await res.json()
    message.value = data.message
  } catch {
    message.value = 'Error connecting to API'
  } finally {
    loading.value = false
  }
}
</script>
