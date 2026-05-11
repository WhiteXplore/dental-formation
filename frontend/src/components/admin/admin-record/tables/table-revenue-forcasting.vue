<template>
  <div>
    <!-- LOADING OVERLAY -->
    <div
      v-if="loadingForecast"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <div
        class="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white shadow-xl border"
      >
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
        <p class="text-sm font-semibold text-gray-700">
          Running {{ forecastType === "daily" ? "Daily" : "Monthly" }} Forecast…
        </p>
        <p class="text-xs text-gray-500">Please wait, analyzing revenue trends</p>
      </div>
    </div>

    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Revenue Forecast Analytics</h1>
          <p class="text-sm text-gray-500">
            {{ forecast?.model ?? "-" }} • {{ forecast?.seasonality ?? "-" }} seasonality
          </p>
        </div>

        <div class="flex gap-2 items-center">
          <!-- FORECAST TYPE TOGGLE -->
          <div class="inline-flex rounded-xl border border-gray-300 bg-gray-100 p-1">
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

          <!-- XLSX EXPORT -->
          <button
            @click="generateXlsx"
            :disabled="loading"
            class="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold shadow-md shadow-emerald-500/30 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
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
            <span v-else class="flex items-center gap-2">
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <template v-if="forecastType === 'daily'">
            <div class="p-4 rounded-xl border flex flex-col">
              <kpiCards
                title="Avg SARIMA"
                :value="`₱${Number(forecast?.summary?.avg_sarima ?? 0).toLocaleString(
                  'en-PH',
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`"
                color="gray"
              />
              <p class="text-xs text-gray-400 mt-1">
                Based on historical SARIMA forecast
              </p>
            </div>
            <div class="p-4 rounded-xl border flex flex-col">
              <kpiCards
                title="Avg Hybrid"
                :value="`₱${Number(forecast?.summary?.avg_hybrid ?? 0).toLocaleString(
                  'en-PH',
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`"
                color="gray"
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
                :value="`₱${Number(
                  forecast?.summary?.max_expected_revenue ?? 0
                ).toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`"
                color="yellow"
              />
              <p class="text-xs text-gray-400 mt-1">Highest expected daily revenue</p>
            </div>
          </template>
          <template v-else>
            <!-- Last Month Revenue -->
            <div class="p-4 rounded-xl border flex flex-col">
              <kpiCards
                title="Last Month Revenue"
                :value="`₱${Number(
                  forecast?.summary?.last_month_actual ?? 0
                ).toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`"
                color="gray"
              />
              <p class="text-xs text-gray-400 mt-1">
                Actual recorded revenue from the previous month
              </p>
            </div>

            <!-- Next Month Forecast -->
            <div class="p-4 rounded-xl border flex flex-col">
              <kpiCards
                title="Next Month Forecast"
                :value="`₱${Number(
                  forecast?.summary?.next_month_forecast ?? 0
                ).toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`"
                color="blue"
              />
              <p class="text-xs text-gray-400 mt-1">
                Projected revenue based on SARIMA + ML forecast model
              </p>
            </div>

            <!-- Forecast Confidence -->
            <div
              class="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col"
            >
              <p class="text-sm text-gray-500 font-medium">Forecast Confidence</p>
              <p class="text-2xl font-bold mt-2">
                {{ forecast?.forecast_confidence?.level ?? "N/A" }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{
                  forecast?.forecast_confidence?.reason ??
                  "Confidence level based on historical model accuracy."
                }}
              </p>
            </div>
          </template>
        </div>

        <!-- CHART MODE TOGGLE -->
        <div v-if="forecastType === 'daily'" class="flex gap-2 mb-4 justify-center">
          <div class="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <button
              @click="
                chartMode = 'historical-hybrid';
                renderChart();
              "
              class="px-4 py-3 text-sm rounded-lg transition-all duration-200"
              :class="{
                'bg-blue-600 text-white shadow-md': chartMode === 'historical-hybrid',
                'text-gray-600 hover:bg-gray-200': chartMode !== 'historical-hybrid',
              }"
            >
              Historical Revenue and Forecast Revenue
            </button>
            <button
              @click="
                chartMode = 'sarima-hybrid';
                renderChart();
              "
              class="px-4 py-3 text-sm rounded-lg transition-all duration-200"
              :class="{
                'bg-blue-600 text-white shadow-md': chartMode === 'sarima-hybrid',
                'text-gray-600 hover:bg-gray-200': chartMode !== 'sarima-hybrid',
              }"
            >
              SARIMA Forecast and Hybrid Forecast
            </button>
          </div>
        </div>

        <!-- CHART CONTAINER -->
        <div class="bg-white p-4 rounded-xl border">
          <canvas v-if="hasChartData" ref="revenueChart" height="70"></canvas>
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

        <!-- INTERPRETATION SECTION -->
        <div class="bg-white p-6 rounded-2xl shadow-md border space-y-6">
          <h3 class="font-semibold text-xl">Forecast Interpretation</h3>

          <template v-if="forecastType === 'daily'">
            <div
              v-if="forecast"
              class="bg-white p-6 rounded-2xl shadow-md border space-y-6"
            >
              <p class="text-gray-600 text-sm leading-relaxed">
                This analysis uses a <b>{{ forecast?.model ?? "..." }}</b> model with
                <b>{{ forecast?.seasonality ?? "..." }} seasonality</b> to forecast daily
                clinic revenue.
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
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
                      'text-red-600 font-semibold': forecast?.summary?.avg_sarima < 500,
                    }"
                  >
                    {{ classifyRevenue(forecast?.summary?.avg_sarima ?? 0) }}
                  </p>
                  <p class="text-gray-700 text-sm">
                    Avg SARIMA revenue: ₱{{ format(forecast?.summary?.avg_sarima ?? 0) }}
                  </p>
                </div>

                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
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
                      'text-red-600 font-semibold': forecast?.summary?.avg_hybrid < 500,
                    }"
                  >
                    {{ classifyRevenue(forecast?.summary?.avg_hybrid ?? 0) }}
                  </p>
                  <p class="text-gray-700 text-sm">
                    Avg Hybrid revenue: ₱{{ format(forecast?.summary?.avg_hybrid ?? 0) }}
                  </p>
                </div>
              </div>

              <div class="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 space-y-2">
                <p class="text-gray-700 text-sm">
                  <b>Hybrid vs SARIMA:</b>
                  <span
                    v-if="forecast?.summary?.avg_difference > 0"
                    class="text-green-600 font-semibold"
                    >Hybrid forecast higher</span
                  >
                  <span
                    v-else-if="forecast?.summary?.avg_difference < 0"
                    class="text-red-600 font-semibold"
                    >Hybrid forecast lower</span
                  >
                  <span v-else class="text-gray-600 font-semibold"
                    >Hybrid equals SARIMA</span
                  >
                </p>
                <p class="text-gray-600 text-sm">
                  <template v-if="forecast?.summary?.avg_difference > 0"
                    >Short-term revenue increase expected.</template
                  >
                  <template v-else-if="forecast?.summary?.avg_difference < 0"
                    >Short-term revenue slowdown expected.</template
                  >
                  <template v-else>Revenue expected to remain stable.</template>
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
                  <span class="text-blue-600 font-semibold"
                    >₱{{ format(forecast?.summary?.max_expected_revenue ?? 0) }}</span
                  >
                </p>
              </div>
            </div>
            <div v-else class="bg-white p-6 rounded-2xl shadow-md border text-gray-500">
              Loading forecast data…
            </div>
          </template>
        </div>

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
                <th class="p-2 border">Actual Data</th>
                <th class="p-2 border">Forecasted</th>
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
                    forecast?.summary.difference >= 0 ? 'text-green-600' : 'text-red-600'
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
  Legend
);

export default {
  name: "RevenueForecastingPage",
  components: { kpiCards },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]),
    hasChartData() {
      return this.forecast && this.forecast.forecast && this.forecast.forecast.length > 0;
    },
  },
  data() {
    return {
      forecast: null,
      chart: null,
      loading: false,
      loadingForecast: false,
      forecastType: "daily",
      chartMode: "historical-hybrid",
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
              ? `${process.env.VUE_APP_API_BASE_URL}/revenue/run-daily-forecast`
              : `${process.env.VUE_APP_API_BASE_URL}/revenue/run-monthly-forecast`;

          const res = await axios.post(url);
          if (!res.data || !res.data.forecast) {
            toast.error("⚠️ Failed to run forecast: No data returned.");
            this.forecast = null;
            return;
          }

          this.forecast = res.data;
          this.$nextTick(() => this.renderChart());
          toast.success(`✅ ${type === "daily" ? "Daily" : "Monthly"} forecast loaded`);
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
  methods: {
    formatProcedureDate(date) {
      if (!date) return "-";

      const d = new Date(date);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },
    classifyRevenue(value) {
      if (value >= 1000) return "High";
      if (value >= 500) return "Medium";
      return "Low";
    },
    format(value) {
      if (value === undefined || value === null) return "-";
      return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toISOString().slice(0, 10);
    },
    formatMonth(date) {
      if (!date) return "-";
      return new Date(date).toLocaleString("default", { year: "numeric", month: "long" });
    },

    renderChart() {
      if (!this.forecast) return;
      if (this.forecastType === "daily") {
        if (this.chartMode === "historical-hybrid") this.renderHistoricalHybridChart();
        else if (this.chartMode === "sarima-hybrid") this.renderSarimaHybridChart();
      } else this.renderMonthlyChart();
    },

    renderHistoricalHybridChart() {
      const ctx = this.$refs.revenueChart;
      if (!ctx || !this.forecast) return;

      const historical = this.forecast.historical || [];
      const forecast = this.forecast.forecast || [];

      // Labels: historical + forecast
      const labels = [
        ...historical.map((d) => this.formatDate(d.date)),
        ...forecast.map((d) => this.formatDate(d.date)),
      ];

      // Historical revenue: values for historical days, null for forecast days
      const historicalData = [
        ...historical.map((d) => d["Clinic Share"]),
        ...Array(forecast.length).fill(null),
      ];

      // Hybrid forecast: null for historical, forecast values for forecast days
      const hybridData = [
        ...Array(historical.length).fill(null),
        ...forecast.map((d) => d.hybrid_forecast),
      ];

      // Destroy previous chart
      if (this.chart) this.chart.destroy();

      // Create chart: Hybrid drawn on top
      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Historical Revenue",
              data: historicalData,
              borderColor: "#6B7280",
              borderWidth: 2,
              tension: 0.3,
              fill: false,
              pointRadius: 4,
              order: 1, // draw below hybrid
            },
            {
              label: "Hybrid Forecast",
              data: hybridData,
              borderColor: "#2563EB",
              borderWidth: 3,
              tension: 0.3,
              fill: false,
              borderDash: [4, 4],
              pointRadius: 4,
              order: 2, // draw on top
            },
          ],
        },
        options: this.baseChartOptions(),
      });
    },
    renderSarimaHybridChart() {
      const ctx = this.$refs.revenueChart;
      if (!ctx) return;

      const forecast = this.forecast.forecast || [];
      const labels = forecast.map((d) => this.formatDate(d.date));
      const sarimaData = forecast.map((d) => d.sarima_forecast);
      const hybridData = forecast.map((d) => d.hybrid_forecast);

      if (this.chart) this.chart.destroy();

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
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
              label: "SARIMA Forecast",
              data: sarimaData,
              borderColor: "#FACC15",
              borderDash: [6, 6],
              borderWidth: 3,
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
              pointRadius: (ctx) => (ctx.dataIndex === forecastData.length - 1 ? 8 : 0),
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
            if (!chart) return [];

            const patient = chart.patient || {};
            const dentist = chart.user_accounts;

            const patientName = `${patient.first_name ?? ""} ${
              patient.middle_name ?? ""
            } ${patient.last_name ?? ""}`.trim();

            const dentistName = dentist
              ? `${dentist.first_name ?? ""} ${dentist.last_name ?? ""}`.trim()
              : "";

            const procedureMap = {};

            (chart.teeth || []).forEach((tooth) => {
              const proc = tooth.priceProcedure;
              if (!proc) return;

              if (!procedureMap[proc.procedure_name]) {
                procedureMap[proc.procedure_name] = {
                  count: 0,
                  type: proc.procedure_type,
                };
              }

              procedureMap[proc.procedure_name].count++;
            });

            const totalPayment = Number(item.patient_payment || 0);

            return Object.entries(procedureMap).map(([name, data]) => {
              const procedureType = data.type || "Basic Procedure";

              const clinicShare =
                procedureType === "Basic Procedure"
                  ? totalPayment * 0.6
                  : totalPayment * 0.5;

              const dentistShare =
                procedureType === "Basic Procedure"
                  ? totalPayment * 0.4
                  : totalPayment * 0.5;

              return {
                "Procedure Date": this.formatProcedureDate(chart.procedure_date),
                "Patient Full Name": patientName,
                Dentist: dentistName,
                Procedure: `${name} - ${data.count}`,
                "Procedure Type": procedureType,
                "Patient Payment": totalPayment.toFixed(2),
                "Clinic Share": clinicShare.toFixed(2),
                "Dentist Share": dentistShare.toFixed(2),
              };
            });
          })
          .flat()
          .filter(Boolean);

        if (!rows.length) {
          toast.warning("⚠️ No valid revenue rows to export.");
          return;
        }

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
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (error) {
        console.error(error);
        toast.warning(" Failed to generate forecast: Data may be insufficient.");
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
