<template>
  <div class="bg-white rounded-2xl h-[43vh] flex flex-col">
    <!-- Chart / No Data -->
    <div class="flex-1">
      <canvas v-if="monthlySupplyConsumption.length" ref="supplyChart"></canvas>

      <div v-else class="w-full h-full flex justify-center items-center">
        <p class="text-gray-400 text-center text-lg">No Data Available</p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  BarController,
} from "chart.js";

import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";

Chart.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  BarController
);

export default {
  name: "GraphSupplyConsumption",

  props: {
    filter: {
      type: Object,
      default: () => ({
        year: null,
        month: null,
      }),
    },
  },

  data() {
    return {
      chartInstance: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    /* ✅ Apply year/month filter */
    filteredMedications() {
      if (!Array.isArray(this.medications)) return [];

      return this.medications.filter((med) => {
        const dateStr = med?.dentalChart?.procedure_date;
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

    /* ✅ GROUP BY MONTH */
    monthlySupplyConsumption() {
      const monthMap = new Map();

      this.filteredMedications.forEach((med) => {
        const dateStr = med?.dentalChart?.procedure_date;
        if (!dateStr) return;

        const date = new Date(dateStr);
        const monthLabel = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }); // Jan 2026

        // Procedure inventories
        const teeth = med?.dentalChart?.teeth || [];
        teeth.forEach((tooth) => {
          const inventories = tooth?.priceProcedure?.procedureInventories || [];

          inventories.forEach((pi) => {
            const qty = Number(pi?.quantity) || 0;
            monthMap.set(monthLabel, (monthMap.get(monthLabel) || 0) + qty);
          });
        });

        // Additional items
        const addItems = med?.dentalChart?.addItems || [];
        addItems.forEach((item) => {
          const qty = Number(item?.pcs) || 0;
          monthMap.set(monthLabel, (monthMap.get(monthLabel) || 0) + qty);
        });
      });

      return Array.from(monthMap.entries()).map(([month, quantity]) => ({
        month,
        quantity,
      }));
    },
  },

  watch: {
    monthlySupplyConsumption: {
      async handler() {
        await this.$nextTick();
        this.renderSupplyChart();
      },
      deep: true,
    },

    filter: {
      async handler() {
        await this.$nextTick();
        this.renderSupplyChart();
      },
      deep: true,
    },
  },

  methods: {
    renderSupplyChart() {
      const canvas = this.$refs.supplyChart;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }

      if (!this.monthlySupplyConsumption.length) return;

      this.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.monthlySupplyConsumption.map((i) => i.month),
          datasets: [
            {
              label: "Total Supplies Used",
              data: this.monthlySupplyConsumption.map((i) => i.quantity),
              backgroundColor: "#f97316",
              borderRadius: 6,
              barThickness: 40,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Month",
              },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Quantity Used",
              },
              ticks: { stepSize: 1 },
              grid: { color: "#f1f5f9" },
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
