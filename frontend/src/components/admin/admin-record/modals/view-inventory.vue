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

      <!-- Select Dropdown -->
      <select
        v-model="selectedUnit"
        class="border border-gray-300 focus:ring-2 focus:ring-blue-500 px-4 py-3 rounded-lg w-full md:w-[10vw] transition"
      >
        <option value="">All Units</option>
        <option v-for="unit in availableUnits" :key="unit">{{ unit }}</option>
      </select>

      <!-- Action Buttons -->
      <div class="flex gap-2 ml-auto">
        <div
          @click="exportToPDF"
          class="flex items-center gap-2 px-4 py-2 border text-blue-600 border-blue-600 rounded-xl hover:bg-blue-100 hover:shadow-lg cursor-pointer transition duration-200"
        >
          <div
            class="p-1 bg-blue-900 bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <icon :name="'circle-arrow-down'" class="w-4 h-4" />
          </div>
          <span class="font-medium text-sm">Download PDF</span>
        </div>

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
          class="border rounded-xl shadow-sm bg-white hover:shadow-md transition relative overflow-hidden min-h-[40vh] flex flex-col justify-between"
          :class="{ 'border-red-500': item.quantity <= 5 }"
        >
          <!-- Image wrapper with badge -->
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

            <!-- Expired Badge (Takes Priority) -->
            <div
              v-if="isExpired(item.expiration)"
              class="absolute top-2 right-2 bg-red-700 text-white text-xs font-semibold px-2 py-1 rounded-md shadow"
            >
              Expired
            </div>

            <!-- Out of Stock Badge -->
            <div
              v-else-if="item.quantity === 0"
              class="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow"
            >
              Out of Stock
            </div>

            <!-- Low Stock Badge -->
            <div
              v-else-if="item.quantity > 0 && item.quantity <= 5"
              class="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow"
            >
              Low Stock
            </div>
          </div>

          <div class="p-4">
            <h2 class="text-lg font-semibold text-gray-800 truncate border-b">
              {{ item.name }}
            </h2>

            <div class="flex flex-col text-sm mt-2 space-y-1">
              <p class="text-gray-600 flex gap-1">
                <span class="font-semibold">Type:</span>
                <span class=" ">{{ item.type }}</span>
              </p>

              <p
                v-if="item.type === 'Medication'"
                class="text-gray-600 flex gap-1"
              >
                <span class="font-semibold">Dosage:</span>
                <span class=" ">{{
                  item.dosage ? item.dosage + "" : "N/A"
                }}</span>
              </p>

              <p class="text-gray-700 flex gap-1 items-center">
                <span class="font-semibold">Quantity:</span>
                <span class=" ">{{ item.quantity }}</span>
              </p>

              <p class="text-gray-600 flex gap-1">
                <span class="font-semibold">Unit:</span>
                <span class=" ">{{ item.unit }}</span>
              </p>

              <p class="text-gray-600 flex gap-1">
                <span class="font-semibold">Expiration:</span>
                <span>
                  {{ item.expiration ? formatDate(item.expiration) : "N/A" }}
                </span>
              </p>
            </div>
          </div>

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
        <!-- Header -->

        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">
              {{ editIndex !== null ? "Edit" : "Add" }} Inventory Item
            </h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Form -->
        <form @submit.prevent="saveItem" class="space-y-2 text-sm p-5">
          <div class="w-full gap-2 flex">
            <!-- Name -->
            <div class="w-full space-y-2 text-left flex flex-col">
              <label class="font-semibold text-gray-700">Item Name</label>
              <input
                v-model="form.name"
                required
                type="text"
                placeholder="Enter item name"
                class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              />
            </div>
            <!-- Type -->
            <div class="w-full space-y-2 text-left flex flex-col">
              <label class="font-semibold text-gray-700">Type</label>
              <select
                v-model="form.type"
                required
                class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select type</option>
                <option value="Medication">Medication</option>
                <option value="Dental Tool">Dental Tool</option>
              </select>
            </div>

            <!-- Dosage (Only for Medication) -->
            <div
              v-if="form.type === 'Medication'"
              class="w-full space-y-2 text-left flex flex-col"
            >
              <label class="font-semibold text-gray-700"
                >Dosage (e.g., 500mg)</label
              >
              <input
                v-model="form.dosage"
                type="text"
                placeholder="Enter dosage"
                class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              />
            </div>
          </div>
          <div class="w-full gap-2 flex">
            <!-- Quantity -->
            <div class="w-full space-y-2 text-left flex flex-col">
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
            <div class="w-full space-y-2 text-left flex flex-col">
              <label class="font-semibold text-gray-700">Unit</label>
              <select
                v-model="form.unit"
                required
                class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select unit</option>
                <option value="pcs">pcs</option>
                <option value="box">box</option>
                <option value="set">set</option>
                <option value="bottle">bottle</option>
                <option value="ml">ml</option>
                <option value="mg">mg</option>
                <option value="tube">tube</option>
                <option value="cartridge">cartridge</option>
                <option value="roll">roll</option>
                <option value="pack">pack</option>
                <option value="strip">strip</option>
              </select>
            </div>
          </div>

          <!-- Price Per Unit -->
          <div
            class="w-full space-y-2 text-left flex flex-col"
            v-if="form.type === 'Medication'"
          >
            <label class="font-semibold text-gray-700">Price per Unit</label>
            <input
              v-model.number="form.price_per_unit"
              required
              min="0"
              type="number"
              placeholder="e.g. 5.00"
              step="0.01"
              class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
            />
          </div>

          <!-- Expiration Date -->
          <div
            v-if="form.type === 'Medication'"
            class="w-full space-y-2 text-left flex flex-col"
          >
            <label class="font-semibold text-gray-700">Expiration Date</label>
            <input
              v-model="form.expiration"
              required
              type="date"
              class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
            />
          </div>

          <!-- Image Upload -->
          <div class="w-full space-y-2 text-left flex flex-col">
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
      class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50 w-min-screen"
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
        Are you sure you want to delete this record? This action cannot be
        undone.
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
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import axios from "axios";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;
import { toast } from "vue3-toastify";
export default {
  name: "InventoryPage",
  components: {
    icon,
  },
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
      form: {
        name: "",
        quantity: null,
        unit: "",
        expiration: "No Date",
        file: null,
        preview: null,
        price_per_unit: null,
        type: "",
        selectedType: "",
        dosage: "",
      },
    };
  },
  watch: {
    "form.type"(newType) {
      if (newType === "Dental Tool") {
        this.form.expiration = null; // JavaScript null
      }
    },
  },

  computed: {
    availableUnits() {
      return [...new Set(this.inventories.map((item) => item.type))].filter(
        Boolean
      );
    },

    filteredInventories() {
      return this.inventories.filter((item) => {
        const matchSearch = item.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        const matchUnit = this.selectedUnit
          ? item.type === this.selectedUnit
          : true;
        const matchType = this.selectedType
          ? item.type === this.selectedType
          : true;
        return matchSearch && matchUnit && matchType;
      });
    },
  },
  mounted() {
    this.fetchInventories();
  },
  methods: {
    isExpired(dateStr) {
      if (!dateStr) return false;
      const today = new Date();
      const expDate = new Date(dateStr);
      // Compare only date (ignore time)
      return expDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString();
    },

    async fetchInventories() {
      const res = await axios.get(
        process.env.VUE_APP_API_BASE_URL + "/inventory/get-inventory"
      );
      this.inventories = res.data.map((item) => ({
        ...item,
        image: item.image
          ? `http://localhost:8000/inventory/inventory-image/${item.inventory_id}`
          : null,
        id: item.inventory_id, // normalize the ID field
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
        expiration: "",
        file: null,
        preview: null,
      };
      this.editIndex = null;
    },

    async confirmDelete() {
      try {
        await axios.delete(
          `http://localhost:8000/inventory/delete/${this.deleteTarget}`
        );
        toast.success("Record deleted successfully");
      } catch (err) {
        console.error("Failed to delete:", err);
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
        price_per_unit: item.price_per_unit,
        expiration: item.expiration?.slice(0, 10),
        file: null,
        preview: item.image,
        type: item.type,
        dosage: item.dosage || "",
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
      formData.append("type", this.form.type);
      formData.append("dosage", this.form.dosage || "");

      // Only append expiration if it has a value
      if (this.form.expiration) {
        formData.append("expiration", this.form.expiration);
      }

      // Only append expiration if it has a value
      if (this.form.price_per_unit) {
        formData.append("price_per_unit", this.form.price_per_unit);
      }

      // Only append image if it exists
      if (this.form.file) {
        formData.append("image", this.form.file);
      }

      try {
        if (this.editIndex === null) {
          // Create
          await axios.post(
            process.env.VUE_APP_API_BASE_URL + "/inventory/add-inventory",
            formData
          );
          toast.success("Record is saved successfully");
        } else {
          // Update
          const id = this.inventories[this.editIndex].id;
          await axios.patch(
            `http://localhost:8000/inventory/update/${id}`,
            formData
          );
          toast.success("Record is saved successfully");
        }

        this.fetchInventories();
        this.closeModal();
      } catch (err) {
        console.error(err);
        toast.error("Failed to save item.");
      }
    },
    deleteItem(id, index) {
      this.deleteTarget = id;
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },

    exportToPDF() {
      const body = [["Name", "Quantity", "Unit", "Expiration"]];
      this.inventories.forEach((item) => {
        body.push([
          item.name,
          item.quantity.toString(),
          item.unit,
          this.formatDate(item.expiration),
        ]);
      });

      pdfMake
        .createPdf({
          content: [
            { text: "Dental Inventory Report", style: "header" },
            { table: { headerRows: 1, body } },
          ],
          styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
          },
        })
        .download("inventory.pdf");
    },
  },
};
</script>

<style scoped>
/* Optional custom styles */
</style>
