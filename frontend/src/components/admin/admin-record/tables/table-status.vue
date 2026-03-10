<template>
  <div v-if="isTable">
    <!-- Header -->
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">Pages / Status</div>

      <div
        @click="toggleAdd"
        class="flex items-center gap-2 px-4 py-2 border text-green-600 border-green-600 rounded-xl hover:bg-green-700 hover:text-white hover:shadow-lg cursor-pointer transition duration-200"
      >
        <div
          class="p-1 bg-[#34699A] bg-opacity-20 rounded-full flex items-center justify-center"
        >
          <icon name="add-account1.1" class="w-4 h-4" />
        </div>

        <span class="font-medium text-sm">Add Status</span>
      </div>
    </div>

    <!-- Table -->
    <div class="text-[14px] bg-white rounded-xl">
      <div class="mt-4 overflow-x-auto border p-2 rounded-xl">
        <!-- Controls -->
        <div class="text-gray-700 flex justify-between items-start mt-1">
          <!-- Items per page -->
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

          <!-- Search -->
          <div class="flex items-center">
            <input
              v-model="searchQuery"
              type="text"
              class="px-3 w-[300px] py-2 border rounded-md"
              placeholder="Search status..."
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
                    class="w-10 px-4 py-2 text-left rounded-tl-lg font-normal"
                  >
                    No.
                  </th>

                  <th class="px-4 py-3 text-left font-normal">Status Name</th>

                  <th class="px-4 py-3 text-left rounded-tr-lg font-normal">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                <!-- Loading -->
                <tr v-if="fetchStore.loading">
                  <td colspan="3" class="text-center py-8 text-gray-400">
                    Loading status...
                  </td>
                </tr>

                <!-- Data -->
                <tr
                  v-for="(status, index) in paginatedData"
                  :key="status.id"
                  class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
                >
                  <td class="px-4 py-2">{{ startIndex + index }}</td>

                  <td class="px-4 py-2">
                    {{ status.status_name }}
                  </td>

                  <td class="px-4 py-2">
                    <div class="flex gap-2">
                      <button
                        @click="toggleEdit(status)"
                        class="px-3 py-1 h-8 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                      >
                        <icon name="edit" /> Edit
                      </button>

                      <button
                        @click="toggleDelete(status)"
                        class="px-3 py-1 h-8 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                      >
                        <icon name="trash" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Empty -->
                <tr v-if="!fetchStore.loading && paginatedData.length === 0">
                  <td colspan="3" class="text-center py-8 text-gray-400">
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
            <span>
              Showing {{ startIndex }} to {{ endIndex }} of
              {{ filteredData.length }} entries
            </span>
          </div>

          <div class="flex items-center">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 bg-gray-300 text-gray-700 rounded-l-md hover:bg-gray-400"
            >
              &lt;
            </button>

            <span v-for="page in pageNumbers" :key="page">
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

  <!-- MODALS -->
  <StatusModal v-if="isAdd" @close="isAdd = false" @refresh="loadStatus" />

  <StatusModal
    v-if="isEdit"
    :status="selectedStatus"
    @close="closeEdit"
    @refresh="loadStatus"
  />

  <!-- Delete Modal -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  ></div>

  <div
    v-if="showDeleteModal"
    class="rounded-xl shadow-lg w-[20vw] bg-white py-6 px-4 flex flex-col items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
  >
    <div
      class="rounded-full w-16 h-16 flex justify-center items-center bg-red-300 animate-pulse"
    >
      <icon name="question" class="w-8 h-8 text-white" />
    </div>

    <h1 class="text-[16px] font-semibold mt-4">Delete Confirmation</h1>

    <p class="mt-2 text-[13px] text-center px-6">
      Are you sure you want to delete this record? This action cannot be undone.
    </p>

    <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>

    <div class="tracking-wide flex gap-2 mt-4">
      <button
        class="bg-red-400 p-2 px-3 text-[13px] rounded-md text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
        @click="showDeleteModal = false"
      >
        No, Cancel
      </button>

      <button
        class="bg-green-400 p-2 px-3 text-[13px] rounded-md text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
        @click="confirmDelete"
      >
        Yes, Delete
      </button>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import StatusModal from "../modals/add-status.vue";
import axios from "axios";
import { toast } from "vue3-toastify";
import { useFetchDataStore } from "../../../../store/fetch-data-store";

export default {
  components: { icon, StatusModal },

  data() {
    return {
      fetchStore: useFetchDataStore(),

      searchQuery: "",
      itemsPerPage: 10,
      currentPage: 1,

      isAdd: false,
      isEdit: false,
      selectedStatus: null,

      showDeleteModal: false,
      recordToDelete: null,

      isTable: true,
    };
  },

  computed: {
    filteredData() {
      return this.fetchStore.status.filter((s) =>
        s.status_name.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
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
    async loadStatus() {
      await this.fetchStore.fetchStatus();
    },

    toggleAdd() {
      this.isAdd = true;
    },

    toggleEdit(status) {
      this.selectedStatus = { ...status };
      this.isEdit = true;
    },

    closeEdit() {
      this.isEdit = false;
      this.selectedStatus = null;
    },

    toggleDelete(status) {
      this.recordToDelete = status;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      try {
        await axios.delete(
          process.env.VUE_APP_API_BASE_URL +
            `/status/${this.recordToDelete.id}`,
        );

        toast.success("Status deleted successfully");

        this.showDeleteModal = false;
        this.recordToDelete = null;

        await this.loadStatus();
      } catch (error) {
        toast.error("Failed to delete status");
        console.error(error);
      }
    },

    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },
  },

  mounted() {
    this.loadStatus();
  },
};
</script>
