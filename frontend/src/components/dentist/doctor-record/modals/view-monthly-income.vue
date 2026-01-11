<template>
  <div class="p-4 bg-gray-50 h-[95vh] overflow-auto">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">
          Monthly Income Report
        </h1>
        <p class="text-sm text-gray-500">
          Automated analytics overview for your dental clinic performance and
          monthly revenue.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- MONTH -->
        <select
          v-model="selectedMonth"
          class="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All Months</option>
          <option
            v-for="month in months"
            :key="month.value"
            :value="month.value"
          >
            {{ month.label }}
          </option>
        </select>

        <!-- YEAR -->
        <select
          v-model="selectedYear"
          class="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Select Year</option>
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>

        <button
          @click="applyFilter"
          class="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition"
        >
          Filter
        </button>
      </div>
    </div>

    <div>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          class="bg-[#34699A] rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
        >
          <cardTotalRevenue :filter="appliedFilter" />
        </div>
        <div
          class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
        >
          <cardMonthCensus :filter="appliedFilter" />
        </div>
        <div
          class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
        >
          <cardPatientVisit :filter="appliedFilter" />
        </div>
        <div
          class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
        >
          <cardNoShowPatient :filter="appliedFilter" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-2xl shadow p-5 h-[500px]">
          <cardPatientByDoctor :filter="appliedFilter" />
        </div>

        <div class="bg-white rounded-2xl shadow p-2 h-[500px]">
          <cardMonthlyIncome :filter="appliedFilter" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cardMonthCensus from "../cards/card-appointments.vue";
import cardPatientVisit from "../cards/card-walk-in-patient.vue";
import cardNoShowPatient from "../cards/card-no-show-patient.vue";
import cardTotalRevenue from "../cards/card-total-revenue.vue";
import cardMonthlyIncome from "../cards/card-monthly-income.vue";
import cardPatientByDoctor from "../cards/card-patient-by-doctor.vue";

export default {
  name: "ViewMonthlyIncomeModal",
  components: {
    cardMonthCensus,
    cardPatientVisit,
    cardNoShowPatient,
    cardTotalRevenue,
    cardMonthlyIncome,
    cardPatientByDoctor,
  },
  data() {
    const currentYear = new Date().getFullYear();

    return {
      selectedYear: "",
      selectedMonth: "",

      appliedFilter: {
        year: null,
        month: null,
      },

      years: Array.from({ length: 5 }, (_, i) => currentYear - i),

      months: [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
      ],
    };
  },
  methods: {
    applyFilter() {
      this.appliedFilter = {
        year: this.selectedYear || null,
        month: this.selectedMonth || null,
      };
    },
  },
};
</script>
