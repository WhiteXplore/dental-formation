<template>
  <div class="border rounded-xl min-h-screen p-2 bg-gray-50">
    <!-- Search & Filter -->
    <div class="flex flex-col md:flex-row gap-2 mb-8 w-full">
      <!-- Search Input -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name..."
        class="border border-gray-300 focus:ring-2 focus:ring-blue-500 px-4 py-3 rounded-lg w-full md:w-[20vw] transition"
      />

      <!-- Type Filter (Only Dental Tool now) -->
      <!-- <select
        v-model="selectedUnit"
        class="border border-gray-300 focus:ring-2 focus:ring-blue-500 px-4 py-3 rounded-lg w-full md:w-[10vw] transition"
      >
        <option value="">All Types</option>
        <option value="Dental Tool">Dental Tool</option>
      </select> -->

      <!-- Action Buttons -->
      <div class="flex gap-2 ml-auto">
        <div
          @click="openInventoryLogs"
          class="flex items-center gap-2 px-4 py-2 border text-purple-600 border-purple-600 rounded-xl hover:bg-purple-100 hover:shadow-lg cursor-pointer transition duration-200"
        >
          <div
            class="p-1 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <icon :name="'list-check'" class="w-4 h-4" />
          </div>
          <span class="font-medium text-sm">Inventory Logs</span>
        </div>

        <!-- <div
          @click="exportToPDF"
          class="flex items-center gap-2 px-4 py-2 border text-blue-600 border-blue-600 rounded-xl hover:bg-blue-100 hover:shadow-lg cursor-pointer transition duration-200"
        >
          <div
            class="p-1 bg-blue-900 bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <icon :name="'circle-arrow-down'" class="w-4 h-4" />
          </div>
          <span class="font-medium text-sm">Download PDF</span>
        </div> -->

        <div
          @click="openAddModal"
          class="flex items-center gap-2 px-4 py-2 border text-green-600 border-green-600 rounded-xl hover:bg-green-100 hover:shadow-lg cursor-pointer transition duration-200"
        >
          <div
            class="p-1 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <icon :name="'add-account1.1'" class="w-4 h-4" />
          </div>
          <span class="font-medium text-sm">Add Item</span>
        </div>
      </div>
    </div>

    <!-- Cards View -->
    <div class="h-[78vh] overflow-auto">
      <div class="grid grid-cols-5 gap-4 p-2">
        <div
          v-for="(item, index) in filteredInventories"
          :key="item.id"
          class="border rounded-xl shadow-sm bg-white transition relative overflow-hidden min-h-[40vh] flex flex-col justify-between"
          :class="{
            'hover:shadow-md': item.quantity > 0,
            '': item.quantity === 0,
          }"
        >
          <!-- Status Badge -->
          <div class="absolute top-3 right-3 z-10">
            <!-- Out of Stock -->
            <span
              v-if="item.quantity === 0"
              class="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white shadow-md animate-pulse"
            >
              Out of Stock
            </span>

            <!-- Low Stock -->
            <span
              v-else-if="item.quantity < 30"
              class="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm"
            >
              Low Stock
            </span>

            <!-- In Stock -->
            <span
              v-else
              class="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300 shadow-sm"
            >
              In Stock
            </span>
          </div>

          <!-- Image -->
          <div class="relative w-full h-36 bg-gray-100">
            <img
              :src="item.image"
              @error="
                $event.target.src =
                  'https://via.placeholder.com/300x150?text=No+Image'
              "
              class="w-full h-full object-contain p-3"
              alt="Inventory item image"
            />
          </div>

          <!-- Details -->
          <div class="p-4">
            <h2
              class="text-lg font-semibold text-gray-800 truncate border-b pb-1"
            >
              {{ item.name }}
            </h2>

            <div class="flex flex-col text-sm mt-2 space-y-1">
              <p class="text-gray-600 flex gap-1">
                <span class="font-semibold">Type:</span>
                <span>Dental Tool</span>
              </p>

              <p class="text-gray-700 flex gap-1 items-center">
                <span class="font-semibold">Quantity:</span>
                <span>{{ item.quantity }}</span>
              </p>

              <p class="text-gray-600 flex gap-1">
                <span class="font-semibold">Unit:</span>
                <span>{{ item.unit }}</span>
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 px-4 pb-4">
            <button
              class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
              @click="editItem(item, index)"
            >
              Edit
            </button>

            <button
              class="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
              @click="deleteItem(item.id, index)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
    >
      <div
        class="w-full max-w-xl bg-white rounded-[15px] shadow-xl animate-fadeInUp"
      >
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">
              {{ editIndex !== null ? "Edit" : "Add" }} Dental Tool
            </h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="closeModal"
            class="cursor-pointer"
          />
        </div>

        <!-- Form -->
        <form @submit.prevent="saveItem" class="space-y-2 text-sm p-5">
          <div class="w-full gap-2 flex">
            <!-- Name -->
            <div class="w-full space-y-2">
              <label class="font-semibold text-gray-700">Item Name</label>
              <input
                v-model="form.name"
                required
                type="text"
                placeholder="Enter item name"
                class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              />
            </div>

            <!-- Type (Always Dental Tool) -->
            <div class="w-full space-y-2">
              <label class="font-semibold text-gray-700">Type</label>
              <select
                v-model="form.type"
                required
                class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              >
                <option value="Dental Tool">Dental Tool</option>
              </select>
            </div>
          </div>

          <div class="w-full gap-2 flex">
            <!-- Quantity -->
            <div class="w-full space-y-2">
              <label class="font-semibold text-gray-700">Quantity</label>
              <input
                v-model.number="form.quantity"
                required
                min="0"
                type="number"
                placeholder="0"
                class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              />
            </div>

            <!-- Unit -->
            <div class="w-full space-y-2">
              <label class="font-semibold text-gray-700">Unit</label>
              <select
                v-model="form.unit"
                required
                class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select unit</option>
                <option value="pcs">pcs</option>
                <option value="pcs">unit</option>
                <option value="pcs">bottle</option>
                <option value="set">set</option>
                <option value="box">box</option>
              </select>
            </div>
          </div>

          <!-- Image Upload -->
          <div class="w-full space-y-2">
            <label class="font-semibold text-gray-700">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <!-- Preview -->
          <div v-if="form.preview" class="text-center">
            <p class="text-gray-500 text-sm">Image Preview</p>
            <img
              :src="form.preview"
              alt="Preview"
              class="h-32 w-auto mx-auto mt-2 rounded border object-contain shadow"
            />
          </div>

          <!-- Actions -->
          <div class="tracking-wide flex justify-end gap-2 mt-4">
            <button
              type="button"
              @click="closeModal"
              class="bg-red-600 p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-[#34699A] p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
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
        <icon name="question" class="w-10 h-10 text-white" />
      </div>

      <h1 class="text-[16px] font-semibold mt-4">Delete Confirmation</h1>
      <p class="mt-2 text-[13px] text-center px-8">
        Are you sure you want to delete this record? This action cannot be
        undone.
      </p>

      <div class="w-full h-[1px] bg-gray-200 mt-4"></div>

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
    <!-- Inventory Logs Modal -->
    <div
      v-if="showLogsModal"
      class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
    >
      <div
        class="w-full max-w-[90vw] bg-white rounded-[15px] shadow-xl animate-fadeInUp p-5"
      >
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-lg font-bold">Inventory Logs</h1>
          <icon
            :name="'circle-close3'"
            @click="closeInventoryLogs"
            class="cursor-pointer"
          />
        </div>
        <!-- <div class="flex gap-2 mb-4">
          <button
            :class="
              tab === 'procedures'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            "
            class="px-4 py-2 rounded-md"
            @click="tab = 'procedures'"
          >
            Procedures
          </button>
          <button
            :class="
              tab === 'inventories'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            "
            class="px-4 py-2 rounded-md"
            @click="tab = 'inventories'"
          >
            Inventories
          </button>
        </div> -->

        <!-- Procedures Table -->
        <div v-if="tab === 'procedures'" class="h-[78vh] overflow-auto">
          <table class="w-full table-auto border-collapse">
            <thead>
              <tr class="bg-gray-100 text-xs">
                <th class="border px-4 py-3">Patient</th>
                <th class="border px-4 py-3">Dentist</th>
                <th class="border px-4 py-3">Procedure</th>
                <th class="border px-4 py-3">Procedure Type</th>
                <th class="border px-4 py-3">Pricing Scope</th>
                <th class="border px-4 py-3">Inventory Name</th>
                <th class="border px-4 py-3">Quantity Deducted</th>
                <th class="border px-4 py-3">Procedure Date</th>
                <th class="border px-4 py-3">Created</th>
                <!-- <th class="border px-4 py-3">Updated</th> -->
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(log, idx) in inventoryLogs"
                :key="idx"
                :class="
                  log.procedureType === 'Add Item'
                    ? 'bg-yellow-50 font-semibold'
                    : ''
                "
                class="text-sm"
              >
                <td class="border px-4 py-2">{{ log.patientName }}</td>
                <td class="border px-4 py-2">{{ log.dentistName }}</td>
                <td class="border px-4 py-2">
                  {{ log.procedureName }}
                  <span
                    v-if="log.procedureType === 'Add Item'"
                    class="ml-1 px-2 py-0.5 text-xs bg-yellow-200 text-yellow-800 rounded-full"
                  >
                    Add Item
                  </span>
                </td>
                <td class="border px-4 py-2">{{ log.procedureType }}</td>
                <td class="border px-4 py-2">{{ log.pricingScope }}</td>
                <td class="border px-4 py-2">{{ log.inventoryName }}</td>
                <td class="border px-4 py-2">{{ log.quantity }}</td>
                <td class="border px-4 py-2">{{ log.procedureDate }}</td>
                <td class="border px-4 py-2">{{ log.createdAt }}</td>
                <!-- <td class="border px-4 py-2">{{ log.updatedAt }}</td> -->
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Inventories Table -->
        <div v-else class="h-[78vh] overflow-auto">
          <table class="w-full table-auto border-collapse text-sm">
            <thead>
              <tr class="bg-gray-100 text-xs font-semibold">
                <th class="border px-4 py-3">Name</th>
                <th class="border px-4 py-3">Quantity</th>
                <th class="border px-4 py-3">Unit</th>
                <th class="border px-4 py-3">Status</th>
                <th class="border px-4 py-3">Last Updated</th>
                <th class="border px-4 py-3">Created At</th>
                <th class="border px-4 py-3">Activity</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in inventories"
                :key="item.inventory_id"
                class="text-sm hover:bg-gray-50 transition text-center"
              >
                <!-- Name -->
                <td class="border px-4 py-2 font-medium text-gray-800">
                  {{ item.name }}
                </td>

                <!-- Quantity -->
                <td class="border px-4 py-2 text-gray-700">
                  {{ item.quantity }}
                </td>

                <!-- Unit -->
                <td class="border px-4 py-2 text-gray-700">{{ item.unit }}</td>

                <!-- Status -->
                <td class="border px-4 py-2">
                  <span
                    v-if="item.quantity === 0"
                    class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600 text-white shadow-sm"
                  >
                    Out of Stock
                  </span>
                  <span
                    v-else-if="item.quantity < 30"
                    class="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm"
                  >
                    Low Stock
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300 shadow-sm"
                  >
                    In Stock
                  </span>
                </td>

                <!-- Last Updated -->
                <td class="border px-4 py-2 text-gray-600">
                  {{ formatDate(item.last_updated) }}
                </td>

                <!-- Created At -->
                <td class="border px-4 py-2 text-gray-600">
                  {{ formatDate(item.created_at) }}
                </td>

                <!-- Activity -->
                <td class="border px-4 py-2">
                  <span
                    v-if="item.created_at === item.last_updated"
                    class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 shadow-sm"
                  >
                    Added
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 shadow-sm"
                  >
                    Edited
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import axios from "axios";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;
import { toast } from "vue3-toastify";
import { useFetchDataStore } from "../../../../store/fetch-data-store";

