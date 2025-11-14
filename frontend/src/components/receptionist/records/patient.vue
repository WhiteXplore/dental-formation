<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Patient List</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tablePatient />
    </div>
  </div>
</template>

<script>
import tablePatient from "./tables/table-patient.vue";
export default {
  name: "PatientPage",
  components: {
    tablePatient,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
