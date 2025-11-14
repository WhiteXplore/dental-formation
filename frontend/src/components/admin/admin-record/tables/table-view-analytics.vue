<template>
  <div class="p-4 bg-gray-50 h-[87vh] overflow-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">
        Monthly Analytics Report
      </h1>
      <p class="text-sm text-gray-500">
        Automated analytics overview for dental clinic performance
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
      >
        <cardMonthCensus />
      </div>
      <div
        class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
      >
        <cardPatientVisit />
      </div>
      <div
        class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
      >
        <cardNoShowPatient />
      </div>
      <div
        class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
      >
        <cardTotalRevenue />
      </div>
    </div>

    <!-- Charts & Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <tablePatientProcedure />
        </div>
        <div class="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <div class="overflow-x-auto">
            <doctorRevenue />
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex flex-col"
      >
        <graphProcedureType />
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-2xl shadow p-5 h-[400px]">
        <graphPatientByDoctor />
      </div>

      <div class="bg-white rounded-2xl shadow p-5 h-[400px]">
        <graphMonthlyTrend />
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
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  BarController,
  LineElement,
  PointElement,
  LineController,
} from "chart.js";

Chart.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  BarController,
  LineElement,
  PointElement,
  LineController
);

export default {
  name: "AnalyticsPage",
  components: {
    doctorRevenue,
    cardPatientVisit,
    cardMonthCensus,
    cardTotalRevenue,
    tablePatientProcedure,
    graphProcedureType,
    graphMonthlyTrend,
    graphPatientByDoctor,
    cardNoShowPatient,
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
  display: block;
}
</style>
