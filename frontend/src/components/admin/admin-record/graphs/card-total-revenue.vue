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
import axios from "axios";
import icon from "@/assets/icon.vue";
export default {
  name: "TableDentalChart",
  components: {
    icon,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      isAdd: false,
      isTable: true,
      editGroup: null,
      isEdit: false,
      isViewMedication: false,
      selectedPrescriptionId: null,
      user: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    doctorRevenue() {
      if (!Array.isArray(this.medications)) return [];

      const doctorMap = new Map();

      this.medications.forEach((item) => {
        const dentalChart = item.dentalChart;
        const doctor = dentalChart?.user_accounts;
        const patient = dentalChart?.patient;
        const teeth = dentalChart?.teeth || [];
        // const prescribedMedications = item.prescribedMedications || [];

        if (!doctor || !patient) return;

        const doctorId = doctor.user_id;
        const patientId = patient.patient_id;

        const revenueFromTeeth = teeth.reduce((sum, tooth) => {
          const priceStr = tooth.priceProcedure?.price || "0";
          return sum + parseFloat(priceStr);
        }, 0);

        // const revenueFromMeds = prescribedMedications.reduce((sum, med) => {
        //   const unitPrice = parseFloat(med.inventory?.price_per_unit || "0");
        //   const pcs = med.pcs || 0;
        //   return sum + unitPrice * pcs;
        // }, 0);

        const totalRevenue = revenueFromTeeth;

        if (!doctorMap.has(doctorId)) {
          doctorMap.set(doctorId, {
            name: `${doctor.first_name} ${doctor.last_name}`,
            patients: new Set(),
            revenue: 0,
          });
        }

        const doctorEntry = doctorMap.get(doctorId);
        doctorEntry.patients.add(patientId);
        doctorEntry.revenue += totalRevenue;
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

      if (revenue < 3000) {
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
        color = "text-red-600";
        trendColor = "text-red-500";
      } else if (revenue < 7000) {
        bgTrack = "bg-yellow-100";
        bgFill = "bg-yellow-500";
        color = "text-yellow-600";
        trendColor = "text-yellow-500";
      }

      return {
        title: "Total Revenue",
        value: `₱${revenue.toLocaleString()}`,
        label: "This Month",
        trend: `${fill.toFixed(1)}% goal`,
        color,
        trendColor,
        icon: "💰",
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
          {
            withCredentials: true,
          }
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
