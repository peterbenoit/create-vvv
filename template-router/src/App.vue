<template>
  <div class="min-h-screen">
    <nav class="bg-white shadow-sm px-6 py-3 flex gap-6">
      <router-link
        to="/"
        class="text-indigo-600 hover:underline font-medium"
        active-class="underline"
      >
        Home
      </router-link>
      <router-link
        to="/about"
        class="text-indigo-600 hover:underline font-medium"
        active-class="underline"
      >
        About
      </router-link>
    </nav>
    <main class="flex items-center justify-center py-16 px-4">
      <router-view />
    </main>
  </div>
</template>
