<template>
  <div v-if="isTable" class="p-2">
    <!-- Header Controls -->
    <div class="text-sm flex justify-between items-center mb-4">
      <div class="text-[13px] text-text font-medium">Pages / Patient List</div>

      <div
        @click="toggleAdd"
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
                  ID
                </th>
                <th class="px-4 py-2 text-left font-medium">Users</th>
                <th class="px-4 py-2 text-left font-medium">Role</th>
                <th class="px-4 py-2 text-left font-medium">Status</th>
                <th class="px-4 py-2 text-left font-medium">Availability</th>
                <th class="px-4 py-2 text-left rounded-tr-lg font-medium">
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
                <td class="px-2 py-1 w-auto">
                  <span
                    :class="[
                      'px-3 py-1 text-xs font-semibold rounded-full',
                      users_data.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : users_data.status === 'Inactive'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600',
                    ]"
                  >
                    {{ users_data.status || "—" }}
                  </span>
                </td>
                <td class="px-4 py-2 w-auto">
                  <span
                    :class="[
                      'px-3 py-1 text-xs font-semibold rounded-full',
                      users_data.doctor_availability === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600',
                    ]"
                  >
                    {{
                      users_data.doctor_availability === "available"
                        ? "Online"
                        : "Offline"
                    }}
                  </span>
                </td>

                <td class="px-4 py-2">
                  <div class="flex gap-2">
                    <button
                      class="px-3 py-1 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                      @click="goToEdit(users_data.user_id)"
                    >
                      <icon name="edit" /> Edit
                    </button>
                    <button
                      class="px-3 py-1 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                      @click="toggleDelete(users_data)"
                    >
                      <icon name="delete" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedData.length === 0">
                <td colspan="5" class="text-center py-8 text-gray-400">
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

  <!-- Modals -->
  <addUsers v-if="isAdd" @close="closeView" @refresh="loadUsers" />
  <editUser
    v-if="isEdit"
    :user="selectedpatient"
    @close="closeEdit"
    @refresh="loadUsers"
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
import addUsers from "../modals/add-users.vue";
import editUser from "../modals/edit-user.vue";
import { toast } from "vue3-toastify";
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import axios from "axios";

export default {
  name: "TableUsers",
  components: {
    icon,
    addUsers,
    editUser,
  },
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
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["useraccounts"]),

    filteredData() {
      const query = this.searchQuery.toLowerCase();
      return (this.useraccounts || []).filter((item) => {
        const middle = item.middle_name || "";
        return `${item.first_name} ${middle} ${item.last_name}`
          .toLowerCase()
          .includes(query);
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
      const count = this.paginatedData.length;
      return count <= 10 ? "h-auto" : "h-[65vh]";
    },
  },
  methods: {
    async loadUsers() {
      const store = useFetchDataStore();
      await store.fetchUsers();
    },
    toggleAdd() {
      this.isAdd = true;
      this.isTable = true;
    },
    goToEdit(userId) {
      const found = this.useraccounts.find((u) => u.user_id === userId);
      if (found) {
        this.selectedpatient = found;
        this.isEdit = true;
      } else {
        toast.error("User not found");
      }
    },
    toggleDelete(item) {
      this.recordToDelete = item;
      this.showDeleteModal = true;
    },
    confirmDelete() {
      if (!this.recordToDelete || isNaN(this.recordToDelete.user_id)) {
        toast.error("Invalid user ID.");
        return;
      }

      const userId = this.recordToDelete.user_id;
      axios
        .delete(process.env.VUE_APP_API_BASE_URL + `/user/${userId}`)
        .then(() => {
          this.recordToDelete = null;
          this.showDeleteModal = false;
          new Audio(require("@/assets/delete.mp3")).play();
          this.loadUsers();
          toast.success("User deleted successfully");
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          toast.error("Failed to delete record.");
        });
    },
    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },
    closeView() {
      this.isAdd = false;
    },
    closeEdit() {
      this.isEdit = false;
      this.selectedpatient = null;
    },
  },
  mounted() {
    this.loadUsers();
  },
};
</script>
