<template>
  <div class="space-y-4 bg-white p-4 border rounded-2xl">
    <!-- Header -->
    <h3
      class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 -960 960 960"
        width="24"
        fill="#147452"
      >
        <path
          d="M320-414v-306h120v306l-60-56-60 56Zm200 60v-526h120v406L520-354ZM120-216v-344h120v224L120-216Zm0 98 258-258 142 122 224-224h-64v-80h200v200h-80v-64L524-146 382-268 232-118H120Z"
        />
      </svg>
      Revenue Forecasting
    </h3>

    <!-- Loading Skeleton -->
    <div
      v-show="loadingForecast"
      class="h-[550px] flex items-center justify-center text-gray-400 text-sm"
    >
      Running daily forecast…
    </div>

    <!-- Chart -->
    <div
      v-show="!loadingForecast"
      class="bg-white p-4 rounded-xl border h-[550px]"
    >
      <canvas ref="revenueChart"></canvas>
    </div>

    <!-- Forecast Table -->
    <div class="bg-white p-4 rounded-xl shadow overflow-x-auto">
      <h3 class="font-semibold mb-3">7-Day Revenue Forecast</h3>

      <table v-if="forecast?.forecast?.length" class="w-full text-sm border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">Date</th>
            <th class="p-2 border">SARIMA</th>
            <th class="p-2 border">Hybrid</th>
            <th class="p-2 border">Difference</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in forecast.forecast" :key="row.date">
            <td class="p-2 border">{{ formatDate(row.date) }}</td>
            <td class="p-2 border">₱{{ format(row.sarima_forecast) }}</td>
            <td class="p-2 border font-semibold">
              ₱{{ format(row.hybrid_forecast) }}
            </td>
            <td
              class="p-2 border"
              :class="row.difference < 0 ? 'text-red-600' : 'text-green-600'"
            >
              ₱{{ format(row.difference) }}
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="text-gray-400 text-sm text-center py-4">
        No forecast data available
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { toast } from "vue3-toastify";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
);

export default {
  name: "RevenueForecastDashboard",
  data() {
    return {
      forecast: null,
      chart: null,
      loadingForecast: false,
    };
  },
  mounted() {
    // Delay the forecast call slightly to let dashboard render faster
    setTimeout(() => this.runDailyForecast(), 300);
  },
  beforeUnmount() {
    this.chart?.destroy();
  },
  methods: {
    async runDailyForecast() {
      if (this.forecast) return; // Already loaded, prevent refetch

      this.loadingForecast = true;
      try {
        const res = await axios.post(
          process.env.VUE_APP_API_BASE_URL + "/revenue/run-daily-forecast",
        );

        if (!res.data?.forecast?.length) {
          toast.warning("⚠️ No forecast data returned");
          this.forecast = { forecast: [] };
          return;
        }

        this.forecast = res.data;

        // Wait for the canvas to exist (v-show ensures it does)
        await this.$nextTick();
        this.renderChart();
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to load revenue forecast");
      } finally {
        this.loadingForecast = false;
      }
    },

    renderChart() {
      const ctx = this.$refs.revenueChart;
      if (!ctx || !this.forecast) return;

      // Destroy old chart if exists
      if (this.chart) this.chart.destroy();

      const last7Historical = (this.forecast.historical || []).slice(-7);
      const historicalLabels = last7Historical.map((d) =>
        this.formatDate(d.date),
      );
      const historicalData = last7Historical.map((d) => d["Clinic Share"]);

      const forecastLabels = (this.forecast.forecast || []).map((d) =>
        this.formatDate(d.date),
      );
      const sarima = this.forecast.forecast.map((d) => d.sarima_forecast);
      const hybrid = this.forecast.forecast.map((d) => d.hybrid_forecast);

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [...historicalLabels, ...forecastLabels],
          datasets: [
            {
              label: "Historical Revenue (Last 7 Days)",
              data: historicalData,
              borderColor: "#6B7280",
              backgroundColor: "transparent",
              borderWidth: 2,
              tension: 0.3,
            },
            {
              label: "SARIMA Forecast",
              data: [...Array(historicalData.length).fill(null), ...sarima],
              borderColor: "#FACC15",
              backgroundColor: "transparent",
              borderDash: [6, 6],
              borderWidth: 3,
              tension: 0.3,
            },
            {
              label: "Hybrid Forecast",
              data: [...Array(historicalData.length).fill(null), ...hybrid],
              borderColor: "#2563EB",
              backgroundColor: "transparent",
              borderDash: [3, 3],
              borderWidth: 3,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true } },
            tooltip: {
              callbacks: {
                label(context) {
                  if (context.raw == null) return "";
                  return `₱${Number(context.raw).toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback(value) {
                  return `₱${Number(value).toLocaleString()}`;
                },
              },
            },
          },
        },
      });
    },

    formatDate(date) {
      return date ? new Date(date).toISOString().slice(0, 10) : "-";
    },

    format(value) {
      return value == null
        ? "-"
        : Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
    },
  },
};
</script>