export default {
  name: "InventoryPage",
  components: { icon },

  data() {
    return {
      showDeleteModal: false,
      deleteTarget: null,
      deleteIndex: null,

      inventories: [],
      searchQuery: "",
      selectedUnit: "",
      showModal: false,
      editIndex: null,

      dentalCharts: [],
      dentalLoading: false,
      dentalError: null,

      form: {
        name: "",
        quantity: null,
        unit: "",
        type: "Dental Tool",
        file: null,
        preview: null,
      },
      showLogsModal: false,
      inventoryLogs: [],
      tab: "procedures",
    };
  },

  computed: {
    filteredInventories() {
      return this.inventories.filter((item) => {
        const matchSearch = item.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        const matchType = this.selectedUnit
          ? item.type === this.selectedUnit
          : true;
        return matchSearch && matchType;
      });
    },
  },

  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleString();
    },
    openInventoryLogs() {
      this.generateInventoryLogs();
      this.showLogsModal = true;
    },

    closeInventoryLogs() {
      this.showLogsModal = false;
    },

    generateInventoryLogs() {
      this.inventoryLogs = [];

      if (!this.dentalCharts || this.dentalCharts.length === 0) return;

      // Map inventory_id → name for quick lookup
      const inventoryMap = {};
      this.inventories.forEach((inv) => {
        inventoryMap[inv.inventory_id] = inv.name;
      });

      this.dentalCharts.forEach((chart) => {
        const patientName = chart.patient
          ? `${chart.patient.first_name} ${chart.patient.last_name}`
          : "N/A";
        const dentistName = chart.user_accounts
          ? `${chart.user_accounts.first_name} ${chart.user_accounts.last_name}`
          : "N/A";
        const procedureDate = chart.procedure_date
          ? chart.procedure_date.split("T")[0]
          : "N/A";
        const createdAt = chart.created_at
          ? new Date(chart.created_at).toLocaleString()
          : "N/A";
        const updatedAt = chart.updated_at
          ? new Date(chart.updated_at).toLocaleString()
          : "N/A";

        const loggedProcedures = new Set();

        // --- Standard procedures per tooth ---
        chart.teeth.forEach((tooth) => {
          const procedure = tooth.priceProcedure;
          if (!procedure || !procedure.procedureInventories?.length) return;

          const pricingScope = procedure.pricing_scope;
          const procedureScope = procedure.procedure_scope;
          const procId = procedure.price_procedure_id;

          procedure.procedureInventories.forEach((pi) => {
            let quantityDeducted = Number(pi.quantity);

            // ONE_TIME → log only once per procedure
            if (pricingScope === "one_time") {
              if (loggedProcedures.has(procId)) return;
              loggedProcedures.add(procId);
            }

            // ALL_TEETH → multiply by total teeth, log only once
            if (
              procedureScope === "ALL_TEETH" &&
              pricingScope === "per_tooth_payment"
            ) {
              if (loggedProcedures.has(procId)) return;
              quantityDeducted *= chart.teeth.length;
              loggedProcedures.add(procId);
            }

            this.inventoryLogs.push({
              patientName,
              dentistName,
              procedureName: procedure.procedure_name,
              procedureType: procedure.procedure_type,
              pricingScope,
              inventoryName: pi.inventory
                ? pi.inventory.name
                : inventoryMap[pi.inventory_id] || "Unknown",
              quantity: quantityDeducted,
              procedureDate,
              createdAt,
              updatedAt,
            });
          });
        });

        // --- Add Items ---
        if (chart.addItems?.length) {
          chart.addItems.forEach((item) => {
            const inventoryName =
              item.inventory?.name || inventoryMap[item.inventory_id] || "N/A";

            this.inventoryLogs.push({
              patientName,
              dentistName,
              procedureName: "Additional Item",
              procedureType: "Add Item",
              pricingScope: "one_time",
              inventoryName,
              quantity: Number(item.pcs),
              procedureDate,
              createdAt,
              updatedAt,
            });
          });
        }
      });
    },
    async loadDentalCharts() {
      const dentalStore = useFetchDataStore();
      this.dentalLoading = true;
      this.dentalError = null;

      try {
        await dentalStore.fetchDentalChart();
        this.dentalCharts = dentalStore.dentalCharts;
      } catch (err) {
        this.dentalError = err.message || "Failed to load dental charts";
      } finally {
        this.dentalLoading = false;
      }
    },

    async fetchInventories() {
      const res = await axios.get(
        `${process.env.VUE_APP_API_BASE_URL}/inventory/get-inventory`,
      );
      this.inventories = res.data.map((item) => ({
        ...item,
        image: item.image
          ? process.env.VUE_APP_API_BASE_URL +
            `/inventory/inventory-image/${item.inventory_id}`
          : null,
        id: item.inventory_id,
      }));
    },

    openAddModal() {
      this.resetForm();
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    resetForm() {
      this.form = {
        name: "",
        quantity: null,
        unit: "",
        type: "Dental Tool",
        file: null,
        preview: null,
      };
      this.editIndex = null;
    },

    async confirmDelete() {
      try {
        await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/inventory/delete/${this.deleteTarget}`,
        );
        toast.success("Record deleted successfully");
      } catch {
        toast.error("Failed to delete record.");
      } finally {
        this.showDeleteModal = false;
        this.deleteTarget = null;
        this.deleteIndex = null;
        this.fetchInventories();
      }
    },

    editItem(item, index) {
      this.form = {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        type: "Dental Tool",
        file: null,
        preview: item.image,
      };
      this.editIndex = index;
      this.showModal = true;
    },

    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.file = file;
        this.form.preview = URL.createObjectURL(file);
      }
    },

    async saveItem() {
      const formData = new FormData();
      formData.append("name", this.form.name);
      formData.append("quantity", this.form.quantity);
      formData.append("unit", this.form.unit);
      formData.append("type", "Dental Tool");
      if (this.form.file) formData.append("image", this.form.file);

      try {
        if (this.editIndex === null) {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/inventory/add-inventory`,
            formData,
          );
          toast.success("Record saved successfully");
        } else {
          const id = this.inventories[this.editIndex].id;
          await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL}/inventory/update/${id}`,
            formData,
          );
          toast.success("Record updated successfully");
        }
        await this.fetchInventories();
        this.closeModal();
      } catch {
        toast.error("Failed to save item.");
      }
    },

    deleteItem(id, index) {
      this.deleteTarget = id;
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },

    exportToPDF() {
      const body = [["Name", "Quantity", "Unit"]];
      this.inventories.forEach((item) => {
        body.push([item.name, item.quantity.toString(), item.unit]);
      });

      pdfMake
        .createPdf({
          content: [
            { text: "Dental Tool Inventory Report", style: "header" },
            { table: { headerRows: 1, body } },
          ],
          styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
          },
        })
        .download("dental_tools_inventory.pdf");
    },
    async deductInventoryInDatabase() {
      if (!this.dentalCharts || this.dentalCharts.length === 0) {
        console.warn("No dental charts loaded");
        return;
      }

      // Only process charts that haven't been deducted
      const chartsToDeduct = this.dentalCharts.filter(
        (chart) => !chart.inventoryDeducted,
      );

      if (chartsToDeduct.length === 0) {
        console.log("All charts already deducted, skipping.");
        return;
      }

      // Aggregate quantities per inventoryId
      const inventoryMap = {};
      const processedOneTime = new Set(); // Prevent multiple ONE_TIME deductions

      chartsToDeduct.forEach((chart) => {
        chart.teeth.forEach((tooth) => {
          const procedure = tooth.priceProcedure;
          if (!procedure || !procedure.procedureInventories?.length) return;

          const scope = procedure.pricing_scope;

          // ONE_TIME → deduct only once per procedure
          if (scope === "one_time") {
            if (processedOneTime.has(procedure.price_procedure_id)) return;
            processedOneTime.add(procedure.price_procedure_id);

            procedure.procedureInventories.forEach((pi) => {
              const invId = pi.inventory.inventory_id;
              inventoryMap[invId] =
                (inventoryMap[invId] || 0) + Number(pi.quantity);
            });
          }

          // PER_TOOTH_PAYMENT → deduct per tooth
          if (scope === "per_tooth_payment") {
            procedure.procedureInventories.forEach((pi) => {
              const invId = pi.inventory.inventory_id;
              inventoryMap[invId] =
                (inventoryMap[invId] || 0) + Number(pi.quantity);
            });
          }
        });
      });

      // Convert map to array of payloads
      const payloads = Object.entries(inventoryMap).map(
        ([inventoryId, quantity]) => ({
          inventoryId: parseInt(inventoryId),
          quantity,
        }),
      );

      console.log("Deduct payloads:", payloads);

      // Send each deduction to backend
      for (const payload of payloads) {
        try {
          await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL}/inventory/deduct`,
            payload,
          );
          console.log(
            `Deducted inventory ${payload.inventoryId}: ${payload.quantity}`,
          );
        } catch (err) {
          console.error(
            `Failed to deduct inventory ${payload.inventoryId}:`,
            err.response?.data || err.message,
          );
        }
      }

      // Mark charts as deducted in backend
      for (const chart of chartsToDeduct) {
        try {
          await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL}/dental-chart/deduct-inventory/${chart.dental_id}`,
          );
          chart.inventoryDeducted = true; // update local state
        } catch (err) {
          console.error(
            `Failed to mark dental chart ${chart.dental_id} as deducted:`,
            err.response?.data || err.message,
          );
        }
      }

      // Refresh inventory list
      await this.fetchInventories();
    },
  },

  mounted() {
    this.fetchInventories();
    this.loadDentalCharts().then(() => {
      console.log("Dental charts loaded:", this.dentalCharts);
      this.deductInventoryInDatabase(); // now will actually process charts
    });
  },
};
</script>

<style scoped></style>
