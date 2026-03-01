<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Dental Records</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableCharts />
    </div>
  </div>
</template>

<script>
import tableCharts from "./tables/table-charts.vue";
export default {
  name: "DentistAppointmentPage",
  components: {
    tableCharts,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
