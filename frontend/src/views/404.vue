<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="text-center">
      <h1 class="text-5xl font-bold text-gray-800">404</h1>
      <p class="text-lg text-gray-600 mt-2">Oops! Page not found.</p>
      <router-link to="/" class="mt-4 text-green-600 underline"
        >Return to login</router-link
      >
    </div>
  </div>
</template>
<script>
export default {
  name: "NotFoundPage",
};
</script>
