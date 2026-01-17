<template>
  <div v-if="isTable" class="p-2 max-h-[80vh] overflow-y-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold">Usage Consumption</h1>
      <p class="text-sm text-gray-500 mt-1">
        Overview of inventory usage by patient and procedures. View details
        below or analyze the graph.
      </p>
    </div>

    <!-- Graph -->
    <div class="grid grid-cols-1 mb-6">
      <div class="bg-white rounded-2xl shadow p-5 h-[440px]">
        <graphSupplyConsumption />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow border p-4 overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-y-2 text-sm">
        <thead class="bg-[#34699A] text-white">
          <tr>
            <th class="px-4 py-3 text-left">No.</th>
            <th class="px-4 py-3 text-left">Patient</th>
            <th class="px-4 py-3 text-center">Inventory Used</th>
            <th class="px-4 py-3 text-center">Procedure Date</th>
            <th class="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(med, index) in paginatedData"
            :key="med.prescription_id"
            class="bg-white hover:bg-green-50 border rounded"
          >
            <td class="px-4 py-2">{{ startIndex + index }}</td>

            <td class="px-4 py-2">
              {{
                med?.dentalChart?.patient
                  ? `${med.dentalChart.patient.last_name}, ${med.dentalChart.patient.first_name}`
                  : "—"
              }}
            </td>

            <!-- Short summary -->
            <td class="px-4 py-2 text-center">
              <span
                v-if="getProcedureInventoryTotals(med).length"
                class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700"
              >
                Procedure
              </span>

              <span
                v-if="getAdditionalInventoryTotals(med).length"
                class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 ml-1"
              >
                Additional
              </span>

              <span v-if="!hasAnyInventory(med)" class="text-gray-400">
                —
              </span>
            </td>

            <!-- Procedure Date -->
            <td class="px-4 py-2 text-center">
              {{
                med?.dentalChart?.procedure_date
                  ? formatDate(med.dentalChart.procedure_date)
                  : "—"
              }}
            </td>

            <td class="px-4 py-2 text-center">
              <button
                @click="openViewModal(med)"
                class="px-3 py-1 border border-blue-400 text-blue-700 rounded hover:bg-blue-100"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- VIEW MODAL -->
    <div
      v-if="showViewModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div class="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">
        <!-- Close -->
        <button
          @click="closeViewModal"
          class="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        <!-- Header -->
        <h2 class="text-lg font-semibold mb-2">Usage & Consumption Details</h2>

        <div class="text-sm text-gray-600 mb-4">
          <div>
            <strong>Patient:</strong>
            {{
              selectedRecord?.dentalChart?.patient
                ? `${selectedRecord.dentalChart.patient.last_name}, ${selectedRecord.dentalChart.patient.first_name}`
                : "—"
            }}
          </div>
          <div>
            <strong>Procedure Date:</strong>
            {{
              selectedRecord?.dentalChart?.procedure_date
                ? formatDate(selectedRecord.dentalChart.procedure_date)
                : "—"
            }}
          </div>
        </div>

        <!-- PROCEDURE USAGE -->
        <div v-if="procedureTotals.length" class="mb-4">
          <h3 class="font-medium text-sm mb-2 text-red-600">
            Procedure Inventory Usage
          </h3>

          <table class="w-full text-sm border">
            <thead class="bg-red-50">
              <tr>
                <th class="px-3 py-2 text-left">Procedure</th>
                <th class="px-3 py-2 text-left">Item</th>
                <th class="px-3 py-2 text-center">Quantity</th>
                <th class="px-3 py-2 text-center">Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in procedureTotals"
                :key="item.inventory_id"
                class="border-t"
              >
                <td class="px-3 py-2">{{ item.procedure_name }}</td>
                <td class="px-3 py-2">{{ item.name }}</td>
                <td class="px-3 py-2 text-center">{{ item.total }}</td>
                <td class="px-3 py-2 text-center">{{ item.unit }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ADDITIONAL ITEMS -->
        <div v-if="additionalTotals.length">
          <h3 class="font-medium text-sm mb-2 text-blue-600">
            Additional Items Used
          </h3>

          <table class="w-full text-sm border">
            <thead class="bg-blue-50">
              <tr>
                <th class="px-3 py-2 text-left">Item</th>
                <th class="px-3 py-2 text-center">Quantity</th>
                <th class="px-3 py-2 text-center">Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in additionalTotals"
                :key="item.inventory_id"
                class="border-t"
              >
                <td class="px-3 py-2">{{ item.name }}</td>
                <td class="px-3 py-2 text-center">{{ item.total }}</td>
                <td class="px-3 py-2 text-center">{{ item.unit }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!procedureTotals.length && !additionalTotals.length"
          class="text-center text-gray-400 mt-6"
        >
          No inventory usage recorded.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";
import graphSupplyConsumption from "../graphs/graph-supply-consumption.vue";

export default {
  components: { graphSupplyConsumption },
  data() {
    return {
      isTable: true,
      currentPage: 1,
      itemsPerPage: 10,
      showViewModal: false,
      selectedRecord: null,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications", "inventories"]),

    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return (this.medications || []).slice(start, start + this.itemsPerPage);
    },

    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    procedureTotals() {
      return this.selectedRecord
        ? this.getProcedureInventoryTotals(this.selectedRecord)
        : [];
    },

    additionalTotals() {
      return this.selectedRecord
        ? this.getAdditionalInventoryTotals(this.selectedRecord)
        : [];
    },
  },
  methods: {
    formatDate(date) {
      return dayjs(date).format("MMM DD, YYYY");
    },

    openViewModal(record) {
      this.selectedRecord = record;
      this.showViewModal = true;
    },

    closeViewModal() {
      this.showViewModal = false;
      this.selectedRecord = null;
    },

    hasAnyInventory(med) {
      return (
        (med?.dentalChart?.teeth?.length || 0) +
        (med?.dentalChart?.addItems?.length || 0)
      );
    },

    // 🔴 PROCEDURE INVENTORY (FROM TEETH)
    getProcedureInventoryTotals(med) {
      const map = {};
      const countedAllTeeth = new Set(); // track ALL_TEETH inventories

      med?.dentalChart?.teeth?.forEach((tooth) => {
        const proc = tooth?.priceProcedure;
        if (!proc) return;

        const procedureName = proc.procedure_name || "Procedure";
        const scope = proc.procedure_scope || "PER_TOOTH";

        tooth?.priceProcedure?.procedureInventories?.forEach((pi) => {
          const inv = pi.inventory;
          if (!inv) return;

          // If ALL_TEETH, count only once per procedure
          const key =
            scope === "ALL_TEETH"
              ? `${inv.inventory_id}`
              : `${inv.inventory_id}-${tooth.tooth_id}`;
          if (map[key] && scope === "ALL_TEETH") return;

          if (!map[key]) {
            map[key] = {
              inventory_id: inv.inventory_id,
              name: inv.name,
              unit: inv.unit || "pcs",
              total: 0,
              procedure_name: procedureName,
            };
          }

          map[key].total += Number(pi.quantity || 0);

          if (scope === "ALL_TEETH") countedAllTeeth.add(inv.inventory_id);
        });
      });

      return Object.values(map);
    },

    // 🔵 ADDITIONAL INVENTORY (LOOKUP NAME FROM INVENTORIES STORE)
    getAdditionalInventoryTotals(med) {
      const map = {};
      const inventoryLookup = new Map();
      (this.inventories || []).forEach((inv) => {
        inventoryLookup.set(inv.inventory_id, inv.name);
      });

      med?.dentalChart?.addItems?.forEach((item) => {
        const name = inventoryLookup.get(item.inventory_id) || "Inventory";

        if (!map[item.inventory_id]) {
          map[item.inventory_id] = {
            inventory_id: item.inventory_id,
            name,
            unit: "pcs",
            total: 0,
          };
        }

        map[item.inventory_id].total += Number(item.pcs || 0);
      });

      return Object.values(map);
    },
  },

  mounted() {
    const store = useFetchDataStore();
    store.fetchMedications?.();
    store.fetchInventories?.(); // ensure inventory names are loaded
  },
};
</script>
