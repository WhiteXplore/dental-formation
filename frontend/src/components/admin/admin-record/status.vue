<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Status</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableStatus />
    </div>
  </div>
</template>

<script>
import tableStatus from "./tables/table-status.vue";
export default {
  name: "InvetoryPage",
  components: {
    tableStatus,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
