<template>
  <div class="px-4 mt-4">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-lg text-gray-800">
        Dental Records
      </h1>
    </div>

    <!-- Tabs -->
    <div class="mt-6 flex space-x-2">
      <button
        @click="activeTab = 'chart'"
        :class="[
          'px-5 py-2 font-medium text-sm rounded-t-md transition-all duration-300',
          activeTab === 'chart'
            ? 'bg-[#34699A] text-white shadow-md'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-blue-600',
        ]"
      >
        Chart
      </button>

      <button
        @click="activeTab = 'medication'"
        :class="[
          'px-5 py-2 font-medium text-sm rounded-t-md transition-all duration-300',
          activeTab === 'medication'
            ? 'bg-[#34699A] text-white shadow-md'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-blue-600',
        ]"
      >
        Medication
      </button>
    </div>

    <!-- Content -->
    <div class="border rounded-b-lg p-4 bg-white shadow-sm">
      <tableChart v-if="activeTab === 'chart'" />
      <tableMedication v-if="activeTab === 'medication'" />
    </div>
  </div>
</template>

<script>
import tableChart from "./tables/table-charts.vue";
import tableMedication from "@/components/dentist/doctor-record/tables/table-medication.vue";

export default {
  name: "DentistAppointmentPage",
  components: {
    tableChart,
    tableMedication,
  },
  data() {
    return {
      activeTab: "chart",
    };
  },
};
</script>
