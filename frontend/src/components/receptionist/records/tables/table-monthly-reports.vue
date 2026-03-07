<template>
  <div class="p-2">
    <!-- Filters Card -->
    <div class="bg-white mb-6 rounded-xl shadow-sm border p-5">
      <div class="flex flex-wrap gap-6 items-end">
        <div class="flex flex-col min-w-[200px]">
          <label class="text-xs font-semibold text-gray-600 uppercase mb-1">
            Report Type
          </label>
          <select
            v-model="reportType"
            class="border border-gray-300 rounded-lg px-3 py-2.5"
          >
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

        <div class="flex flex-col min-w-[160px]">
          <label class="text-xs font-semibold text-gray-600 uppercase mb-1">
            Start Month
          </label>
          <input
            type="month"
            v-model="filter.startMonth"
            class="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div class="flex flex-col min-w-[160px]">
          <label class="text-xs font-semibold text-gray-600 uppercase mb-1">
            End Month
          </label>
          <input
            type="month"
            v-model="filter.endMonth"
            class="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div
          v-if="
            ['monthlyCensusPerDentist', 'monthlyIncomePerDentist'].includes(
              reportType,
            )
          "
          class="flex flex-col min-w-[200px]"
        >
          <label class="text-xs font-semibold text-gray-600 uppercase mb-1">
            Dentist
          </label>

          <select
            v-model="filter.dentistId"
            class="border border-gray-300 rounded-lg px-3 py-2"
          >
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

        <div
          v-if="reportType === 'monthlyIncomePerProcedure'"
          class="flex flex-col min-w-[200px]"
        >
          <label class="text-xs font-semibold text-gray-600 uppercase mb-1">
            Procedure
          </label>

          <select
            v-model="filter.procedureType"
            class="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Procedures</option>
            <option v-for="p in uniqueProcedureTypes" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            @click="resetFilters"
            class="bg-[#34699A] text-white px-5 py-2 rounded-lg"
          >
            Reset Filters
          </button>

          <!-- DOWNLOAD BUTTON -->
          <button
            @click="previewPdf"
            class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>

    <!-- TABLE (UNCHANGED) -->
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
          <div class="overflow-y-auto max-h-[65vh]">
            <table
              class="min-w-full table-auto border-separate border-spacing-y-2 text-sm text-gray-700"
            >
              <thead class="bg-[#34699A] text-white sticky top-0 z-10">
                <tr>
                  <th class="px-4 py-3 text-left">Patient ID</th>
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
                        item.dentalChart?.procedure_date,
                      )
                    }}
                  </td>
                  <td class="px-4 py-2">
                    {{
                      item.dentalChart?.teeth?.[0]?.priceProcedure
                        ?.procedure_type
                    }}
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF PREVIEW MODAL -->
    <div
      v-if="showPreview"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white w-[900px] h-[80vh] rounded-xl flex flex-col">
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="font-semibold text-lg">PDF Preview</h2>

          <div class="flex gap-2">
            <button
              @click="downloadPreviewPdf"
              class="bg-green-600 text-white px-4 py-2 rounded"
            >
              Download
            </button>

            <button
              @click="showPreview = false"
              class="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>

        <iframe :src="pdfPreviewUrl" class="flex-1 w-full"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";

