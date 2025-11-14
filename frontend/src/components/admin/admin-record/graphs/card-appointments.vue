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
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import icon from "@/assets/icon.vue";
export default {
  name: "AppointmentsCard",
  components: {
    icon,
  },
  data() {
    return {
      card: {
        title: "Total Appointments",
        value: "0", // Will be updated
        label: "Compared to last month",
        trend: " +4.5%",
        color: "text-blue-600",
        trendColor: "text-blue-500",
        icon: "📅",
        fill: 75,
        bgTrack: "bg-blue-100",
        bgFill: "bg-blue-500",
      },
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),
  },
  methods: {
    async loadAppointments() {
      const store = useFetchDataStore();
      await store.fetchAppointments();

      const totalAppointments = store.appointments.length;
      this.card.value = totalAppointments.toLocaleString(); // Adds comma formatting
    },
  },
  mounted() {
    this.loadAppointments();
  },
};
</script>

<style scoped></style>
