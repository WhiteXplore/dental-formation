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
      <span>Total Procedures </span>
    </h3>

    <div class="flex-grow flex justify-center items-center w-full p-8">
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
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import axios from "axios";

Chart.register(Title, Tooltip, Legend, ArcElement, DoughnutController);

export default {
  name: "ChartProcedureType",
  data() {
    return {
      user: null,
      chartInstance: null,
      resizeTimeout: null,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]),
    procedureSummary() {
      if (!Array.isArray(this.medications)) return [];

      const procedureMap = new Map();
      this.medications.forEach((item) => {
        const dentalChart = item.dentalChart;
        const patient = dentalChart?.patient;
        const teeth = dentalChart?.teeth || [];
        if (!patient) return;

        const patientId = patient.patient_id;
        teeth.forEach((tooth) => {
          const procedure = tooth.priceProcedure;
          if (!procedure) return;

          const procedureName = procedure.procedure_name;
          const price = parseFloat(procedure.price || "0");

          if (!procedureMap.has(procedureName)) {
            procedureMap.set(procedureName, {
              procedure: procedureName,
              patients: new Set(),
              revenue: 0,
            });
          }

          const entry = procedureMap.get(procedureName);
          entry.patients.add(patientId);
          entry.revenue += price;
        });
      });

      const allProcedures = [
        "Check-Up",
        "Extracted",
        "Tooth Fillings",
        "Braces",
      ];

      allProcedures.forEach((name) => {
        if (!procedureMap.has(name)) {
          procedureMap.set(name, {
            procedure: name,
            patients: new Set(),
            revenue: 0,
          });
        }
      });

      return Array.from(procedureMap.values()).map((entry) => ({
        procedure: entry.procedure,
        patients: entry.patients.size,
        revenue: entry.revenue,
      }));
    },
  },
  methods: {
    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          {
            withCredentials: true,
          }
        );
        if (response.data) {
          this.user = response.data;
        } else {
          this.$router.push("/");
          location.reload();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        this.$router.push("/");
      }
    },

    renderChart() {
      const canvas = this.$refs.procedureChart;
      if (!canvas) {
        console.warn("Canvas not yet available — skipping chart render.");
        return;
      }

      const labels = this.procedureSummary.map((item) => item.procedure);
      const data = this.procedureSummary.map((item) => item.patients);

      // Destroy previous chart instance to avoid duplicates
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const ctx = canvas.getContext("2d");
      this.chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              label: "Procedure Count",
              data,
              backgroundColor: ["#60A5FA", "#F87171", "#FBBF24", "#34D399"],
              borderColor: "#ffffff",
              borderWidth: 2,
              hoverOffset: 12,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "52%",
          plugins: {
            legend: {
              position: "bottom",
              labels: { usePointStyle: true, padding: 20 },
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) =>
                  `${tooltipItem.label}: ${tooltipItem.raw} patients`,
              },
            },
          },
        },
      });
    },
  },

  async mounted() {
    await this.fetchUser();
    const store = useFetchDataStore();
    await store.fetchMedications();

    this.$nextTick(() => {
      const canvas = this.$refs.chartCanvas;
      if (canvas) {
        this.renderChart();
      } else {
        console.warn("Canvas not yet available — skipping chart render.");
      }
    });

    // Debounced resize listener
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.renderChart(), 200);
    });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.renderChart);
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
  },

  watch: {
    // Watch for store data updates and re-render
    procedureSummary: {
      deep: true,
      handler() {
        this.$nextTick(() => this.renderChart());
      },
    },
  },
};
</script>
