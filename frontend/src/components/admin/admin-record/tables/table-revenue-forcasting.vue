<template>
  <div
    v-if="loadingForecast"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
  >
    <div
      class="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white shadow-xl border"
    >
      <!-- Spinner -->
      <svg
        class="w-10 h-10 animate-spin text-blue-600"
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
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>

      <!-- Text -->
      <p class="text-sm font-semibold text-gray-700">
        Running {{ forecastType === "daily" ? "Daily" : "Monthly" }} Forecast…
      </p>
      <p class="text-xs text-gray-500">Please wait, analyzing revenue trends</p>
    </div>
  </div>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Revenue Forecast Analytics</h1>
        <p class="text-sm text-gray-500">
          {{ forecast?.model }} • {{ forecast?.seasonality }} seasonality
        </p>
      </div>
      <div class="flex gap-2 items-center">
        <!-- Controls -->
        <div class="flex items-center gap-4">
          <!-- Forecast Type Selector -->
          <div
            class="inline-flex rounded-xl border border-gray-300 bg-gray-100 p-1"
          >
            <button
              @click="forecastType = 'daily'"
              :class="[
                'px-4 py-2 text-sm font-semibold rounded-lg transition',
                forecastType === 'daily'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-white',
              ]"
            >
              Daily
            </button>

            <button
              @click="forecastType = 'monthly'"
              :class="[
                'px-4 py-2 text-sm font-semibold rounded-lg transition',
                forecastType === 'monthly'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-white',
              ]"
            >
              Monthly
            </button>
          </div>
        </div>

        <!-- Generate XLSX Button -->
        <button
          @click="generateXlsx"
          :disabled="loading"
          class="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold shadow-md shadow-emerald-500/30 hover:from-emerald-600 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-500/40 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <!-- Loading -->
          <span v-if="loading" class="flex items-center gap-2">
            <svg
              class="h-4 w-4 animate-spin text-white"
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
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Generating XLSX…
          </span>

          <!-- Default -->
          <span v-else class="flex items-center gap-2">
            <!-- Download Icon -->
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
              />
            </svg>
            Export Revenue (XLSX)
          </span>
        </button>
      </div>
    </div>

    <div class="max-h-[75vh] overflow-y-auto space-y-4">
      <!-- KPI CARDS -->
      <!-- KPI CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- DAILY KPIs -->
        <template v-if="forecastType === 'daily'">
          <!-- Avg SARIMA -->
          <div class="p-4 rounded-xl border flex flex-col">
            <kpiCards
              title="Avg SARIMA"
              :value="forecast?.summary?.avg_sarima ?? 0"
              color="gray"
            />
            <p class="text-xs text-gray-400 mt-1">
              Based on historical SARIMA forecast
            </p>
          </div>
          <div class="p-4 rounded-xl border flex flex-col">
            <kpiCards
              title="Avg Hybrid"
              :value="forecast?.summary?.avg_hybrid ?? 0"
              color="green"
            />
            <p class="text-xs text-gray-400 mt-1">
              SARIMA + ML hybrid forecast adjustment
            </p>
          </div>

          <div class="p-4 rounded-xl border flex flex-col">
            <kpiCards
              title="ML Adjustment"
              :value="forecast?.summary?.avg_difference ?? 0"
              color="red"
            />
            <p class="text-xs text-gray-400 mt-1">
              Difference between SARIMA and Hybrid forecast
            </p>
          </div>
          <div class="p-4 rounded-xl border flex flex-col">
            <kpiCards
              title="Max Expected Revenue"
              :value="forecast?.summary?.max_expected_revenue ?? 0"
              color="yellow"
            />
            <p class="text-xs text-gray-400 mt-1">
              Highest expected daily revenue
            </p>
          </div>
        </template>

        <!-- MONTHLY KPIs -->
        <template v-else>
          <div class="p-4 rounded-xl border flex flex-col">
            <kpiCards
              title="Last Month Revenue"
              :value="forecast?.summary?.last_month_actual ?? 0"
              color="gray"
            />
          </div>
          <div class="p-4 rounded-xl border flex flex-col">
            <kpiCards
              title="Next Month Forecast"
              :value="forecast?.summary?.next_month_forecast ?? 0"
              color="blue"
            />
          </div>

          <div class="bg-white p-5 rounded-xl shadow border border-gray-100">
            <p class="text-sm text-gray-500 font-medium">Forecast Confidence</p>
            <p class="text-2xl font-bold mt-2">
              {{ forecast?.forecast_confidence?.level ?? "N/A" }}
            </p>

            <p class="text-xs text-gray-400 mt-1">
              {{ forecast?.forecast_confidence?.reason ?? "" }}
            </p>
          </div>
        </template>
      </div>

      <!-- LINE CHART -->
      <div class="bg-white p-4 rounded-xl border">
        <!-- Chart -->
        <canvas v-if="hasChartData" ref="revenueChart" height="120"></canvas>

        <!-- Empty State -->
        <div
          v-else
          class="h-[30vh] flex flex-col items-center justify-center text-gray-400 text-sm"
        >
          <svg
            class="w-10 h-10 mb-2 text-gray-300"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 3v18h18M7 13l3-3 4 4 5-6"
            />
          </svg>
          No forecast data available
        </div>
      </div>

      <!-- INTERPRETATION -->
      <!-- INTERPRETATION -->
      <div class="bg-white p-6 rounded-2xl shadow-md border space-y-6">
        <h3 class="font-semibold text-xl">Forecast Interpretation</h3>

        <!-- DAILY -->
        <template v-if="forecastType === 'daily'">
          <div
            v-if="forecast"
            class="bg-white p-6 rounded-2xl shadow-md border space-y-6"
          >
            <!-- Intro -->
            <p class="text-gray-600 text-sm leading-relaxed">
              This analysis uses a
              <b>{{ forecast?.model ?? "..." }}</b> model with
              <b>{{ forecast?.seasonality ?? "..." }} seasonality</b> to
              forecast daily clinic revenue.
            </p>

            <!-- Forecast Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- SARIMA -->
              <div
                class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2"
              >
                <h4 class="font-semibold text-gray-800">SARIMA Forecast</h4>
                <p class="text-gray-600 text-sm">
                  Based on historical trends and weekly seasonality.
                </p>
                <p
                  :class="{
                    'text-green-600 font-semibold':
                      forecast?.summary?.avg_sarima >= 1000,
                    'text-yellow-600 font-semibold':
                      forecast?.summary?.avg_sarima >= 500 &&
                      forecast?.summary?.avg_sarima < 1000,
                    'text-red-600 font-semibold':
                      forecast?.summary?.avg_sarima < 500,
                  }"
                >
                  {{ classifyRevenue(forecast?.summary?.avg_sarima ?? 0) }}
                </p>
                <p class="text-gray-700 text-sm">
                  Avg SARIMA revenue: ₱{{
                    format(forecast?.summary?.avg_sarima ?? 0)
                  }}
                </p>
              </div>

              <!-- Hybrid -->
              <div
                class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2"
              >
                <h4 class="font-semibold text-gray-800">Hybrid Forecast</h4>
                <p class="text-gray-600 text-sm">
                  Adjusted using machine learning for recent trends.
                </p>
                <p
                  :class="{
                    'text-green-600 font-semibold':
                      forecast?.summary?.avg_hybrid >= 1000,
                    'text-yellow-600 font-semibold':
                      forecast?.summary?.avg_hybrid >= 500 &&
                      forecast?.summary?.avg_hybrid < 1000,
                    'text-red-600 font-semibold':
                      forecast?.summary?.avg_hybrid < 500,
                  }"
                >
                  {{ classifyRevenue(forecast?.summary?.avg_hybrid ?? 0) }}
                </p>
                <p class="text-gray-700 text-sm">
                  Avg Hybrid revenue: ₱{{
                    format(forecast?.summary?.avg_hybrid ?? 0)
                  }}
                </p>
              </div>
            </div>

            <!-- Summary -->
            <div
              class="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 space-y-2"
            >
              <p class="text-gray-700 text-sm">
                <b>Hybrid vs SARIMA:</b>
                <span
                  v-if="forecast?.summary?.avg_difference > 0"
                  class="text-green-600 font-semibold"
                >
                  Hybrid forecast higher
                </span>
                <span
                  v-else-if="forecast?.summary?.avg_difference < 0"
                  class="text-red-600 font-semibold"
                >
                  Hybrid forecast lower
                </span>
                <span v-else class="text-gray-600 font-semibold">
                  Hybrid equals SARIMA
                </span>
              </p>

              <p class="text-gray-600 text-sm">
                <template v-if="forecast?.summary?.avg_difference > 0">
                  Short-term revenue increase expected.
                </template>
                <template v-else-if="forecast?.summary?.avg_difference < 0">
                  Short-term revenue slowdown expected.
                </template>
                <template v-else> Revenue expected to remain stable. </template>
              </p>

              <ul
                v-if="forecast?.summary?.avg_difference !== 0"
                class="list-disc list-inside text-gray-700 space-y-1 ml-2"
              >
                <li>Adjust appointment slots to match demand.</li>
                <li>Promote high-margin procedures strategically.</li>
                <li>Ensure dentist availability and chair utilization.</li>
              </ul>

              <p class="text-gray-800 text-sm font-medium mt-2">
                Highest projected daily revenue:
                <span class="text-blue-600 font-semibold">
                  ₱{{ format(forecast?.summary?.max_expected_revenue ?? 0) }}
                </span>
              </p>
            </div>
          </div>

          <!-- Loading state when forecast is not yet loaded -->
          <div
            v-else
            class="bg-white p-6 rounded-2xl shadow-md border text-gray-500"
          >
            Loading forecast data…
          </div>
        </template>

        <!-- MONTHLY -->
        <template v-else>
          <p class="text-sm text-gray-600">
            This forecast uses a <b>{{ forecast?.model }}</b> approach.
          </p>

          <div class="bg-gray-50 p-4 rounded-xl border space-y-3">
            <p class="text-sm">
              <b>Methodology:</b> {{ forecast?.methodology }}
            </p>

            <p class="text-sm">
              <b>Historical Months:</b>
              {{ forecast?.validation?.historical_months_available ?? "N/A" }}
            </p>

            <p
              class="font-semibold"
              :class="
                forecast?.summary.difference >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{
                forecast?.summary.difference === 0
                  ? "Revenue expected to remain stable next month."
                  : forecast?.summary.difference > 0
                  ? "Revenue is projected to increase next month."
                  : "Revenue is projected to decline next month."
              }}
            </p>

            <ul class="list-disc list-inside text-sm text-gray-700">
              <li v-if="forecast?.summary.difference > 0">
                Prepare additional appointment slots and staffing.
              </li>
              <li v-if="forecast?.summary.difference < 0">
                Consider promotions or optimizing schedules.
              </li>
              <li>
                Monitor actual performance to improve future forecast accuracy.
              </li>
            </ul>
          </div>
        </template>
      </div>

      <!-- FORECAST TABLE -->
      <!-- FORECAST TABLE -->
      <div class="bg-white p-4 rounded-xl shadow overflow-x-auto">
        <h3 class="font-semibold mb-3">
          {{
            forecastType === "daily"
              ? "7-Day Revenue Forecast"
              : "Monthly Revenue Forecast"
          }}
        </h3>

        <!-- DAILY TABLE -->
        <table v-if="forecastType === 'daily'" class="w-full text-sm border">
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
              <td class="p-2 border">₱{{ format(row.hybrid_forecast) }}</td>
              <td class="p-2 border">₱{{ format(row.difference) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- MONTHLY TABLE -->
        <table v-else class="w-full text-sm border">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 border">Month</th>
              <th class="p-2 border">Last Actual</th>
              <th class="p-2 border">Forecast</th>
              <th class="p-2 border">Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="p-2 border">
                {{ formatMonth(forecast?.forecast[0]?.month) }}
              </td>
              <td class="p-2 border">
                ₱{{ format(forecast?.summary.last_month_actual) }}
              </td>
              <td class="p-2 border font-semibold">
                ₱{{ format(forecast?.summary.next_month_forecast) }}
              </td>
              <td
                class="p-2 border font-semibold"
                :class="
                  forecast?.summary.difference >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                ₱{{ format(forecast?.summary.difference) }}
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
import kpiCards from "../graphs/kpi-cards.vue";
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
  Legend,
);

export default {
  name: "RevenueForecastingPage",
  components: {
    kpiCards,
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]),
    hasChartData() {
      return (
        this.forecast &&
        this.forecast.forecast &&
        this.forecast.forecast.length > 0
      );
    },
  },

  data() {
    return {
      forecast: null,
      chart: null,
      loading: false,
      loadingForecast: false,
      forecastType: "daily",
    };
  },
  watch: {
    forecastType: {
      immediate: true,
      async handler(type) {
        this.loadingForecast = true;

        try {
          const url =
            type === "daily"
              ? process.env.VUE_APP_API_BASE_URL + "/revenue/run-daily-forecast"
              : process.env.VUE_APP_API_BASE_URL +
                "/revenue/run-monthly-forecast";

          const res = await axios.post(url);

          if (!res.data || !res.data.forecast) {
            toast.error("⚠️ Failed to run forecast: No data returned.");
            this.forecast = null;
            return;
          }

          this.forecast = res.data;

          this.$nextTick(() => {
            if (this.hasChartData) {
              this.renderChart();
            }
          });

          toast.success(
            `✅ ${type === "daily" ? "Daily" : "Monthly"} forecast loaded`,
          );
        } catch (err) {
          console.error(err);
          toast.error("❌ Failed to run forecast.");
          this.forecast = null;
        } finally {
          this.loadingForecast = false;
        }
      },
    },
  },

  async mounted() {
    try {
      await useFetchDataStore().fetchMedications?.();
    } catch (err) {
      console.error("Failed to fetch medications:", err);
    }
  },
  methods: {
    classifyRevenue(value) {
      if (value >= 1000) return "High";
      if (value >= 500) return "Medium";
      return "Low";
    },
    async runForecast() {
      this.loadingForecast = true;

      try {
        const url =
          this.forecastType === "daily"
            ? process.env.VUE_APP_API_BASE_URL + "/revenue/run-daily-forecast"
            : process.env.VUE_APP_API_BASE_URL +
              "/revenue/run-monthly-forecast";

        const res = await axios.post(url);

        if (!res.data || !res.data.forecast) {
          toast.error("⚠️ Failed to run forecast: No data returned.");
          return;
        }

        this.forecast = res.data;
        this.$nextTick(() => {
          this.renderChart();
        });

        toast.success(
          `✅ ${
            this.forecastType === "daily" ? "Daily" : "Monthly"
          } forecast completed!`,
        );
      } catch (error) {
        console.error(error);
        toast.error("❌ Failed to run forecast.");
      } finally {
        this.loadingForecast = false;
      }
    },

    async runMonthlyForecast() {
      this.loadingForecast = true;

      try {
        const res = await axios.post(
          process.env.VUE_APP_API_BASE_URL + "/revenue/run-monthly-forecast",
        );

        if (!res.data || !res.data.forecast) {
          toast.error("⚠️ Failed to run forecast: No data returned.");
          return;
        }

        // Update the forecast
        this.forecast = res.data;

        // Update chart
        this.$nextTick(() => {
          this.renderChart();
        });

        toast.success("✅ Forecast run successfully!");
      } catch (error) {
        console.error(error);
        toast.error("❌ Failed to run forecast.");
      } finally {
        this.loadingForecast = false;
      }
    },
    formatProcedureDate(date) {
      if (!date) return "-";

      const d = new Date(date);
      d.setDate(d.getDate() + 1); // 🔥 ADD 1 DAY

      return d.toISOString().slice(0, 10);
    },
    formatMonth(date) {
      if (!date) return "-";
      return new Date(date).toLocaleString("default", {
        year: "numeric",
        month: "long",
      });
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
      if (this.forecastType === "daily") {
        this.renderDailyChart();
      } else {
        this.renderMonthlyChart();
      }
    },

    renderDailyChart() {
      const ctx = this.$refs.revenueChart;
      if (!ctx || !this.forecast) return;

      // Use last 7 historical days (or fewer if less data)
      const last7Historical = this.forecast.historical.slice(-7);
      const historicalLabels = last7Historical.map((d) =>
        this.formatDate(d.date),
      );
      const historicalData = last7Historical.map((d) => d["Clinic Share"]);

      // Forecast labels and data
      const forecastLabels = this.forecast.forecast.map((d) =>
        this.formatDate(d.date),
      );
      const sarima = this.forecast.forecast.map((d) => d.sarima_forecast);
      const hybrid = this.forecast.forecast.map((d) => d.hybrid_forecast);
      const difference = this.forecast.forecast.map((d) => d.difference);

      // Combine labels for X-axis
      const allLabels = [...historicalLabels, ...forecastLabels];

      // Pad forecast datasets with nulls to align after historical
      const sarimaData = [
        ...Array(historicalData.length).fill(null),
        ...sarima,
      ];
      const hybridData = [
        ...Array(historicalData.length).fill(null),
        ...hybrid,
      ];
      const differenceData = [
        ...Array(historicalData.length).fill(null),
        ...difference,
      ];

      // Destroy existing chart if exists
      if (this.chart) this.chart.destroy();

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: allLabels,
          datasets: [
            {
              label: "Historical Revenue (Last 7 Days)",
              data: historicalData,
              borderColor: "#6B7280",
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 4,
              fill: false,
            },
            {
              label: "SARIMA Forecast",
              data: sarimaData,
              borderColor: "#FACC15",
              borderDash: [6, 6],
              borderWidth: 3,
              tension: 0.3,
              fill: false,
            },
            {
              label: "Hybrid Forecast",
              data: hybridData,
              borderColor: "#2563EB",
              borderDash: [3, 3],
              borderWidth: 3,
              tension: 0.3,
              fill: false,
            },
            {
              label: "Difference",
              data: differenceData,
              borderColor: "#EF4444",
              borderDash: [2, 2],
              borderWidth: 2,
              tension: 0.3,
              fill: false,
            },
          ],
        },
        options: this.baseChartOptions(),
      });
    },
    renderMonthlyChart() {
      const ctx = this.$refs.revenueChart;
      if (!ctx || !this.forecast) return;

      const historical = this.forecast.historical || [];
      const forecast = this.forecast.forecast || [];

      const labels = [
        ...historical.map((h) => this.formatMonth(h.month)),
        ...forecast.map((f) => this.formatMonth(f.month)),
      ];

      const historicalData = historical.map((h) => h.clinic_share);

      const forecastData = [
        ...Array(historical.length - 1).fill(null),
        historical[historical.length - 1]?.clinic_share,
        ...forecast.map((f) => f.forecast),
      ];

      if (this.chart) this.chart.destroy();

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Historical Revenue",
              data: historicalData,
              borderColor: "#6B7280",
              borderWidth: 3,
              tension: 0.35,
              pointRadius: 4,
            },
            {
              label: "Next Month Forecast",
              data: forecastData,
              borderColor: "#FACC15",
              borderDash: [7, 7],
              borderWidth: 4,
              tension: 0.35,
              pointRadius: (ctx) =>
                ctx.dataIndex === forecastData.length - 1 ? 8 : 0,
              pointBackgroundColor: "#FACC15",
              pointBorderColor: "#F59E0B",
              pointBorderWidth: 3,
            },
          ],
        },
        options: this.baseChartOptions(),
      });
    },
    baseChartOptions() {
      return {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true },
          },
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
      };
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
          rows,
        );

        if (!res.data.forecast || !res.data.forecast.forecast?.length) {
          alert("⚠️ Not enough data to generate forecast.");
          return;
        }

        toast.success("✅ Generated Revenue Forecast Successfully");

        // Update chart and table
        this.forecast = res.data.forecast;
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (error) {
        console.error(error);
        toast.warning(
          " Failed to generate forecast: Data may be insufficient.",
        );
      } finally {
        this.loading = false; // stop loading
      }
    },
  },
};
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
