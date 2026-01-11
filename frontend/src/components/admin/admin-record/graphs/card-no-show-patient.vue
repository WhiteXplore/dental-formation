<template>
  <div class="p-2">
    <div class="bg-white rounded-2xl flex flex-col justify-between w-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm text-gray-500 mb-1">{{ summary.title }}</h2>
          <p :class="`text-3xl font-bold ${summary.color}`">
            {{ summary.value }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ summary.label }}:
            <span :class="summary.trendColor">{{ summary.trend }}</span>
          </p>
        </div>
        <div :class="`${summary.color} text-4xl`">
          <icon name="circle-round" />
        </div>
      </div>

      <div class="mt-4 w-full h-1.5 rounded-full" :class="summary.bgTrack">
        <div
          class="h-1.5 rounded-full"
          :class="summary.bgFill"
          :style="{ width: summary.fill + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useFetchDataStore } from "@/store/fetch-data-store";
import icon from "@/assets/icon.vue";
import axios from "axios";

export default {
  name: "NoShowSummaryCard",
  components: { icon },

  props: {
    filter: {
      type: Object,
      default: () => ({
        year: null,
        month: null,
      }),
    },
  },

  data() {
    return {
      user: null, // authenticated user
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),

    /* ✅ FILTERED APPOINTMENTS */
    filteredAppointments() {
      if (!this.user || !Array.isArray(this.appointments)) return [];

      const isPrivileged =
        this.user.role === "Admin" || this.user.role === "Receptionist";

      return this.appointments.filter((appt) => {
        // Admin & Receptionist see all
        if (!isPrivileged && appt.user_id !== this.user.sub) return false;

        if (!appt?.scheduled_date) return false;

        const date = new Date(appt.scheduled_date);
        if (isNaN(date.getTime())) return false;

        if (this.filter.year && date.getFullYear() !== Number(this.filter.year))
          return false;

        if (
          this.filter.month &&
          date.getMonth() + 1 !== Number(this.filter.month)
        )
          return false;

        return true;
      });
    },
    /* ✅ SUMMARY COMPUTATION */
    summary() {
      const count = this.filteredAppointments.filter(
        (a) => a.appointment_status === "No-Show"
      ).length;

      const goal = 50;
      const fill = Math.min((count / goal) * 100, 100);

      let bgTrack = "bg-purple-100";
      let bgFill = "bg-purple-500";
      let color = "text-purple-600";
      let trendColor = "text-purple-500";

      if (count < 5) {
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
        color = "text-red-600";
        trendColor = "text-red-500";
      } else if (count < 15) {
        bgTrack = "bg-yellow-100";
        bgFill = "bg-yellow-500";
        color = "text-yellow-600";
        trendColor = "text-yellow-500";
      } else {
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
        color = "text-red-600";
        trendColor = "text-red-500";
      }

      return {
        title: "No Show Patients",
        value: count.toLocaleString(),
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
      }
    },
  },

  async mounted() {
    await this.fetchUser();

    const store = useFetchDataStore();
    await store.fetchAppointments();
  },
};
</script>
