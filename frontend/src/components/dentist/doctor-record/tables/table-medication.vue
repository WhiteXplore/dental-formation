<template>
  <div v-if="isTable">
    <!-- Header -->
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">
        Pages / Prescription
      </div>
      <div
        @click="toggleAdd"
        class="flex items-center gap-2 px-4 py-2 border text-green-600 border-green-600 rounded-xl hover:bg-green-700 hover:text-white hover:shadow-lg cursor-pointer transition duration-200"
      >
        <div
          class="p-1 bg-[#34699A] bg-opacity-20 rounded-full flex items-center justify-center"
        >
          <icon :name="'add-account1.1'" class="w-4 h-4" />
        </div>
        <span class="font-medium text-sm">Add Prescriptions</span>
      </div>
    </div>

    <!-- Table Wrapper -->
    <div class="text-[14px] bg-white rounded-xl">
      <div class="mt-4 overflow-x-auto border p-2 rounded-xl">
        <!-- Table Controls -->
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

        <!-- Table Content -->
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

                  <th class="px-4 py-2 text-left font-normal rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="(group, groupIndex) in groupedData"
                  :key="
                    group.patient?.patient_id ||
                    group.rows[0]?.prescription_id ||
                    groupIndex
                  "
                >
                  <tr
                    v-for="(row, rowIndex) in group.rows"
                    :key="row.prescription_id || rowIndex"
                    class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
                  >
                    <td class="px-4 py-2">
                      {{ getRowIndex(rowIndex, groupIndex) }}
                    </td>
                    <td class="px-4 py-2">
                      {{
                        row.dentalChart?.patient
                          ? `${row.dentalChart.patient.last_name}, ${row.dentalChart.patient.first_name}`
                          : "N/A"
                      }}
                    </td>
                    <td class="px-4 py-2">
                      Dr.
                      {{
                        row.dentalChart?.user_accounts
                          ? `${row.dentalChart.user_accounts.last_name}, ${row.dentalChart.user_accounts.first_name}`
                          : "N/A"
                      }}
                    </td>
                    <td class="px-4 py-2 whitespace-pre-wrap break-words">
                      {{ formatScheduledDate(row.dentalChart?.procedure_date) }}
                    </td>
                    <td class="px-4 py-2 flex gap-2">
                      <button
                        class="px-2 py-1 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                        @click="editPrescription(row)"
                      >
                        <icon name="edit" /> Edit
                      </button>
                      <button
                        v-if="row.prescription_id"
                        class="px-2 py-1 border border-blue-300 hover:bg-blue-200 text-blue-800 rounded-lg flex items-center gap-1"
                        @click="viewMedication(row.prescription_id)"
                      >
                        <icon name="eye" /> View
                      </button>

                      <button
                        class="px-2 py-1 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                        @click="toggleDelete(row)"
                      >
                        <icon name="delete" /> Delete
                      </button>
                    </td>
                  </tr>
                </template>

                <!-- No data row -->
                <tr v-if="groupedData.length === 0">
                  <td colspan="6" class="text-center py-8 text-gray-400">
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
            Showing {{ startIndex }} to {{ endIndex }} of
            {{ filteredData.length }} entries
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
                  'bg-[#34699A] text-white': currentPage === page,
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

  <!-- Modals -->
  <addPrescription v-if="isAdd" @close="closeView" @refresh="loadMedications" />
  <editPrescription
    v-if="isEdit && editGroup"
    :prescription="editGroup"
    :isEdit="true"
    @close="closeEdit"
    @refresh="loadMedications"
  />

  <viewMedication
    v-if="isViewMedication"
    :prescriptionId="selectedPrescriptionId"
    @close="isViewMedication = false"
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
        @click="
          () => {
            showDeleteModal = false;
            selectedPrescriptionToDelete = null;
          }
        "
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
import addPrescription from "../modals/add-prescription.vue";
import editPrescription from "../modals/edit-prescription.vue";
import viewMedication from "../modals/view-medication.vue";
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import dayjs from "dayjs";
import axios from "axios";

