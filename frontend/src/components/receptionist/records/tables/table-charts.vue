<template>
  <div v-if="isTable">
    <!-- Header -->
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">
        Pages / Dental Charts
      </div>
      <div
        v-if="loggedUser?.role === 'Dentist'"
        @click="toggleAdd"
        class="flex items-center gap-2 px-4 py-2 border text-green-600 border-green-600 rounded-xl hover:bg-green-700 hover:shadow-lg cursor-pointer transition duration-200"
      >
        <div
          class="p-1 bg-[#34699A] bg-opacity-20 rounded-full flex items-center justify-center"
        >
          <icon :name="'add-account1.1'" class="w-4 h-4" />
        </div>
        <span class="font-medium text-sm text-green-600">Add Dental Chart</span>
      </div>
    </div>

    <!-- Dental Chart Table -->
    <div class="text-[14px] bg-white rounded-xl mt-4">
      <div class="overflow-x-auto border p-2 rounded-xl">
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
                  <th
                    class="w-10 px-4 py-2 text-left font-normal rounded-tl-lg"
                  >
                    No.
                  </th>
                  <th class="px-4 py-2 text-left font-normal">Dentist</th>
                  <th class="px-4 py-2 text-left font-normal">Patient</th>
                  <th class="px-4 py-2 text-left font-normal rounded-tr-lg">
                    History
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-if="groupedData.length">
                  <tr
                    v-for="(group, index) in groupedData"
                    :key="group.patient.patient_id"
                    class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
                  >
                    <td class="px-4 py-2">{{ getRowIndex(0, index) }}</td>

                    <td class="px-4 py-2">
                      Dr. {{ group.rows[0].user_accounts?.last_name }},
                      {{ group.rows[0].user_accounts?.first_name }}
                    </td>

                    <td class="px-4 py-2">
                      {{ group.patient?.last_name }},
                      {{ group.patient?.first_name }}
                    </td>

                    <td class="px-4 py-2 flex gap-2">
                      <!-- View History -->
                      <button
                        class="px-3 py-1 h-8 border border-blue-300 hover:bg-blue-200 text-blue-800 rounded-lg flex items-center gap-1.5"
                        @click="viewHistory(group.patient.patient_id)"
                      >
                        <icon name="list" /> History
                      </button>

                      <!-- Edit Dental Chart -->
                      <button
                        v-if="loggedUser?.role === 'Dentist'"
                        class="px-3 py-1 h-8 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                        @click="editDentalChart(group.patient.patient_id)"
                      >
                        <icon name="edit" /> Edit</button
                      ><!-- Delete Dental Chart -->
                      <!-- <button
                        v-if="loggedUser?.role === 'Dentist'"
                        class="px-3 py-1 h-8 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                        @click="deleteDentalChart(group.patient.patient_id)"
                      >
                        <icon name="delete" /> Delete
                      </button> -->
                    </td>
                  </tr>
                </template>

                <template v-else>
                  <tr>
                    <td colspan="6" class="text-center py-8 text-gray-400">
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

  <!-- Procedure Selection Modal -->
  <selectProcedure
    v-if="isSelectProcedure"
    :procedures="proceduresToSelect"
    @close="isSelectProcedure = false"
    @select="onProcedureSelected"
  />

  <!-- Add / Edit Dental Chart Modal -->
  <addDentalChart
    v-if="isAdd"
    :editMode="isEdit"
    :existingData="editData"
    @close="closeView"
    @refresh="loadDentalCharts"
  />

  <!-- View Dental History -->
  <viewDentalHistory
    v-if="isViewHistory"
    :patientId="selectedPatientId"
    @close="isViewHistory = false"
    @refresh="loadDentalCharts"
  />
</template>

<script>
import icon from "@/assets/icon.vue";
import addDentalChart from "../modals/add-dental-chart.vue";
import selectProcedure from "../modals/select-procedure.vue";
import viewDentalHistory from "../modals/view-dental-history.vue";
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import axios from "axios";

