<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="bg-white w-full mx-auto">
      <!-- Header -->
      <div class="text-sm flex justify-between">
        <div class="text-[13px] text-text mt-4 font-regular">
          Pages / Patient History
        </div>

        <button
          @click="fetchMedications"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center text-gray-500 py-10">
        Loading prescriptions...
      </div>

      <!-- Empty -->
      <div
        v-else-if="groupedPrescriptions.length === 0"
        class="text-center text-gray-500 py-10"
      >
        No prescription records found.
      </div>

      <!-- Table -->
      <div v-else class="text-[14px] bg-white rounded-xl mt-4">
        <div class="overflow-x-auto border p-2 rounded-xl">
          <!-- Controls -->
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center gap-2">
              <select
                v-model="itemsPerPage"
                class="px-2 py-1 border rounded-md"
                @change="changePage(1)"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="20">20</option>
              </select>
              <span>Per page</span>
            </div>

            <input
              v-model="searchQuery"
              type="text"
              class="px-3 py-2 border rounded-md w-[300px]"
              placeholder="Search patient or dentist..."
              @input="changePage(1)"
            />
          </div>

          <!-- Main Table -->
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
                      class="px-4 py-2 text-left w-10 rounded-tl-lg font-normal"
                    >
                      Transaction ID
                    </th>
                    <th class="px-4 py-2 text-left">Patient</th>
                    <th class="px-4 py-2 text-left">Dentist</th>
                    <th class="px-4 py-2 text-left">Issued Date</th>
                    <th class="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in paginatedData"
                    :key="row.patient.patient_id"
                    class="bg-white border shadow-sm hover:bg-green-50"
                  >
                    <td class="px-4 py-2">
                      <!-- Show first transaction ID for reference -->
                      {{ row.transactions[0].prescription_id }}
                    </td>
                    <td class="px-4 py-2">
                      {{ row.patient.first_name }} {{ row.patient.last_name }}
                    </td>
                    <td class="px-4 py-2">
                      <!-- Show dentist of first transaction for reference -->
                      {{
                        row.transactions[0].dentalChart.user_accounts.first_name
                      }}
                      {{
                        row.transactions[0].dentalChart.user_accounts.last_name
                      }}
                    </td>
                    <td class="px-4 py-2">
                      {{ formatDate(row.transactions[0].issued_date) }}
                    </td>
                    <td class="px-4 py-2 text-center">
                      <button
                        @click="openReport(row)"
                        class="px-3 py-1 border border-green-400 rounded-lg hover:bg-green-200 text-green-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>

                  <tr v-if="paginatedData.length === 0">
                    <td colspan="5" class="text-center py-6 text-gray-400">
                      No records found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="flex justify-between items-center mt-4">
            <div class="text-gray-700">
              <span
                >Showing {{ startIndex + 1 }} to {{ endIndex }} of
                {{ filteredData.length }} entries</span
              >
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                ‹
              </button>

              <button
                v-for="p in pageNumbers"
                :key="p"
                @click="changePage(p)"
                class="px-3 py-1 rounded"
                :class="
                  p === currentPage ? 'bg-[#34699A] text-white' : 'bg-gray-200'
                "
              >
                {{ p }}
              </button>

              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      >
        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-6xl overflow-y-auto max-h-[90vh]"
        >
          <div
            class="sticky top-0 z-20 bg-white border-b px-6 py-4 flex justify-between items-center"
          >
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Patient History</h2>
              <p class="text-sm text-gray-500">
                {{ selectedPatient.first_name }}
                {{ selectedPatient.last_name }}
              </p>
            </div>

            <button
              @click="closeModal"
              class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <!-- History Table -->
          <div class="overflow-y-auto p-6">
            <table class="min-w-full text-sm text-gray-700">
              <thead class="bg-gray-50 z-10">
                <tr>
                  <th class="p-2 border w-[10%]">Date</th>
                  <th class="p-2 border w-[15%]">Dentist</th>
                  <th class="p-2 border w-auto">Notes</th>
                  <th class="p-2 border w-[15%]">Procedure</th>
                  <th class="p-2 border">X-Ray</th>
                  <th class="p-2 border">Teeth</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="h in selectedPatientHistory"
                  :key="h.prescription_id"
                >
                  <td class="p-2 border">
                    {{ formatDate(h.issued_date) }}
                  </td>
                  <td class="p-2 border">
                    Dr. {{ h.dentalChart.user_accounts.first_name }}
                    {{ h.dentalChart.user_accounts.last_name }}
                  </td>
                  <td class="p-2 border">
                    {{ h.instruction || "None" }}
                  </td>
                  <td class="p-2 border text-center">
                    <div
                      v-for="procedure in uniqueProcedures(h.dentalChart.teeth)"
                      :key="procedure"
                    >
                      {{ procedure }}
                    </div>
                  </td>

                  <td class="p-2 border text-center">None</td>
                  <td class="p-2 border">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="t in h.dentalChart.teeth"
                        :key="t.tooth_number"
                        class="px-2 py-1 bg-gray-200 rounded text-xs"
                      >
                        {{ t.tooth_number }}
                      </span>
                    </div>
                  </td>
                </tr>

                <tr v-if="!selectedPatientHistory.length">
                  <td colspan="6" class="text-center py-6 text-gray-400">
                    No history found
                  </td>
                </tr>
              </tbody>
            </table>
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
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 5,
      showModal: false,
      selectedPatient: null,
      selectedPatientHistory: [],
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    // Group by patient
    groupedPrescriptions() {
      const groups = {};
      this.medications.forEach((m) => {
        const patient = m.dentalChart?.patient;
        if (!patient) return;

        if (!groups[patient.patient_id]) {
          groups[patient.patient_id] = {
            patient,
            transactions: [],
          };
        }
        groups[patient.patient_id].transactions.push(m);
      });

      // Convert object to array
      return Object.values(groups);
    },

    filteredData() {
      if (!this.searchQuery) return this.groupedPrescriptions;
      const q = this.searchQuery.toLowerCase();
      return this.groupedPrescriptions.filter(
        (g) =>
          g.patient.first_name?.toLowerCase().includes(q) ||
          g.patient.last_name?.toLowerCase().includes(q),
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
        this.filteredData.length,
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
    uniqueProcedures(teeth = []) {
      return [
        ...new Set(
          teeth.map((t) => t.priceProcedure?.procedure_name).filter(Boolean),
        ),
      ];
    },
    async fetchMedications() {
      this.loading = true;
      await useFetchDataStore().fetchMedications();
      this.loading = false;
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    },

    openReport(row) {
      this.selectedPatient = row.patient;
      this.selectedPatientHistory = row.transactions;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.selectedPatient = null;
      this.selectedPatientHistory = [];
    },

    formatDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  mounted() {
    this.fetchMedications();
  },
};
</script>
