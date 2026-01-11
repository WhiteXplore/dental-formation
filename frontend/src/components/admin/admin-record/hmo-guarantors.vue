<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">HMO's / Guarantors</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <HMOGuarantorsTable />
    </div>
  </div>
</template>

<script>
import HMOGuarantorsTable from "../admin-record/tables/table-hmo-guarantors.vue";
export default {
  name: "HMOGuarantorsPage",
  components: {
    HMOGuarantorsTable,
  },
};
</script>

<style scoped></style>
