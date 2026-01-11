<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Patient History</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <viewInventoryTracker />
    </div>
  </div>
</template>

<script>
import viewInventoryTracker from "./tables/table-view-inventory-report.vue";
export default {
  name: "InvetoryPage",
  components: {
    viewInventoryTracker,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
