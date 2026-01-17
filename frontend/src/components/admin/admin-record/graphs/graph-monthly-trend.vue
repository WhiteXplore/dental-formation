<template>
  <div class="bg-white rounded-2xl h-[350px] p-4">
    <h3 class="text-lg font-semibold text-gray-700 mb-3">
      Monthly Income Trend
    </h3>
    <div class="flex-grow">
      <canvas ref="incomeChart" width="400" height="360"></canvas>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LineController,
} from "chart.js";
import { mapState } from "pinia";
import { useFetchDataStore } from "@/store/fetch-data-store";
import dayjs from "dayjs";

Chart.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LineController
);

export default {
  name: "MonthlyIncomeTrend",

  props: {
    filter: {
      type: Object,
      default: () => ({ year: null }),
    },
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    filteredPayments() {
      if (!Array.isArray(this.medications)) return [];

      return this.medications.filter((item) => {
        const dateStr = item?.dentalChart?.procedure_date;
        if (!dateStr) return false;

        const date = new Date(dateStr);
        if (this.filter.year && date.getFullYear() !== Number(this.filter.year))
          return false;

        return true;
      });
    },
  },

  watch: {
    filteredPayments: {
      handler() {
        this.renderIncomeChart();
      },
      immediate: true,
    },
  },

  methods: {
    renderIncomeChart() {
      // Initialize 12 months with 0 revenue
      const incomePerMonth = Array(12).fill(0);

      this.filteredPayments.forEach((item) => {
        const dateStr = item?.dentalChart?.procedure_date;
        if (!dateStr) return;

        const monthIndex = dayjs(dateStr).month(); // 0 = Jan
        const payment = Number(item.patient_payment || 0);
        incomePerMonth[monthIndex] += payment; // sum per patient_payment
      });

      const monthLabels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const ctx = this.$refs.incomeChart;
      if (!ctx) return;

      if (this._chartInstance) this._chartInstance.destroy();

      this._chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: monthLabels,
          datasets: [
            {
              label: "Monthly Income",
              data: incomePerMonth,
              backgroundColor: "#34D399",
              borderColor: "#10B981",
              fill: false,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `₱${ctx.raw.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) =>
                  `₱${val.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
              },
            },
          },
        },
      });
    },
  },

  mounted() {
    const store = useFetchDataStore();
    store.fetchMedications();
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
