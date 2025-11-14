<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Prescription</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableMedication />
    </div>
  </div>
</template>

<script>
import tableMedication from "./tables/table-medication.vue";
export default {
  name: "DentistAppointmentPage",
  components: {
    tableMedication,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
