<template>
  <div class="p-2">
    <!-- Walk-In Patients Card -->
    <div class="bg-white rounded-2xl flex flex-col justify-between w-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm text-gray-500 mb-1">
            {{ walkInSummary.title }}
          </h2>
          <p :class="`text-3xl font-bold ${walkInSummary.color}`">
            {{ walkInSummary.value }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ walkInSummary.label }}:
            <span :class="walkInSummary.trendColor">
              {{ walkInSummary.trend }}
            </span>
          </p>
        </div>
        <div :class="`${walkInSummary.color} text-4xl`">
          <icon :name="'users3'" />
        </div>
      </div>
      <div
        class="mt-4 w-full h-1.5 rounded-full"
        :class="walkInSummary.bgTrack"
      >
        <div
          class="h-1.5 rounded-full"
          :class="walkInSummary.bgFill"
          :style="{ width: walkInSummary.fill + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFetchDataStore } from "@/store/fetch-data-store";
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
      user: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),

    walkInSummary() {
      const uniqueWalkInPatients = new Set();

      this.appointments.forEach((appointment) => {
        if (appointment.appointment_status === "Walk-In") {
          const patientId = appointment.patient?.patient_id;
          if (patientId) uniqueWalkInPatients.add(patientId);
        }
      });

      const total = uniqueWalkInPatients.size;
      const fill = Math.min((total / 500) * 100, 100); // 500 is the goal

      let bgTrack = "bg-blue-100";
      let bgFill = "bg-blue-500";
      let color = "text-blue-600";
      let trendColor = "text-blue-500";

      if (total < 30) {
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
        color = "text-red-600";
        trendColor = "text-red-500";
      } else if (total < 80) {
        bgTrack = "bg-yellow-100";
        bgFill = "bg-yellow-500";
        color = "text-yellow-600";
        trendColor = "text-yellow-500";
      }

      return {
        title: "Walk-In Patients",
        value: total.toLocaleString(),
        label: "This Month",
        trend: `${fill.toFixed(1)}% goal`,
        color,
        trendColor,
        icon: "🚶‍♂️",
        fill,
        bgTrack,
        bgFill,
      };
    },
  },

  methods: {
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

    async loadAppointments() {
      const store = useFetchDataStore();
      await store.fetchAppointments();
    },
  },

  async mounted() {
    await this.fetchUser();
    await this.loadAppointments();
  },
};
</script>
