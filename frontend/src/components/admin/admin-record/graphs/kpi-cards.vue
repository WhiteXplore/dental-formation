<template>
  <p class="text-sm text-gray-500">{{ title }}</p>
  <p class="text-2xl font-bold text-black mt-1">{{ formattedValue }}</p>
</template>

<script>
export default {
  name: "KpiCard",
  props: {
    title: { type: String, required: true },
    value: { type: [Number, String], default: "-" },
  },
  computed: {
    formattedValue() {
      if (this.value === null || this.value === undefined) return "-";
      if (typeof this.value === "number") {
        return Number(this.value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      return this.value;
    },
  },
};
</script>

<style scoped></style>
