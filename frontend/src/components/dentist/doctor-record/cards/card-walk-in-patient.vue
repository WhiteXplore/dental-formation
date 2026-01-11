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
import dayjs from "dayjs";

export default {
  name: "WalkInPatientsCard",
  components: { icon },

  props: {
    filter: {
      type: Object,
      default: () => ({ year: null, month: null }),
    },
  },

  data() {
    return {
      user: null, // authenticated user
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),

    // Filter appointments based on user and month/year
    userAppointments() {
      if (!this.user || !Array.isArray(this.appointments)) return [];

      return this.appointments.filter((appt) => {
        // Admin sees all
        if (this.user.role !== "Admin" && appt.user_id !== this.user.sub)
          return false;

        const date = appt.scheduled_date;
        if (!date) return false;

        const yearMatch = this.filter.year
          ? dayjs(date).year() === +this.filter.year
          : true;
        const monthMatch = this.filter.month
          ? dayjs(date).month() + 1 === +this.filter.month
          : true;

        return yearMatch && monthMatch;
      });
    },

    walkInSummary() {
      const uniqueWalkInPatients = new Set();

      this.userAppointments.forEach((appointment) => {
        if (appointment.appointment_status === "Walk-In") {
          const patientId = appointment.patient?.patient_id;
          if (patientId) uniqueWalkInPatients.add(patientId);
        }
      });

      const total = uniqueWalkInPatients.size;
      const fill = Math.min((total / 500) * 100, 100);

      let bgTrack = "bg-blue-100";
      let bgFill = "bg-blue-500";
      let color = "text-blue-600";
      let trendColor = "text-blue-500";

      if (total < 1) {
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
        color = "text-red-600";
        trendColor = "text-red-500";
      } else if (total < 80) {
        bgTrack = "bg-blue-100";
        bgFill = "bg-blue-500";
        color = "text-blue-600";
        trendColor = "text-blue-500";
      }

      return {
        title: "Walk-In Patients",
        value: total.toLocaleString(),
        label:
          this.filter.month && this.filter.year
            ? `${dayjs()
                .month(this.filter.month - 1)
                .format("MMMM")} ${this.filter.year}`
            : "This Month",
        trend: `${fill.toFixed(1)}% goal`,
        color,
        trendColor,
        fill,
        bgTrack,
        bgFill,
      };
    },
  },

  watch: {
    filter: {
      handler() {
        // triggers recomputation whenever filter changes
      },
      deep: true,
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
