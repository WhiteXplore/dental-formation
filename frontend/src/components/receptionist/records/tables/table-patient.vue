<template>
  <div v-if="isTable" class=" ">
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">
        Pages / Patient List
      </div>

      <div
        @click="toggleAdd"
        class="flex items-center gap-2 px-4 py-2 border text-green-600 border-green-600 rounded-xl over:bg-green-700 hover:shadow-lg cursor-pointer transition duration-200"
      >
        <div
          class="p-1 bg-[#34699A] bg-opacity-20 rounded-full flex items-center justify-center"
        >
          <icon :name="'add-account1.1'" class="w-4 h-4" />
        </div>
        <span class="font-medium text-sm">Add Patient</span>
      </div>
    </div>

    <div class="text-[14px] bg-white rounded-xl">
      <div class="mt-4 overflow-x-auto border p-2 rounded-xl">
        <!-- Top controls -->
        <div class="text-gray-700 flex justify-between items-start mt-1">
          <!-- Items Per Page -->
          <div class="flex items-center">
            <select
              v-model="itemsPerPage"
              class="px-1 py-1 border rounded-md"
              @change="changePage(1)"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
            <span class="ml-2">Per page</span>
          </div>

          <!-- Search -->
          <div class="flex items-center">
            <input
              v-model="searchQuery"
              type="text"
              class="px-3 w-[300px] py-2 border rounded-md"
              placeholder="Search..."
              @input="changePage(1)"
            />
          </div>
        </div>

        <!-- Table -->
        <div class="w-full mt-3 rounded-xl shadow overflow-hidden">
          <div
            class="overflow-y-auto transition-all duration-300"
            :class="tableHeightClass"
          >
            <table
              class="min-w-full table-auto border-separate border-spacing-y-2 text-sm text-gray-700"
            >
              <thead
                class="bg-[#34699A] text-white sticky top-0 z-10 tracking-wide"
              >
                <tr>
                  <th
                    class="w-10 px-4 py-2 text-left rounded-tl-lg font-normal"
                  >
                    No.
                  </th>
                  <th class="px-4 py-3 text-left font-normal">Patient</th>
                  <th class="px-4 py-3 text-center font-normal w-[50%]">
                    Status
                  </th>
                  <th class="px-4 py-3 text-left rounded-tr-lg font-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(patient_data, index) in paginatedData"
                  :key="patient_data.patient_id"
                  class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
                >
                  <td class="px-4 py-2 text-left">{{ startIndex + index }}</td>

                  <td class="px-4 py-2 text-left">
                    {{ patient_data.last_name }}, {{ patient_data.first_name }}
                    {{ patient_data.middle_name }}
                  </td>
                  <td class="px-4 py-3 flex justify-center">
                    <div
                      v-if="getPaymentStatus(patient_data) === 'Discharged'"
                      class="text-green-600 font-medium flex gap-1"
                    >
                      <icon name="check" class="w-5 h-5 flex items-center" />
                      <span>Discharged</span>
                    </div>
                    <div v-else class="text-yellow-600 font-medium">
                      Ongoing
                    </div>
                  </td>

                  <td class="px-4 py-2 text-left">
                    <div class="flex gap-2">
                      <!-- View -->
                      <!-- <button
                        class="px-3 py-1 h-8 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                        @click="toggleView(patient_data)"
                      >
                        <icon name="eye" /> View
                      </button> -->

                      <!-- History -->
                      <button
                        class="px-3 py-1 h-8 border border-blue-300 hover:bg-blue-200 text-blue-800 rounded-lg flex items-center gap-1"
                        @click="viewHistory(patient_data.patient_id)"
                      >
                        <icon name="eye" /> View
                      </button>
                      <!-- Edit -->
                      <button
                        class="px-3 py-1 h-8 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                        @click="toggleEdit(patient_data)"
                      >
                        <icon name="edit" /> Edit
                      </button>

                      <!-- Delete -->
                      <button
                        class="px-3 py-1 h-8 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                        @click="toggleDelete(patient_data)"
                      >
                        <icon name="delete" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedData.length === 0">
                  <td colspan="5" class="text-center py-8 text-gray-400">
                    No records found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-gray-700">
            <span>
              Showing {{ startIndex }} to {{ endIndex }} of
              {{ filteredData.length }} entries
            </span>
          </div>
          <div class="flex items-center">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 bg-gray-300 text-gray-700 rounded-l-md hover:bg-gray-400"
            >
              &lt;
            </button>
            <span v-for="page in pageNumbers" :key="'page-' + page">
              <button
                @click="changePage(page)"
                :class="{
                  ' bg-[#34699A] text-white': currentPage === page,
                  'bg-gray-200 text-gray-700': currentPage !== page,
                }"
                class="px-3 py-1 mx-1 rounded-md hover:bg-green-300"
              >
                {{ page }}
              </button>
            </span>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 bg-gray-300 text-gray-700 rounded-r-md hover:bg-gray-400"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <addPatient
    v-if="isAdd"
    :patient="selectedpatient"
    @close="closePatientModal"
    @refresh="loadPatient"
  />

  <viewPatient
    v-if="showEditModal && selectedpatient"
    :patient="selectedpatient"
    @close="closeModal"
    @refresh="loadPatient"
  />

  <viewDentalHistory
    v-if="isViewHistory"
    :patientId="selectedPatientId"
    @close="isViewHistory = false"
    @refresh="loadPatient"
  />

  <!-- Delete Confirmation Modal -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50 w-min-screen"
  ></div>
  <div
    v-if="showDeleteModal"
    class="rounded-xl shadow-lg w-[300px] md:w-[400px] bg-white py-6 px-4 flex flex-col items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
  >
    <div
      class="rounded-full w-16 h-16 md:w-20 md:h-20 flex justify-center items-center bg-red-300 animate-pulse"
    >
      <icon
        name="question"
        class="w-8 h-8 md:w-10 md:h-10 text-white flex justify-center items-center"
      />
    </div>

    <h1 class="text-[14px] md:text-[16px] font-semibold mt-4">
      Delete Confirmation
    </h1>
    <p class="mt-2 text-[12px] md:text-[13px] text-center px-8">
      Are you sure you want to delete this record? This action cannot be undone.
    </p>

    <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>

    <div class="tracking-wide flex gap-2 mt-4">
      <button
        class="bg-red-400 p-2 px-3 text-[11px] md:text-[13px] rounded-md text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
        @click="showDeleteModal = false"
      >
        No, Cancel
      </button>
      <button
        class="bg-green-400 p-2 px-3 text-[11px] md:text-[13px] rounded-md text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
        @click="confirmDelete"
      >
        Yes, Delete
      </button>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import addPatient from "../modals/add-patient.vue";
