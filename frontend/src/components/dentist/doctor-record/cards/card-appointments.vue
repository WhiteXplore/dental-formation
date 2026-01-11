<template>
  <div>
    <!-- Appointments Card -->
    <div class="bg-white rounded-2xl flex flex-col justify-between p-2 w-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm text-gray-500 mb-1">{{ card.title }}</h2>
          <p :class="`text-3xl font-bold ${card.color}`">{{ card.value }}</p>
          <p class="text-xs text-gray-400 mt-1">
            {{ card.label }}:
            <span :class="card.trendColor">{{ card.trend }}</span>
          </p>
        </div>
        <div :class="`${card.color} text-4xl`">
          <icon :name="'calendar2'" />
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
import { mapState } from "pinia";
import { useFetchDataStore } from "@/store/fetch-data-store";
import axios from "axios";
import dayjs from "dayjs";
import icon from "@/assets/icon.vue";

export default {
  name: "AppointmentsCard",
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
      card: {
        title: "Total Appointments",
        value: "0",
        label: "Compared to last month",
        trend: "0%",
        color: "text-blue-600",
        trendColor: "text-blue-500",
        fill: 0,
        bgTrack: "bg-blue-100",
        bgFill: "bg-blue-500",
      },
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),

    filteredAppointments() {
      if (!this.user || !Array.isArray(this.appointments)) return [];

      return this.appointments.filter((appt) => {
        if (appt.user_id !== this.user.sub) return false;
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

    previousMonthAppointments() {
      if (!this.user || !Array.isArray(this.appointments)) return [];

      return this.appointments.filter((appt) => {
        if (appt.user_id !== this.user.sub) return false;
        const date = appt.scheduled_date;
        if (!date) return false;

        const prevMonth = this.filter.month
          ? +this.filter.month - 1
          : dayjs().month(); // if no month filter, use current month
        const year = this.filter.year || dayjs().year();

        const apptMonth = dayjs(date).month() + 1;
        const apptYear = dayjs(date).year();

        return apptMonth === prevMonth && apptYear === year;
      });
    },
  },

  watch: {
    filter: {
      handler() {
        this.updateCard();
      },
      deep: true,
    },
    filteredAppointments: {
      handler() {
        this.updateCard();
      },
      deep: true,
    },
  },

  methods: {
    async fetchUser() {
      try {
        const res = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          { withCredentials: true }
        );
        this.user = res.data;

        const store = useFetchDataStore();
        await store.fetchAppointments();
        this.updateCard();
      } catch (err) {
        console.error("Failed to fetch user:", err);
        this.$router.push("/");
      }
    },

    updateCard() {
      const current = this.filteredAppointments.length;
      const previous = this.previousMonthAppointments.length;

      // Update value
      this.card.value = current.toLocaleString();

      // Update trend
      let trend = 0;
      if (previous > 0) {
        trend = ((current - previous) / previous) * 100;
      } else if (current > 0) {
        trend = 100; // first appointment of the year
      }

      this.card.trend = (trend >= 0 ? "+" : "") + trend.toFixed(1) + "%";

      // Update trend color based on trend
      this.card.trendColor = trend >= 0 ? "text-green-500" : "text-red-500";

      // Default colors
      let bgTrack = "bg-blue-100";
      let bgFill = "bg-blue-500";
      let color = "text-blue-600";
      let trendColor = this.card.trendColor;

      // Conditional styling based on total appointments
      if (current < 1) {
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
        color = "text-red-600";
        trendColor = "text-red-500";
      } else if (current < 100) {
        bgTrack = "bg-blue-100";
        bgFill = "bg-blue-500";
        color = "text-blue-600";
        trendColor = "text-blue-500";
      } else {
        bgTrack = "bg-green-100";
        bgFill = "bg-green-500";
        color = "text-green-600";
        trendColor = "text-green-500";
      }

      // Update fill based on max monthly appointments in this year
      let maxAppointments = 0;
      this.appointments.forEach((appt) => {
        if (appt.user_id !== this.user.sub) return;
        const year = dayjs(appt.scheduled_date).year();
        if (year === (this.filter.year || dayjs().year())) {
          maxAppointments++;
        }
      });

      const fill =
        maxAppointments > 0
          ? Math.min((current / maxAppointments) * 100, 100)
          : 0;

      // Apply computed styles
      this.card.fill = fill;
      this.card.color = color;
      this.card.bgFill = bgFill;
      this.card.bgTrack = bgTrack;
      this.card.trendColor = trendColor;
    },
  },

  async mounted() {
    await this.fetchUser();
  },
};
</script>

<style scoped></style>
