<template>
  <div v-if="isTable" class="p-2">
    <!-- Header Controls -->
    <div class="text-sm flex justify-between items-center mb-4">
      <div class="text-[13px] text-text font-medium">Pages / Patient List</div>

      <div
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2 border text-green-600 border-green-600 rounded-xl hover:bg-green-100 hover:shadow-lg cursor-pointer transition duration-200"
      >
        <div
          class="p-1 bg-green-100 rounded-full flex items-center justify-center"
        >
          <icon :name="'add-account1.1'" class="w-4 h-4" />
        </div>
        <span class="font-medium text-sm">Add Account</span>
      </div>
    </div>

    <!-- Table Wrapper -->
    <div class="bg-white rounded-xl shadow border p-4">
      <!-- Top controls -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div class="flex items-center gap-2">
          <select
            v-model="itemsPerPage"
            class="px-2 py-1 border border-gray-300 rounded-md text-sm"
            @change="changePage(1)"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
          <span class="text-sm text-gray-600">per page</span>
        </div>

        <!-- Search -->
        <div class="w-full md:w-[300px]">
          <input
            v-model="searchQuery"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Search..."
            @input="changePage(1)"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="mt-4 overflow-x-auto rounded-xl">
        <div
          :class="tableHeightClass"
          class="transition-all duration-300 overflow-y-auto"
        >
          <table
            class="min-w-full table-auto border-separate border-spacing-y-2 text-sm text-gray-700"
          >
            <thead class="bg-[#34699A] text-white sticky top-0 z-10">
              <tr>
                <th class="w-10 px-4 py-3 text-left rounded-tl-lg font-medium">
                  No.
                </th>
                <th class="px-4 py-2 text-left font-medium">Users</th>
                <th class="px-4 py-2 text-left font-medium">Role</th>

                <th class="w-[350px] px-4 py-2 text-center font-medium">
                  Day Scheduled
                </th>
                <th class="px-4 py-2 text-center font-medium">Status</th>
                <th class="px-4 py-2 text-center font-medium">Availability</th>
                <th class="px-4 py-2 text-center rounded-tr-lg font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(users_data, index) in paginatedData"
                :key="users_data.user_id"
                class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
              >
                <td class="px-4 py-2">{{ startIndex + index }}</td>

                <td class="px-4 py-2">
                  {{ users_data.last_name }}, {{ users_data.first_name }}
                  {{ users_data.middle_name || "" }}
                </td>

                <td class="px-4 py-2">
                  {{ users_data.role || "—" }}
                </td>

                <td
                  class="w-[350px] px-4 py-3 flex flex-wrap gap-2 justify-center"
                >
                  <template v-if="users_data.schedules?.length">
                    <span
                      v-for="s in sortSchedules(users_data.schedules)"
                      :key="s.schedule_id + '-day'"
                      class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {{ s.day }}
                    </span>
                  </template>
                  <span v-else class="text-gray-400">—</span>
                </td>

                <td class="px-2 py-1 text-center">
                  <span
                    :class="[
                      'px-3 py-1 text-xs font-semibold rounded-full',
                      users_data.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600',
                    ]"
                  >
                    {{ users_data.status || "—" }}
                  </span>
                </td>

                <td class="px-4 py-2 text-center">
                  <span
                    :class="[
                      'px-3 py-1 text-xs font-semibold rounded-full',
                      checkAvailability(users_data) === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600',
                    ]"
                  >
                    {{
                      checkAvailability(users_data) === "available"
                        ? "Available"
                        : "Not Available"
                    }}
                  </span>
                </td>

                <td class="px-4 py-2 flex justify-center">
                  <div class="flex gap-2">
                    <!-- View -->
                    <button
                      class="px-3 py-1 border border-blue-300 hover:bg-blue-200 text-blue-800 rounded-lg flex items-center gap-1"
                      @click="openViewModal(users_data)"
                    >
                      <icon name="eye" /> View
                    </button>

                    <!-- Edit -->
                    <button
                      class="px-3 py-1 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                      @click="openEditModal(users_data)"
                    >
                      <icon name="edit" /> Edit
                    </button>

                    <!-- Delete -->
                    <button
                      class="px-3 py-1 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                      @click="toggleDelete(users_data)"
                    >
                      <icon name="delete" /> Delete
                    </button>
                  </div>
                </td>
              </tr>

              <!-- No results -->
              <tr v-if="paginatedData.length === 0">
                <td colspan="6" class="text-center py-8 text-gray-400">
                  No records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div
        class="flex flex-col md:flex-row justify-between items-center mt-4 gap-4"
      >
        <div class="text-gray-600 text-sm">
          Showing {{ startIndex }} to {{ endIndex }} of
          {{ filteredData.length }} entries
        </div>

        <div class="flex items-center gap-1">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded-l-md hover:bg-gray-300"
          >
            &lt;
          </button>

          <button
            v-for="page in pageNumbers"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === page
                ? 'bg-[#34699A] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-green-300',
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Add User Modal -->
  <addUsers v-if="isAdd" @close="closeAdd" @refresh="loadUsers" />

  <!-- Edit User Modal -->
  <addUsers
    v-if="isEdit"
    :user="selectedpatient"
    @close="closeEdit"
    @refresh="loadUsers"
  />

  <!-- Delete Modal -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  ></div>

  <div
    v-if="showDeleteModal"
    class="rounded-xl shadow-lg w-[300px] md:w-[400px] bg-white py-6 px-4 flex flex-col items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
  >
    <div
      class="rounded-full w-16 h-16 flex justify-center items-center bg-red-300 animate-pulse"
    >
      <icon name="question" class="w-10 h-10 text-white" />
    </div>

    <h1 class="text-[16px] font-semibold mt-4">Delete Confirmation</h1>

    <p class="mt-2 text-[13px] text-center px-8">
      Are you sure you want to delete this record? This action cannot be undone.
    </p>

    <div class="w-full h-[1px] bg-gray-200 mt-4"></div>

    <div class="tracking-wide flex gap-2 mt-4">
      <button
        class="bg-red-400 p-2 px-3 text-[13px] rounded-md text-white hover:bg-white border hover:border-red-800 hover:text-red-800"
        @click="showDeleteModal = false"
      >
        No, Cancel
      </button>

      <button
        class="bg-green-400 p-2 px-3 text-[13px] rounded-md text-white hover:bg-white border hover:border-green-800 hover:text-green-800"
        @click="confirmDelete"
      >
        Yes, Delete
      </button>
    </div>
  </div>
  <!-- View User Modal -->
  <div
    v-if="isView"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-white w-[95%] sm:w-[520px] rounded-2xl shadow-xl overflow-hidden"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Avatar -->
          <div
            class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold"
          >
            {{ selectedUser.first_name?.charAt(0) }}
          </div>

          <div>
            <h2 class="text-base font-semibold text-gray-800">
              {{ selectedUser.first_name }} {{ selectedUser.last_name }}
            </h2>
            <p class="text-xs text-gray-500">
              {{ selectedUser.role || "User" }}
            </p>
          </div>
        </div>

        <button
          class="text-gray-400 hover:text-red-500 transition"
          @click="closeViewModal"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-6 text-sm text-gray-700">
        <!-- Account Info -->
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase mb-3">
            Account Information
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500">Email</p>
              <p class="font-medium break-all">
                {{ selectedUser.email }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-500">Status</p>
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  selectedUser.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600',
                ]"
              >
                {{ selectedUser.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Professional Info -->
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase mb-3">
            Professional Details
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500">License No</p>
              <p class="font-medium">
                {{ selectedUser.license_no || "—" }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-500">PRC Type</p>
              <p class="font-medium">
                {{ selectedUser.prc_type || "—" }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-500">Availability</p>
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  checkAvailability(selectedUser) === 'available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600',
                ]"
              >
                {{
                  checkAvailability(selectedUser) === "available"
                    ? "Available"
                    : "Not Available"
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Schedule -->
        <!-- Schedule -->
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase mb-3">
            Schedule
          </h3>

          <div v-if="sortedSchedules.length" class="space-y-2">
            <div
              v-for="sched in sortedSchedules"
              :key="sched.schedule_id"
              class="flex justify-between items-center bg-gray-50 rounded-lg p-3"
            >
              <!-- Day -->
              <span class="font-medium text-gray-700">
                {{ sched.day }}
              </span>

              <!-- Time -->
              <span class="text-sm font-semibold text-gray-600">
                {{ formatTime(sched.start_time) }} —
                {{ formatTime(sched.end_time) }}
              </span>
            </div>
          </div>

          <p v-else class="text-sm text-gray-400 text-center">
            No schedule available
          </p>
        </div>

        <!-- Available Days -->
        <div v-if="selectedUser.available_days?.length">
          <h3 class="text-xs font-semibold text-gray-400 uppercase mb-3">
            Available Days
          </h3>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="day in trimmedDays(selectedUser.available_days)"
              :key="day"
              class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700"
            >
              {{ day }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t flex justify-end bg-gray-50">
        <button
          class="px-5 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          @click="closeViewModal"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import addUsers from "../modals/add-users.vue";
import { toast } from "vue3-toastify";
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
export default {
  name: "TableUsers",
  components: { icon, addUsers },

  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      isAdd: false,
      isEdit: false,
      isTable: true,
      showDeleteModal: false,
      recordToDelete: null,
      selectedpatient: null,
      isView: false,
      selectedUser: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["useraccounts"]),
    sortedSchedules() {
      if (!this.selectedUser?.schedules) return [];

      const weekOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      return [...this.selectedUser.schedules].sort(
        (a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day)
      );
    },
    filteredData() {
      const q = this.searchQuery.toLowerCase();
      return (this.useraccounts || []).filter((u) => {
        const mid = u.middle_name || "";
        return `${u.first_name} ${mid} ${u.last_name}`
          .toLowerCase()
          .includes(q);
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
      return this.filteredData.length
        ? (this.currentPage - 1) * this.itemsPerPage + 1
        : 0;
    },

    endIndex() {
      const e = this.currentPage * this.itemsPerPage;
      return e > this.filteredData.length ? this.filteredData.length : e;
    },

    pageNumbers() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    },

    tableHeightClass() {
      return this.paginatedData.length <= 10 ? "h-auto" : "h-[65vh]";
    },
  },

  methods: {
    sortSchedules(schedules) {
      if (!Array.isArray(schedules)) return [];

      const weekOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      return [...schedules].sort(
        (a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day)
      );
    },
    checkAvailability(user) {
      if (!Array.isArray(user.schedules) || !user.schedules.length) {
        return "not available";
      }

      const now = dayjs();
      const today = now.format("dddd"); // Monday, Tuesday, etc.

      return user.schedules.some((sched) => {
        if (sched.day !== today) return false;

        const start = dayjs(
          `${now.format("YYYY-MM-DD")} ${sched.start_time}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        const end = dayjs(
          `${now.format("YYYY-MM-DD")} ${sched.end_time}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        return now.isAfter(start) && now.isBefore(end);
      })
        ? "available"
        : "not available";
    },
    formatTime(time) {
      if (!time) return "";
      const parsed = dayjs(time, "HH:mm:ss");
      return parsed.isValid() ? parsed.format("hh:mm A") : "";
    },

    async loadUsers() {
      const store = useFetchDataStore();
      await store.fetchUsers();
    },

    openAddModal() {
      this.isAdd = true;
      this.isEdit = false;
    },

    closeAdd() {
      this.isAdd = false;
    },

    openEditModal(user) {
      this.selectedpatient = user;
      this.isEdit = true;
      this.isAdd = false;
    },

    closeEdit() {
      this.isEdit = false;
      this.selectedpatient = null;
    },

    toggleDelete(item) {
      this.recordToDelete = item;
      this.showDeleteModal = true;
    },

    confirmDelete() {
      if (!this.recordToDelete) return;

      axios
        .delete(
          process.env.VUE_APP_API_BASE_URL +
            `/user/${this.recordToDelete.user_id}`
        )
        .then(() => {
          new Audio(require("@/assets/delete.mp3")).play();
          toast.success("User deleted successfully");
          this.showDeleteModal = false;
          this.loadUsers();
        })
        .catch(() => toast.error("Failed to delete record."));
    },

    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },
    openViewModal(user) {
      this.selectedUser = user;
      this.isView = true;
    },

    closeViewModal() {
      this.isView = false;
      this.selectedUser = null;
    },
  },

  mounted() {
    this.loadUsers();
  },
};
</script>
