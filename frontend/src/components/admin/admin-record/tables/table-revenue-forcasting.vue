<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Revenue Forecast Analytics</h1>
        <p class="text-sm text-gray-500">
          {{ forecast?.model }} • {{ forecast?.seasonality }} seasonality
        </p>
      </div>
      <!-- Generate XLSX Button -->
      <button
        @click="generateXlsx"
        :disabled="loading"
        class="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        <span v-if="loading" class="flex gap-2 w-full">
          <svg
            class="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Generating...
        </span>
        <span v-else>Generate Revenue XLSX</span>
      </button>
    </div>

    <div class="max-h-[75vh] overflow-y-auto space-y-4">
      <!-- KPI CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Card: Avg SARIMA -->
        <div
          class="bg-white p-5 rounded-xl shadow hover:shadow-md transition-shadow duration-300 border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500 font-medium">Avg SARIMA</p>
            <svg
              class="w-5 h-5 text-gray-300"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p class="text-2xl font-bold text-gray-800 mt-2">
            ₱{{ format(forecast?.summary.avg_sarima) }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Based on historical SARIMA forecast
          </p>
        </div>

        <!-- Card: Avg Hybrid -->
        <div
          class="bg-white p-5 rounded-xl shadow hover:shadow-md transition-shadow duration-300 border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500 font-medium">Avg Hybrid</p>
            <svg
              class="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p class="text-2xl font-bold text-green-600 mt-2">
            ₱{{ format(forecast?.summary.avg_hybrid) }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            SARIMA + ML hybrid forecast adjustment
          </p>
        </div>

        <!-- Card: ML Adjustment -->
        <div
          class="bg-white p-5 rounded-xl shadow hover:shadow-md transition-shadow duration-300 border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500 font-medium">ML Adjustment</p>
            <svg
              class="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 13l-4 4L5 7"
              />
            </svg>
          </div>
          <p class="text-2xl font-bold text-red-600 mt-2">
            ₱{{ format(forecast?.summary.avg_difference) }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Difference between SARIMA and Hybrid forecast
          </p>
        </div>

        <!-- Card: Max Expected Revenue -->
        <div
          class="bg-white p-5 rounded-xl shadow hover:shadow-md transition-shadow duration-300 border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500 font-medium">
              Max Expected Revenue
            </p>
            <svg
              class="w-5 h-5 text-yellow-400"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4l3 3"
              />
            </svg>
          </div>
          <p class="text-2xl font-bold text-gray-800 mt-2">
            ₱{{ format(forecast?.summary.max_expected_revenue) }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Highest revenue expected this period
          </p>
        </div>
      </div>

      <!-- LINE CHART -->
      <div class="bg-white p-4 rounded-xl shadow">
        <canvas ref="revenueChart" height="120"></canvas>
      </div>

      <!-- INTERPRETATION -->
      <div
        class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-6"
      >
        <!-- Header -->
        <div class="flex items-center space-x-3">
          <svg
            class="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          <h3 class="font-semibold text-xl text-gray-800">
            Forecast Interpretation
          </h3>
        </div>

        <!-- Intro -->
        <p class="text-gray-600 text-sm leading-relaxed">
          This analysis uses a <b>Hybrid SARIMA + Machine Learning model</b> to
          forecast clinic revenue.
        </p>

        <!-- Grid Forecast -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- SARIMA Forecast -->
          <div
            class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3"
          >
            <h4 class="font-semibold text-gray-800">SARIMA Forecast</h4>
            <p class="text-gray-600 text-sm">
              Expected revenue based on historical trends and weekly seasonality
              patterns.
            </p>
            <p
              :class="
                forecast?.summary.avg_sarima > 15000
                  ? 'text-green-600 font-semibold'
                  : 'text-red-600 font-semibold'
              "
            >
              {{ forecast?.summary.avg_sarima > 15000 ? "High" : "Low" }}
            </p>
            <!-- Conditional Suggestions -->
            <div class="ml-3 text-gray-700 text-sm space-y-1">
              <template v-if="forecast?.summary.avg_sarima > 15000">
                <p>✅ Revenue expected to be strong. Clinic may:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>
                    Plan additional appointments to capture increased demand.
                  </li>
                  <li>
                    Ensure all dentist chairs are staffed and fully utilized.
                  </li>
                  <li>Promote high-margin procedures to maximize revenue.</li>
                  <li>Monitor peak days and adjust staffing accordingly.</li>
                </ul>
              </template>
              <template v-else>
                <p>⚠️ Revenue expected to be lower. Clinic may:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>
                    Plan promotions or discounts to attract more patients.
                  </li>
                  <li>
                    Focus on high-margin procedures to maintain profitability.
                  </li>
                  <li>Optimize staffing to reduce idle dentist time.</li>
                  <li>Monitor cancellations and reschedule strategically.</li>
                </ul>
              </template>
            </div>
          </div>

          <!-- Hybrid Forecast -->
          <div
            class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3"
          >
            <h4 class="font-semibold text-gray-800">Hybrid Forecast</h4>
            <p class="text-gray-600 text-sm">
              Adjusts SARIMA predictions using machine learning to account for
              recent fluctuations.
            </p>
            <p
              :class="
                forecast?.summary.avg_hybrid > 15000
                  ? 'text-green-600 font-semibold'
                  : 'text-red-600 font-semibold'
              "
            >
              {{ forecast?.summary.avg_hybrid > 15000 ? "High" : "Low" }}
            </p>
            <!-- Conditional Suggestions -->
            <div class="ml-3 text-gray-700 text-sm space-y-1">
              <template v-if="forecast?.summary.avg_hybrid > 15000">
                <p>✅ Potential short-term revenue increase. Clinic may:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>
                    Expand appointment slots to accommodate higher demand.
                  </li>
                  <li>Promote high-margin procedures aggressively.</li>
                  <li>
                    Ensure all dentists are available to avoid bottlenecks.
                  </li>
                  <li>
                    Adjust staff schedules to support peak patient flow
                    efficiently.
                  </li>
                </ul>
              </template>
              <template v-else>
                <p>⚠️ Potential short-term slowdown. Clinic may:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>Plan promotions or discounts to increase visits.</li>
                  <li>
                    Focus on high-margin procedures to maintain profitability.
                  </li>
                  <li>Optimize dentist schedules and chair utilization.</li>
                  <li>Track cancellations and reschedule strategically.</li>
                </ul>
              </template>
            </div>
          </div>
        </div>

        <!-- Summary Section -->
        <div
          class="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 space-y-3"
        >
          <p class="text-gray-700 text-sm leading-relaxed">
            <b>Hybrid vs SARIMA Forecast:</b>
            <span
              v-if="forecast?.summary.avg_difference > 0"
              class="text-green-600 font-semibold"
            >
              Hybrid forecast is higher than SARIMA
            </span>
            <span
              v-else-if="forecast?.summary.avg_difference < 0"
              class="text-red-600 font-semibold"
            >
              Hybrid forecast is lower than SARIMA
            </span>
            <span v-else class="text-gray-600 font-semibold">
              Hybrid forecast is equal to SARIMA
            </span>
          </p>

          <p class="text-gray-600 text-sm">
            <template v-if="forecast?.summary.avg_difference > 0">
              Potential short-term revenue increase. Management may:
            </template>
            <template v-else-if="forecast?.summary.avg_difference < 0">
              Potential short-term slowdown. Management may:
            </template>
            <template v-else>
              Revenue expected to follow normal seasonal patterns. Continue
              standard operations.
            </template>
          </p>

          <ul
            v-if="forecast?.summary.avg_difference !== 0"
            class="list-disc list-inside text-gray-700 space-y-1 ml-2"
          >
            <li>Expand appointment slots – maximize dentist time.</li>
            <li>Promote high-margin procedures aggressively.</li>
            <li>
              Ensure dentist availability and chair utilization to avoid
              bottlenecks.
            </li>
          </ul>

          <p class="text-gray-800 text-sm font-medium mt-2">
            Highest projected daily revenue in the forecast window is
            <span class="text-blue-600 font-semibold">
              ₱{{ format(forecast?.summary.max_expected_revenue) }} </span
            >.
          </p>
        </div>
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
    // Fetch forecast
    const res = await axios.get(
      "http://localhost:8000/analytics/revenue/forecast"
    );
    this.forecast = res.data.data;
    this.renderChart();

    // Fetch medications for XLSX
    useFetchDataStore().fetchMedications?.();
  },

  methods: {
    formatProcedureDate(date) {
      if (!date) return "-";

      const d = new Date(date);
      d.setDate(d.getDate() + 1); // 🔥 ADD 1 DAY

      return d.toISOString().slice(0, 10);
    },
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
      const ctx = this.$refs.revenueChart;
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

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [...historicalLabels, ...forecastLabels],
          datasets: [
            {
              label: "Historical Revenue",
              data: historicalData,
              borderColor: "#6B7280",
              backgroundColor: "transparent",
              borderWidth: 2,
              tension: 0.3,
            },
            {
              label: "SARIMA Forecast",
              data: [...Array(historicalData.length).fill(null), ...sarima],
              borderColor: "#FACC15",
              backgroundColor: "transparent",
              borderDash: [6, 6],
              borderWidth: 3,
              tension: 0.3,
            },
            {
              label: "Hybrid Forecast",
              data: [...Array(historicalData.length).fill(null), ...hybrid],
              borderColor: "#2563EB",
              backgroundColor: "transparent",
              borderDash: [3, 3],
              borderWidth: 3,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true } },
            tooltip: {
              callbacks: {
                label(context) {
                  return `₱${Number(context.raw).toLocaleString()}`;
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

    // ------------------ XLSX Generation ------------------
    async generateXlsx() {
      if (!this.medications?.length) {
        alert("⚠️ No data available to generate forecast.");
        return;
      }

      this.loading = true; // start loading
      try {
        const rows = this.medications
          .map((item) => {
            const chart = item.dentalChart;
            if (!chart) return null;

            const patient = chart.patient;
            const dentist = chart.user_accounts;

            const patientName = `${patient.first_name} ${
              patient.middle_name ?? ""
            } ${patient.last_name}`.trim();
            const dentistName = dentist
              ? `${dentist.first_name} ${dentist.last_name}`
              : "";

            const procedureMap = {};
            chart.teeth.forEach((tooth) => {
              const proc = tooth.priceProcedure;
              if (!proc) return;
              if (!procedureMap[proc.procedure_name])
                procedureMap[proc.procedure_name] = {
                  count: 0,
                  type: proc.procedure_type,
                };
              procedureMap[proc.procedure_name].count++;
            });

            const totalPayment = Number(item.patient_payment || 0);
            const procedureType =
              Object.values(procedureMap)[0]?.type || "Basic Procedure";

            const clinicShare =
              procedureType === "Basic Procedure"
                ? totalPayment * 0.6
                : totalPayment * 0.5;
            const dentistShare =
              procedureType === "Basic Procedure"
                ? totalPayment * 0.4
                : totalPayment * 0.5;

            return Object.entries(procedureMap).map(([name, data]) => ({
              "Procedure Date": this.formatProcedureDate(chart.procedure_date),
              "Patient Full Name": patientName,
              Dentist: dentistName,
              Procedure: `${name} - ${data.count}`,
              "Procedure Type": data.type,
              "Patient Payment": totalPayment.toFixed(2),
              "Clinic Share": clinicShare.toFixed(2),
              "Dentist Share": dentistShare.toFixed(2),
            }));
          })
          .flat();

        const res = await axios.post(
          process.env.VUE_APP_API_BASE_URL + "/revenue/generate-xlsx",
          rows
        );

        if (!res.data.forecast || !res.data.forecast.forecast?.length) {
          alert("⚠️ Not enough data to generate forecast.");
          return;
        }

        toast.success("✅ Generated Revenue Forecast Successfully");

        // Update chart and table
        this.forecast = res.data.forecast;
        this.renderChart();
      } catch (error) {
        console.error(error);
        alert("❌ Failed to generate forecast: Data may be insufficient.");
      } finally {
        this.loading = false; // stop loading
      }
    },
  },
};
</script>
