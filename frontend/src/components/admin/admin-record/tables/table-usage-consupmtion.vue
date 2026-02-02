<template>
  <div v-if="isTable" class="p-2 max-h-[85vh] overflow-y-auto">
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

    <!-- Inventory Usage Summary Table -->
    <div class="bg-white rounded-xl shadow border p-4 overflow-x-auto mt-6">
      <h2 class="text-lg font-semibold mb-4">Inventory Usage Summary</h2>
      <table class="min-w-full text-sm border-separate border-spacing-y-2">
        <thead class="bg-[#34699A] text-white">
          <tr>
            <th class="px-4 py-3 text-left">Inventory Name</th>
            <th class="px-4 py-3 text-center">Total Used</th>
            <th class="px-4 py-3 text-center">Available Stock</th>
            <th class="px-4 py-3 text-center">Status</th>
            <th class="px-4 py-3 text-center">Restock Needed?</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in totalInventoryUsage"
            :key="item.inventory_id"
            class="bg-white hover:bg-green-50 border rounded"
          >
            <td class="px-4 py-2">{{ item.name }}</td>
            <td class="px-4 py-2 text-center">
              {{ item.totalUsed }} {{ item.unit }}
            </td>
            <td class="px-4 py-2 text-center">
              {{ item.stock }} {{ item.unit }}
            </td>
            <!-- Status Badge -->
            <td class="px-4 py-2 text-center">
              <span
                :class="[
                  'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                  item.stock < 30
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600',
                ]"
              >
                {{ item.stock < 30 ? "Low Stock" : "In Stock" }}
              </span>
            </td>
            <!-- Restock Needed Badge -->
            <td class="px-4 py-2 text-center">
              <span
                :class="[
                  'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                  item.stock < 30
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600',
                ]"
              >
                {{ item.stock < 30 ? "Yes" : "No" }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// import dayjs from "dayjs";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";
import graphSupplyConsumption from "../graphs/graph-supply-consumption.vue";

export default {
  components: { graphSupplyConsumption },
  data() {
    return {
      isTable: true,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications", "inventories"]),

    // Aggregate inventory usage across all medications
    totalInventoryUsage() {
      const map = {};

      (this.medications || []).forEach((med) => {
        // Procedure inventory
        this.getProcedureInventoryTotals(med).forEach((item) => {
          if (!map[item.inventory_id]) {
            map[item.inventory_id] = {
              inventory_id: item.inventory_id,
              name: item.name,
              totalUsed: 0,
              unit: item.unit,
              stock: 0, // will fill from inventories
            };
          }
          map[item.inventory_id].totalUsed += Number(item.total || 0);
        });

        // Additional inventory
        this.getAdditionalInventoryTotals(med).forEach((item) => {
          if (!map[item.inventory_id]) {
            map[item.inventory_id] = {
              inventory_id: item.inventory_id,
              name: item.name,
              totalUsed: 0,
              unit: item.unit,
              stock: 0,
            };
          }
          map[item.inventory_id].totalUsed += Number(item.total || 0);
        });
      });

      // Add stock from inventories store
      (this.inventories || []).forEach((inv) => {
        if (map[inv.inventory_id]) {
          map[inv.inventory_id].stock = inv.quantity || 0;
        } else {
          map[inv.inventory_id] = {
            inventory_id: inv.inventory_id,
            name: inv.name,
            totalUsed: 0,
            unit: inv.unit || "pcs",
            stock: inv.quantity || 0,
          };
        }
      });

      return Object.values(map);
    },
  },
  methods: {
    // 🔴 PROCEDURE INVENTORY (FROM TEETH)
    getProcedureInventoryTotals(med) {
      const map = {};
      med?.dentalChart?.teeth?.forEach((tooth) => {
        const proc = tooth?.priceProcedure;
        if (!proc) return;
        const scope = proc.procedure_scope || "PER_TOOTH";

        tooth?.priceProcedure?.procedureInventories?.forEach((pi) => {
          const inv = pi.inventory;
          if (!inv) return;

          const key =
            scope === "ALL_TEETH"
              ? inv.inventory_id
              : `${inv.inventory_id}-${tooth.tooth_id}`;
          if (map[key] && scope === "ALL_TEETH") return;

          if (!map[key]) {
            map[key] = {
              inventory_id: inv.inventory_id,
              name: inv.name,
              unit: inv.unit || "pcs",
              total: 0,
            };
          }

          map[key].total += Number(pi.quantity || 0);
        });
      });

      return Object.values(map);
    },

    // 🔵 ADDITIONAL INVENTORY (LOOKUP NAME FROM INVENTORIES STORE)
    getAdditionalInventoryTotals(med) {
      const map = {};
      const inventoryLookup = new Map(
        (this.inventories || []).map((inv) => [inv.inventory_id, inv.name]),
      );

      med?.dentalChart?.addItems?.forEach((item) => {
        const inventoryId = item.inventory_id;
        if (!map[inventoryId]) {
          map[inventoryId] = {
            inventory_id: inventoryId,
            name:
              item.inventory_name ||
              inventoryLookup.get(inventoryId) ||
              "Inventory",
            unit: item.unit || "pcs",
            total: 0,
          };
        }
        map[inventoryId].total += Number(item.pcs || 0);
      });

      return Object.values(map);
    },
  },
  mounted() {
    const store = useFetchDataStore();
    store.fetchMedications?.();
    store.fetchInventories?.();
  },
};
</script>
