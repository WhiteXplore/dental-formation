<template>
  <div class="">
    <!-- Headers -->

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableViewAnalytics />
    </div>
  </div>
</template>

<script>
import tableViewAnalytics from "./tables/table-view-analytics.vue";
export default {
  name: "InvetoryPage",
  components: {
    tableViewAnalytics,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
