<template>
  <div class="bg-white rounded-2xl h-[460px] flex flex-col">
    <h3 class="text-lg font-semibold text-gray-700 mb-3">Patients by Doctor</h3>

    <!-- No Data Message -->
    <div
      v-if="!doctorPatients.length"
      class="flex-grow flex justify-center items-center text-gray-400 text-center p-8"
    >
      No Data Available
    </div>

    <!-- Chart -->
    <div v-else class="flex-grow">
      <canvas ref="doctorChart" class=""></canvas>
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
  name: "GraphPatientByDoctor",

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
      isReady: false,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    filteredMedications() {
      if (!Array.isArray(this.medications)) return [];

      return this.medications.filter((item) => {
        const dateStr = item?.dentalChart?.procedure_date;
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

    doctorPatients() {
      const map = new Map();

      this.filteredMedications.forEach((item) => {
        const doctor = item?.dentalChart?.user_accounts;
        const patient = item?.dentalChart?.patient;

        if (!doctor || !patient) return;

        if (!map.has(doctor.user_id)) {
          map.set(doctor.user_id, {
            name: `${doctor.first_name} ${doctor.last_name}`,
            patients: new Set(),
          });
        }

        map.get(doctor.user_id).patients.add(patient.patient_id);
      });

      return Array.from(map.values()).map((d) => ({
        name: d.name,
        count: d.patients.size,
      }));
    },
  },

  watch: {
    doctorPatients: {
      async handler() {
        if (!this.isReady) return;
        await this.$nextTick();
        this.renderChart();
      },
      deep: true,
    },
  },

  methods: {
    renderChart() {
      const canvas = this.$refs.doctorChart;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (canvas.clientHeight === 0 || canvas.clientWidth === 0) return;

      // Destroy previous chart
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }

      // No data check
      if (!this.doctorPatients.length) return;

      const labels = this.doctorPatients.map((d) => d.name);
      const data = this.doctorPatients.map((d) => d.count);

      this.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Patients Attended",
              data,
              backgroundColor: "#0ea5e9",
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
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
              grid: { color: "#f1f5f9" },
            },
          },
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label(context) {
                  return `${context.parsed.y} patient(s)`;
                },
              },
            },
          },
        },
      });
    },
  },

  async mounted() {
    const store = useFetchDataStore();
    await store.fetchMedications();

    await this.$nextTick();
    this.isReady = true;
    this.renderChart();
  },

  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
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
