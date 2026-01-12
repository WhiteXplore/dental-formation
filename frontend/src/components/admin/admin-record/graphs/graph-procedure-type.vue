<template>
  <div class="bg-white rounded-2xl flex flex-col w-full h-full">
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
      <span>Total Procedures</span>
    </h3>

    <!-- No data -->
    <div
      v-if="!filteredProcedures.length"
      class="flex-grow flex justify-center items-center text-gray-400 text-center p-8"
    >
      No Data Available
    </div>

    <!-- Chart -->
    <div v-else class="flex-grow flex justify-center items-center w-full p-4">
      <canvas ref="procedureChart"></canvas>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
} from "chart.js";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";
import axios from "axios";

Chart.register(Title, Tooltip, Legend, ArcElement, DoughnutController);

export default {
  name: "ChartProcedureType",

  props: {
    filter: {
      type: Object,
      default: () => ({ year: null, month: null }),
    },
  },

  data() {
    return {
      user: null,
      chartInstance: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    filteredProcedures() {
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

        return (item.dentalChart?.teeth || []).length > 0;
      });
    },

    procedureSummary() {
      if (!this.filteredProcedures.length) return [];

      const map = new Map();

      this.filteredProcedures.forEach((item) => {
        item.dentalChart?.teeth?.forEach((tooth) => {
          const proc = tooth.priceProcedure;
          if (!proc) return;

          if (!map.has(proc.procedure_name)) {
            map.set(proc.procedure_name, {
              procedure: proc.procedure_name,
              total: 0,
            });
          }

          map.get(proc.procedure_name).total++;
        });
      });

      return Array.from(map.values());
    },
  },

  watch: {
    procedureSummary() {
      this.$nextTick(this.renderChart);
    },
  },

  methods: {
    async fetchUser() {
      try {
        const res = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          { withCredentials: true }
        );
        this.user = res.data;
      } catch {
        this.$router.push("/");
      }
    },

    renderChart() {
      if (!this.procedureSummary.length) return;

      this.$nextTick(() => {
        const canvas = this.$refs.procedureChart;
        if (!canvas || !canvas.isConnected) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }

        this.chartInstance = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: this.procedureSummary.map((p) => p.procedure),
            datasets: [
              {
                data: this.procedureSummary.map((p) => p.total),
                backgroundColor: [
                  "#60A5FA",
                  "#F87171",
                  "#FBBF24",
                  "#34D399",
                  "#A78BFA",
                ],
                borderColor: "#ffffff",
                borderWidth: 2,
                hoverOffset: 12,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            resizeDelay: 200,
            cutout: "52%",
            plugins: {
              legend: {
                position: "bottom",
                labels: { usePointStyle: true, padding: 20 },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.label}: ${ctx.raw} procedures`,
                },
              },
            },
          },
        });
      });
    },
    handleResize() {
      if (!this.chartInstance) return;
      if (!this.$refs.procedureChart?.isConnected) return;
      this.chartInstance.resize();
    },
  },

  async mounted() {
    await this.fetchUser();
    const store = useFetchDataStore();
    await store.fetchMedications();

    this.$nextTick(this.renderChart);
    window.addEventListener("resize", this.handleResize);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    this.chartInstance?.destroy();
    this.chartInstance = null;
  },
};
</script>

<style scoped>
canvas {
  width: 30%;
  height: 100%;
  display: block;
}
</style>
