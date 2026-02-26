<template>
  <div>
    <!-- Loading Overlay -->
    

 

    <!-- Chart -->
    <div class="bg-white p-4 rounded-xl border">
      <canvas v-if="hasData" ref="chart" height="120"></canvas>
      <div v-else class="h-[30vh] flex items-center justify-center text-gray-400 text-sm">
        No daily forecast data available
      </div>
    </div>
       <!-- Chart Mode Toggle -->
    <div class="flex gap-2 mb-4 justify-center">
      <div class="flex bg-gray-100 rounded-xl p-1 shadow-inner">
        <button
          @click="chartMode = 'historical-hybrid'; renderChart()"
          :class="btnClass('historical-hybrid')"
        >
          Historical vs Hybrid
        </button>
        <button
          @click="chartMode = 'sarima-hybrid'; renderChart()"
          :class="btnClass('sarima-hybrid')"
        >
          SARIMA vs Hybrid
        </button>
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

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default {
  name: "DailyRevenueForecast",

  data() {
    return {
      forecast: null,
      chart: null,
      loading: false,
      chartMode: "historical-hybrid",
    };
  },

  computed: {
    hasData() {
      return this.forecast?.forecast?.length > 0;
    },
  },

  async mounted() {
    await this.fetchForecast();
  },

  methods: {
    btnClass(mode) {
      return [
        "px-4 py-1 text-sm rounded-lg transition-all duration-200",
        this.chartMode === mode
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-200",
      ];
    },

    async fetchForecast() {
      this.loading = true;
      try {
        const res = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/revenue/run-daily-forecast`
        );
        this.forecast = res.data;
        this.$nextTick(() => this.renderChart());
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      return new Date(date).toISOString().slice(0, 10);
    },

    renderChart() {
      if (!this.hasData) return;
      if (this.chart) this.chart.destroy();

      if (this.chartMode === "historical-hybrid") {
        this.renderHistoricalHybrid();
      } else {
        this.renderSarimaHybrid();
      }
    },

    renderHistoricalHybrid() {
      const ctx = this.$refs.chart;
      const historical = this.forecast.historical || [];
      const forecast = this.forecast.forecast || [];

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
            { label: "Historical Revenue", data: historicalData, borderColor: "#6B7280", tension: 0.3 },
            { label: "Hybrid Forecast", data: hybridData, borderColor: "#2563EB", borderDash: [4,4], tension: 0.3 },
          ],
        },
      });
    },

    renderSarimaHybrid() {
      const ctx = this.$refs.chart;
      const forecast = this.forecast.forecast || [];

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: forecast.map(d => this.formatDate(d.date)),
          datasets: [
            { label: "SARIMA", data: forecast.map(d => d.sarima_forecast), borderColor: "#FACC15",  borderDash: [4,4],   tension: 0.3 },
            { label: "Hybrid", data: forecast.map(d => d.hybrid_forecast), borderColor: "#2563EB", borderDash: [4,4],  tension: 0.3 },
          ],
        },
      });
    },
  },
};
</script>