<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="bg-white w-full mx-auto">
      <!-- Header -->
      <div class="text-sm flex justify-between">
        <div class="text-[13px] text-text mt-4 font-regular">
          Pages / Price Procedure
        </div>

        <button
          @click="fetchPrescriptions"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      <!-- Table Controls -->
      <div v-if="loading" class="text-center text-gray-500 py-10">
        Loading prescriptions...
      </div>

      <div
        v-else-if="groupedPrescriptions.length === 0"
        class="text-center text-gray-500 py-10"
      >
        No prescription records found.
      </div>

      <div v-else class="text-[14px] bg-white rounded-xl">
        <div class="mt-4 overflow-x-auto border p-2 rounded-xl">
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
                placeholder="Search patient or dentist..."
                @input="changePage(1)"
              />
            </div>
          </div>

          <!-- Table -->
          <div class="w-full mt-3 rounded-xl shadow overflow-hidden">
            <div class="overflow-y-auto transition-all duration-300">
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
                      Transaction ID
                    </th>
                    <th class="px-4 py-3 text-left font-normal">
                      Patient Name
                    </th>
                    <th class="px-4 py-3 text-left font-normal">Dentist</th>
                    <th class="px-4 py-3 text-left font-normal">Issued Date</th>
                    <th class="px-4 py-3 text-left rounded-tr-lg font-normal">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(group, index) in paginatedData"
                    :key="index"
                    class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
                  >
                    <td class="px-4 py-2">{{ group.prescription_id }}</td>

                    <td class="px-4 py-2">
                      {{ group.patient.first_name }}
                      {{ group.patient.last_name }}
                    </td>

                    <td class="px-4 py-2">
                      {{ group.dentist.first_name }}
                      {{ group.dentist.last_name }}
                    </td>

                    <td class="px-4 py-2">
                      {{ formatDate(group.issued_date) }}
                    </td>

                    <td class="px-4 py-2">
                      <div class="flex justify-center">
                        <button
                          @click="openReport(group)"
                          class="px-3 py-1 h-8 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                        >
                          <icon name="eye" /> View
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="paginatedData.length === 0">
                    <td
                      colspan="5"
                      class="text-center py-8 text-gray-400 bg-white border border-gray-200 rounded-md shadow-sm"
                    >
                      No records found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Pagination -->
          <div class="flex justify-between items-center mt-4 px-2">
            <div class="text-gray-700">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of
              {{ filteredData.length }} entries
            </div>

            <div class="flex items-center">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 bg-gray-300 text-gray-700 rounded-l-md hover:bg-gray-400 disabled:opacity-50"
              >
                &lt;
              </button>

              <button
                v-for="page in pageNumbers"
                :key="page"
                @click="changePage(page)"
                :class="{
                  'bg-[#34699A] text-white': currentPage === page,
                  'bg-gray-200 text-gray-700': currentPage !== page,
                }"
                class="px-3 py-1 mx-1 rounded-md hover:bg-green-300"
              >
                {{ page }}
              </button>

              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 bg-gray-300 text-gray-700 rounded-r-md hover:bg-gray-400 disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative border border-gray-200 overflow-y-auto max-h-[90vh]"
        >
          <button
            @click="closeModal"
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
          >
            ✕
          </button>

          <div v-if="selectedReport">
            <!-- Header -->
            <div class="flex justify-between items-center border-b pb-4 mb-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-800">
                  Dental Prescription Report
                </h1>
                <p class="text-sm text-gray-500">
                  Issued on: {{ formatDate(selectedReport.issued_date) }}
                </p>
              </div>
              <span
                class="px-4 py-1 text-sm font-semibold rounded-full bg-red-500 text-white shadow-md"
              >
                OUT
              </span>
            </div>

            <!-- Patient and Dentist Info -->
            <div class="grid grid-cols-2 gap-6 mb-8">
              <div class="space-y-2">
                <h2 class="font-semibold text-gray-700 text-lg border-b pb-1">
                  Patient Information
                </h2>
                <p class="text-gray-600">
                  <strong>Name:</strong>
                  {{ selectedReport.dentalChart.patient.first_name }}
                  {{ selectedReport.dentalChart.patient.last_name }}
                </p>
                <p class="text-gray-600">
                  <strong>Gender:</strong>
                  {{ selectedReport.dentalChart.patient.gender }}
                </p>
                <p class="text-gray-600">
                  <strong>Age:</strong>
                  {{ selectedReport.dentalChart.patient.age }}
                </p>
                <p class="text-gray-600">
                  <strong>Address:</strong>
                  {{ selectedReport.dentalChart.patient.address }}
                </p>
              </div>
              <div class="space-y-2">
                <h2 class="font-semibold text-gray-700 text-lg border-b pb-1">
                  Dentist Information
                </h2>
                <p class="text-gray-600">
                  <strong>Name:</strong>
                  {{ selectedReport.dentalChart.user_accounts.first_name }}
                  {{ selectedReport.dentalChart.user_accounts.last_name }}
                </p>
                <p class="text-gray-600">
                  <strong>Position:</strong>
                  {{ selectedReport.dentalChart.user_accounts.position }}
                </p>
                <p class="text-gray-600">
                  <strong>Email:</strong>
                  {{ selectedReport.dentalChart.user_accounts.email }}
                </p>
                <p class="text-gray-600">
                  <strong>Status:</strong>
                  {{
                    selectedReport.dentalChart.user_accounts.doctor_availability
                  }}
                </p>
              </div>
            </div>

            <!-- Procedures -->
            <div class="mb-8">
              <h2
                class="font-semibold text-gray-700 text-lg border-b pb-1 mb-3"
              >
                Procedure Details
              </h2>
              <div class="overflow-x-auto">
                <table
                  class="min-w-full border-collapse border border-gray-200"
                >
                  <thead>
                    <tr class="bg-gray-100 text-left text-gray-700">
                      <th class="p-3 border border-gray-200">Tooth #</th>
                      <th class="p-3 border border-gray-200">Procedure</th>
                      <th class="p-3 border border-gray-200 text-right">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="tooth in selectedReport.dentalChart.teeth"
                      :key="tooth.tooth_id"
                      class="hover:bg-gray-50 transition"
                    >
                      <td class="p-3 border border-gray-200">
                        {{ tooth.tooth_number }}
                      </td>
                      <td class="p-3 border border-gray-200">
                        {{ tooth.priceProcedure.procedure_name }}
                      </td>
                      <td class="p-3 border border-gray-200 text-right">
                        ₱{{ formatCurrency(tooth.priceProcedure.price) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Medications -->
            <div class="mb-8">
              <h2
                class="font-semibold text-gray-700 text-lg border-b pb-1 mb-3"
              >
                Prescribed Medications
              </h2>
              <div class="overflow-x-auto">
                <table
                  class="min-w-full border-collapse border border-gray-200"
                >
                  <thead>
                    <tr class="bg-gray-100 text-left text-gray-700">
                      <th class="p-3 border border-gray-200">Medication</th>
                      <th class="p-3 border border-gray-200">Dosage</th>
                      <th class="p-3 border border-gray-200">Quantity</th>
                      <!-- <th class="p-3 border border-gray-200">Price/Unit</th>
                      <th class="p-3 border border-gray-200">Expiration</th> -->
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="med in selectedReport.prescribedMedications"
                      :key="med.prescribe_medication_id"
                      class="hover:bg-gray-50 transition"
                    >
                      <td class="p-3 border border-gray-200">
                        {{ med.inventory.name }}
                      </td>
                      <td class="p-3 border border-gray-200">
                        {{ med.inventory.dosage }}
                      </td>
                      <td class="p-3 border border-gray-200">
                        {{ med.pcs }} {{ med.inventory.unit }}
                      </td>
                      <!-- <td class="p-3 border border-gray-200">
                        ₱{{ formatCurrency(med.inventory.price_per_unit) }}
                      </td>
                      <td class="p-3 border border-gray-200">
                        {{ formatDate(med.inventory.expiration) }}
                      </td> -->
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Instructions -->
            <div>
              <h2
                class="font-semibold text-gray-700 text-lg border-b pb-1 mb-2"
              >
                Instruction
              </h2>
              <p
                class="text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                {{ selectedReport.instruction }}
              </p>
            </div>

            <div class="border-t pt-4 text-right text-gray-500 text-sm mt-6">
              <p>Generated by: ToothFormations System</p>
              <p>© 2025 Dental Clinic</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";

export default {
  data() {
    return {
      loading: false,
      showModal: false,
      selectedReport: null,
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]),
    groupedPrescriptions() {
      return this.medications.map((pres) => ({
        ...pres,
        patient: pres.dentalChart?.patient || {},
        dentist: pres.dentalChart?.user_accounts || {},
      }));
    },
    filteredData() {
      if (!this.searchQuery) return this.groupedPrescriptions;
      const q = this.searchQuery.toLowerCase();
      return this.groupedPrescriptions.filter(
        (g) =>
          g.patient.first_name?.toLowerCase().includes(q) ||
          g.patient.last_name?.toLowerCase().includes(q) ||
          g.dentist.first_name?.toLowerCase().includes(q) ||
          g.dentist.last_name?.toLowerCase().includes(q)
      );
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      return Math.min(
        this.startIndex + this.itemsPerPage,
        this.filteredData.length
      );
    },
    paginatedData() {
      return this.filteredData.slice(this.startIndex, this.endIndex);
    },
    pageNumbers() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    },
  },
  methods: {
    async fetchPrescriptions() {
      this.loading = true;
      const store = useFetchDataStore();
      await store.fetchMedications();
      this.loading = false;
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    },
    openReport(report) {
      this.selectedReport = report;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedReport = null;
    },
    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    formatCurrency(value) {
      if (!value) return "0.00";
      return parseFloat(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      });
    },
  },
  async mounted() {
    await this.fetchPrescriptions();
  },
};
</script>
