<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Outpatient List</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableOutpatient />
    </div>
  </div>
</template>

<script>
import tableOutpatient from "./tables/table-outpatient.vue";
export default {
  name: "PatientPage",
  components: {
    tableOutpatient,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
