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
  components: { icon },

  data() {
    return {
      user: null, // authenticated user
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),

    walkInSummary() {
      // If user not loaded yet, return default
      if (!this.user) {
        return {
          title: "Walk-In Patients",
          value: "0",
          label: "This Month",
          trend: "0% goal",
          color: "text-gray-600",
          trendColor: "text-gray-500",
          icon: "🚶‍♂️",
          fill: 0,
          bgTrack: "bg-gray-100",
          bgFill: "bg-gray-500",
        };
      }

      const uniqueWalkInPatients = new Set();

      this.appointments.forEach((appointment) => {
        // Admin sees all Walk-In patients
        const isAdmin =
          this.user.role === "Admin" || this.user.role === "Receptionist";

        if (
          appointment.appointment_status === "Walk-In" &&
          (isAdmin || appointment.user_id === this.user.sub)
        ) {
          const patientId = appointment.patient?.patient_id;
          if (patientId) uniqueWalkInPatients.add(patientId);
        }
      });

      const total = uniqueWalkInPatients.size;
      const fill = Math.min((total / 500) * 100, 100); // 500 is the goal

      // Set colors based on total
      let bgTrack = "bg-blue-100";
      let bgFill = "bg-blue-500";
      let color = "text-blue-600";
      let trendColor = "text-blue-500";

      if (total < 1) {
        color = "text-red-600";
        trendColor = "text-red-500";
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
      } else if (total < 60) {
        color = "text-blue-600";
        trendColor = "text-blue-500";
        bgTrack = "bg-blue-100";
        bgFill = "bg-yelbluelow-500";
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
          { withCredentials: true }
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
