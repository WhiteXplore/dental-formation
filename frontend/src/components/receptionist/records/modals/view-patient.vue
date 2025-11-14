<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div
      class="bg-white w-[45vw] h-[90vh] rounded-2xl p-6 flex flex-col animate-fadeIn"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b pb-3 mb-4">
        <h2 class="text-2xl font-bold text-green-700">Patient Profile</h2>
      </div>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto flex-1 pr-2 space-y-6">
        <!-- General Info -->
        <section>
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            General Information
          </h3>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-gray-800"
          >
            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Full Name</p>
              <p>
                {{ patient.last_name }}, {{ patient.first_name }}
                {{ patient.middle_name }}
              </p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Gender</p>
              <p>{{ patient.gender }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Birthdate</p>
              <p>{{ formatDate(patient.birthdate) }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Age</p>
              <p>{{ patient.age }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Status</p>
              <p>{{ patient.marital_status || "N/A" }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Occupation</p>
              <p>{{ patient.occupation || "N/A" }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Contact Number</p>
              <p>{{ patient.contact_number || "N/A" }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Religion</p>
              <p>{{ patient.religion || "N/A" }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Nationality</p>
              <p>{{ patient.nationality || "N/A" }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg">
              <p class="font-bold text-gray-600 mb-1">Dental Insurance</p>
              <p>{{ patient.dental_insurance || "N/A" }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg md:col-span-2">
              <p class="font-bold text-gray-600 mb-1">Address</p>
              <p>{{ patient.address || "N/A" }}</p>
            </div>

            <div class="bg-gray-50 border p-4 rounded-lg md:col-span-2">
              <p class="font-bold text-gray-600 mb-1">Parent/Guardian</p>
              <p>{{ patient.parent_fullname || "N/A" }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          class="bg-red-600 py-2 px-4 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          class="bg-[#34699A] py-2 px-4 rounded-lg text-white hover:bg-white border hover:border-green-800 hover:text-green-800"
          @click="openEditModal"
        >
          Update
        </button>
      </div>
    </div>

    <!-- Edit Modal -->
    <EditPatient
      v-if="showEditModal"
      :patient="selectedPatient"
      @close="showEditModal = false"
      @refresh="handleRefresh"
    />
  </div>
</template>

<script>
import EditPatient from "./edit-patient.vue";

export default {
  name: "ViewPatient",
  components: {
    EditPatient,
  },
  props: {
    patient: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showEditModal: false,
      selectedPatient: null,
    };
  },
  methods: {
    formatDate(date) {
      if (!date) return "N/A";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    openEditModal() {
      this.selectedPatient = this.patient;
      this.showEditModal = true;
    },
    handleRefresh() {
      this.$emit("refresh");
      this.showEditModal = false;
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
/* You can add fadeIn animation class if needed */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}
</style>
