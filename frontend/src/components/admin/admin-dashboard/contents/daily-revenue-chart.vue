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
        No daily forecast data available
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
  name: "DailyRevenueForecast",

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
          `${process.env.VUE_APP_API_BASE_URL}/revenue/run-daily-forecast`
        );

        console.log("Daily Forecast Response:", res.data);

        this.forecast = res.data;

        this.$nextTick(() => {
          this.renderChart();
        });

      } catch (e) {
        console.error("Daily forecast error:", e);
        this.forecast = null;
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      return new Date(date).toISOString().slice(0, 10);
    },

    renderChart() {
      if (!this.hasAnyData) {
        console.warn("No daily forecast data:", this.forecast);
        return;
      }

      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = this.$refs.chart;
      const historical = this.forecast?.historical ?? [];
      const forecast = this.forecast?.forecast ?? [];

      const labels = [
        ...historical.map(d => this.formatDate(d.date)),
        ...forecast.map(d => this.formatDate(d.date)),
      ];

      const historicalData = [
        ...historical.map(d => d["Clinic Share"]),
        ...Array(forecast.length).fill(null),
      ];

      const hybridData = [
        ...Array(historical.length).fill(null),
        ...forecast.map(d => d.hybrid_forecast),
      ];

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Historical Revenue",
              data: historicalData,
              borderColor: "#6B7280",
              borderWidth: 3,
              tension: 0.35,
              pointRadius: 3,
            },
            {
              label: "Hybrid Forecast",
              data: hybridData,
              borderColor: "#2563EB",
              borderDash: [6, 6],
              borderWidth: 3,
              tension: 0.35,
              pointRadius: 3,
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