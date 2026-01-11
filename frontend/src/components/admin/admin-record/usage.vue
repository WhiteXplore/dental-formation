<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Usage Consumption</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableUsageConsupmtion />
    </div>
  </div>
</template>

<script>
import tableUsageConsupmtion from "./tables/table-usage-consupmtion.vue";
export default {
  name: "UsagePage",
  components: {
    tableUsageConsupmtion,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
