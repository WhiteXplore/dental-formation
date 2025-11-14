<template>
  <div
    v-if="showEditModal && selectedpatient"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white w-[45vw] h-[90vh] px-6 rounded-2xl p-6 relative flex flex-col space-y-4 animate-fadeIn"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b pb-4">
        <h2 class="text-2xl font-bold text-green-700">Patient Profile</h2>
      </div>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto pr-2 flex-1 space-y-4">
        <!-- General Info -->
        <section>
          <h3 class="text-lg font-semibold text-gray-700 mb-3">
            General Information
          </h3>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800"
          >
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Full Name</p>
              <p>
                {{ selectedpatient.last_name }},
                {{ selectedpatient.first_name }}
                {{ selectedpatient.middle_name || "" }}
              </p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Gender</p>
              <p>{{ selectedpatient.gender || "N/A" }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Birthdate</p>
              <p>{{ formatDate(selectedpatient.birthdate) }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Age</p>
              <p>{{ selectedpatient.age || "N/A" }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Status</p>
              <p>{{ selectedpatient.marital_status || "N/A" }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Occupation</p>
              <p>{{ selectedpatient.occupation || "N/A" }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Contact Number</p>
              <p>{{ selectedpatient.contact_number || "N/A" }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Religion</p>
              <p>{{ selectedpatient.religion || "N/A" }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Nationality</p>
              <p>{{ selectedpatient.nationality || "N/A" }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg">
              <p class="font-bold text-gray-600">Dental Insurance</p>
              <p>{{ selectedpatient.dental_insurance || "N/A" }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg md:col-span-2">
              <p class="font-bold text-gray-600">Address</p>
              <p>{{ selectedpatient.address || "N/A" }}</p>
            </div>
            <div class="bg-gray-50 border p-3 rounded-lg md:col-span-2">
              <p class="font-bold text-gray-600">Parent/Guardian</p>
              <p>{{ selectedpatient.parent_fullname || "N/A" }}</p>
            </div>
          </div>
        </section>

        <!-- History -->
        <section>
          <h3 class="text-lg font-semibold text-gray-700 mb-3">
            Medical & Dental History
          </h3>
          <div class="space-y-4 text-sm text-gray-800">
            <div>
              <p class="font-bold text-gray-600 mb-1">Medical History</p>
              <div class="bg-gray-100 px-3 py-4 rounded-lg whitespace-pre-wrap">
                {{ selectedpatient.medical_history || "N/A" }}
              </div>
            </div>
            <div>
              <p class="font-bold text-gray-600 mb-1">Dental History</p>
              <div class="bg-gray-100 px-3 py-4 rounded-lg whitespace-pre-wrap">
                {{ selectedpatient.dental_history || "N/A" }}
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Close Button -->
      <div class="tracking-wide flex justify-end gap-3 mt-4 text-sm">
        <button
          class="bg-red-600 p-3 px-3 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800"
          @click="closeModal"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import axios from "axios";
import { toast } from "vue3-toastify";

export default {
  name: "TablePatient",
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      showEditModal: false,
      selectedpatient: null,
      showDeleteModal: false,
      recordToDelete: null,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["patients"]),
    filteredData() {
      const query = this.searchQuery.toLowerCase();
      return this.patients.filter((item) =>
        `${item.first_name} ${item.middle_name} ${item.last_name}`
          .toLowerCase()
          .includes(query)
      );
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredData.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async loadPatient() {
      const store = useFetchDataStore();
      await store.fetchPatients();
    },
    toggleView(item) {
      this.selectedpatient = item;
      this.showEditModal = true;
    },
    closeModal() {
      this.selectedpatient = null;
      this.showEditModal = false;
    },
    formatDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString();
    },
    confirmDelete() {
      if (!this.recordToDelete?.patient_id) {
        toast.error("Invalid patient ID.");
        return;
      }

      axios
        .delete(
          `http://localhost:8000/patient/delete-id/${this.recordToDelete.patient_id}`
        )
        .then(() => {
          this.recordToDelete = null;
          this.showDeleteModal = false;
          const audio = new Audio(require("@/assets/delete.mp3"));
          audio.play();
          this.loadPatient();
          toast.success("Record deleted successfully");
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          toast.error("Failed to delete record.");
        });
    },
  },
  mounted() {
    this.loadPatient();
  },
};
</script>

<style scoped>
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
