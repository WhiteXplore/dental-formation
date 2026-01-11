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
            reportType
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
    <div class="bg-white rounded-xl p-4 border">
      <!-- Controls -->
      <div class="flex justify-between mb-3">
        <div>
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
      <div class="overflow-x-auto max-h-[70vh]">
        <table class="min-w-full border rounded-t-lg text-sm">
          <thead class="bg-[#34699A] text-white sticky top-0">
            <tr>
              <th class="px-4 py-3 text-left rounded-t-lg">Patient ID</th>
              <th class="px-4 py-3 text-left">Procedure Date</th>
              <th class="px-4 py-3 text-left">Patient Name</th>
              <th class="px-4 py-3 text-left">Admit Type</th>
              <th class="px-4 py-3 text-left">Service Type</th>
              <th v-if="isIncome" class="px-4 py-3 text-left">Clinic Income</th>
              <th v-if="isIncome" class="px-4 py-3 text-left">
                Dentist Income
              </th>
              <th v-else class="px-4 py-3 text-left">Guarantor</th>
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
                    item.dentalChart?.procedure_date
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
                {{ item.hmoGuarantor?.first_name }}
                {{ item.hmoGuarantor?.last_name }}
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
              <td class="px-4 py-3">{{ formatCurrency(totalClinicIncome) }}</td>
              <td class="px-4 py-3">
                {{ formatCurrency(totalDentistIncome) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between mt-4">
        <span class="text-sm text-gray-600">
          Showing {{ startIndex }} to {{ endIndex }} of
          {{ filteredData.length }}
        </span>

        <div class="flex gap-1">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            ‹
          </button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            @click="changePage(p)"
            :class="
              p === currentPage
                ? 'bg-[#34699A] text-white px-3 py-1 rounded'
                : 'px-3 py-1'
            "
          >
            {{ p }}
          </button>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            ›
          </button>
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

    filteredData() {
      if (!Array.isArray(this.medications)) return [];

      return this.medications.filter((item) => {
        const issued = dayjs(item.dentalChart?.procedure_date);
        if (!issued.isValid()) return false;

        let inRange = true;

        if (this.filter.startMonth) {
          const start = dayjs(this.filter.startMonth).startOf("month");
          inRange = issued.isAfter(start) || issued.isSame(start, "day");
        }

        if (this.filter.endMonth && inRange) {
          const end = dayjs(this.filter.endMonth).endOf("month");
          inRange = issued.isBefore(end) || issued.isSame(end, "day");
        }

        // Dentist filter
        let dentistMatch = true;
        if (
          (this.reportType === "monthlyCensusPerDentist" ||
            this.reportType === "monthlyIncomePerDentist") &&
          this.filter.dentistId
        ) {
          dentistMatch =
            Number(item.dentalChart?.user_accounts?.user_id) ===
            Number(this.filter.dentistId);
        }

        // Procedure filter
        let procedureMatch = true;
        if (
          this.reportType === "monthlyIncomePerProcedure" &&
          this.filter.procedureType
        ) {
          procedureMatch =
            item.dentalChart?.priceProcedure?.procedure_type ===
            this.filter.procedureType;
        }

        return inRange && dentistMatch && procedureMatch;
      });
    },
    paginatedCensus() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    },

    pageNumbers() {
      const pages = Math.ceil(this.filteredData.length / this.pageSize);
      return Array.from({ length: pages }, (_, i) => i + 1);
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

    uniqueDentists() {
      const dentistsMap = {};
      if (Array.isArray(this.medications)) {
        this.medications.forEach((item) => {
          const dentist = item.dentalChart?.user_accounts;
          if (dentist && !dentistsMap[dentist.user_id]) {
            dentistsMap[dentist.user_id] = dentist;
          }
        });
      }
      return Object.values(dentistsMap);
    },

    uniqueProcedureTypes() {
      const typesSet = new Set();
      if (Array.isArray(this.medications)) {
        this.medications.forEach((item) => {
          const type = item.dentalChart?.priceProcedure?.procedure_type;
          if (type) typesSet.add(type);
        });
      }
      return Array.from(typesSet);
    },

    totalClinicIncome() {
      return this.filteredData.reduce(
        (sum, item) => sum + this.calculateClinicIncome(item),
        0
      );
    },

    totalDentistIncome() {
      return this.filteredData.reduce(
        (sum, item) => sum + this.calculateDentistIncome(item),
        0
      );
    },
  },
  methods: {
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
      if (!Array.isArray(this.medications)) return "New Patient";
      const issued = dayjs(issuedDate);
      const previousRecords = this.medications.filter(
        (m) =>
          m.dentalChart?.patient?.patient_id === patientId &&
          dayjs(m.dentalChart?.procedure_date).isBefore(issued)
      );
      return previousRecords.length > 0 ? "Old Patient" : "New Patient";
    },

    calculateClinicIncome(item) {
      const payment = parseFloat(item.patient_payment || 0);
      const type = item.dentalChart?.priceProcedure?.procedure_type;
      if (type === "Basic Procedure") return payment * 0.6;
      if (type === "Special Case") return payment * 0.5;
      return payment;
    },

    calculateDentistIncome(item) {
      const payment = parseFloat(item.patient_payment || 0);
      const type = item.dentalChart?.priceProcedure?.procedure_type;
      if (type === "Basic Procedure") return payment * 0.4;
      if (type === "Special Case") return payment * 0.5;
      return 0;
    },

    formatCurrency(value) {
      if (!value) return "$0.00";
      return parseFloat(value).toLocaleString(undefined, {
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
