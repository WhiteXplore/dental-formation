<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div
      class="rounded-[15px] shadow-lg animate-fadeInUp w-full max-w-lg bg-white p-4 flex flex-col"
    >
      <!-- Header: Title + Close Button -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">
          {{ currentStep === 1 ? "Add Dental Chart" : "Add Prescription" }}
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700"
          @click="$emit('close')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 mb-4">
        <div v-if="currentStep === 1">
          <add-dental-chart />
        </div>
        <div v-else-if="currentStep === 2">
          <add-prescription />
        </div>
      </div>

      <!-- Footer: Navigation Buttons -->
      <div class="flex justify-end gap-2">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
        >
          Back
        </button>

        <button
          v-if="currentStep < 2"
          @click="nextStep"
          class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
        </button>

        <button
          v-if="currentStep === 2"
          @click="$emit('close')"
          class="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
        >
          Finish
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AddDentalChart from "./add-dental-chart.vue";
import AddPrescription from "@/components/dentist/doctor-record/modals/add-prescription.vue";

export default {
  name: "AddCentralPage",
  components: { AddDentalChart, AddPrescription },
  data() {
    return {
      currentStep: 1,
    };
  },
  methods: {
    nextStep() {
      if (this.currentStep < 2) this.currentStep++;
    },
    prevStep() {
      if (this.currentStep > 1) this.currentStep--;
    },
  },
};
</script>

<style>
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeInUp {
  animation: fadeInUp 0.3s ease forwards;
}
</style>
