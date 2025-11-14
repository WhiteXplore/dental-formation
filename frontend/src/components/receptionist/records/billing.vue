<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Billing & Payment</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableBilling />
    </div>
  </div>
</template>

<script>
import tableBilling from "./tables/table-billing.vue";
export default {
  name: "BillingPage",
  components: {
    tableBilling,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
