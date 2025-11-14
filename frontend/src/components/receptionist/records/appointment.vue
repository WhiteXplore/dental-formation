<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Appointment</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableAppointment />
    </div>
  </div>
</template>

<script>
import tableAppointment from "./tables/table-appointment.vue";
export default {
  name: "AppointmentPage",
  components: {
    tableAppointment,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
