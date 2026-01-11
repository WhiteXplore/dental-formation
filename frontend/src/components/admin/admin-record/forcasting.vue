<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Revenue Forcasting</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableRevenueForcasting />
    </div>
  </div>
</template>

<script>
import tableRevenueForcasting from "./tables/table-revenue-forcasting.vue";
export default {
  name: "HMOGuarantorsPage",
  components: {
    tableRevenueForcasting,
  },
};
</script>

<style scoped></style>
