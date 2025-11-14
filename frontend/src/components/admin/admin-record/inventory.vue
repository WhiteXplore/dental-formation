<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Inventory Management</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <viewInventory />
    </div>
  </div>
</template>

<script>
import viewInventory from "./modals/view-inventory.vue";
export default {
  name: "InvetoryPage",
  components: {
    viewInventory,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
