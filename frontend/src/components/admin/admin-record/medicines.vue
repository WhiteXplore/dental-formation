<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Medicines</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableMedicines />
    </div>
  </div>
</template>

<script>
import tableMedicines from "./tables/table-medicines.vue";
export default {
  name: "InvetoryPage",
  components: {
    tableMedicines,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
