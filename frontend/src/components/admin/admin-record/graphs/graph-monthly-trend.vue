<template>
  <div class="bg-white rounded-2xl h-[350px]">
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
import { useFetchDataStore } from "@/store/fetch-data-store"; // adjust path
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
      default: () => ({ year: null, month: null }),
    },
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    filteredMedications() {
      if (!Array.isArray(this.medications)) return [];

      return this.medications.filter((item) => {
        const dateStr = item.issued_date || item.dentalChart?.procedure_date;
        if (!dateStr) return false;

        const date = new Date(dateStr);

        if (this.filter.year && date.getFullYear() !== Number(this.filter.year))
          return false;
        if (
          this.filter.month &&
          date.getMonth() + 1 !== Number(this.filter.month)
        )
          return false;

        return true;
      });
    },
  },

  watch: {
    filteredMedications: {
      handler() {
        this.renderIncomeChart();
      },
      immediate: true,
    },
  },

  methods: {
    renderIncomeChart() {
      const incomePerMonth = {};

      this.filteredMedications.forEach((item) => {
        const date = item.issued_date || item.dentalChart?.procedure_date;
        if (!date) return;

        const month = dayjs(date).format("MMM");

        let toothRevenue = 0;
        let medRevenue = 0;

        const teeth = item.dentalChart?.teeth || [];
        teeth.forEach((tooth) => {
          const price = parseFloat(tooth.priceProcedure?.price || "0");
          toothRevenue += price;
        });

        const meds = item.prescribedMedications || [];
        meds.forEach((med) => {
          const unitPrice = parseFloat(med.inventory?.price_per_unit || "0");
          const pcs = med.pcs || 0;
          medRevenue += unitPrice * pcs;
        });

        const totalRevenue = toothRevenue + medRevenue;

        if (!incomePerMonth[month]) incomePerMonth[month] = 0;
        incomePerMonth[month] += totalRevenue;
      });

      // Sort months in calendar order
      const monthOrder = [
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
      const sortedMonths = monthOrder.filter((m) => incomePerMonth[m]);
      const sortedData = sortedMonths.map((m) => incomePerMonth[m]);

      const ctx = this.$refs.incomeChart;
      if (!ctx) return;

      if (this._chartInstance) this._chartInstance.destroy();

      this._chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: sortedMonths,
          datasets: [
            {
              label: "Monthly Income",
              data: sortedData,
              backgroundColor: "#34D399",
              borderColor: "#10B981",
              fill: false,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // ← important
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (val) => `₱${val.toLocaleString()}` },
            },
          },
        },
      });
    },
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
