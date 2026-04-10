<template>
  <div class="min-h-screen bg-gray-50 py-16 px-4">
    <div class="max-w-2xl mx-auto space-y-8">

      <!-- Header -->
      <div class="text-center space-y-3">
        <img src="/favicon.svg" alt="Logo" class="w-16 h-16 mx-auto" />
        <h1 class="text-4xl font-bold text-indigo-600">Vercel + Vite + Vue</h1>
        <p class="text-gray-500">
          Your project is running. Start by editing
          <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-700">src/pages/Home.vue</code>.
        </p>
      </div>

      <!-- API demo -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 class="font-semibold text-gray-800 text-lg">Test your API route</h2>
        <p class="text-sm text-gray-500">
          Calls <code class="bg-gray-100 px-1 rounded font-mono">/api/hello</code>.
          Requires <code class="bg-gray-100 px-1 rounded font-mono">npx vercel dev</code> to work locally.
          With <code class="bg-gray-100 px-1 rounded font-mono">npm run dev</code> only, it will return an error — that is expected.
        </p>
        <button
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm"
          :disabled="loading"
          @click="loadMessage"
        >
          {{ loading ? 'Loading...' : 'Call /api/hello' }}
        </button>
        <p v-if="message" class="text-sm" :class="isError ? 'text-red-500' : 'text-gray-700'">{{ message }}</p>
      </div>

      <!-- Next steps -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 class="font-semibold text-gray-800 text-lg">Next steps</h2>
        <ul class="space-y-3 text-sm text-gray-600">
          <li class="flex gap-3">
            <span class="text-indigo-400 shrink-0">▸</span>
            <span>Edit <code class="bg-gray-100 px-1 rounded font-mono">src/pages/Home.vue</code> to build your home page.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-indigo-400 shrink-0">▸</span>
            <span>Add pages in <code class="bg-gray-100 px-1 rounded font-mono">src/pages/</code> and register them in <code class="bg-gray-100 px-1 rounded font-mono">src/router.js</code>.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-indigo-400 shrink-0">▸</span>
            <span>Edit <code class="bg-gray-100 px-1 rounded font-mono">api/hello.js</code> for your backend. Add more files in <code class="bg-gray-100 px-1 rounded font-mono">api/</code> for new routes.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-indigo-400 shrink-0">▸</span>
            <span>Use <code class="bg-gray-100 px-1 rounded font-mono">npm run dev</code> for UI-only work, and <code class="bg-gray-100 px-1 rounded font-mono">npx vercel dev</code> when you need API routes available locally.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-indigo-400 shrink-0">▸</span>
            <span>Copy <code class="bg-gray-100 px-1 rounded font-mono">.env.example</code> to <code class="bg-gray-100 px-1 rounded font-mono">.env</code> and fill in your variables.</span>
          </li>
        </ul>
      </div>

      <div class="text-center text-xs text-gray-400">
        <a
          href="https://github.com/peterbenoit/VercelViteVue"
          target="_blank"
          rel="noopener noreferrer"
          class="text-indigo-400 hover:underline"
        >GitHub</a>
      </div>

    </div>
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
const isError = ref(false)
const loading = ref(false)

async function loadMessage() {
  loading.value = true
  isError.value = false
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/hello`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    message.value = data.message
  } catch {
    isError.value = true
    message.value = import.meta.env.DEV
      ? 'API unavailable — run npx vercel dev to test API routes locally'
      : 'Error connecting to API'
  } finally {
    loading.value = false
  }
}
</script>
