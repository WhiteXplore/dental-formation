<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Price Procedures</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tablePrice />
    </div>
  </div>
</template>

<script>
import tablePrice from "./tables/table-price.vue";
export default {
  name: "InvetoryPage",
  components: {
    tablePrice,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
