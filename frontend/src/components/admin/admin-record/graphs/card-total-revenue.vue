<template>
  <div class="p-2">
    <!-- Revenue Summary Card -->
    <div class="bg-white rounded-2xl flex flex-col justify-between w-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm text-gray-500 mb-1">
            {{ totalRevenueSummary.title }}
          </h2>
          <p :class="`text-3xl font-bold ${totalRevenueSummary.color}`">
            {{ totalRevenueSummary.value }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ totalRevenueSummary.label }}:
            <span :class="totalRevenueSummary.trendColor">{{
              totalRevenueSummary.trend
            }}</span>
          </p>
        </div>
        <div :class="`${totalRevenueSummary.color} text-4xl`">
          <icon :name="'credit-card'" />
        </div>
      </div>
      <div
        class="mt-4 w-full h-1.5 rounded-full"
        :class="totalRevenueSummary.bgTrack"
      >
        <div
          class="h-1.5 rounded-full"
          :class="totalRevenueSummary.bgFill"
          :style="{ width: totalRevenueSummary.fill + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import icon from "@/assets/icon.vue";

export default {
  name: "CardTotalRevenue",

  components: { icon },

  /* ✅ NEW FILTER PROP */
  props: {
    filter: {
      type: Object,
      default: () => ({
        year: null,
        month: null,
      }),
    },
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    /* ✅ FILTERED MEDICATIONS */
    filteredMedications() {
      if (!Array.isArray(this.medications)) return [];

      return this.medications.filter((item) => {
        const dateStr = item?.dentalChart?.procedure_date;
        if (!dateStr) return false;

        const date = new Date(dateStr);

        if (
          this.filter.year &&
          date.getFullYear() !== Number(this.filter.year)
        ) {
          return false;
        }

        if (
          this.filter.month &&
          date.getMonth() + 1 !== Number(this.filter.month)
        ) {
          return false;
        }

        return true;
      });
    },

    /* ✅ DOCTOR REVENUE (FILTERED) */
    doctorRevenue() {
      const doctorMap = new Map();

      this.filteredMedications.forEach((item) => {
        const chart = item.dentalChart;
        const doctor = chart?.user_accounts;
        const patient = chart?.patient;
        const teeth = chart?.teeth || [];

        if (!doctor || !patient) return;

        const revenueFromTeeth = teeth.reduce((sum, tooth) => {
          return sum + Number(tooth?.priceProcedure?.price || 0);
        }, 0);

        if (!doctorMap.has(doctor.user_id)) {
          doctorMap.set(doctor.user_id, {
            revenue: 0,
          });
        }

        doctorMap.get(doctor.user_id).revenue += revenueFromTeeth;
      });

      return Array.from(doctorMap.values());
    },

    /* ✅ TOTAL REVENUE SUMMARY */
    totalRevenueSummary() {
      const revenue = this.doctorRevenue.reduce((sum, d) => sum + d.revenue, 0);

      const goal = 100000;
      const fill = Math.min((revenue / goal) * 100, 100);

      let bgTrack = "bg-green-100";
      let bgFill = "bg-green-500";
      let color = "text-green-600";
      let trendColor = "text-green-500";

      if (revenue < 3000) {
        bgTrack = "bg-blue-100";
        bgFill = "bg-blue-500";
        color = "text-blue-600";
        trendColor = "text-blue-500";
      } else if (revenue < 7000) {
        bgTrack = "bg-yellow-100";
        bgFill = "bg-yellow-500";
        color = "text-yellow-600";
        trendColor = "text-yellow-500";
      }

      return {
        title: "Total Revenue",
        value: `₱${revenue.toLocaleString()}`,
        label:
          this.filter.month || this.filter.year
            ? "Filtered Period"
            : "All Time",
        trend: `${fill.toFixed(1)}% goal`,
        color,
        trendColor,
        fill,
        bgTrack,
        bgFill,
      };
    },
  },

  mounted() {
    const store = useFetchDataStore();
    store.fetchMedications();
  },
};
</script>
