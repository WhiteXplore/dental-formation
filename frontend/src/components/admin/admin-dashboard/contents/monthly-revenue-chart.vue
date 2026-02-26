<template>
  <div class="h-full">
    <div class="bg-white p-4 rounded-xl border h-full flex flex-col">
      
      <!-- Chart -->
      <div v-if="hasAnyData" class="relative flex-1">
        <canvas ref="chart" class="w-full h-full"></canvas>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="flex-1 flex items-center justify-center text-gray-400 text-sm"
      >
        No monthly forecast data available
      </div>

    </div>
  </div>
</template>

<script>
import axios from "axios";
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
  Legend
);

export default {
  name: "MonthlyRevenueForecast",

  data() {
    return {
      forecast: null,
      chart: null,
      loading: false,
    };
  },

  computed: {
    hasAnyData() {
      if (!this.forecast) return false;

      const historical = this.forecast.historical ?? [];
      const forecast = this.forecast.forecast ?? [];

      return historical.length > 0 || forecast.length > 0;
    },
  },

  async mounted() {
    await this.fetchForecast();
  },

  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },

  methods: {
    async fetchForecast() {
      this.loading = true;
      try {
        const res = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/revenue/run-monthly-forecast`
        );

        console.log("Monthly Forecast Response:", res.data);

        this.forecast = res.data;

        this.$nextTick(() => {
          this.renderChart();
        });

      } catch (e) {
        console.error("Monthly forecast error:", e);
        this.forecast = null;
      } finally {
        this.loading = false;
      }
    },

    formatMonth(date) {
      return new Date(date).toLocaleString("default", {
        year: "numeric",
        month: "short",
      });
    },

    renderChart() {
      if (!this.hasAnyData) {
        console.warn("No monthly forecast data:", this.forecast);
        return;
      }

      if (this.chart) {
        this.chart.destroy();
      }

      const historical = this.forecast?.historical ?? [];
      const forecast = this.forecast?.forecast ?? [];

      const labels = [
        ...historical.map(h => this.formatMonth(h.month)),
        ...forecast.map(f => this.formatMonth(f.month)),
      ];

      const historicalData = historical.map(h => h.clinic_share);

      // Safe hybrid forecast line
      const forecastData = [
        ...Array(Math.max(historical.length - 1, 0)).fill(null),
        ...(historical.length
          ? [historical[historical.length - 1].clinic_share]
          : []),
        ...forecast.map(f => f.forecast),
      ];

      this.chart = new Chart(this.$refs.chart, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Historical Revenue",
              data: historicalData,
              borderColor: "#6B7280",
              backgroundColor: "transparent",
              tension: 0.35,
              borderWidth: 3,
              pointRadius: 4,
            },
            {
              label: "Forecast",
              data: forecastData,
              borderColor: "#FACC15",
              backgroundColor: "transparent",
              borderDash: [6, 6],
              tension: 0.35,
              borderWidth: 3,
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: value =>
                  "₱" + Number(value).toLocaleString(),
              },
            },
          },
        },
      });
    },
  },
};
</script>