import viewPatient from "../modals/view-patient.vue";
import viewDentalHistory from "../modals/view-dental-history.vue";
import { toast } from "vue3-toastify";
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import axios from "axios";

export default {
  name: "TablePatient",

  components: {
    icon,
    addPatient,
    viewPatient,
    viewDentalHistory,
  },

  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",

      isAdd: false,
      isTable: true,
      isUploadData: false,

      showDeleteModal: false,
      recordToDelete: null,

      selectedpatient: null,
      showEditModal: false,

      isViewHistory: false,
      selectedPatientId: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["patients"]),

    filteredData() {
      const query = this.searchQuery.toLowerCase();
      return this.patients.filter((item) =>
        `${item.first_name} ${item.middle_name} ${item.last_name}`
          .toLowerCase()
          .includes(query),
      );
    },

    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
    },

    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredData.slice(start, start + this.itemsPerPage);
    },

    startIndex() {
      return this.filteredData.length === 0
        ? 0
        : (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    endIndex() {
      const end = this.currentPage * this.itemsPerPage;
      return end > this.filteredData.length ? this.filteredData.length : end;
    },

    pageNumbers() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    },

    tableHeightClass() {
      return this.paginatedData.length <= 10 ? "h-auto" : "h-[65vh]";
    },
  },

  methods: {
    /* ===============================
       LOAD DATA
    =============================== */
    async loadPatient() {
      const store = useFetchDataStore();
      await store.fetchPatients();
    },

    async loadMedications() {
      const store = useFetchDataStore();
      await store.fetchMedications();
    },

    /* ===============================
       STATUS (AUTO DISCHARGE BASED ON PAYMENT)
    =============================== */
    getPaymentStatus(patient) {
      const store = useFetchDataStore();

      const prescription = store.medications
        .filter((med) => med.dentalChart?.patient_id === patient.patient_id)
        .sort((a, b) => new Date(b.issued_date) - new Date(a.issued_date))[0];

      // No prescription at all → Ongoing
      if (!prescription) return "Ongoing";

      const status = prescription.payment_status;

      // If null, undefined, or empty string → Ongoing
      if (!status || status.trim() === "") {
        return "Ongoing";
      }

      // If explicitly Paid → Discharged
      if (status === "Paid") {
        return "Discharged";
      }

      // Any other value → Ongoing
      return "Ongoing";
    },
    /* ===============================
       UI ACTIONS
    =============================== */
    toggleAdd() {
      this.selectedpatient = null;
      this.isAdd = true;
    },

    toggleEdit(item) {
      this.selectedpatient = item;
      this.isAdd = true; // reuse modal
    },

    toggleView(item) {
      this.selectedpatient = item;
      this.showEditModal = true;
    },

    viewHistory(patientId) {
      this.selectedPatientId = patientId;
      this.isViewHistory = true;
    },

    closePatientModal() {
      this.isAdd = false;
      this.selectedpatient = null;
    },

    closeModal() {
      this.showEditModal = false;
      this.selectedpatient = null;
    },

    /* ===============================
       DELETE
    =============================== */
    toggleDelete(item) {
      this.recordToDelete = item;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      if (!this.recordToDelete || isNaN(this.recordToDelete.patient_id)) {
        toast.error("Invalid patient ID.");
        return;
      }

      const patientId = this.recordToDelete.patient_id;

      try {
        await axios.delete(
          process.env.VUE_APP_API_BASE_URL + `/patient/delete-id/${patientId}`,
        );

        this.recordToDelete = null;
        this.showDeleteModal = false;

        const audio = new Audio(require("@/assets/delete.mp3"));
        audio.play();

        await this.loadPatient();
        toast.success("Patient deleted successfully");
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Failed to delete record.");
      }
    },

    /* ===============================
       PAGINATION
    =============================== */
    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },
  },

  async mounted() {
    await this.loadPatient();
    await this.loadMedications();
  },
};
</script>
