<template>
  <div class="px-2 mt-2">
    <!-- Headers -->
    <div class="flex justify-between items-start">
      <h1 class="font-semibold tracking-wide text-md">Dental Certificate</h1>
    </div>

    <!-- Main Content  -->
    <div class="mt-3">
      <!-- Table -->
      <tableCertificate />
    </div>
  </div>
</template>

<script>
import tableCertificate from "./tables/table-certificate.vue";
export default {
  name: "CertificatePage",
  components: {
    tableCertificate,
  },
};
</script>

<style scoped>
/* Add any required styles here */
</style>
