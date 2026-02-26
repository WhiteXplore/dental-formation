<template>
  <div class="p-4 bg-gray-50 min-h-screen flex flex-col gap-6">
    <!-- Header -->
    <div class="text-left">
      <h1 class="text-2xl font-semibold text-gray-800">
        Welcome, {{ user.first_name }} 👋
      </h1>
      <p class="text-sm text-gray-500">Here's what's happening today</p>
    </div>

    <!-- Summary Cards -->
    <div
      class="flex flex-wrap grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center sm:justify-start"
    >
      <div
        class="flex-1 w-full bg-white rounded-2xl shadow p-5 flex flex-col justify-between"
      >
        <CardMonthCensus />
      </div>
      <div
        class="flex-1 w-full bg-white rounded-2xl shadow p-5 flex flex-col justify-between"
      >
        <CardPatientVisit />
      </div>
      <div
        class="flex-1 w-full bg-white rounded-2xl shadow p-5 flex flex-col justify-between"
      >
        <CardNoShowPatient />
      </div>
      <div
        class="flex-1 w-full bg-white rounded-2xl shadow p-5 flex flex-col justify-between"
      >
        <CardTotalRevenue />
      </div>
    </div>

    <!-- Charts -->
    <div class="flex flex-col lg:flex-row gap-4 flex-1  max-h-[600px]">
      <!-- Daily Revenue Chart -->
      <div class="flex-1 min-h-[300px] bg-white rounded-2xl p-5 border flex flex-col">
        <h1 class="text-lg font-semibold mb-4 text-gray-700">Daily Revenue Forecast</h1>
        <DailyRevenueChart chartMode="historical-hybrid" class="flex-1" />
      </div>

      <!-- Monthly Revenue Chart -->
      <div class="flex-1 min-h-[300px] bg-white rounded-2xl p-5 border flex flex-col">
        <h1 class="text-lg font-semibold mb-4 text-gray-700">Monthly Revenue Forecast</h1>
        <MonthlyRevenueChart class="flex-1" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import DailyRevenueChart from "./contents/daily-revenue-chart.vue";
import MonthlyRevenueChart from "./contents/monthly-revenue-chart.vue";
import CardPatientVisit from "@/components/admin/admin-record/graphs/card-walk-in-patient.vue";
import CardNoShowPatient from "@/components/admin/admin-record/graphs/card-no-show-patient.vue";
import CardMonthCensus from "@/components/admin/admin-record/graphs/card-appointments.vue";
import CardTotalRevenue from "@/components/admin/admin-record/graphs/card-total-revenue.vue";

export default {
  name: "AdminDashboardPage",
  components: {
    CardNoShowPatient,
    CardPatientVisit,
    CardMonthCensus,
    CardTotalRevenue,
    DailyRevenueChart,
    MonthlyRevenueChart,
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
          { withCredentials: true }
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
/* Optional: make charts scale nicely */
</style>