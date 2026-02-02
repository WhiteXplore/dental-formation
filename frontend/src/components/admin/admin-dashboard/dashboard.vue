<template>
  <div class="p-4 bg-gray-50 h-[92vh] overflow-auto">
    <!-- Header -->
    <div class="mb-4 text-left">
      <h1 class="text-2xl font-semibold text-gray-800">
        Welcome, {{ user.first_name }} 👋
      </h1>
      <p class="text-sm text-gray-500">Here's what's happening today</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
      >
        <CardMonthCensus />
      </div>
      <div
        class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
      >
        <CardPatientVisit />
      </div>
      <div
        class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
      >
        <CardNoShowPatient />
      </div>
      <div
        class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
      >
        <CardTotalRevenue />
      </div>
    </div>

    <!-- Charts -->
    <div class="flex flex-wrap gap-6">
      <!-- Linear Regression Chart -->
      <div
        class="bg-white rounded-2xl p-5 border"
        style="flex: 1 1 1200px; min-height: 680px"
      >
        <LinearRegression />
      </div>

      <!-- Procedure Type Chart (Optional) -->
      <!--
  <div
    class="bg-white rounded-2xl p-5 border"
    style="flex: 1 1 700px; min-height: 680px"
  >
    <GraphProcedureType />
  </div>
  -->
    </div>
  </div>
</template>

<script>
import axios from "axios";
import LinearRegression from "./contents/linear-regression.vue";
import CardPatientVisit from "@/components/admin/admin-record/graphs/card-walk-in-patient.vue";
import CardNoShowPatient from "@/components/admin/admin-record/graphs/card-no-show-patient.vue";
import CardMonthCensus from "@/components/admin/admin-record/graphs/card-appointments.vue";
import CardTotalRevenue from "@/components/admin/admin-record/graphs/card-total-revenue.vue";
// import GraphProcedureType from "@/components/admin/admin-record/graphs/graph-procedure-type.vue";

export default {
  name: "AdminDashboardPage",
  components: {
    LinearRegression,
    CardNoShowPatient,
    CardPatientVisit,
    CardMonthCensus,
    CardTotalRevenue,
    // GraphProcedureType,
  },
  data() {
    return {
      user: {},
    };
  },
  mounted() {
    this.fetchUser();
  },
  methods: {
    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          {
            withCredentials: true,
          },
        );
        if (response.data) this.user = response.data;
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    },
  },
};
</script>

<style scoped>
/* No custom styles needed here for now */
</style>