export default {
  name: "TableDentalChart",
  components: { icon, addPrescription, editPrescription, viewMedication },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      isAdd: false,
      isTable: true,
      editGroup: null,
      isEdit: false,
      isViewMedication: false,
      selectedPrescriptionId: null,
      user: null, // Store logged-in user
      showDeleteModal: false,
      selectedPrescriptionToDelete: null,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    filteredData() {
      const query = this.searchQuery.toLowerCase();

      if (!this.user || !Array.isArray(this.medications)) {
        return [];
      }

      return this.medications.filter((item) => {
        const dentist = item.dentalChart?.user_accounts;

        const dentistFullName = `${dentist?.first_name || ""} ${
          dentist?.middle_name || ""
        } ${dentist?.last_name || ""}`.toLowerCase();

        const matchesSearch = query === "" || dentistFullName.includes(query);

        const isSameUser = dentist?.user_id === this.user.sub;

        return matchesSearch && isSameUser;
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
      const grouped = [];
      const patientMap = new Map();

      this.paginatedData.forEach((item) => {
        const pid = item.patient?.patient_id;
        if (!patientMap.has(pid)) {
          patientMap.set(pid, {
            patient: item.patient,
            rows: [item],
          });
        } else {
          patientMap.get(pid).rows.push(item);
        }
      });

      patientMap.forEach((value) => {
        grouped.push(value);
      });

      return grouped;
    },
  },

  methods: {
    viewMedication(prescriptionId) {
      this.selectedPrescriptionId = prescriptionId;
      this.isViewMedication = true;
    },

    formatScheduledDate(date) {
      return date ? dayjs(date).format("MMMM DD, YYYY") : "N/A";
    },

    hasMultipleDates(rows) {
      if (!rows || rows.length === 0) return false;
      const firstDate = this.formatScheduledDate(
        rows[0].dentalChart?.created_at
      );
      return rows.some(
        (r) => this.formatScheduledDate(r.dentalChart?.created_at) !== firstDate
      );
    },
    toggleAdd() {
      this.isAdd = true;
    },
    toggleDelete(row) {
      this.selectedPrescriptionToDelete = row; // store the selected row
      this.showDeleteModal = true; // show modal
    },
    async confirmDelete() {
      if (!this.selectedPrescriptionToDelete) return;

      try {
        await axios.delete(
          `http://localhost:8000/prescription/delete/${this.selectedPrescriptionToDelete.prescription_id}`
        );

        // Hide modal and refresh
        this.showDeleteModal = false;
        this.selectedPrescriptionToDelete = null;
        await this.loadMedications();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },

    closeView() {
      this.isAdd = false;
    },

    editPrescription(prescription) {
      console.log("EDITING PRESCRIPTION:", prescription);
      this.editGroup = prescription; // still using same variable name
      this.isEdit = true;
    },
    closeEdit() {
      this.isEdit = false;
      this.editGroup = null;
    },

    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },

    getRowIndex(indexInGroup, groupIndex) {
      let offset = 0;
      for (let i = 0; i < groupIndex; i++) {
        offset += this.groupedData[i].rows.length;
      }
      return this.startIndex + offset + indexInGroup;
    },

    openMedication(id) {
      if (!id) return;
      this.selectedPrescriptionId = id;
      this.isViewMedication = true;
    },

    async loadMedications() {
      const store = useFetchDataStore();
      await store.fetchMedications();
    },

    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          this.user = response.data;
          console.log("Authenticated User:", this.user);
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

  async mounted() {
    await this.fetchUser();
    await this.loadMedications();

    console.log(
      "Matching Records for Logged-in User:",
      this.medications.filter(
        (item) => item.user_accounts?.user_id === this.user?.sub
      )
    );
  },
};
</script>
