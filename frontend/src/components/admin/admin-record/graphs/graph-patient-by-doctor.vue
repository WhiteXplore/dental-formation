<template>
  <div class="bg-white rounded-2xl h-[350px]">
    <h3 class="text-lg font-semibold text-gray-700 mb-3">Patients by Doctor</h3>
    <div class="h-[calc(100%-2rem)]">
      <canvas ref="doctorChart" class="w-full h-full"></canvas>
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

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    doctorRevenue() {
      if (!Array.isArray(this.medications)) return [];

      const doctorMap = new Map();

      this.medications.forEach((item) => {
        const dentalChart = item.dentalChart;
        const doctor = dentalChart?.user_accounts;
        const patient = dentalChart?.patient;

        if (!doctor || !patient) return;

        const doctorId = doctor.user_id;
        const patientId = patient.patient_id;

        if (!doctorMap.has(doctorId)) {
          doctorMap.set(doctorId, {
            name: `${doctor.first_name} ${doctor.last_name}`,
            patients: new Set(),
          });
        }

        const doctorEntry = doctorMap.get(doctorId);
        doctorEntry.patients.add(patientId);
      });

      return Array.from(doctorMap.values()).map((doc) => ({
        name: doc.name,
        patients: doc.patients.size,
      }));
    },
  },

  watch: {
    doctorRevenue: {
      handler(newVal) {
        if (newVal.length > 0) {
          this.renderDoctorChart();
        }
      },
      immediate: true,
    },
  },

  methods: {
    renderDoctorChart() {
      const ctx = this.$refs.doctorChart;

      if (!ctx) return;

      // Destroy previous chart instance if any
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const labels = this.doctorRevenue.map((d) => d.name);
      const data = this.doctorRevenue.map((d) => d.patients);

      this.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Patients Attended",
              data,
              backgroundColor: "#0ea5e9",
              borderRadius: 8,
              barThickness: 40,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
              grid: { color: "#f1f5f9" },
            },
          },
          plugins: {
            legend: { display: true, position: "top" },
            title: {
              display: true,
              text: "Doctor-wise Patient Volume",
              font: { size: 16, weight: "bold" },
              padding: { top: 10, bottom: 20 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.dataset.label}: ${ctx.parsed.y} patients`,
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
