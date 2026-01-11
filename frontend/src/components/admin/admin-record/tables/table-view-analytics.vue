<template>
  <div class="p-2 bg-gray-50 h-[87vh] overflow-auto">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">
          Monthly Analytics Report
        </h1>
        <p class="text-sm text-gray-500">
          Automated analytics overview for dental clinic performance
        </p>
      </div>

      <!-- FILTER -->
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

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-2xl shadow p-5 min-h-[150px]">
        <cardMonthCensus :filter="appliedFilter" />
      </div>
      <div class="bg-white rounded-2xl shadow p-5 min-h-[150px]">
        <cardPatientVisit :filter="appliedFilter" />
      </div>
      <div class="bg-white rounded-2xl shadow p-5 min-h-[150px]">
        <cardNoShowPatient :filter="appliedFilter" />
      </div>
      <div class="bg-white rounded-2xl shadow p-5 min-h-[150px]">
        <cardTotalRevenue :filter="appliedFilter" />
      </div>
    </div>

    <!-- Charts & Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-md p-5 border">
          <tablePatientProcedure :filter="appliedFilter" />
        </div>

        <div class="bg-white rounded-2xl shadow-md p-5 border overflow-x-auto">
          <doctorRevenue :filter="appliedFilter" />
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-5 border">
        <graphProcedureType :filter="appliedFilter" />
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-2xl shadow p-5 h-[500px]">
        <graphPatientByDoctor :filter="appliedFilter" />
      </div>

      <div class="bg-white rounded-2xl shadow p-5 h-[500px]">
        <graphMonthlyTrend :filter="appliedFilter" />
      </div>
    </div>

    <div class="grid grid-cols-1 mb-6">
      <div class="bg-white rounded-2xl shadow p-5 h-[440px]">
        <graphSupplyConsumption :filter="appliedFilter" />
      </div>
    </div>
  </div>
</template>

<script>
import doctorRevenue from "../graphs/table-doctor-revenue.vue";
import cardPatientVisit from "../graphs/card-walk-in-patient.vue";
import cardNoShowPatient from "../graphs/card-no-show-patient.vue";
import cardMonthCensus from "../graphs/card-appointments.vue";
import cardTotalRevenue from "../graphs/card-total-revenue.vue";
import tablePatientProcedure from "../graphs/table-patient-procedure.vue";
import graphProcedureType from "../graphs/graph-procedure-type.vue";
import graphMonthlyTrend from "../graphs/graph-monthly-trend.vue";
import graphPatientByDoctor from "../graphs/graph-patient-by-doctor.vue";
import graphSupplyConsumption from "../graphs/graph-supply-consumption.vue";

export default {
  name: "AnalyticsPage",

  components: {
    doctorRevenue,
    cardPatientVisit,
    cardNoShowPatient,
    cardMonthCensus,
    cardTotalRevenue,
    tablePatientProcedure,
    graphProcedureType,
    graphMonthlyTrend,
    graphPatientByDoctor,
    graphSupplyConsumption,
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

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
  display: block;
}
</style>
