<template>
  <div v-if="isTable">
    <!-- Header -->
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">
        Pages / Medicines
      </div>

      <div
        @click="toggleAdd"
        class="flex items-center gap-2 px-4 py-2 border text-green-600 border-green-600 rounded-xl hover:bg-green-700 hover:text-white hover:shadow-lg cursor-pointer transition duration-200"
      >
        <div
          class="p-1 bg-[#34699A] bg-opacity-20 rounded-full flex items-center justify-center"
        >
          <icon name="add-account1.1" class="w-4 h-4" />
        </div>

        <span class="font-medium text-sm">Add Medicine</span>
      </div>
    </div>

    <!-- Table -->
    <div class="text-[14px] bg-white rounded-xl">
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
              placeholder="Search medicines..."
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

                  <th class="px-4 py-3 text-left font-normal">Medicine Name</th>

                  <th class="px-4 py-3 text-left font-normal">Type</th>

                  <th class="px-4 py-3 text-left font-normal">Dosage</th>

                  <th
                    class="px-4 py-3 text-center rounded-tr-lg font-normal w-[10%]"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                <!-- Loading -->
                <tr v-if="fetchStore.loading">
                  <td colspan="5" class="text-center py-8 text-gray-400">
                    Loading medicines...
                  </td>
                </tr>

                <!-- Data -->
                <tr
                  v-for="(medicine, index) in paginatedData"
                  :key="medicine.id"
                  class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
                >
                  <td class="px-4 py-2">
                    {{ startIndex + index }}
                  </td>

                  <td class="px-4 py-2">
                    {{ medicine.name }}
                  </td>

                  <td class="px-4 py-2">
                    {{ medicine.type }}
                  </td>

                  <td class="px-4 py-2">
                    {{ medicine.dosage }}
                  </td>

                  <td class="px-4 py-2">
                    <div class="flex gap-2">
                      <button
                        @click="toggleEdit(medicine)"
                        class="px-3 py-1 h-8 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                      >
                        <icon name="edit" /> Edit
                      </button>

                      <button
                        @click="toggleDelete(medicine)"
                        class="px-3 py-1 h-8 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                      >
                        <icon name="trash" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Empty -->
                <tr v-if="!fetchStore.loading && paginatedData.length === 0">
                  <td colspan="5" class="text-center py-8 text-gray-400">
                    No medicines found
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
              class="px-3 py-1 bg-gray-300 text-gray-700 rounded-l-md"
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
                class="px-3 py-1 mx-1 rounded-md"
              >
                {{ page }}
              </button>
            </span>

            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 bg-gray-300 text-gray-700 rounded-r-md"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ADD MODAL -->
  <MedicineModal v-if="isAdd" @close="isAdd = false" @refresh="loadMedicines" />

  <!-- EDIT MODAL -->
  <MedicineModal
    v-if="isEdit"
    :medicine="selectedMedicine"
    @close="closeEdit"
    @refresh="loadMedicines"
  />

  <!-- DELETE MODAL -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div
      class="rounded-xl shadow-lg w-[20vw] bg-white py-6 px-4 flex flex-col items-center"
    >
      <div
        class="rounded-full w-16 h-16 flex justify-center items-center bg-red-300 animate-pulse"
      >
        <icon name="question" class="w-8 h-8 text-white" />
      </div>

      <h1 class="text-[16px] font-semibold mt-4">Delete Confirmation</h1>

      <p class="mt-2 text-[13px] text-center px-6">
        Are you sure you want to delete this medicine?
      </p>

      <div class="flex gap-2 mt-4">
        <button
          class="bg-red-400 p-2 px-3 rounded-md text-white"
          @click="showDeleteModal = false"
        >
          Cancel
        </button>

        <button
          class="bg-green-500 p-2 px-3 rounded-md text-white"
          @click="confirmDelete"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import MedicineModal from "../modals/add-medicines.vue";
import axios from "axios";
import { toast } from "vue3-toastify";
import { useFetchDataStore } from "../../../../store/fetch-data-store";

export default {
  components: {
    icon,
    MedicineModal,
  },

  data() {
    return {
      fetchStore: useFetchDataStore(),

      searchQuery: "",
      itemsPerPage: 10,
      currentPage: 1,

      isAdd: false,
      isEdit: false,

      selectedMedicine: null,

      showDeleteModal: false,
      recordToDelete: null,

      isTable: true,
    };
  },

  computed: {
    filteredData() {
      return this.fetchStore.medicines.filter((m) =>
        m.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
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
    async loadMedicines() {
      await this.fetchStore.fetchMedicines();
    },

    toggleAdd() {
      this.isAdd = true;
    },

    toggleEdit(medicine) {
      this.selectedMedicine = { ...medicine };
      this.isEdit = true;
    },

    closeEdit() {
      this.isEdit = false;
      this.selectedMedicine = null;
    },

    toggleDelete(medicine) {
      this.recordToDelete = medicine;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      try {
        await axios.delete(
          process.env.VUE_APP_API_BASE_URL +
            `/medicines/${this.recordToDelete.id}`,
        );

        toast.success("Medicine deleted successfully");

        this.showDeleteModal = false;
        this.recordToDelete = null;

        await this.loadMedicines();
      } catch (error) {
        toast.error("Failed to delete medicine");
      }
    },

    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },
  },

  mounted() {
    this.loadMedicines();
  },
};
</script>
