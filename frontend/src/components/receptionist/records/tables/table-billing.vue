<template>
  <div v-if="isTable">
    <!-- Header -->
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">
        Pages / Prescription
      </div>
    </div>

    <!-- Table -->
    <div class="text-[14px] bg-[#FDF5AA]-blue-800-white rounded-xl">
      <div class="mt-4 overflow-x-auto border p-2 rounded-xl">
        <!-- Controls -->
        <div class="text-gray-700 flex justify-between items-start mt-1">
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
              placeholder="Search..."
              @input="changePage(1)"
            />
          </div>
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
                  <th
                    class="w-10 px-4 py-2 text-left font-normal rounded-tl-lg"
                  >
                    No.
                  </th>
                  <th class="px-4 py-2 text-left font-normal">Patient</th>
                  <th class="px-4 py-2 text-left font-normal">Dentist</th>

                  <th class="px-4 py-2 text-left font-normal">
                    Procedure Date(s)
                  </th>

                  <th class="px-4 py-2 text-left font-normal">
                    Payment Status
                  </th>
                  <th class="px-4 py-2 text-left font-normal rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="groupedData.length > 0">
                  <tr
                    v-for="(item, index) in groupedData"
                    :key="item.key"
                    class="bg-white hover:bg-gray-50 border border-gray-200 rounded-md shadow-sm"
                  >
                    <td class="px-4 py-2">{{ startIndex + index }}</td>
                    <td class="px-4 py-2">
                      {{ item.patient?.last_name }},
                      {{ item.patient?.first_name }}
                    </td>
                    <td class="px-4 py-2">
                      Dr.
                      {{
                        item.dentist
                          ? `${item.dentist.last_name}, ${item.dentist.first_name}`
                          : "N/A"
                      }}
                    </td>
                    <td class="px-4 py-2">{{ item.procedure_date }}</td>
                    <td class="px-4 py-2">
                      <span
                        :class="[
                          'text-xs font-semibold px-3 py-1 rounded-full',
                          item.payment_status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : item.payment_status === 'For Payment'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800',
                        ]"
                      >
                        {{ item.payment_status || "Unknown" }}
                      </span>
                    </td>
                    <td class="px-4 py-2 flex gap-2">
                      <button
                        class="px-2 py-1 border border-yellow-300 hover:bg-yellow-200 text-yellow-800 rounded-lg flex items-center gap-1"
                        @click="openEdit(item)"
                      >
                        <icon name="payment" /> Billing
                      </button>

                      <!-- Procedure Receipt -->
                      <button
                        class="px-2 py-1 border rounded-lg flex items-center gap-1"
                        :class="[
                          item.payment_status === 'Paid'
                            ? 'border-blue-300 hover:bg-blue-200 text-blue-800'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed',
                        ]"
                        :disabled="item.payment_status !== 'Paid'"
                        @click="
                          item.payment_status === 'Paid' &&
                            downloadReceipt(item, 'procedure')
                        "
                      >
                        <icon name="printer" /> Print Receipt
                      </button>

                      <!-- Medication Receipt -->
                      <button
                        class="px-2 py-1 border rounded-lg flex items-center gap-1"
                        :class="[
                          item.payment_status === 'Paid'
                            ? 'border-green-300 hover:bg-green-200 text-green-800'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed',
                        ]"
                        :disabled="item.payment_status !== 'Paid'"
                        @click="
                          item.payment_status === 'Paid' &&
                            downloadReceipt(item, 'medication')
                        "
                      >
                        <icon name="printer" /> Print Medication
                      </button>

                      <!-- <button
                        class="px-2 py-1 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                        @click="deletePrescription(item)"
                      >
                        <icon name="delete" /> Delete
                      </button> -->
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="7" class="text-center py-8 text-gray-400">
                      No records found
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-gray-700">
            Showing {{ startIndex }} to {{ endIndex }} of
            {{ filteredData.length }} entries
          </div>
          <div class="flex items-center">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 bg-[#FDF5AA]-blue-800-gray-300 text-gray-700 rounded-l-md hover:bg-[#FDF5AA]-blue-800-gray-400"
            >
              &lt;
            </button>
            <span v-for="page in pageNumbers" :key="'page-' + page">
              <button
                @click="changePage(page)"
                :class="{
                  'bg-[#34699A] text-white': currentPage === page,
                  'bg-[#FDF5AA]-blue-800-gray-200 text-gray-700':
                    currentPage !== page,
                }"
                class="px-3 py-1 mx-1 rounded-md hover:bg-[#FDF5AA]-blue-800-green-300"
              >
                {{ page }}
              </button>
            </span>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 bg-[#FDF5AA]-blue-800-gray-300 text-gray-700 rounded-r-md hover:bg-[#FDF5AA]-blue-800-gray-400"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <addPrescription v-if="isAdd" @close="closeView" @refresh="loadMedications" />
  <editPrescription
    v-if="isEdit && editGroup"
    :record="editGroup.row"
    @close="closeEdit"
    @refresh="loadMedications"
  />

  <!-- PDF Preview Modal -->
  <div
    v-if="showPreview"
    class="fixed inset-0 bg-[#FDF5AA]-blue-800-black bg-[#FDF5AA]-blue-800-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-[#FDF5AA]-blue-800-white w-[80%] h-[100%] rounded-xl shadow-lg relative"
    >
      <button
        @click="closePreview"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
      >
        ✕
      </button>
      <iframe
        :src="pdfPreviewUrl"
        class="w-full h-full rounded-b-xl"
        frameborder="0"
      ></iframe>
      <div class="absolute bottom-4 right-4">
        <button
          @click="downloadPreviewPdf"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  </div>
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
import editPrescription from "../modals/view-billings.vue";

import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import dayjs from "dayjs";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import logoImage from "@/assets/img/clinic-logo.png";
import { toast } from "vue3-toastify";
import axios from "axios";

pdfMake.vfs = pdfFonts.vfs;

export default {
  name: "TableDentalChart",
  components: { icon, editPrescription },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      isAdd: false,
      isTable: true,
      showPreview: false,
      pdfPreviewUrl: null,
      pendingPdfDefinition: null,
      pendingPdfType: null, // store type for filename
      pendingPdfPatient: null, // store patient for filename
      editGroup: null,
      isEdit: false,
      groupToDelete: null,
      showDeleteModal: false,
      user: null,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications", "prices"]),

    currentUser() {
      const store = useFetchDataStore();
      return store.user || {};
    },

    filteredData() {
      const query = this.searchQuery.toLowerCase();
      if (!Array.isArray(this.medications)) return [];
      return this.medications.filter((item) => {
        const patient = item.dentalChart?.patient;
        const dentist = item.dentalChart?.user_accounts;
        const fullName = `${patient?.first_name ?? ""} ${
          patient?.middle_name ?? ""
        } ${patient?.last_name ?? ""}`.toLowerCase();
        const dentistName = `${dentist?.first_name ?? ""} ${
          dentist?.middle_name ?? ""
        } ${dentist?.last_name ?? ""}`.toLowerCase();
        return fullName.includes(query) || dentistName.includes(query);
      });
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

    groupedData() {
      if (!Array.isArray(this.paginatedData)) return [];
      return this.paginatedData.map((item) => {
        const patient = item.dentalChart?.patient;
        const dentist = item.dentalChart?.user_accounts;
        const instruction = item.prescription?.instruction;
        return {
          key: item.prescription_id,
          patient,
          dentist,
          procedure_date: this.formatScheduledDate(
            item.dentalChart?.procedure_date || item.dentalChart?.created_at,
          ),
          payment_status: item.payment_status,
          instruction,
          row: item,
          rows: [item],
        };
      });
    },
  },
  methods: {
    // ===========================
    // PDF HANDLING
    // ===========================
    downloadPreviewPdf() {
      if (!this.pendingPdfDefinition || !this.pendingPdfPatient) return;
      const fileName = this.getPdfFileName(
        this.pendingPdfType,
        this.pendingPdfPatient,
      );
      pdfMake.createPdf(this.pendingPdfDefinition).download(fileName);
    },

    getPdfFileName(type, patient) {
      const name = patient
        ? `${patient.first_name || "N/A"}_${patient.last_name || "N/A"}`
        : "Unknown_Patient";
      const date = dayjs().format("YYYY-MM-DD");
      const typeStr = type === "procedure" ? "Procedure" : "Medication";
      return `${name.replace(/\s+/g, "_")}_${typeStr}_${date}.pdf`;
    },
    async toBase64(imgPath) {
      try {
        const response = await axios.get(imgPath, {
          responseType: "blob",
          withCredentials: false,
        });

        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(response.data);
        });
      } catch (error) {
        console.error("Image load failed:", imgPath, error);
        return null;
      }
    },

    formatScheduledDate(date) {
      return date ? dayjs(date).format("MMMM DD, YYYY") : "N/A";
    },

    async downloadReceipt(group, type) {
      if (!group || (!group.rows && !group.row)) {
        toast.error("No data found for this record.");
        return;
      }

      const rows = Array.isArray(group.rows) ? group.rows : [group.row];
      const row = rows[0];
      const patient = row.dentalChart?.patient;
      const base64Logo = await this.toBase64(logoImage);
      // ===========================
      // LOAD SIGNATURE
      // ===========================

      let signatureBase64 = null;

      const dentist =
        type === "procedure"
          ? this.user
          : row?.dentalChart?.user_accounts || this.user;

      if (dentist?.signature) {
        try {
          const signatureUrl = `${process.env.VUE_APP_API_BASE_URL}/uploads/signatures/${dentist.signature}`;

          signatureBase64 = await this.toBase64(signatureUrl);
          console.log("Signature File:", dentist.signature);
          console.log("Signature URL:", signatureUrl);
          console.log("Signature Base64:", signatureBase64);
        } catch (err) {
          console.warn("Signature failed to load", err);
        }
      }
      // ===========================
      // PDF HEADER (FIXED)
      // ===========================
      const header = [
        { image: base64Logo, width: 200, alignment: "center" },
        { text: "TOOTHFORMATIONS DENTAL CLINIC", style: "clinicHeader" },
        {
          text: "PANABO POLYMEDIC HOSPITAL, INC. - GROUND FLOOR",
          style: "subTitle",
        },
        {
          stack: [
            {
              table: {
                widths: ["*", "auto", "auto", "*"],
                body: [
                  [
                    { text: "", border: [false, false, false, false] },
                    {
                      text: "Contact#: 0985-104-6429",
                      style: "receiptTitle",
                      border: [false, false, false, false],
                    },
                    {
                      text: "Telephone#: 0985-104-6429",
                      style: "receiptTitle",
                      margin: [20, 0, 0, 0],
                      border: [false, false, false, false],
                    },
                    { text: "", border: [false, false, false, false] },
                  ],
                ],
              },
              layout: "noBorders",
            },

            {
              text: "FB: TOOTHFORMATIONS DENTAL CLINIC",
              style: "receiptTitle",
              alignment: "center",
              margin: [0, 2, 0, 0],
            },
          ],
          margin: [0, 6, 0, 10],
        },
        {
          margin: [0, 8, 0, 8],
          stack: [
            // DATE ISSUED
            {
              table: {
                widths: ["auto", "*"],
                body: [
                  [
                    {
                      text: "Date Issued:",
                      style: "label",
                      border: [false, false, false, false],
                    },
                    {
                      text: dayjs().format("MMMM DD, YYYY"),
                      style: "value",
                      border: [false, false, false, false],
                    },
                  ],
                ],
              },
              layout: "noBorders",
              margin: [0, 0, 0, 6],
            },
            // PATIENT NAME / AGE & SEX
            {
              columns: [
                {
                  width: "67%",
                  table: {
                    widths: ["auto", "*"],
                    body: [
                      [
                        {
                          text: "Patient Name:",
                          style: "label",
                          border: [false, false, false, false],
                        },
                        {
                          text: `${patient?.last_name || "N/A"}, ${
                            patient?.first_name || "N/A"
                          }`,
                          style: "value",
                          border: [false, false, false, false],
                          noWrap: false,
                        },
                      ],
                    ],
                  },
                  layout: "noBorders",
                },
                {
                  width: "40%",
                  table: {
                    widths: [25, 25, 25, 35],
                    body: [
                      [
                        {
                          text: "Age:",
                          style: "label",
                          alignment: "right",
                          border: [false, false, false, false],
                        },
                        {
                          text: `${patient?.age || "N/A"}`,
                          style: "value",
                          border: [false, false, false, false],
                        },
                        {
                          text: "Sex:",
                          style: "label",
                          alignment: "right",
                          border: [false, false, false, false],
                        },
                        {
                          text: `${patient?.gender || "N/A"}`,
                          style: "value",
                          border: [false, false, false, false],
                        },
                      ],
                    ],
                  },
                  layout: "noBorders",
                },
              ],
              columnGap: 10,
            },
            // ADDRESS / STATUS
            {
              columns: [
                {
                  width: "68%",
                  table: {
                    widths: [55, "*"],
                    body: [
                      [
                        {
                          text: "Address:",
                          style: "label",
                          border: [false, false, false, false],
                        },
                        {
                          text: `${patient?.address || "N/A"}`,
                          style: "value",
                          border: [false, false, false, false],
                          noWrap: false,
                        },
                      ],
                    ],
                  },
                  layout: "noBorders",
                },
                {
                  width: "40%",
                  table: {
                    widths: [40, "*"],
                    body: [
                      [
                        {
                          text: "Status:",
                          style: "label",
                          border: [false, false, false, false],
                        },
                        {
                          text: patient?.marital_status || "N/A",
                          style: "value",
                          border: [false, false, false, false],
                        },
                      ],
                    ],
                  },
                  layout: "noBorders",
                },
              ],
              columnGap: 10,
              margin: [0, 3, 0, 0],
            },
          ],
        },
      ];

      let content = [...header];

      // ===========================
      // PROCEDURE PDF WITH PRICING_SCOPE
      // ===========================
      if (type === "procedure") {
        // Map to handle one-time procedures and per-tooth procedures
        const procedureMap = new Map();

        (row.dentalChart?.teeth || []).forEach((tooth) => {
          const proc = tooth.priceProcedure;

          if (!proc) {
            procedureMap.set(`no-proc-${tooth.tooth_number}`, {
              toothNumber: tooth.tooth_number || "N/A",
              status: "No Procedure",
              date: this.formatScheduledDate(
                row.dentalChart?.procedure_date || row.dentalChart?.created_at,
              ),
              pricingScope: "-",
              price: "₱0.00",
            });
            return;
          }

          // ONE TIME PROCEDURE → only 1 row with Tooth = "All"
          if (proc.pricing_scope === "one_time") {
            if (!procedureMap.has(proc.price_procedure_id)) {
              procedureMap.set(proc.price_procedure_id, {
                toothNumber: "All",
                status: proc.procedure_name || "Unknown",
                date: this.formatScheduledDate(
                  row.dentalChart?.procedure_date ||
                    row.dentalChart?.created_at,
                ),
                pricingScope: "ONE TIME",
                price: `₱${Number(proc.price || 0).toFixed(2)}`,
              });
            }
            return;
          }

          // PER TOOTH PROCEDURE
          procedureMap.set(`${proc.price_procedure_id}-${tooth.tooth_number}`, {
            toothNumber: tooth.tooth_number || "N/A",
            status: proc.procedure_name || "Unknown",
            date: this.formatScheduledDate(
              row.dentalChart?.procedure_date || row.dentalChart?.created_at,
            ),
            pricingScope: "PER TOOTH PAYMENT",
            price: `₱${Number(proc.price || 0).toFixed(2)}`,
          });
        });

        const procedures = Array.from(procedureMap.values());

        // Total & Excess
        const totalProcedurePrice = procedures.reduce(
          (sum, p) => sum + (parseFloat(p.price.replace(/[₱,]/g, "")) || 0),
          0,
        );
        const excessPayment = Number(
          row.excess_payment || row.prescription?.excess_payment || 0,
        );

        // Procedure Table
        content.push({ text: "Procedure Details", style: "sectionTitle" });
        content.push({
          style: "tableStyle",
          table: {
            headerRows: 1,
            widths: ["auto", "*", "*", "*", "auto"],
            body: [
              [
                { text: "Tooth", style: "tableHeader" },
                { text: "Procedure", style: "tableHeader" },
                { text: "Date", style: "tableHeader" },
                { text: "Pricing Scope", style: "tableHeader" },
                { text: "Price", style: "tableHeader" },
              ],
              ...procedures.map((p) => [
                p.toothNumber,
                { text: p.status, bold: true, alignment: "center" },
                { text: p.date, alignment: "center" },
                { text: p.pricingScope, alignment: "center" },
                { text: p.price, alignment: "right" },
              ]),
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#E8F5E9" : null),
          },
        });

        // Excess Payment
        content.push({ text: "Excess Payment", style: "sectionTitle" });
        content.push({
          style: "tableStyle",
          table: {
            headerRows: 1,
            widths: ["*", "auto"],
            body: [
              [
                {
                  text: "Description",
                  style: "tableHeader",
                  alignment: "left",
                },
                { text: "Amount", style: "tableHeader", alignment: "right" },
              ],
              [
                { text: "Excess / Additional Charges", alignment: "left" },
                {
                  text: `₱${excessPayment.toFixed(2)}`,
                  alignment: "right",
                  bold: true,
                },
              ],
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#FFF3E0" : null),
          },
        });

        const grandTotal = totalProcedurePrice + excessPayment;
        content.push({
          text: `Grand Total Payment: ₱${grandTotal.toFixed(2)}`,
          style: "grandTotalText",
        });
      }

      // ===========================
      // MEDICATION PDF
      // ===========================
      else if (type === "medication") {
        const meds = (row.prescribedMedications || []).map((med) => {
          const cleanName = (med.name || "Unnamed")
            .replace(/\bpcs\b/gi, "")
            .trim();

          const dosage = med.dosage ? med.dosage : "";

          return {
            name: `${cleanName} ${dosage}`.trim(),
            qty: med.pcs || 0,
            instruction: med.med_instruction || "N/A",
          };
        });

        // RX symbol
        content.push({
          text: "Rx",
          fontSize: 20,
          bold: true,
          margin: [0, 10, 0, 10],
        });

        meds.forEach((med, index) => {
          content.push({
            margin: [0, 6, 0, 8],
            stack: [
              // Medication name
              {
                columns: [
                  {
                    width: "*",
                    text: `${index + 1}: ${med.name}`,
                    fontSize: 12,
                    bold: true,
                  },
                  {
                    width: "auto",
                    text: `#${med.qty}`,
                    fontSize: 12,
                    bold: true,
                    alignment: "right",
                  },
                ],
              },

              // Instruction
              {
                text: `Sig: ${med.instruction}`,
                fontSize: 11,
                margin: [20, 2, 0, 0],
              },
            ],
          });
        });
      } // ===========================
      // SIGNATURE BLOCK
      // ===========================
      content.push({
        margin: [0, 50, 0, 0], // smaller spacing
        columns: [
          { width: "*", text: "" },

          {
            width: 200,
            alignment: "center",
            stack: [
              ...(signatureBase64
                ? [
                    {
                      image: signatureBase64,
                      width: 60,
                      alignment: "center",
                      margin: [0, 0, 0, 5],
                    },
                  ]
                : []),

              {
                text: dentist
                  ? `${dentist.last_name}, ${dentist.first_name}`
                  : "N/A",
                bold: true,
                alignment: "center",
                fontSize: 11,
                decoration: "underline",
              },
              {
                text: dentist?.license_no
                  ? `License No: ${dentist.license_no}`
                  : "Receptionist",
                fontSize: 10,
                alignment: "center",
              },
            ],
          },
        ],
      });
      const docDefinition = {
        pageSize: "A5",
        pageOrientation: "portrait",
        pageMargins: [25, 5, 25, 40],

        content,

        styles: {
          clinicHeader: {
            fontSize: 16,
            alignment: "center",
            color: "#2E7D32",
            bold: true,
          },

          subTitle: {
            fontSize: 10,
            alignment: "center",
            color: "#555",
          },

          receiptTitle: {
            fontSize: 8,
            alignment: "center",
            color: "#555",
          },

          label: {
            fontSize: 9,
            color: "#000000",
          },

          value: {
            fontSize: 10,
            bold: true,
          },

          sectionTitle: {
            fontSize: 11,
            bold: true,
            color: "#1B5E20",
            margin: [0, 8, 0, 4],
          },

          tableStyle: {
            margin: [0, 4, 0, 8],
            fontSize: 9,
          },

          tableHeader: {
            fillColor: "#C8E6C9",
            bold: true,
            color: "#1B5E20",
            alignment: "center",
          },

          grandTotalText: {
            alignment: "right",
            bold: true,
            fontSize: 11,
            color: "#2E7D32",
            margin: [0, 6, 0, 10],
          },
        },
      };

      this.pendingPdfDefinition = docDefinition;
      this.pendingPdfType = type;
      this.pendingPdfPatient = patient;

      pdfMake.createPdf(docDefinition).getDataUrl((dataUrl) => {
        this.pdfPreviewUrl = dataUrl;
        this.showPreview = true;
      });
    },
    // ===========================
    // USER FETCH
    // ===========================
    async fetchUser() {
      try {
        // Ensure API base URL comes from environment variables
        const baseUrl = process.env.VUE_APP_API_BASE_URL;

        // Make request using Axios
        const response = await axios.get(`${baseUrl}/auth/me`, {
          withCredentials: true, // keep cookies for auth
        });

        if (response.data) {
          this.user = response.data;
        } else {
          // If no user data, redirect to home
          this.$router.push("/");
          location.reload();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        this.$router.push("/");
      }
    },
    // ===========================
    // PAGINATION, MODALS
    // ===========================
    openEdit(group) {
      this.editGroup = group;
      this.isEdit = true;
    },
    closeEdit() {
      this.isEdit = false;
      this.editGroup = null;
    },
    closeView() {
      this.isAdd = false;
    },
    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },
    closePreview() {
      this.showPreview = false;
      this.pdfPreviewUrl = null;
      this.pendingPdfDefinition = null;
    },
    async deletePrescription(group) {
      this.groupToDelete = group;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      if (!this.groupToDelete) return;
      try {
        for (const row of this.groupToDelete.rows) {
          const id = row.prescription_id;
          await axios.delete(
            process.env.VUE_APP_API_BASE_URL + `/prescription/delete/${id}`,
          );
        }
        toast.success("Prescription(s) deleted successfully.");
        await this.loadMedications();
      } catch (error) {
        toast.error("Failed to delete prescription(s).");
        console.error(error);
      } finally {
        this.showDeleteModal = false;
        this.groupToDelete = null;
      }
    },

    async loadMedications() {
      const store = useFetchDataStore();
      await store.fetchMedications();
    },
    async loadPrices() {
      const store = useFetchDataStore();
      await store.fetchPrices();
    },
  },
  mounted() {
    this.fetchUser();
    this.loadMedications();
    this.loadPrices();
  },
};
</script>
