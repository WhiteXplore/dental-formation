<template>
  <div>
    <!-- Appointments Card -->
    <div class="bg-white rounded-2xl flex flex-col justify-between p-2 w-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm text-gray-500 mb-1">{{ card.title }}</h2>
          <p :class="`text-3xl font-bold ${card.color}`">
            {{ card.value }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ card.label }}:
            <span :class="card.trendColor">{{ card.trend }}</span>
          </p>
        </div>
        <div :class="`${card.color} text-4xl`">
          <icon name="calendar2" />
        </div>
      </div>

      <div class="mt-4 w-full h-1.5 rounded-full" :class="card.bgTrack">
        <div
          class="h-1.5 rounded-full"
          :class="card.bgFill"
          :style="{ width: card.fill + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";
import icon from "@/assets/icon.vue";
import axios from "axios";

export default {
  name: "AppointmentsCard",
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
      user: null,
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

    /* ✅ CARD COMPUTATION */
    card() {
      const total = this.filteredAppointments.length;
      const goal = 200;
      const fill = Math.min((total / goal) * 100, 100);

      let color = "text-blue-600";
      let trendColor = "text-blue-500";
      let bgTrack = "bg-blue-100";
      let bgFill = "bg-blue-500";

      if (total < 1) {
        color = "text-red-600";
        trendColor = "text-red-500";
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
      } else if (total < 60) {
        color = "text-blue-600";
        trendColor = "text-blue-500";
        bgTrack = "bg-blue-100";
        bgFill = "bg-blue-500";
      }

      return {
        title: "Total Appointments",
        value: total.toLocaleString(),
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
        const { data } = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/auth/me`,
          { withCredentials: true }
        );
        this.user = data;
      } catch (error) {
        console.error("User fetch failed:", error);
      }
    },
  },

  async mounted() {
    await this.fetchUser();
    await useFetchDataStore().fetchAppointments();
  },
};
</script>
