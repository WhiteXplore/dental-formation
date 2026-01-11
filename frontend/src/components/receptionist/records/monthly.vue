<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Monthly Reports</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableMonthlyReports />
    </div>
  </div>
</template>

<script>
import tableMonthlyReports from "./tables/table-monthly-reports.vue";
export default {
  name: "DentistAppointmentPage",
  components: {
    tableMonthlyReports,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
