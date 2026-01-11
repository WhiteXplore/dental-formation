<template>
  <div v-if="isTable">
    <!-- Header -->
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">
        Pages / Dental Chart
      </div>
      <div
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
                  <th class="px-4 py-2 text-left font-normal">
                    Tooth & Status
                  </th>
                  <th class="px-4 py-2 text-left font-normal">
                    Procedure Date(s)
                  </th>
                  <th class="px-4 py-2 text-left font-normal">Dentist</th>
                  <th class="px-4 py-2 text-left font-normal">Patient</th>

                  <th class="px-4 py-2 text-left font-normal rounded-tr-lg">
                    History
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-if="groupedData.length > 0">
                  <tr
                    v-for="(group, index) in groupedData"
                    :key="group.patient.patient_id"
                    class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
                  >
                    <td class="px-4 py-2">{{ getRowIndex(0, index) }}</td>

                    <td class="px-4 py-2">
                      <div class="whitespace-pre-wrap break-words">
                        {{
                          group.rows
                            .flatMap((r) =>
                              (r.teeth || []).map(
                                (t) => `${t.tooth_number} - ${t.status}`
                              )
                            )
                            .join(", ")
                        }}
                      </div>
                    </td>

                    <td class="px-4 py-2">
                      <div class="whitespace-pre-wrap break-words">
                        {{
                          hasMultipleDates(group.rows)
                            ? group.rows
                                .map((r) =>
                                  formatScheduledDate(r.procedure_date)
                                )
                                .join(", ")
                            : formatScheduledDate(group.rows[0].procedure_date)
                        }}
                      </div>
                    </td>

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
                        class="px-3 py-1 h-8 border border-yellow-400 hover:bg-yellow-200 text-yellow-800 rounded-lg flex items-center gap-1.5"
                        @click="editDentalChart(group)"
                      >
                        <icon name="edit" /> Edit
                      </button>
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

  <!-- Modals -->
  <addDentalChart v-if="isAdd" @close="closeView" @refresh="loadDentalCharts" />
  <editDentalChart
    v-if="isEdit"
    :editMode="isEdit"
    :existingData="editData"
    @close="closeView"
    @refresh="loadDentalCharts"
  />

  <viewDentalHistory
    v-if="isViewHistory"
    :patientId="selectedPatientId"
    @close="isViewHistory = false"
  />
</template>

<script>
import icon from "@/assets/icon.vue";
import addDentalChart from "../modals/add-dental-chart.vue";
import viewDentalHistory from "../modals/view-dental-history.vue";
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import dayjs from "dayjs";
import axios from "axios";

export default {
  name: "TableDentalChart",
  components: {
    icon,
    addDentalChart,
    viewDentalHistory,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      isAdd: false,
      isTable: true,
      selectedPatientId: null,
      isViewHistory: false,
      isEdit: false,
      editData: null,
      user: null, // added user here
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["dentalCharts"]),

    filteredData() {
      const query = this.searchQuery.toLowerCase();

      if (!this.user) return [];

      return this.dentalCharts.filter((item) => {
        // Use user_accounts for dentist info
        const dentistFullName = `${item.user_accounts?.first_name || ""} ${
          item.user_accounts?.middle_name || ""
        } ${item.user_accounts?.last_name || ""}`.toLowerCase();

        const matchesSearch = dentistFullName.includes(query);

        // Check if this dentist matches logged-in user
        const isSameDentist =
          item.user_accounts?.first_name === this.user.first_name &&
          item.user_accounts?.last_name === this.user.last_name;

        return matchesSearch && isSameDentist;
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
    hasMultipleDates(rows) {
      if (!rows || rows.length === 0) return false;
      const firstDate = this.formatScheduledDate(rows[0].procedure_date);
      return rows.some(
        (r) => this.formatScheduledDate(r.procedure_date) !== firstDate
      );
    },
    viewHistory(patientId) {
      this.selectedPatientId = patientId;
      this.isViewHistory = true;
    },
    formatScheduledDate(date) {
      return dayjs(date).format("MMMM DD, YYYY");
    },

    async loadDentalCharts() {
      const store = useFetchDataStore();
      await store.fetchDentalChart();
    },

    toggleAdd() {
      this.isAdd = true;
    },
    editDentalChart(group) {
      const firstChart = group.rows[0];
      this.editData = firstChart;
      this.isEdit = true;
      this.isAdd = false; // changed from true to false
    },
    closeView() {
      this.isAdd = false;
      this.isEdit = false;
      this.editData = null;
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
    await this.loadDentalCharts();
  },
};
</script>
