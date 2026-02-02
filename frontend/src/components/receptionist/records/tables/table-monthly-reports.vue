<template>
  <div class="p-2">
    <!-- Filters Card -->
    <div class="bg-white mb-6 flex flex-wrap gap-6 items-end p-4">
      <!-- Report Type -->
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700 mb-1"
          >Report Type</label
        >
        <select v-model="reportType" class="border rounded-lg px-3 py-2">
          <option value="monthlyCensus">Monthly Census</option>
          <option value="monthlyCensusPerDentist">
            Monthly Census per Dentist
          </option>
          <option value="monthlyIncome">Monthly Income</option>
          <option value="monthlyIncomePerDentist">
            Monthly Income per Dentist
          </option>
          <option value="monthlyIncomePerProcedure">
            Monthly Income per Procedure
          </option>
        </select>
      </div>

      <!-- Start Month -->
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700 mb-1"
          >Start Month</label
        >
        <input
          type="month"
          v-model="filter.startMonth"
          class="border rounded-lg px-3 py-2"
        />
      </div>

      <!-- End Month -->
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700 mb-1">End Month</label>
        <input
          type="month"
          v-model="filter.endMonth"
          class="border rounded-lg px-3 py-2"
        />
      </div>

      <!-- Dentist -->
      <div
        v-if="
          ['monthlyCensusPerDentist', 'monthlyIncomePerDentist'].includes(
            reportType,
          )
        "
        class="flex flex-col"
      >
        <label class="text-sm font-medium text-gray-700 mb-1">Dentist</label>
        <select v-model="filter.dentistId" class="border rounded-lg px-3 py-2">
          <option value="">All Dentists</option>
          <option
            v-for="d in uniqueDentists"
            :key="d.user_id"
            :value="d.user_id"
          >
            {{ d.first_name }} {{ d.last_name }}
          </option>
        </select>
      </div>

      <!-- Procedure -->
      <div
        v-if="reportType === 'monthlyIncomePerProcedure'"
        class="flex flex-col"
      >
        <label class="text-sm font-medium text-gray-700 mb-1">Procedure</label>
        <select
          v-model="filter.procedureType"
          class="border rounded-lg px-3 py-2"
        >
          <option value="">All Procedures</option>
          <option v-for="p in uniqueProcedureTypes" :key="p" :value="p">
            {{ p }}
          </option>
        </select>
      </div>

      <button
        @click="resetFilters"
        class="bg-blue-600 text-white px-5 py-2 rounded-lg"
      >
        Reset
      </button>
    </div>

    <!-- Table -->
    <div class="text-[14px] bg-[#FDF5AA]-blue-800-white rounded-xl">
      <div class="mt-4 overflow-x-auto border p-2 rounded-xl">
        <!-- Controls -->
        <div class="text-gray-700 flex justify-between items-start mt-1">
          <div class="flex items-center">
            <select
              v-model="pageSize"
              @change="changePage(1)"
              class="border rounded px-2 py-1"
            >
              <option v-for="n in [5, 10, 15, 20]" :key="n" :value="n">
                {{ n }}
              </option>
            </select>
            <span class="ml-2">Per page</span>
          </div>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="border rounded px-3 py-2 w-[300px]"
          />
        </div>

        <!-- Table -->
        <div class="w-full mt-3 rounded-xl shadow overflow-hidden">
          <div class="overflow-y-auto max-h-[65vh] transition-all duration-300">
            <table
              class="min-w-full table-auto border-separate border-spacing-y-2 text-sm text-gray-700"
            >
              <thead
                class="bg-[#34699A] text-white sticky top-0 z-10 tracking-wide"
              >
                <tr>
                  <th class="px-4 py-3 text-left rounded-tl-lg">Patient ID</th>
                  <th class="px-4 py-3 text-left">Procedure Date</th>
                  <th class="px-4 py-3 text-left">Patient Name</th>
                  <th class="px-4 py-3 text-left">Admit Type</th>
                  <th class="px-4 py-3 text-left">Service Type</th>
                  <th v-if="isIncome" class="px-4 py-3 text-left">
                    Clinic Income
                  </th>
                  <th v-if="isIncome" class="px-4 py-3 text-left">
                    Dentist Income
                  </th>
                  <th v-else class="px-4 py-3 text-left rounded-tr-lg">
                    Guarantor
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="item in paginatedCensus"
                  :key="item.prescription_id"
                  class="bg-white hover:bg-gray-50"
                >
                  <td class="px-4 py-2">
                    {{ item.dentalChart?.patient?.patient_id ?? "-" }}
                  </td>
                  <td class="px-4 py-2">
                    {{ formatDate(item.dentalChart?.procedure_date) }}
                  </td>
                  <td class="px-4 py-2">
                    {{ item.dentalChart?.patient?.first_name }}
                    {{ item.dentalChart?.patient?.last_name }}
                  </td>
                  <td class="px-4 py-2">
                    {{
                      getAdmitType(
                        item.dentalChart?.patient?.patient_id,
                        item.dentalChart?.procedure_date,
                      )
                    }}
                  </td>
                  <td class="px-4 py-2">
                    {{ item.dentalChart?.priceProcedure?.procedure_type }}
                  </td>
                  <td v-if="isIncome" class="px-4 py-2">
                    {{ formatCurrency(calculateClinicIncome(item)) }}
                  </td>
                  <td v-if="isIncome" class="px-4 py-2">
                    {{ formatCurrency(calculateDentistIncome(item)) }}
                  </td>
                  <td v-else class="px-4 py-2">
                    {{ item.hmoGuarantor?.full_name ?? "-" }}
                  </td>
                </tr>

                <tr v-if="paginatedCensus.length === 0">
                  <td
                    :colspan="isIncome ? 7 : 6"
                    class="text-center py-6 text-gray-400"
                  >
                    No records found
                  </td>
                </tr>

                <tr
                  v-if="isIncome && paginatedCensus.length"
                  class="bg-gray-100 font-semibold"
                >
                  <td colspan="5" class="text-right px-4 py-3">Total:</td>
                  <td class="px-4 py-3">
                    {{ formatCurrency(totalClinicIncome) }}
                  </td>
                  <td class="px-4 py-3">
                    {{ formatCurrency(totalDentistIncome) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600">
            Showing {{ startIndex }} to {{ endIndex }} of
            {{ filteredData.length }}
          </span>

          <div class="flex items-center gap-1">
            <!-- Prev -->
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded-l-md bg-gray-300 text-gray-700 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            <!-- Pages -->
            <button
              v-for="p in pageNumbers"
              :key="p"
              @click="changePage(p)"
              class="px-3 py-1 rounded text-sm transition"
              :class="
                p === currentPage
                  ? 'bg-[#34699A] text-white font-semibold'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              "
            >
              {{ p }}
            </button>

            <!-- Next -->
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded-r-md bg-gray-300 text-gray-700 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";

export default {
  name: "TableMonthlyReports",
  data() {
    return {
      reportType: "monthlyCensusPerDentist",
      filter: {
        startMonth: "",
        endMonth: "",
        dentistId: "",
        procedureType: "",
      },
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    // --- FILTERED DATA ---
    filteredData() {
      if (!Array.isArray(this.medications)) return [];

      return this.medications.filter((item) => {
        const issued = dayjs(item.dentalChart?.procedure_date);
        if (!issued.isValid()) return false;

        // --- DATE RANGE FILTER ---
        let inRange = true;
        if (this.filter.startMonth) {
          const start = dayjs(this.filter.startMonth).startOf("month");
          inRange = issued.isSame(start, "month") || issued.isAfter(start);
        }
        if (this.filter.endMonth && inRange) {
          const end = dayjs(this.filter.endMonth).endOf("month");
          inRange = issued.isSame(end, "month") || issued.isBefore(end);
        }

        // --- DENTIST FILTER ---
        let dentistMatch = true;
        if (
          ["monthlyCensusPerDentist", "monthlyIncomePerDentist"].includes(
            this.reportType,
          ) &&
          this.filter.dentistId
        ) {
          dentistMatch =
            Number(item.dentalChart?.user_accounts?.user_id) ===
            Number(this.filter.dentistId);
        }

        // --- PROCEDURE FILTER ---
        let procedureMatch = true;
        if (
          this.reportType === "monthlyIncomePerProcedure" &&
          this.filter.procedureType
        ) {
          procedureMatch =
            item.dentalChart?.priceProcedure?.procedure_type ===
            this.filter.procedureType;
        }

        // --- SEARCH QUERY ---
        const search = this.searchQuery.toLowerCase();
        let matchesSearch = true;
        if (search) {
          const patientName = `${item.dentalChart?.patient?.first_name ?? ""} ${
            item.dentalChart?.patient?.last_name ?? ""
          }`.toLowerCase();
          matchesSearch = patientName.includes(search);
        }

        return inRange && dentistMatch && procedureMatch && matchesSearch;
      });
    },

    // --- PAGINATION ---
    paginatedCensus() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    },
    pageNumbers() {
      return Array.from(
        { length: Math.ceil(this.filteredData.length / this.pageSize) },
        (_, i) => i + 1,
      );
    },
    startIndex() {
      return this.filteredData.length === 0
        ? 0
        : (this.currentPage - 1) * this.pageSize + 1;
    },
    endIndex() {
      const end = this.currentPage * this.pageSize;
      return end > this.filteredData.length ? this.filteredData.length : end;
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.pageSize);
    },

    // --- UNIQUE FILTERS ---
    uniqueDentists() {
      const map = {};
      this.medications.forEach((item) => {
        const dentist = item.dentalChart?.user_accounts;
        if (dentist && !map[dentist.user_id]) map[dentist.user_id] = dentist;
      });
      return Object.values(map);
    },
    uniqueProcedureTypes() {
      const set = new Set();
      this.medications.forEach((item) => {
        const type = item.dentalChart?.priceProcedure?.procedure_type;
        if (type) set.add(type);
      });
      return Array.from(set);
    },

    // --- TOTAL INCOME ---
    totalClinicIncome() {
      return this.filteredData.reduce(
        (sum, item) => sum + this.calculateClinicIncome(item),
        0,
      );
    },
    totalDentistIncome() {
      return this.filteredData.reduce(
        (sum, item) => sum + this.calculateDentistIncome(item),
        0,
      );
    },

    // --- IS INCOME REPORT ---
    isIncome() {
      return [
        "monthlyIncome",
        "monthlyIncomePerDentist",
        "monthlyIncomePerProcedure",
      ].includes(this.reportType);
    },
  },
  methods: {
    calculateClinicIncome(item) {
      const payment = Number(item.patient_payment || 0);
      const type = item.dentalChart?.priceProcedure?.procedure_type;
      if (type === "Basic Procedure") return payment * 0.6;
      if (type === "Special Case") return payment * 0.5;
      return payment;
    },
    calculateDentistIncome(item) {
      const payment = Number(item.patient_payment || 0);
      const type = item.dentalChart?.priceProcedure?.procedure_type;
      if (type === "Basic Procedure") return payment * 0.4;
      if (type === "Special Case") return payment * 0.5;
      return 0;
    },
    resetFilters() {
      this.filter.startMonth = "";
      this.filter.endMonth = "";
      this.filter.dentistId = "";
      this.filter.procedureType = "";
      this.currentPage = 1;
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },
    getAdmitType(patientId, issuedDate) {
      const issued = dayjs(issuedDate);
      const previousRecords = this.medications.filter(
        (m) =>
          m.dentalChart?.patient?.patient_id === patientId &&
          dayjs(m.dentalChart?.procedure_date).isBefore(issued),
      );
      return previousRecords.length > 0 ? "Old Patient" : "New Patient";
    },
    formatCurrency(value) {
      return parseFloat(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    formatDate(date) {
      return dayjs(date).format("MMM DD, YYYY hh:mm A");
    },
    loadMedications() {
      const store = useFetchDataStore();
      if (!store.medications || store.medications.length === 0)
        store.fetchMedications();
    },
  },
  mounted() {
    this.loadMedications();
  },
};
</script>

<style scoped>
tbody tr {
  transition: background-color 0.2s ease;
}
thead th {
  background: #34699a;
  color: white;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: rgba(100, 100, 100, 0.4);
  border-radius: 3px;
}
</style>
