<template>
  <div
    class="max-h-[75vh] overflow-y-auto space-y-4 bg-white p-4 border rounded-2xl"
  >
    <!-- Header -->
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

    <!-- LINE CHART -->
    <div class="bg-white p-4 rounded-xl border h-[350px]">
      <canvas ref="revenueChart"></canvas>
    </div>

    <!-- FORECAST TABLE -->
    <div class="bg-white p-4 rounded-xl shadow overflow-x-auto">
      <h3 class="font-semibold mb-3">7-Day Revenue Forecast</h3>
      <table class="w-full text-sm border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">Date</th>
            <th class="p-2 border">SARIMA</th>
            <th class="p-2 border">Hybrid</th>
            <th class="p-2 border">Difference</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in forecast?.forecast" :key="row.date">
            <td class="p-2 border">{{ formatDate(row.date) }}</td>
            <td class="p-2 border">₱{{ format(row.sarima_forecast) }}</td>
            <td class="p-2 border font-semibold">
              ₱{{ format(row.hybrid_forecast) }}
            </td>
            <td
              class="p-2 border"
              :class="row.difference < 0 ? 'text-red-600' : 'text-green-600'"
            >
              ₱{{ format(row.difference) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";
import { toast } from "vue3-toastify";
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

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export default {
  name: "RevenueForecastingPage",

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),
  },

  data() {
    return {
      forecast: null,
      chart: null,
      loading: false,
    };
  },

  async mounted() {
    try {
      const res = await axios.get(
        "http://localhost:8000/analytics/revenue/forecast"
      );

      this.forecast = res.data.data;

      // ✅ wait until canvas is mounted
      this.$nextTick(() => {
        this.renderChart();
      });

      useFetchDataStore().fetchMedications?.();
    } catch (err) {
      console.error(err);
    }
  },

  beforeUnmount() {
    // ✅ VERY IMPORTANT
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toISOString().slice(0, 10);
    },

    format(value) {
      if (value === undefined || value === null) return "-";
      return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    renderChart() {
      const canvas = this.$refs.revenueChart;

      // ✅ guard against null canvas
      if (!canvas || !this.forecast) return;

      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      const historicalLabels = this.forecast.historical.map((d) =>
        this.formatDate(d.date)
      );
      const historicalData = this.forecast.historical.map(
        (d) => d["Clinic Share"]
      );

      const forecastLabels = this.forecast.forecast.map((d) =>
        this.formatDate(d.date)
      );

      const sarima = this.forecast.forecast.map((d) => d.sarima_forecast);
      const hybrid = this.forecast.forecast.map((d) => d.hybrid_forecast);

      this.chart = new Chart(canvas, {
        type: "line",
        data: {
          labels: [...historicalLabels, ...forecastLabels],
          datasets: [
            {
              label: "Historical Revenue",
              data: historicalData,
              borderColor: "#6B7280",
              borderWidth: 2,
              tension: 0.3,
            },
            {
              label: "SARIMA Forecast",
              data: [...Array(historicalData.length).fill(null), ...sarima],
              borderColor: "#FACC15",
              borderDash: [6, 6],
              borderWidth: 3,
              tension: 0.3,
            },
            {
              label: "Hybrid Forecast",
              data: [...Array(historicalData.length).fill(null), ...hybrid],
              borderColor: "#2563EB",
              borderDash: [3, 3],
              borderWidth: 3,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // ✅ critical
          plugins: {
            legend: {
              position: "bottom",
              labels: { usePointStyle: true },
            },
            tooltip: {
              callbacks: {
                label(ctx) {
                  return `₱${Number(ctx.raw).toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback(value) {
                  return `₱${Number(value).toLocaleString()}`;
                },
              },
            },
          },
        },
      });
    },

    async generateXlsx() {
      if (!this.medications?.length) {
        alert("⚠️ No data available.");
        return;
      }

      this.loading = true;

      try {
        const rows = this.medications
          .map((item) => {
            const chart = item.dentalChart;
            if (!chart) return null;

            const patient = chart.patient;
            const dentist = chart.user_accounts;

            const procedureMap = {};
            chart.teeth.forEach((tooth) => {
              const proc = tooth.priceProcedure;
              if (!proc) return;
              procedureMap[proc.procedure_name] ??= {
                count: 0,
                type: proc.procedure_type,
              };
              procedureMap[proc.procedure_name].count++;
            });

            const total = Number(item.patient_payment || 0);
            const type =
              Object.values(procedureMap)[0]?.type || "Basic Procedure";

            const clinicShare =
              type === "Basic Procedure" ? total * 0.6 : total * 0.5;
            const dentistShare = total - clinicShare;

            return Object.entries(procedureMap).map(([name, d]) => ({
              "Procedure Date": chart.procedure_date,
              "Patient Full Name": `${patient.first_name} ${patient.last_name}`,
              Dentist: dentist
                ? `${dentist.first_name} ${dentist.last_name}`
                : "",
              Procedure: `${name} - ${d.count}`,
              "Procedure Type": d.type,
              "Patient Payment": total.toFixed(2),
              "Clinic Share": clinicShare.toFixed(2),
              "Dentist Share": dentistShare.toFixed(2),
            }));
          })
          .flat();

        const res = await axios.post(
          process.env.VUE_APP_API_BASE_URL + "/revenue/generate-xlsx",
          rows
        );

        toast.success("✅ Revenue Forecast Generated");

        this.forecast = res.data.forecast;

        this.$nextTick(() => this.renderChart());
      } catch (err) {
        console.error(err);
        alert("❌ Forecast generation failed.");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
