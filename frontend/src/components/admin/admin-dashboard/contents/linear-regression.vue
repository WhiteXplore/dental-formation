<template>
  <div class="bg-white rounded-2xl shadow p-5 h-[680px]">
    <h3
      class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#147452"
      >
        <path
          d="M320-414v-306h120v306l-60-56-60 56Zm200 60v-526h120v406L520-354ZM120-216v-344h120v224L120-216Zm0 98 258-258 142 122 224-224h-64v-80h200v200h-80v-64L524-146 382-268 232-118H120Z"
        />
      </svg>
      <span>Revenue Forecasting</span>
    </h3>

    <div class="flex-grow flex justify-center items-center h-[600px] p-8">
      <canvas ref="monthlyTrendChart"></canvas>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { nextTick } from "vue";

Chart.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale
);

export default {
  name: "LinearRegression",
  data() {
    return {
      forcastingData: [],
      chartInstance: null,
    };
  },
  methods: {
    async fetchForecastingData() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/dental-chart/get-dental-chart"
        );
        this.forcastingData = response.data || [];

        // Wait for DOM and data update before rendering chart
        await nextTick();
        this.renderChart();
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    },

    prepareForecastData() {
      if (!this.forcastingData.length)
        return { labels: [], actualY: [], forecastY: [] };

      const dailyRevenue = {};
      this.forcastingData.forEach((a) => {
        const date = new Date(a.procedure_date).toISOString().split("T")[0];
        if (!dailyRevenue[date]) dailyRevenue[date] = 0;
        const revenue = a.teeth.reduce(
          (sum, tooth) => sum + Number(tooth.priceProcedure?.price || 0),
          0
        );
        dailyRevenue[date] += revenue;
      });

      const sortedDates = Object.keys(dailyRevenue).sort();
      const revenueValues = sortedDates.map((d) => dailyRevenue[d]);

      const n = sortedDates.length;
      const x = sortedDates.map((_, i) => i + 1);
      const y = revenueValues;
      const xMean = x.reduce((a, b) => a + b, 0) / n;
      const yMean = y.reduce((a, b) => a + b, 0) / n;

      let num = 0,
        den = 0;
      for (let i = 0; i < n; i++) {
        num += (x[i] - xMean) * (y[i] - yMean);
        den += (x[i] - xMean) ** 2;
      }

      const slope = num / den;
      const intercept = yMean - slope * xMean;

      const forecastX = Array.from({ length: n + 7 }, (_, i) => i + 1);
      const forecastY = forecastX.map((xi) => intercept + slope * xi);
      const labels = [
        ...sortedDates,
        ...Array.from({ length: 7 }, (_, i) => `+${i + 1}d`),
      ];

      return { labels, forecastY, actualY: revenueValues };
    },

    renderChart() {
      const canvas = this.$refs.monthlyTrendChart;

      if (!canvas) {
        console.warn("Canvas not found, skipping chart render.");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.warn("Canvas context not available.");
        return;
      }

      // Clean up old chart before re-rendering
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const { labels, forecastY, actualY } = this.prepareForecastData();

      if (!labels.length) {
        console.warn("No data available for chart rendering.");
        return;
      }

      this.chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Actual Revenue",
              data: [...actualY, ...Array(7).fill(null)],
              borderColor: "#3B82F6",
              fill: false,
              tension: 0.2,
            },
            {
              label: "Forecast Revenue",
              data: forecastY,
              borderColor: "#F59E0B",
              borderDash: [5, 5],
              fill: false,
              tension: 0.2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: { mode: "index", intersect: false },
          },
          interaction: { mode: "nearest", intersect: false },
          scales: {
            x: {
              title: {
                display: true,
                text: "Date",
              },
            },
            y: {
              title: {
                display: true,
                text: "Revenue (₱)",
              },
              beginAtZero: true,
            },
          },
        },
      });
    },
  },

  async mounted() {
    await this.fetchForecastingData();
  },

  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },
};
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
