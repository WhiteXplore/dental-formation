<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Dental Charts</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableChart />
    </div>
  </div>
</template>

<script>
import tableChart from "./tables/table-charts.vue";
export default {
  name: "DentistAppointmentPage",
  components: {
    tableChart,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
