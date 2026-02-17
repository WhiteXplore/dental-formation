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
          <div class="flex items-center">
            <input
              v-model="searchQuery"
              type="text"
              class="px-3 w-[300px] py-2 border rounded-md"
              placeholder="Search patient or dentist..."
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
                  <th class="px-4 py-3 text-left rounded-tl-lg">No.</th>
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
                      @click="openModal(visit)"
                      class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <span>
            Showing {{ startIndex }} to {{ endIndex }} of
            {{ filteredData.length }} entries
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
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto pt-10"
    >
      <div
        class="bg-white w-[1000px] max-h-[90vh] overflow-auto rounded-xl p-8 relative shadow-lg"
      >
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
        >
          ✕
        </button>

        <!-- ===== Clinic Header ===== -->
        <div class="text-center space-y-1 mb-4">
          <h2 class="text-2xl font-bold text-green-700">
            TOOTH FORMATION DENTAL CLINIC
          </h2>
          <div class="text-sm text-gray-600">
            PANABO POLYMEDIC HOSPITAL, INC. – GROUP FLOOR
          </div>
          <div class="text-sm text-gray-600">Contact #: 0985-104-6429</div>
          <div class="text-sm text-gray-600">
            FB: TOOTH FORMATION DENTAL CLINIC
          </div>

          <div class="mt-3 font-semibold text-gray-700">DENTAL CERTIFICATE</div>

          <hr class="my-3 border-gray-300" />
        </div>

        <!-- ===== Patient Information (PDF-like) ===== -->
        <div class="text-sm space-y-2 mb-4">
          <!-- Date -->
          <div>
            <span class="font-semibold">Date Issued:</span>
            <span class="border-b border-black px-2">
              {{ formatDate(selectedReport.issued_date) }}
            </span>
          </div>

          <!-- Name / Age / Sex -->
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-8">
              <span class="font-semibold">Patient Name:</span>
              <span class="border-b border-black px-2">
                {{ fullName(selectedReport.dentalChart.patient) }}
              </span>
            </div>
            <div class="col-span-4">
              <span class="font-semibold">Age:</span>
              <span class="border-b border-black px-1 mr-3">
                {{ selectedReport.dentalChart.patient.age || "N/A" }}
              </span>
              <span class="font-semibold">Sex:</span>
              <span class="border-b border-black px-1">
                {{ selectedReport.dentalChart.patient.gender || "N/A" }}
              </span>
            </div>
          </div>

          <!-- Address / Status -->
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-8">
              <span class="font-semibold">Address:</span>
              <span class="border-b border-black px-2">
                {{ selectedReport.dentalChart.patient.address || "N/A" }}
              </span>
            </div>
            <div class="col-span-4">
              <span class="font-semibold">Status:</span>
              <span class="border-b border-black px-2">
                {{ selectedReport.dentalChart.patient.marital_status || "N/A" }}
              </span>
            </div>
          </div>
        </div>

        <!-- ===== Diagnosis ===== -->
        <div class="mb-4">
          <label class="font-semibold text-sm">Diagnosis</label>
          <textarea
            v-model="diagnosis"
            class="w-full border rounded-md p-2 mt-1 text-sm"
            rows="3"
            placeholder="Enter diagnosis here..."
          ></textarea>
        </div>

        <!-- <div class="mb-4">
          <label class="font-semibold text-sm">Diagnosis</label>
          <textarea
            v-model="diagnosis"
            class="w-full border rounded-md p-2 mt-1 text-sm"
            rows="3"
            placeholder="Enter diagnosis here..."
          ></textarea>
        </div> -->

        <!-- ===== Recommendation ===== -->
        <div class="mb-6">
          <label class="font-semibold text-sm">Recommendation</label>
          <textarea
            v-model="recommendation"
            class="w-full border rounded-md p-2 mt-1 text-sm"
            rows="3"
            placeholder="Enter recommendation here..."
          ></textarea>
        </div>

        <!-- ===== Buttons ===== -->
        <div class="flex justify-end gap-3">
          <button
            @click="previewPDF"
            class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Preview PDF
          </button>

          <button
            @click="closeModal"
            class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- PDF Modal -->
    <div
      v-if="showPdfModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div
        class="bg-white w-[60%] h-[80%] rounded-xl relative overflow-auto p-4"
      >
        <button
          @click="showPdfModal = false"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <iframe
          v-if="pdfDataUrl"
          :src="pdfDataUrl"
          class="w-full h-full border rounded-md"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { mapState } from "pinia";
import { useFetchDataStore } from "@/store/fetch-data-store";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

