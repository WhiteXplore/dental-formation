<template>
  <div class="bg-white rounded-2xl h-[40vh] p-4 flex flex-col">
    <h3 class="text-lg font-semibold text-gray-700 mb-3">Monthly Income</h3>

    <div class="flex-1 relative">
      <!-- Show canvas only if data exists -->
      <canvas
        v-if="filteredMedications.length > 0"
        ref="incomeChart"
        class="w-full h-full block"
      ></canvas>

      <!-- Show message if no data -->
      <p
        v-else
        class="absolute inset-0 flex items-center justify-center text-gray-400"
      >
        No income data available for the selected filter
      </p>
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
import axios from "axios";
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
  name: "CardMonthlyIncomeTrend",

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

    userMedications() {
      if (!Array.isArray(this.medications)) return [];
      if (this.user?.role === "Admin") return this.medications;

      // Filter medications assigned to the logged-in dentist
      return this.medications.filter(
        (item) => item.dentalChart?.user_accounts?.user_id === this.user?.sub
      );
    },

    filteredMedications() {
      return this.userMedications.filter((item) => {
        const procedureDate = item.dentalChart?.procedure_date;
        if (!procedureDate) return false;

        const date = dayjs(procedureDate);
        const yearMatch = this.filter.year
          ? date.year() === +this.filter.year
          : true;
        const monthMatch = this.filter.month
          ? date.month() + 1 === +this.filter.month
          : true;

        return yearMatch && monthMatch;
      });
    },
  },

  watch: {
    filteredMedications: {
      handler() {
        this.$nextTick(() => {
          this.renderIncomeChart();
        });
      },
      deep: true,
      immediate: true,
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
      } catch (err) {
        console.error("User fetch failed:", err);
        this.$router.push("/");
      }
    },

    renderIncomeChart() {
      const canvas = this.$refs.incomeChart;
      if (!canvas) return;

      // Destroy previous chart
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }

      if (!this.filteredMedications.length) return;

      // Prepare income per month
      const incomePerMonth = {};

      this.filteredMedications.forEach((item) => {
        const date = item.dentalChart?.procedure_date;
        if (!date) return;

        const month = dayjs(date).format("MMM");

        const patientPayment = parseFloat(item.patient_payment || "0");
        let revenue = 0;

        const firstTooth = item.dentalChart?.teeth?.[0];
        const procedureType = firstTooth?.priceProcedure?.procedure_type;

        if (procedureType === "Basic Procedure") revenue = patientPayment * 0.4;
        else if (procedureType === "Special Case")
          revenue = patientPayment * 0.5;
        else revenue = patientPayment * 0.4;

        incomePerMonth[month] = (incomePerMonth[month] || 0) + revenue;
      });

      // All months in order
      const allMonths = [
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

      // Only show months with income or filter applied
      const labels = allMonths.filter((m) => incomePerMonth[m] !== undefined);
      const data = labels.map((m) => incomePerMonth[m]);

      if (!labels.length) return; // no data

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      this.chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label:
                this.user?.role === "Admin"
                  ? "Clinic Monthly Income"
                  : "Your Monthly Income",
              data,
              borderColor: "#3B82F6",
              backgroundColor: "rgba(59,130,246,0.2)",
              tension: 0.35,
              fill: true,
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: (ctx) => "₱ " + ctx.parsed.y.toLocaleString(),
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (v) => "₱" + v.toLocaleString(),
              },
            },
          },
        },
      });
    },
  },

  async mounted() {
    const store = useFetchDataStore();
    await this.fetchUser();
    await store.fetchMedications();
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
  width: 100%;
  height: 100%;
  display: block;
}
</style>