export default {
  name: "TableDentalChart",
  components: { icon, addDentalChart, viewDentalHistory, selectProcedure },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      isAdd: false,
      isTable: true,
      isEdit: false,
      editData: null,
      selectedPatientId: null,
      isViewHistory: false,
      isSelectProcedure: false,
      proceduresToSelect: [],
      loggedUser: null,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["dentalCharts"]),
    filteredData() {
      if (!this.dentalCharts || !Array.isArray(this.dentalCharts)) return [];
      const query = this.searchQuery.toLowerCase();
      let data =
        this.loggedUser?.role === "Dentist"
          ? this.dentalCharts.filter(
              (item) => item.user_accounts?.user_id === this.loggedUser.sub,
            )
          : this.dentalCharts;
      return data.filter((item) => {
        const fullName = `${item.patient?.first_name ?? ""} ${
          item.patient?.middle_name ?? ""
        } ${item.patient?.last_name ?? ""}`.toLowerCase();
        const dentistName = `${item.user_accounts?.first_name ?? ""} ${
          item.user_accounts?.middle_name ?? ""
        } ${item.user_accounts?.last_name ?? ""}`.toLowerCase();
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
      return Math.min(
        this.currentPage * this.itemsPerPage,
        this.filteredData.length,
      );
    },
    pageNumbers() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    },
    tableHeightClass() {
      return this.paginatedData.length <= 10 ? "h-auto" : "h-[65vh]";
    },
    groupedData() {
      const map = new Map();
      this.paginatedData.forEach((item) => {
        const pid = item.patient?.patient_id;
        if (!map.has(pid))
          map.set(pid, { patient: item.patient, rows: [item] });
        else map.get(pid).rows.push(item);
      });
      return Array.from(map.values());
    },
  },
  methods: {
    async fetchUser() {
      try {
        const { data } = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          { withCredentials: true },
        );
        this.loggedUser = data;
      } catch (err) {
        console.error("Fetch user error:", err);
      }
    },
    async loadDentalCharts() {
      const store = useFetchDataStore();
      await store.fetchDentalChart();
    },
    toggleAdd() {
      this.isAdd = true;
      this.isEdit = false;
      this.editData = null;
    },
   editDentalChart(patientId) {
  const records = this.dentalCharts.filter(
    (item) => item.patient?.patient_id === patientId,
  );

  const proceduresByDate = {};
  records.forEach((item) => {
    const date = item.procedure_date;
    if (!proceduresByDate[date]) proceduresByDate[date] = [];
    proceduresByDate[date].push(item);
  });

  const multipleProcedures = Object.values(proceduresByDate).filter(
    (arr) => arr.length > 1,
  );

  if (multipleProcedures.length > 0) {
    this.proceduresToSelect = multipleProcedures.flat();
    this.isSelectProcedure = true;
  } else {
    const editableRecord = JSON.parse(JSON.stringify(records[0]));
    editableRecord.inventoryDeducted = false;

    this.editData = editableRecord;
    this.isEdit = true;
    this.isAdd = true;
  }
},
    // async deleteDentalChart(patientId) {
    //   const confirmed = confirm(
    //     "Are you sure you want to delete all dental chart records for this patient?"
    //   );
    //   if (!confirmed) return;

    //   try {
    //     // Loop through all dental chart records for this patient
    //     const recordsToDelete = this.dentalCharts.filter(
    //       (item) => item.patient?.patient_id === patientId
    //     );

    //     for (const record of recordsToDelete) {
    //       await axios.delete(
    //         `${process.env.VUE_APP_API_BASE_URL}/dental-chart/${record.dental_id}`,
    //         { withCredentials: true }
    //       );
    //     }

    //     // Reload table after deletion
    //     await this.loadDentalCharts();
    //     alert("Dental chart records deleted successfully.");
    //   } catch (err) {
    //     console.error("❌ Delete dental chart failed:", err);
    //     alert("Failed to delete dental chart records.");
    //   }
    // },
    onProcedureSelected(procedure) {
      this.editData = procedure;
      this.isEdit = true;
      this.isAdd = true;
      this.isSelectProcedure = false;
    },
    closeView() {
      this.isAdd = false;
      this.isEdit = false;
      this.editData = null;
    },
    viewHistory(patientId) {
      this.selectedPatientId = patientId;
      this.isViewHistory = true;
    },
    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },
    getRowIndex(indexInGroup, groupIndex) {
      let offset = 0;
      for (let i = 0; i < groupIndex; i++)
        offset += this.groupedData[i].rows.length;
      return this.startIndex + offset + indexInGroup;
    },
  },
  async mounted() {
    await this.fetchUser();
    await this.loadDentalCharts();
  },
};
</script>
