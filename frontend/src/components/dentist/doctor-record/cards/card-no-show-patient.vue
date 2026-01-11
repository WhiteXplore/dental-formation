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
          <icon :name="'circle-round'" />
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
import axios from "axios";
import icon from "@/assets/icon.vue";
import dayjs from "dayjs";

export default {
  name: "NoShowSummaryCard",
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

    // Filtered appointments based on user and month/year
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

    summary() {
      const count = this.userAppointments.filter(
        (a) => a.appointment_status === "No-Show"
      ).length;

      const fill = Math.min((count / 200) * 100, 100);

      let bgTrack = "bg-purple-100",
        bgFill = "bg-purple-500",
        color = "text-purple-600",
        trendColor = "text-purple-500";

      if (count < 1) {
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
        color = "text-red-600";
        trendColor = "text-red-500";
      } else if (count < 80) {
        bgTrack = "bg-blue-100";
        bgFill = "bg-blue-500";
        color = "text-blue-600";
        trendColor = "text-blue-500";
      }

      return {
        title: "No Show Patients",
        value: count.toLocaleString(),
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
        // recompute summary whenever filter changes
      },
      deep: true,
    },
  },

  async mounted() {
    try {
      const res = await axios.get(
        process.env.VUE_APP_API_BASE_URL + "/auth/me",
        { withCredentials: true }
      );
      this.user = res.data;
    } catch (err) {
      console.error("Auth error:", err);
      this.$router.push("/");
    }
  },
};
</script>
