<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        ref="procedureForm"
        class="w-auto bg-white text-[13px] rounded-[15px] shadow-l p-0.5"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">Add Procedure</h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Form -->
        <div class="p-5 w-[27vw] space-y-4">
          <!-- Procedure Name -->
          <div class="space-y-1.5 text-left flex flex-col">
            <label for="procedure_name" class="font-bold"
              >Procedure Name:</label
            >
            <input
              v-model="form.procedure_name"
              type="text"
              id="procedure_name"
              required
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="Enter procedure name"
            />
          </div>

          <!-- Price -->
          <div class="space-y-1.5 text-left flex flex-col">
            <label for="price" class="font-bold">Price (₱):</label>
            <input
              v-model="form.price"
              type="number"
              id="price"
              required
              step="0.01"
              min="0"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="Enter price"
            />
          </div>

          <!-- Inventory Selection -->
          <div class="flex flex-col gap-2 relative">
            <label class="font-bold">Select Inventory Items:</label>
            <input
              type="text"
              v-model="searchInventoryQuery"
              @focus="showInventoryDropdown = true"
              @blur="hideDropdown('inventory')"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="Search inventory..."
            />

            <!-- Dropdown -->
            <div
              v-if="showInventoryDropdown"
              class="absolute left-0 top-full z-30 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto w-full mt-1"
            >
              <div
                v-for="item in filteredInventories"
                :key="item.inventory_id"
                class="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b"
                @mousedown.prevent="toggleInventory(item)"
              >
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-800">{{
                    item.name
                  }}</span>
                  <span class="text-xs text-gray-600 italic"
                    >{{ item.type }} • {{ item.quantity }} {{ item.unit }}</span
                  >
                </div>
              </div>
              <div
                v-if="filteredInventories.length === 0"
                class="p-3 text-gray-500 italic text-center text-sm"
              >
                No inventory found
              </div>
            </div>

            <!-- Selected Inventories -->
            <div
              v-if="form.selected_inventories.length > 0"
              class="mt-2 space-y-2"
            >
              <div
                v-for="(item, index) in form.selected_inventories"
                :key="item.inventory_id"
                class="flex justify-between items-center border border-green-300 bg-white shadow-sm rounded-lg px-4 py-2"
              >
                <div class="flex flex-col w-full text-sm">
                  <div class="flex justify-between items-center">
                    <span>
                      {{ item.name }}
                      <span class="text-xs text-gray-500"
                        >({{ item.type }} • {{ item.quantity }}
                        {{ item.unit }})</span
                      >
                    </span>

                    <input
                      type="number"
                      min="1"
                      class="border rounded px-2 py-1 w-[70px] text-sm"
                      v-model.number="item.selected_quantity"
                      placeholder="pcs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  @click="removeInventory(index)"
                  class="ml-3 text-red-500 text-xs hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="space-y-1.5 text-left flex flex-col">
            <label for="is_active" class="font-bold">Status:</label>
            <select
              v-model="form.is_active"
              id="is_active"
              required
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select status</option>
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>

          <!-- Status Color -->
          <div class="space-y-1.5 text-left flex flex-col">
            <label for="status_color" class="font-bold">Status Color:</label>
            <select
              v-model="form.status_color"
              id="status_color"
              required
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select a color</option>
              <option value="bg-[#34699A]">🔵 Blue</option>
              <option value="bg-yellow-400">🟡 Yellow</option>
              <option value="bg-red-400">🔴 Red</option>
              <option value="bg-gray-400">⚪ Gray</option>
              <option value="bg-green-400">🟢 Green</option>
              <option value="bg-purple-400">🟣 Purple</option>
              <option value="bg-pink-400">🌸 Pink</option>
              <option value="bg-orange-400">🟠 Orange</option>
            </select>
          </div>

          <!-- Divider -->
          <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>

          <!-- Buttons -->
          <div class="tracking-wide flex justify-end gap-2 mt-4">
            <button
              class="bg-red-600 p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              class="bg-[#34699A] p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
              type="submit"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import { toast } from "vue3-toastify";
import axios from "axios";

export default {
  name: "AddPriceProcedure",
  components: { icon },
  data() {
    return {
      form: {
        procedure_name: "",
        price: "",
        inventory_id: "",
        selected_inventories: [],
        is_active: "",
        status_color: "",
      },
      inventories: [],
      searchInventoryQuery: "",
      showInventoryDropdown: false,
      loading: false,
      error: null,
    };
  },
  computed: {
    filteredInventories() {
      return this.inventories.filter(
        (inv) =>
          inv.name
            .toLowerCase()
            .includes(this.searchInventoryQuery.toLowerCase()) &&
          !this.form.selected_inventories.find(
            (i) => i.inventory_id === inv.inventory_id
          )
      );
    },
  },
  created() {
    this.fetchInventories();
  },
  methods: {
    hideDropdown(type) {
      setTimeout(() => {
        if (type === "inventory") this.showInventoryDropdown = false;
      }, 150);
    },
    toggleInventory(item) {
      this.form.selected_inventories.push({ ...item, selected_quantity: 1 });
      this.searchInventoryQuery = "";
      this.showInventoryDropdown = false;
    },
    removeInventory(index) {
      this.form.selected_inventories.splice(index, 1);
    },
    async fetchInventories() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/inventory/get-inventory"
        );
        this.inventories = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch inventories";
        toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },
    async submitData() {
      const formEl = this.$refs.procedureForm;
      if (!formEl.checkValidity()) {
        formEl.reportValidity();
        return;
      }

      try {
        const payload = {
          procedure_name: this.form.procedure_name,
          price: parseFloat(this.form.price),
          inventory_ids: this.form.selected_inventories.map((i) => ({
            inventory_id: i.inventory_id,
            quantity: i.selected_quantity,
          })),
          inventory_id: this.form.selected_inventories[0]?.inventory_id || null, // first inventory
          is_active:
            this.form.is_active === true || this.form.is_active === "true",
          status_color: this.form.status_color,
        };

        await axios.post(
          process.env.VUE_APP_API_BASE_URL +
            "/price-procedure/add-price-procedure",
          payload
        );

        console.log("Send to Database ", payload);
        toast.success("Procedure added successfully!");
        new Audio(require("@/assets/add.mp3")).play();

        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to add procedure."
        );
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.3s ease-out;
}
</style>
