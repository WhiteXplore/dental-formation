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
import icon from "@/assets/icon.vue";
export default {
  name: "NoShowSummaryCard",
  components: {
    icon,
  },
  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),
    summary() {
      const count = this.appointments.filter(
        (a) => a.appointment_status === "No-Show"
      ).length;
      const fill = Math.min((count / 200) * 100, 100);
      let bgTrack = "bg-purple-100",
        bgFill = "bg-purple-500",
        color = "text-purple-600",
        trendColor = "text-purple-500";
      if (count < 10) {
        bgTrack = "bg-red-100";
        bgFill = "bg-red-500";
        color = "text-red-600";
        trendColor = "text-red-500";
      } else if (count < 50) {
        bgTrack = "bg-yellow-100";
        bgFill = "bg-yellow-500";
        color = "text-yellow-600";
        trendColor = "text-yellow-500";
      }
      return {
        title: "No Show Patients",
        value: count.toLocaleString(),
        label: "This Month",
        trend: `${fill.toFixed(1)}% goal`,
        color,
        trendColor,
        icon: "❌",
        fill,
        bgTrack,
        bgFill,
      };
    },
  },
};
</script>
