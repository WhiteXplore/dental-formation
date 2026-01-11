<template>
  <div class="">
    <!-- Main Content  -->
    <div class="">
      <!-- Table -->
      <ViewMonthlyIncomeModal />
    </div>
  </div>
</template>

<script>
import ViewMonthlyIncomeModal from "./modals/view-monthly-income.vue";
export default {
  name: "DentistAppointmentPage",
  components: {
    ViewMonthlyIncomeModal,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