export default {
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

      showPreview: false,
      pdfPreviewUrl: null,

      pendingPdfDefinition: null,
      pendingPdfType: null,
      pendingPdfPatient: null,
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
          inRange = issued.isSame(start, "month") || issued.isAfter(start);
        }

        if (this.filter.endMonth && inRange) {
          const end = dayjs(this.filter.endMonth).endOf("month");
          inRange = issued.isSame(end, "month") || issued.isBefore(end);
        }

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

        let procedureMatch = true;

        if (
          this.reportType === "monthlyIncomePerProcedure" &&
          this.filter.procedureType
        ) {
          procedureMatch =
            item.dentalChart?.teeth?.[0]?.priceProcedure?.procedure_type ===
            this.filter.procedureType;
        }

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

    paginatedCensus() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    },

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
        const type =
          item.dentalChart?.teeth?.[0]?.priceProcedure?.procedure_type;
        if (type) set.add(type);
      });
      return Array.from(set);
    },

    isIncome() {
      return [
        "monthlyIncome",
        "monthlyIncomePerDentist",
        "monthlyIncomePerProcedure",
      ].includes(this.reportType);
    },
  },

  methods: {
    previewPdf() {
      const rows = [];

      const header = [
        "Patient ID",
        "Procedure Date",
        "Patient Name",
        "Admit Type",
        "Service Type",
      ];

      if (this.isIncome) {
        header.push("Clinic Income");
        header.push("Dentist Income");
      } else {
        header.push("Guarantor");
      }

      rows.push(header);

      this.filteredData.forEach((item) => {
        const patientId = item?.dentalChart?.patient?.patient_id ?? "-";

        const procedureDate = item?.dentalChart?.procedure_date
          ? this.formatDate(item.dentalChart.procedure_date)
          : "-";

        const patientName =
          `${item?.dentalChart?.patient?.first_name ?? ""} ${
            item?.dentalChart?.patient?.last_name ?? ""
          }`.trim() || "-";

        const admitType = this.getAdmitType(
          item?.dentalChart?.patient?.patient_id,
          item?.dentalChart?.procedure_date,
        );

        // ✅ FIXED SERVICE TYPE SOURCE
        const serviceType =
          item?.dentalChart?.teeth?.[0]?.priceProcedure?.procedure_type ?? "-";

        const row = [
          patientId,
          procedureDate,
          patientName,
          admitType,
          serviceType,
        ];

        if (this.isIncome) {
          const clinicIncome = this.formatCurrency(
            this.calculateClinicIncome(item),
          );

          const dentistIncome = this.formatCurrency(
            this.calculateDentistIncome(item),
          );

          row.push(clinicIncome);
          row.push(dentistIncome);
        } else {
          row.push(item?.hmoGuarantor?.full_name ?? "-");
        }

        rows.push(row);
      });

      const columnCount = rows[0].length;

      const docDefinition = {
        pageSize: "A4",
        pageOrientation: "landscape",

        content: [
          {
            text: "Monthly Dental Report",
            style: "header",
          },

          {
            text: `Report Type: ${this.reportType}`,
            margin: [0, 0, 0, 5],
          },

          {
            text: `Date Range: ${this.filter.startMonth || "Beginning"} - ${
              this.filter.endMonth || "Present"
            }`,
            margin: [0, 0, 0, 15],
          },

          {
            table: {
              headerRows: 1,
              widths: new Array(columnCount).fill("*"),
              body: rows,
            },
            layout: "lightHorizontalLines",
          },
        ],

        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10],
          },
        },
      };

      this.pendingPdfDefinition = docDefinition;

      const pdf = pdfMake.createPdf(docDefinition);

      pdf.getBlob((blob) => {
        this.pdfPreviewUrl = URL.createObjectURL(blob);
        this.showPreview = true;
      });
    },

    downloadPreviewPdf() {
      if (!this.pendingPdfDefinition) return;

      const fileName = `dental_report_${dayjs().format("YYYYMMDD_HHmm")}.pdf`;

      pdfMake.createPdf(this.pendingPdfDefinition).download(fileName);
    },

    resetFilters() {
      this.filter.startMonth = "";
      this.filter.endMonth = "";
      this.filter.dentistId = "";
      this.filter.procedureType = "";

      this.currentPage = 1;
    },

    changePage(page) {
      this.currentPage = page;
    },

    calculateClinicIncome(item) {
      const payment = Number(item.patient_payment || 0);
      const type = item.dentalChart?.teeth?.[0]?.priceProcedure?.procedure_type;

      if (type === "Basic Procedure") return payment * 0.6;
      if (type === "Special Case") return payment * 0.5;

      return payment;
    },

    calculateDentistIncome(item) {
      const payment = Number(item.patient_payment || 0);
      const type = item.dentalChart?.teeth?.[0]?.priceProcedure?.procedure_type;

      if (type === "Basic Procedure") return payment * 0.4;
      if (type === "Special Case") return payment * 0.5;

      return 0;
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

::-webkit-scrollbar {
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: rgba(100, 100, 100, 0.4);
  border-radius: 3px;
}
</style>
