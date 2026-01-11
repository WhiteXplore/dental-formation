<template>
  <div v-if="isTable">
    <!-- Header -->
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">
        Pages / HMO Guarantors
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
        <span class="font-medium text-sm">Add Guarantors</span>
      </div>
    </div>

    <div class="text-[14px] bg-white rounded-xl">
      <div class="mt-4 overflow-x-auto border p-2 rounded-xl">
        <!-- Top controls -->
        <div class="text-gray-700 flex justify-between items-start mt-1">
          <!-- Items Per Page -->
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
              placeholder="Search guarantor..."
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
                  <th class="px-4 py-3 text-left font-normal">First Name</th>
                  <th class="px-4 py-3 text-left font-normal">Middle Name</th>
                  <th class="px-4 py-3 text-left font-normal">Last Name</th>
                  <th class="px-4 py-3 text-left font-normal">Company</th>
                  <th class="px-4 py-3 text-left rounded-tr-lg font-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(guarantor, index) in paginatedData"
                  :key="guarantor.id"
                  class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
                >
                  <td class="px-4 py-2">{{ startIndex + index }}</td>
                  <td class="px-4 py-2">{{ guarantor.first_name }}</td>
                  <td class="px-4 py-2">{{ guarantor.middle_name }}</td>
                  <td class="px-4 py-2">{{ guarantor.last_name }}</td>
                  <td class="px-4 py-2">{{ guarantor.company }}</td>

                  <td class="px-4 py-2">
                    <div class="flex gap-2">
                      <button
                        @click="toggleEdit(guarantor)"
                        class="px-3 py-1 h-8 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                      >
                        <icon name="edit" /> Edit
                      </button>
                      <button
                        @click="toggleDelete(guarantor)"
                        class="px-3 py-1 h-8 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                      >
                        <icon name="trash" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
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
        <div class="flex justify-between items-center mt-4">
          <div class="text-gray-700">
            <span
              >Showing {{ startIndex }} to {{ endIndex }} of
              {{ filteredData.length }} entries</span
            >
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
                  ' bg-[#34699A] text-white': currentPage === page,
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

  <!-- Add/Edit Modals -->
  <addHmoGuarantors v-if="isAdd" @close="closeView" @refresh="loadGuarantors" />
  <addHmoGuarantors
    v-if="isEdit"
    :guarantor="selectedGuarantor"
    @close="closeEdit"
    @refresh="loadGuarantors"
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
import addHmoGuarantors from "../modals/add-hmo-guarantors.vue";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";
import { toast } from "vue3-toastify";
import axios from "axios";

export default {
  name: "HMOGuarantorsTable",
  components: { icon, addHmoGuarantors },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      isAdd: false,
      isTable: true,
      showDeleteModal: false,
      recordToDelete: null,
      selectedGuarantor: null,
      isEdit: false,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["hmoGuarantors"]),
    filteredData() {
      const query = this.searchQuery.toLowerCase();
      return this.hmoGuarantors.filter(
        (item) =>
          item.first_name.toLowerCase().includes(query) ||
          item.middle_name.toLowerCase().includes(query) ||
          item.last_name.toLowerCase().includes(query) ||
          item.company.toLowerCase().includes(query)
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
      return this.paginatedData.length <= 10 ? "h-auto" : "h-[65vh]";
    },
  },
  methods: {
    async loadGuarantors() {
      const store = useFetchDataStore();
      await store.fetchHMOGuarantors();
    },
    toggleEdit(guarantor) {
      this.selectedGuarantor = { ...guarantor };
      this.isEdit = true;
    },
    closeEdit() {
      this.isEdit = false;
      this.selectedGuarantor = null;
    },
    toggleAdd() {
      this.isAdd = true;
      this.isTable = true;
    },
    closeView() {
      this.isAdd = false;
    },
    toggleDelete(item) {
      this.recordToDelete = item;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      if (!this.recordToDelete || isNaN(this.recordToDelete.id)) {
        toast.error("Invalid guarantor ID.");
        return;
      }

      const id = this.recordToDelete.id;
      try {
        await axios.delete(
          process.env.VUE_APP_API_BASE_URL + `/hmo-guarantors/delete/${id}`
        );
        this.recordToDelete = null;
        this.showDeleteModal = false;
        toast.success("Guarantor deleted successfully");
        this.loadGuarantors();
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Failed to delete guarantor.");
      }
    },
    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },
  },
  mounted() {
    this.loadGuarantors();
  },
};
</script>
