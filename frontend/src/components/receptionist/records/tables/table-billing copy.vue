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
                  <th class="px-4 py-2 text-left font-normal rounded-tl-lg">
                    #
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
                        @click="editPrescription(item)"
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
                        <icon name="printer" /> Print Procedure
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

                      <button
                        class="px-2 py-1 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                        @click="deletePrescription(item)"
                      >
                        <icon name="delete" /> Delete
                      </button>
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
          class="px-4 py-2 bg-[#FDF5AA]-blue-800-green-600 text-white rounded hover:bg-[#FDF5AA]-blue-800-green-700"
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
import logoImage from "@/assets/img/clinic-logo.vue.png";
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

    tableHeightClass() {
      return this.paginatedData.length <= 10 ? "h-auto" : "h-[65vh]";
    },

    groupedData() {
      if (!Array.isArray(this.paginatedData)) return [];
      return this.paginatedData.map((item) => {
        const patient = item.dentalChart?.patient;
        const dentist = item.dentalChart?.user_accounts;
        return {
          key: item.prescription_id,
          patient,
          dentist,
          procedure_date: this.formatScheduledDate(
            item.dentalChart?.procedure_date || item.dentalChart?.created_at
          ),
          payment_status: item.payment_status,
          row: item,
          rows: [item], // for consistent structure
        };
      });
    },
  },
  methods: {
    async toBase64(imgPath) {
      const response = await fetch(imgPath);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    },

    getProcedureNameFromStatus(status) {
      const match = this.prices.find(
        (p) => String(p.price_procedure_id) === String(status)
      );
      return match ? match.procedure_name : "Unknown Procedure";
    },

    formatScheduledDate(date) {
      return date ? dayjs(date).format("MMMM DD, YYYY") : "N/A";
    },

    async loadMedications() {
      const store = useFetchDataStore();
      await store.fetchMedications();
    },

    async loadPrices() {
      const store = useFetchDataStore();
      await store.fetchPrices();
      console.log("Loaded prices:", store.prices);
    },

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
          await axios.delete(`http://localhost:8000/prescription/delete/${id}`);
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

    async downloadReceipt(group, type) {
      if (!group || (!group.rows && !group.row)) {
        toast.error("No data found for this record.");
        return;
      }

      const rows = Array.isArray(group.rows) ? group.rows : [group.row];
      const row = rows[0];
      const patient = row.dentalChart?.patient;

      const base64Logo = await this.toBase64(logoImage);

      // Header
      const header = [
        { image: base64Logo, width: 100, alignment: "center" },
        { text: "PANABO POLYMEDIC HOSPITAL, INC.", style: "clinicHeader" },
        { text: "Qurino St. Brgy. Gredu, Panabo City", style: "receiptTitle" },
        {
          text: "E-mail: panabopolymedic2002@yahoo.com",
          style: "receiptTitle",
        },
        { text: "telefax: (D84) 823-0581", style: "receiptTitle" },
        {
          margin: [0, 10, 0, 10],
          columns: [
            {
              stack: [
                { text: "Patient Name", style: "label" },
                {
                  text: `${patient?.last_name || "N/A"}, ${
                    patient?.first_name || "N/A"
                  }`,
                  style: "value",
                },
              ],
            },
            {
              stack: [
                { text: "Date", style: "label", alignment: "right" },
                {
                  text: dayjs().format("MMMM DD, YYYY"),
                  style: "value",
                  alignment: "right",
                },
              ],
            },
          ],
        },
      ];

      let content = [...header];
      let fileName = "";

      if (type === "procedure") {
        const procedures =
          row.dentalChart?.teeth?.map((tooth) => {
            const proc = tooth.priceProcedure;
            return {
              toothNumber: tooth.tooth_number || "N/A",
              status: proc?.procedure_name || "Unknown",
              date: this.formatScheduledDate(
                row.dentalChart?.procedure_date || row.dentalChart?.created_at
              ),
              price: proc ? `₱${parseFloat(proc.price).toFixed(2)}` : "₱0.00",
            };
          }) || [];

        const totalProcedurePrice = procedures.reduce(
          (sum, p) => sum + (parseFloat(p.price.replace(/[₱,]/g, "")) || 0),
          0
        );

        content.push({ text: "Procedure Details", style: "sectionTitle" });
        content.push({
          style: "tableStyle",
          table: {
            headerRows: 1,
            widths: ["auto", "*", "*", "auto"],
            body: [
              [
                { text: "Tooth", style: "tableHeader" },
                { text: "Procedure", style: "tableHeader" },
                { text: "Date", style: "tableHeader" },
                { text: "Price", style: "tableHeader" },
              ],
              ...procedures.map((p) => [
                p.toothNumber,
                { text: p.status, bold: true },
                { text: p.date, alignment: "right" },
                { text: p.price, alignment: "right" },
              ]),
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#E8F5E9" : null),
          },
        });

        content.push({
          text: `Total Procedure Cost: ₱${totalProcedurePrice.toFixed(2)}`,
          style: "grandTotalText",
        });
        fileName = "procedure_receipt.pdf";
      } else if (type === "medication") {
        const meds =
          row.prescribedMedications?.map((med) => {
            const inv = med.inventory || {};
            const dosage = inv.dosage
              ? `${inv.dosage} ${inv.unit || ""}`
              : "N/A";
            const price = parseFloat(inv.price_per_unit || 0);
            const total = price * med.pcs;
            return {
              name: `${inv.name || "Unnamed"} - ${dosage}`,
              pcs: med.pcs,
              price_per_unit: `₱${price.toFixed(2)}`,
              total: `₱${total.toFixed(2)}`,
            };
          }) || [];

        const totalMeds = meds.reduce(
          (sum, m) => sum + (parseFloat(m.total.replace(/[₱,]/g, "")) || 0),
          0
        );

        content.push({ text: "Prescribed Medications", style: "sectionTitle" });
        content.push({
          style: "tableStyle",
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: [
              [
                { text: "Medicine", style: "tableHeader" },
                { text: "Qty", style: "tableHeader" },
                // { text: "Unit Price", style: "tableHeader" },
                // { text: "Total", style: "tableHeader" },
              ],
              ...meds.map((m) => [
                m.name,
                { text: m.pcs.toString(), alignment: "center" },
                // { text: m.price_per_unit, alignment: "right" },
                // { text: m.total, alignment: "right" },
              ]),
            ],
          },
          layout: "lightHorizontalLines",
        });

        content.push({
          text: `Total Medication Cost: ₱${totalMeds.toFixed(2)}`,
          style: "grandTotalText",
        });
        fileName = "medication_receipt.pdf";
      }

      // Footer
      const footerName =
        type === "procedure"
          ? this.user && this.user.first_name && this.user.last_name
            ? `${this.user.last_name}, ${this.user.first_name}`
            : "N/A"
          : row.dentalChart?.user_accounts
          ? `${row.dentalChart.user_accounts.last_name}, ${row.dentalChart.user_accounts.first_name}`
          : "N/A";

      const footerRole =
        type === "procedure"
          ? this.user?.role || this.user?.position || "Receptionist"
          : "Attending Dentist";

      content.push({
        margin: [0, 40, 0, 0],
        columns: [
          { width: "*", text: "" },
          {
            width: "auto",
            stack: [
              {
                text: footerName,
                bold: true,
                decoration: "underline",
                alignment: "right",
              },
              {
                text: footerRole,
                fontSize: 10,
                color: "#555",
                alignment: "right",
              },
            ],
          },
        ],
      });

      const docDefinition = {
        pageSize: "LETTER",
        pageMargins: [40, 20, 40, 40],
        content,
        styles: {
          clinicHeader: {
            fontSize: 20,
            bold: true,
            alignment: "center",
            color: "#2E7D32",
          },
          receiptTitle: { fontSize: 10, alignment: "center", color: "#555" },
          label: { fontSize: 10, color: "#888" },
          value: { fontSize: 11, bold: true },
          sectionTitle: {
            fontSize: 12,
            bold: true,
            color: "#1B5E20",
            margin: [0, 10, 0, 5],
          },
          tableStyle: { margin: [0, 5, 0, 10], fontSize: 10 },
          tableHeader: {
            fillColor: "#C8E6C9",
            bold: true,
            color: "#1B5E20",
            alignment: "center",
          },
          grandTotalText: {
            alignment: "right",
            bold: true,
            fontSize: 12,
            color: "#2E7D32",
            margin: [0, 8, 0, 14],
          },
        },
      };

      this.pendingPdfDefinition = docDefinition;

      // Show preview first
      pdfMake.createPdf(docDefinition).getDataUrl((dataUrl) => {
        this.pdfPreviewUrl = dataUrl;
        this.showPreview = true;
      });

      // Download PDF
      pdfMake.createPdf(docDefinition).download(fileName);
    },

    async fetchUser() {
      try {
        const host = window.location.hostname;
        this.apiBaseUrl = `http://${host}:8000`;
        const response = await axios.get(`${this.apiBaseUrl}/auth/me`, {
          withCredentials: true,
        });

        if (response.data) {
          this.user = response.data;
          console.log("Fetched user:", this.user);
        } else {
          this.$router.push("/");
          location.reload();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        this.$router.push("/");
      }
    },
  },
  mounted() {
    this.fetchUser();
    this.loadMedications();
    this.loadPrices();
  },
};
</script>