export default {
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      showPdfModal: false,
      selectedReport: null,
      recommendation: "",
      diagnosis: "",
      searchQuery: "",
      pdfDataUrl: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    /* =============================
       FILTER RAW DATA
    ============================= */
    filteredData() {
      const q = this.searchQuery.toLowerCase().trim();
      return this.medications
        .filter((m) => m.payment_status === "Paid")
        .filter((m) => {
          if (!q) return true;

          const patientName = this.fullName(
            m.dentalChart?.patient,
          ).toLowerCase();

          const dentistName = this.fullName(
            m.dentalChart?.user_accounts,
          ).toLowerCase();

          return patientName.includes(q) || dentistName.includes(q);
        });
    },

    //   return this.medications
    //     .filter((m) => m.payment_status === "Paid" && m.is_discharged === true)
    //     .filter((m) => {
    //       if (!q) return true;

    //       const patientName = this.fullName(
    //         m.dentalChart?.patient
    //       ).toLowerCase();

    //       const dentistName = this.fullName(
    //         m.dentalChart?.user_accounts
    //       ).toLowerCase();

    //       return patientName.includes(q) || dentistName.includes(q);
    //     });
    // },

    /* =============================
       GROUP BY PATIENT + PROCEDURE DATE
    ============================= */
    groupedByPatientAndDate() {
      const map = {};

      this.filteredData.forEach((item) => {
        const patient = item.dentalChart.patient;
        const dentist = item.dentalChart.user_accounts;
        const procedureDate = item.dentalChart.procedure_date;

        const key = `${patient.patient_id}-${procedureDate}`;

        if (!map[key]) {
          map[key] = {
            key,
            patient,
            dentist,
            procedure_date: procedureDate,
            procedures: [],
            sourceItem: item, // used for modal / PDF
          };
        }

        map[key].procedures.push({
          procedure_name: item.dentalChart.priceProcedure?.procedure_name,
          teeth: item.dentalChart.teeth.map((t) => t.tooth_number),
        });
      });

      return Object.values(map);
    },

    /* =============================
       PAGINATION
    ============================= */
    paginatedGroupedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.groupedByPatientAndDate.slice(
        start,
        start + this.itemsPerPage,
      );
    },

    totalPages() {
      return (
        Math.ceil(this.groupedByPatientAndDate.length / this.itemsPerPage) || 1
      );
    },

    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    endIndex() {
      return Math.min(
        this.currentPage * this.itemsPerPage,
        this.groupedByPatientAndDate.length,
      );
    },
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    itemsPerPage() {
      this.currentPage = 1;
    },
  },

  methods: {
    changePage(page) {
      this.currentPage = page;
    },

    loadMedications() {
      useFetchDataStore().fetchMedications();
    },

    /* =============================
       MODAL
    ============================= */
    openModal(visit) {
      this.selectedReport = visit.sourceItem;
      this.recommendation = "";
      // Populate diagnosis from procedure_notes
      this.diagnosis = visit.sourceItem.dentalChart.procedure_notes || "";
      this.showModal = true;
      this.pdfDataUrl = null;
    },

    closeModal() {
      this.showModal = false;
      this.selectedReport = null;
      this.recommendation = "";
      this.diagnosis = "";
      this.pdfDataUrl = null;
    },

    /* =============================
       HELPERS
    ============================= */
    formatDate(date) {
      return dayjs(date).format("MMMM DD, YYYY");
    },

    fullName(person) {
      if (!person) return "";
      return `${person.last_name}, ${person.first_name} ${
        person.middle_name || ""
      }`;
    },

    async toBase64(imgPath) {
      const res = await fetch(imgPath);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    },

    async previewPDF() {
      if (!this.selectedReport) return;

      const patient = this.selectedReport.dentalChart.patient || {};
      const dentist = this.selectedReport.dentalChart.user_accounts || {};
      const procedure = this.selectedReport.dentalChart.priceProcedure || {};
      const teeth = this.selectedReport.dentalChart.teeth || [];

      const logoBase64 = await this.toBase64(
        require("@/assets/img/clinic-logo.png"),
      );

      const toothNumbers = teeth.map((t) => t.tooth_number).join(", ");

      const docDefinition = {
        pageSize: "LETTER",

        // Space reserved for header & footer
        pageMargins: [40, 160, 40, 80],

        /* =========================
       FIXED HEADER
    ========================= */
        header: {
          margin: [40, 15, 40, 0],
          stack: [
            {
              image: logoBase64,
              width: 150, // ⬅ slightly smaller
              alignment: "center",
              margin: [0, 0, 0, 6],
            },
            {
              text: "TOOTH FORMATION DENTAL CLINIC",
              style: "clinicHeader",
            },
            {
              text: "PANABO POLYMEDIC HOSPITAL, INC. - GROUP FLOOR",
              style: "subTitle",
            },
            {
              columns: [
                { text: "Contact #: 0985-104-6429", style: "receiptTitle" },
                {
                  text: "FB : TOOTH FORMATION DENTAL CLINIC",
                  style: "receiptTitle",
                },
              ],
              margin: [40, 6, 40, 6],
            },
            {
              text: "Dental Certificate",
              style: "subTitle",
              bold: true,
              fontSize: 15,
              margin: [0, 20, 0, 0],
            },
          ],
        },

        content: [
          {
            margin: [0, 0, 0, 20],
            stack: [
              {
                text: [
                  { text: "Date Issued: ", bold: true },
                  {
                    text: dayjs().format("MMMM DD, YYYY"),
                    decoration: "underline",
                  },
                ],
                margin: [0, 0, 0, 12],
              },
              {
                columns: [
                  {
                    width: "65%",
                    text: [
                      { text: "Patient Name: ", bold: true },
                      {
                        text: `${patient.last_name || ""}, ${
                          patient.first_name || ""
                        }`,
                        decoration: "underline",
                      },
                    ],
                  },
                  {
                    width: "35%",
                    text: [
                      { text: "Age: ", bold: true },
                      {
                        text: `${patient.age || "N/A"}`,
                        decoration: "underline",
                      },
                      "    ",
                      { text: "Sex: ", bold: true },
                      {
                        text: `${patient.gender || "N/A"}`,
                        decoration: "underline",
                      },
                    ],
                  },
                ],
              },

              {
                margin: [0, 6, 0, 0],
                columns: [
                  {
                    width: "65%",
                    text: [
                      { text: "Address: ", bold: true },
                      {
                        text: patient.address || "N/A",
                        decoration: "underline",
                      },
                    ],
                  },
                  {
                    width: "35%",
                    text: [
                      { text: "Status: ", bold: true },
                      {
                        text: patient.marital_status || "N/A",
                        decoration: "underline",
                      },
                    ],
                  },
                ],
              },
            ],
          },

          /* =========================
     LETTER BODY
  ========================= */
          {
            text: [
              "This is to certify that ",
              {
                text: `${patient.last_name}, ${patient.first_name} `.toUpperCase(),
                bold: true,
                decoration: "underline",
              },
              "has been examined to ",
              {
                text: "TOOTH FORMATION DENTAL CLINIC – PANABO POLYMEDIC HOSPITAL, INC. ",
                bold: true,
                decoration: "underline",
              },
              `on ${this.formatDate(
                this.selectedReport.dentalChart.procedure_date,
              )}. `,
              "The patient underwent the dental procedure ",
              { text: `${procedure.procedure_name || "N/A"} `, bold: true },
              "involving tooth/teeth number(s) ",
              { text: `${toothNumbers || "N/A"}.`, bold: true },
              {
                text: "with a diagnosis of ",
              },
              {
                text: (this.diagnosis || "N/A").toUpperCase(),
                bold: true,
                decoration: "underline",
              },
            ],
            alignment: "justify",
            lineHeight: 1.6,
            margin: [0, 20, 0, 20],
          },
          {
            text: [
              "Recommendation ",
              {
                text: (this.recommendation || "N/A").toUpperCase(),
                bold: true,
                decoration: "underline",
              },
            ],
            alignment: "justify",
            lineHeight: 1.6,
            margin: [0, 20, 0, 20],
          },
          {
            text: [
              "This certificate is being issued upon the request of  ",
              {
                text: `${patient.last_name}, ${patient.first_name} ,`.toUpperCase(),
                bold: true,
                decoration: "underline",
              },
              "for whatever purpose it may serve (excluding legal matters).",
            ],
            alignment: "justify",
            lineHeight: 1.6,
            margin: [0, 20, 0, 20],
          },
        ],

        /* =========================
       FOOTER
    ========================= */
        footer: {
          margin: [40, 0, 40, 30],
          columns: [
            { width: "*", text: "" },
            {
              width: "auto",
              stack: [
                {
                  text: `${dentist.last_name || ""}, ${
                    dentist.first_name || ""
                  }`.toUpperCase(),
                  bold: true,
                  decoration: "underline",
                  alignment: "center",
                },

                {
                  columns: [
                    {
                      text: "License No.",
                      fontSize: 9,
                      color: "#555",
                      alignment: "right",
                      margin: [0, 5, 5, 0],
                    },
                    {
                      text: `${dentist.license_no || "N/A"}`,
                      bold: true,
                      fontSize: 9,
                      color: "#555",
                      alignment: "left",
                      margin: [0, 5, 0, 0],
                    },
                  ],
                },
              ],
            },
          ],
        },

        styles: {
          clinicHeader: {
            fontSize: 17,
            bold: true,
            alignment: "center",
            color: "#2E7D32",
          },
          subTitle: {
            fontSize: 11,
            alignment: "center",
            color: "#555",
          },
          receiptTitle: {
            fontSize: 9,
            alignment: "center",
            color: "#555",
          },
        },

        defaultStyle: {
          fontSize: 12,
        },
      };

      this.pdfDataUrl = await new Promise((resolve) => {
        pdfMake.createPdf(docDefinition).getDataUrl(resolve);
      });

      this.showPdfModal = true;
    },
  },

  mounted() {
    this.loadMedications();
  },
};
</script>
