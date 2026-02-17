<template>
  <div class="px-2 mt-2">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Dental Records</h1>
    </div>

    <!-- Tabs -->
    <div class="mt-4 border-b border-gray-300">
      <nav class="flex space-x-4">
        <button
          :class="
            activeTab === 'chart'
              ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
              : 'text-gray-500'
          "
          class="pb-2 transition-colors"
          @click="activeTab = 'chart'"
        >
          Chart
        </button>
        <button
          :class="
            activeTab === 'medication'
              ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
              : 'text-gray-500'
          "
          class="pb-2 transition-colors"
          @click="activeTab = 'medication'"
        >
          Medication
        </button>
      </nav>
    </div>

    <!-- Content -->
    <div class="mt-3">
      <tableChart v-if="activeTab === 'chart'" />
      <tableMedication v-if="activeTab === 'medication'" />
    </div>
  </div>
</template>

<script>
import tableChart from "./tables/table-charts.vue";
import tableMedication from "./tables/table-medication.vue";

export default {
  name: "DentistAppointmentPage",
  components: {
    tableChart,
    tableMedication,
  },
  data() {
    return {
      activeTab: "chart", // default active tab
    };
  },
};
</script>

<style scoped>
/* Optional: smooth transition for tab content */
</style>
