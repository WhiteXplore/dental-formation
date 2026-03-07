<template>
  <div>
    <!-- Header -->
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">
        Pages / Prescription List
      </div>

      <button
        @click="loadMedications"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Refresh
      </button>
    </div>

    <!-- Table Wrapper -->
    <div class="text-[14px] bg-white rounded-xl mt-4">
      <div class="overflow-x-auto border p-2 rounded-xl">
        <!-- Controls -->
        <div class="text-gray-700 flex justify-between items-start mt-1 mb-3">
          <div class="flex items-center">
            <select
              v-model.number="itemsPerPage"
              class="px-1 py-1 border rounded-md"
              @change="changePage(1)"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="20">20</option>
            </select>
            <span class="ml-2">Per page</span>
          </div>

          <input
            v-model="searchQuery"
            type="text"
            class="px-3 w-[300px] py-2 border rounded-md"
            placeholder="Search patient or dentist..."
            @input="changePage(1)"
          />
        </div>

        <!-- Table -->
        <table
          class="min-w-full table-auto border-separate border-spacing-y-2 text-sm text-gray-700"
        >
          <thead class="bg-[#34699A] text-white sticky top-0">
            <tr>
              <th class="px-4 py-3 text-left">No.</th>
              <th class="px-4 py-3 text-left">Patient</th>
              <th class="px-4 py-3 text-left">Dentist</th>
              <th class="px-4 py-3 text-left">Date Procedure</th>
              <th class="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(visit, index) in paginatedGroupedData"
              :key="visit.key"
              class="bg-white border rounded-md shadow-sm"
            >
              <td class="px-4 py-2">{{ startIndex + index }}</td>

              <td class="px-4 py-2">
                {{ fullName(visit.patient) }}
              </td>

              <td class="px-4 py-2">Dr. {{ fullName(visit.dentist) }}</td>

              <td class="px-4 py-2">
                {{ formatDate(visit.procedure_date) }}
              </td>

              <td class="px-4 py-2">
                <button
                  @click="openModal(visit.sourceItem)"
                  class="px-3 py-1 bg-blue-600 text-white rounded-lg"
                >
                  View
                </button>
              </td>
            </tr>

            <tr v-if="paginatedGroupedData.length === 0">
              <td colspan="5" class="text-center py-6 text-gray-400">
                No records found
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <span>
            Showing {{ startIndex }} to {{ endIndex }} of
            {{ groupedByPatientAndDate.length }} entries
          </span>

          <div class="flex gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              class="px-3 py-1 rounded"
              :class="
                page === currentPage ? 'bg-[#34699A] text-white' : 'bg-gray-200'
              "
            >
              {{ page }}
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
                {{ selectedReport.dentalChart.user_accounts.role }}
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
            <h2 class="font-semibold text-gray-700 text-lg border-b pb-1 mb-3">
              Procedure Details
            </h2>
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse border border-gray-200">
                <thead>
                  <tr class="bg-gray-100 text-left text-gray-700">
                    <th class="p-3 border border-gray-200">Tooth #</th>
                    <th class="p-3 border border-gray-200">Procedure</th>
                    <th class="p-3 border border-gray-200 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="tooth in selectedReport?.dentalChart?.teeth || []"
                    :key="tooth.tooth_id"
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
            <h2 class="font-semibold text-gray-700 text-lg border-b pb-1 mb-3">
              Prescribed Medications
            </h2>
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse border border-gray-200">
                <thead>
                  <tr class="bg-gray-100 text-left text-gray-700">
                    <th class="p-3 border border-gray-200">Medication</th>
                    <th class="p-3 border border-gray-200">Dosage</th>
                    <th class="p-3 border border-gray-200">Quantity</th>
                    <th class="p-3 border border-gray-200">Instruction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="med in selectedReport.prescribedMedications || []"
                    :key="med.prescribe_medication_id"
                    class="hover:bg-gray-50 transition"
                  >
                    <td class="p-3 border border-gray-200 font-medium">
                      {{ med.name || "N/A" }}
                    </td>

                    <td class="p-3 border border-gray-200">
                      {{ med.dosage || "N/A" }}
                    </td>

                    <td class="p-3 border border-gray-200">
                      {{ med.pcs || 0 }}
                    </td>

                    <td class="p-3 border border-gray-200 text-gray-600">
                      {{ med.med_instruction || "No instruction" }}
                    </td>
                  </tr>

                  <tr v-if="!selectedReport?.prescribedMedications?.length">
                    <td
                      colspan="4"
                      class="text-center py-8 text-gray-400 bg-white border border-gray-200 rounded-md shadow-sm"
                    >
                      No prescribed medications
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="border-t pt-4 text-right text-gray-500 text-sm mt-6">
            <p>Generated by: ToothFormations System</p>
            <p>© 2025 Dental Clinic</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { mapState } from "pinia";
import { useFetchDataStore } from "@/store/fetch-data-store";

export default {
  name: "PrescriptionTable",

  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      showModal: false,
      selectedReport: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    filteredData() {
      const q = this.searchQuery.toLowerCase();

      return this.medications
        .filter((m) => m.payment_status === "Paid")
        .filter((m) => {
          if (!q) return true;

          const patient = this.fullName(m.dentalChart.patient).toLowerCase();
          const dentist = this.fullName(
            m.dentalChart.user_accounts,
          ).toLowerCase();

          return patient.includes(q) || dentist.includes(q);
        });
    },

    groupedByPatientAndDate() {
      const map = {};

      this.filteredData.forEach((item) => {
        const key = `${item.dentalChart.patient.patient_id}-${item.dentalChart.procedure_date}`;

        if (!map[key]) {
          map[key] = {
            key,
            patient: item.dentalChart.patient,
            dentist: item.dentalChart.user_accounts,
            procedure_date: item.dentalChart.procedure_date,
            sourceItem: item,
          };
        }
      });

      return Object.values(map).sort(
        (a, b) => new Date(b.procedure_date) - new Date(a.procedure_date),
      );
    },

    totalPages() {
      return (
        Math.ceil(this.groupedByPatientAndDate.length / this.itemsPerPage) || 1
      );
    },

    paginatedGroupedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.groupedByPatientAndDate.slice(
        start,
        start + this.itemsPerPage,
      );
    },

    startIndex() {
      return this.groupedByPatientAndDate.length
        ? (this.currentPage - 1) * this.itemsPerPage + 1
        : 0;
    },

    endIndex() {
      return Math.min(
        this.currentPage * this.itemsPerPage,
        this.groupedByPatientAndDate.length,
      );
    },
  },

  methods: {
    loadMedications() {
      useFetchDataStore().fetchMedications();
    },
    changePage(page) {
      this.currentPage = page;
    },
    openModal(item) {
      this.selectedReport = item;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedReport = null;
    },
    formatDate(date) {
      return dayjs(date).format("MMMM DD, YYYY");
    },
    formatCurrency(val) {
      return Number(val || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      });
    },
    fullName(p) {
      if (!p) return "";
      return `${p.last_name}, ${p.first_name} ${p.middle_name || ""}`;
    },
  },

  mounted() {
    this.loadMedications();
  },
};
</script>
