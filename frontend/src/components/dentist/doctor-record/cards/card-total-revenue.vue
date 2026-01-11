<template>
  <div class="p-2">
    <!-- Revenue Summary Card -->
    <div class="rounded-2xl flex flex-col justify-between w-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm text-white mb-1">
            {{ totalRevenueSummary.title }}
          </h2>
          <p :class="`text-3xl font-bold ${totalRevenueSummary.color}`">
            {{ totalRevenueSummary.value }}
          </p>
          <p class="text-xs text-white mt-1">
            {{ totalRevenueSummary.label }}:
            <span :class="totalRevenueSummary.trendColor">
              {{ totalRevenueSummary.trend }}
            </span>
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
import axios from "axios";
import icon from "@/assets/icon.vue";

export default {
  name: "RevenueSummaryCard",
  components: { icon },

  props: {
    filter: {
      type: Object,
      default: () => ({ year: null, month: null }),
    },
  },

  data() {
    return {
      user: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    userMedications() {
      if (!Array.isArray(this.medications)) return [];

      // Admin sees all, dentist sees only theirs
      if (this.user?.role === "Admin") return this.medications;

      return this.medications.filter(
        (item) => item.dentalChart?.user_accounts?.user_id === this.user?.sub
      );
    },

    filteredMedications() {
      // Filter by month/year using dentalChart.procedure_date
      return this.userMedications.filter((item) => {
        const procedureDate = new Date(item.dentalChart?.procedure_date);
        if (!procedureDate) return false;

        const yearMatch = this.filter.year
          ? procedureDate.getFullYear() === +this.filter.year
          : true;
        const monthMatch = this.filter.month
          ? procedureDate.getMonth() + 1 === +this.filter.month
          : true;

        return yearMatch && monthMatch;
      });
    },

    doctorRevenue() {
      const doctorMap = new Map();

      this.filteredMedications.forEach((item) => {
        const dentalChart = item.dentalChart;
        const doctor = dentalChart?.user_accounts;
        const patient = dentalChart?.patient;

        if (!doctor || !patient) return;

        const doctorId = doctor.user_id;
        const patientId = patient.patient_id;

        const patientPayment = parseFloat(item.patient_payment || "0");
        let revenueFromPatient = 0;

        // Use the first tooth for procedure type
        const firstTooth = dentalChart?.teeth?.[0];
        const procedureType = firstTooth?.priceProcedure?.procedure_type;

        if (procedureType === "Basic Procedure")
          revenueFromPatient = patientPayment * 0.4;
        else if (procedureType === "Special Case")
          revenueFromPatient = patientPayment * 0.5;

        if (!doctorMap.has(doctorId)) {
          doctorMap.set(doctorId, {
            name: `${doctor.first_name} ${doctor.last_name}`,
            patients: new Set(),
            revenue: 0,
          });
        }

        const doctorEntry = doctorMap.get(doctorId);
        doctorEntry.patients.add(patientId);
        doctorEntry.revenue += revenueFromPatient;
      });

      return Array.from(doctorMap.values()).map((doc) => ({
        name: doc.name,
        patients: doc.patients.size,
        revenue: doc.revenue,
      }));
    },

    totalRevenueSummary() {
      const revenue = this.doctorRevenue.reduce(
        (sum, doc) => sum + doc.revenue,
        0
      );
      const fill = Math.min((revenue / 100000) * 100, 100);

      let bgTrack = "bg-yellow-100";
      let bgFill = "bg-yellow-500";
      let color = "text-yellow-600";
      let trendColor = "text-yellow-500";

      if (revenue) {
        bgTrack = "bg-white";
        bgFill = "bg-yellow-400";
        color = "text-white";
        trendColor = "text-yellow-500";
      }

      return {
        title:
          this.user?.role === "Admin"
            ? "Total Clinic Revenue"
            : "Your Total Revenue",
        value: `₱${revenue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        label: "This Month",
        trend: `${fill.toFixed(1)}% goal`,
        color,
        trendColor,
        fill,
        bgTrack,
        bgFill,
      };
    },
  },

  methods: {
    async loadMedications() {
      const store = useFetchDataStore();
      await store.fetchMedications();
    },

    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          { withCredentials: true }
        );
        this.user = response.data;
      } catch (error) {
        console.error("User fetch failed:", error);
        this.$router.push("/");
      }
    },
  },

  async mounted() {
    await this.fetchUser();
    await this.loadMedications();
  },
};
</script>
