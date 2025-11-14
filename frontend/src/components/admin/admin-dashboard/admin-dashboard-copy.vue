<template>
  <div class="w-full h-[93vh] overflow-auto p-4 bg-gray-50 space-y-6">
    <!-- Header -->
    <div class="mb-4 text-left">
      <h1 class="text-2xl font-semibold text-gray-800">
        Welcome, {{ user.first_name }} 👋
      </h1>
      <p class="text-sm text-gray-500">Here's what's happening today</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        class="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:ring-2 hover:ring-blue-200 transition duration-300"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm text-gray-500">Total Visits</h2>
            <p class="text-3xl font-bold text-blue-600 mt-1">
              {{ stats.totalVisits }}
            </p>
          </div>
          <div class="bg-blue-100 text-blue-600 p-2 rounded-full">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 11c0 .638-.244 1.223-.641 1.641A2.248 2.248 0 0110 13a2.248 2.248 0 01-1.359-.359A2.248 2.248 0 018 11m4 0a2.248 2.248 0 011.359-.359A2.248 2.248 0 0114 11m0 0c0 .638.244 1.223.641 1.641A2.248 2.248 0 0016 13a2.248 2.248 0 001.359-.359A2.248 2.248 0 0018 11M9 17h6m-3 0v1"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:ring-2 hover:ring-green-200 transition duration-300"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm text-gray-500">Income This Month</h2>
            <p class="text-3xl font-bold text-green-600 mt-1">
              ₱{{ stats.income.toLocaleString() }}
            </p>
          </div>
          <div class="bg-green-100 text-green-600 p-2 rounded-full">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4l3 3m9-9a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:ring-2 hover:ring-red-200 transition duration-300"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm text-gray-500">Missed Appointments</h2>
            <p class="text-3xl font-bold text-red-500 mt-1">
              {{ stats.missedAppointments }}
            </p>
          </div>
          <div class="bg-red-100 text-red-500 p-2 rounded-full">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4l3 3M12 6v6m0 4h.01M4.93 4.93a10 10 0 0114.14 14.14A10 10 0 014.93 4.93z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:ring-2 hover:ring-yellow-200 transition duration-300"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm text-gray-500">Most Common Procedure</h2>
            <p class="text-xl font-semibold text-gray-700 mt-1">
              {{ stats.mostCommonProcedure }}
            </p>
          </div>
          <div class="bg-yellow-100 text-yellow-500 p-2 rounded-full">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        class="bg-white p-6 rounded-2xl shadow-md h-full min-h-[300px] flex flex-col"
      >
        <h3 class="text-lg font-semibold text-gray-700 mb-4">
          Procedure Distribution
        </h3>
        <div class="flex-grow flex justify-center items-center">
          <canvas
            id="procedureChart"
            class="w-full max-w-[500px] max-h-[400px]"
          ></canvas>
        </div>
      </div>
      <div
        class="bg-white p-6 rounded-2xl shadow-md h-full min-h-[300px] flex flex-col"
      >
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Monthly Income</h3>
        <div class="flex-grow">
          <canvas id="incomeChart" class="w-full max-h-[400px]"></canvas>
        </div>
      </div>
    </div>

    <!-- Dentist Performance Table -->
    <div class="bg-white p-6 rounded-2xl shadow-md">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        Dentist Performance
      </h3>

      <div class="overflow-x-auto">
        <table
          class="min-w-full divide-y divide-gray-200 text-sm text-gray-700"
        >
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-600">
                Name
              </th>
              <th class="px-4 py-3 text-right font-medium text-gray-600">
                Procedures
              </th>
              <th class="px-4 py-3 text-right font-medium text-gray-600">
                Income
              </th>
              <th class="px-4 py-3 text-right font-medium text-gray-600">
                Prescriptions
              </th>
              <th class="px-4 py-3 text-right font-medium text-gray-600">
                Appointments
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="dentist in dentists"
              :key="dentist.id"
              class="hover:bg-blue-50 transition duration-150 ease-in-out"
            >
              <td class="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                {{ dentist.name }}
              </td>
              <td class="px-4 py-3 text-right">{{ dentist.procedures }}</td>
              <td class="px-4 py-3 text-right font-semibold text-green-600">
                ₱{{ dentist.income.toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-right">{{ dentist.prescriptions }}</td>
              <td class="px-4 py-3 text-right">{{ dentist.appointments }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "DashboardPage",
  data() {
    return {
      user: {
        first_name: "John",
      },

      stats: {
        totalVisits: 1245,
        income: 85000,
        missedAppointments: 35,
        mostCommonProcedure: "Tooth Fillings",
      },
      dentists: [
        {
          id: 1,
          name: "Dr. Santos",
          procedures: 45,
          income: 32000,
          prescriptions: 12,
          appointments: 38,
        },
        {
          id: 2,
          name: "Dr. Reyes",
          procedures: 58,
          income: 41000,
          prescriptions: 18,
          appointments: 42,
        },
      ],
    };
  },
  mounted() {
    this.renderProcedureChart();
    this.renderIncomeChart();
  },
  methods: {
    renderProcedureChart() {
      const ctx = document.getElementById("procedureChart");
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Checkup", "Fillings", "Extractions", "X-rays"],
          datasets: [
            {
              label: "Procedures",
              data: [120, 80, 30, 15],
              backgroundColor: ["#60A5FA", "#F87171", "#FBBF24", "#34D399"],
            },
          ],
        },
      });
    },
    renderIncomeChart() {
      const ctx = document.getElementById("incomeChart");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Monthly Income",
              data: [32000, 40000, 37000, 46000, 50000, 85000],
              backgroundColor: "#34D399",
              borderColor: "#10B981",
              fill: false,
              tension: 0.3,
            },
          ],
        },
      });
    },
  },
};
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: auto !important;
  max-height: 400px;
}
</style>
