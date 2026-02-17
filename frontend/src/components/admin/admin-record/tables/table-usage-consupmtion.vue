<template>
  <div v-if="isTable" class="p-2 max-h-[85vh] overflow-y-auto">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Usage Consumption</h1>
        <p class="text-sm text-gray-500 mt-1">
          Overview of inventory usage by patient and procedures. View details
          below or analyze the graph.
        </p>
      </div>

      <!-- Month & Year Filter + Download Type -->
      <div class="flex gap-2 items-center">
        <!-- Month Dropdown -->
        <div class="relative">
          <button
            @click="showMonthDropdown = !showMonthDropdown"
            class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 flex items-center justify-between w-full"
          >
            {{ filter.month ? months[filter.month - 1] : "Select Month" }}
            <svg
              class="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <ul
            v-show="showMonthDropdown"
            class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            <li
              @click="
                filter.month = '';
                showMonthDropdown = false;
              "
              class="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
            >
              All Months
            </li>
            <li
              v-for="(m, idx) in months"
              :key="idx"
              @click="
                filter.month = idx + 1;
                showMonthDropdown = false;
              "
              class="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
            >
              {{ m }}
            </li>
          </ul>
        </div>

        <!-- Year Dropdown -->
        <div class="relative">
          <button
            @click="showYearDropdown = !showYearDropdown"
            class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 flex items-center justify-between w-full"
          >
            {{ filter.year || "Select Year" }}
            <svg
              class="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <ul
            v-show="showYearDropdown"
            class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            <li
              @click="
                filter.year = '';
                showYearDropdown = false;
              "
              class="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
            >
              All Years
            </li>
            <li
              v-for="y in years"
              :key="y"
              @click="
                filter.year = y;
                showYearDropdown = false;
              "
              class="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
            >
              {{ y }}
            </li>
          </ul>
        </div>

        <!-- Download Type Dropdown -->
        <div class="relative">
          <button
            @click="showDownloadDropdown = !showDownloadDropdown"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 flex items-center justify-between w-full"
          >
            Download
            <svg
              class="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <ul
            v-show="showDownloadDropdown"
            class="absolute right-0 z-10 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-auto"
          >
            <li
              @click="
                exportReport('pdf');
                showDownloadDropdown = false;
              "
              class="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
            >
              Export PDF
            </li>
            <li
              @click="
                exportReport('excel');
                showDownloadDropdown = false;
              "
              class="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
            >
              Export Excel
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Graph -->
    <div class="grid grid-cols-1 mb-6 mt-4">
      <div class="bg-white rounded-2xl shadow p-5 h-[440px]">
        <graphSupplyConsumption :filter="filter" />
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
            v-for="item in filteredTotalInventoryUsage"
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
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";
import graphSupplyConsumption from "../graphs/graph-supply-consumption.vue";

// PDF
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

// Excel
import * as XLSX from "xlsx";

export default {
  components: { graphSupplyConsumption },
  data() {
    return {
      isTable: true,
      filter: { month: "", year: "" },
      showMonthDropdown: false,
      showYearDropdown: false,
      showDownloadDropdown: false,
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications", "inventories"]),

    years() {
      const yearsSet = new Set(
        (this.medications || [])
          .map((m) => new Date(m?.dentalChart?.procedure_date)?.getFullYear())
          .filter(Boolean),
      );
      return Array.from(yearsSet).sort();
    },

    filteredMedications() {
      return (this.medications || []).filter((med) => {
        const dateStr = med?.dentalChart?.procedure_date;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        if (this.filter.year && date.getFullYear() !== Number(this.filter.year))
          return false;
        if (
          this.filter.month &&
          date.getMonth() + 1 !== Number(this.filter.month)
        )
          return false;
        return true;
      });
    },

    filteredTotalInventoryUsage() {
      const map = {};
      this.filteredMedications.forEach((med) => {
        this.getProcedureInventoryTotals(med).forEach((item) => {
          if (!map[item.inventory_id])
            map[item.inventory_id] = { ...item, totalUsed: 0, stock: 0 };
          map[item.inventory_id].totalUsed += Number(item.total || 0);
        });
        this.getAdditionalInventoryTotals(med).forEach((item) => {
          if (!map[item.inventory_id])
            map[item.inventory_id] = { ...item, totalUsed: 0, stock: 0 };
          map[item.inventory_id].totalUsed += Number(item.total || 0);
        });
      });
      (this.inventories || []).forEach((inv) => {
        if (map[inv.inventory_id])
          map[inv.inventory_id].stock = inv.quantity || 0;
        else
          map[inv.inventory_id] = {
            inventory_id: inv.inventory_id,
            name: inv.name,
            totalUsed: 0,
            unit: inv.unit || "pcs",
            stock: inv.quantity || 0,
          };
      });
      return Object.values(map);
    },
  },

  methods: {
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
          if (!map[key])
            map[key] = {
              inventory_id: inv.inventory_id,
              name: inv.name,
              unit: inv.unit || "pcs",
              total: 0,
            };
          map[key].total += Number(pi.quantity || 0);
        });
      });
      return Object.values(map);
    },

    getAdditionalInventoryTotals(med) {
      const map = {};
      const inventoryLookup = new Map(
        (this.inventories || []).map((inv) => [inv.inventory_id, inv.name]),
      );
      med?.dentalChart?.addItems?.forEach((item) => {
        const inventoryId = item.inventory_id;
        if (!map[inventoryId])
          map[inventoryId] = {
            inventory_id: inventoryId,
            name:
              item.inventory_name ||
              inventoryLookup.get(inventoryId) ||
              "Inventory",
            unit: item.unit || "pcs",
            total: 0,
          };
        map[inventoryId].total += Number(item.pcs || 0);
      });
      return Object.values(map);
    },

    exportReport(type) {
      const filtered = this.filteredTotalInventoryUsage.map((item) => ({
        name: item.name,
        remainingStock: item.stock,
        usage: item.totalUsed,
        recommendation: item.stock < 30 ? 50 - item.stock : 0,
      }));

      const monthName = this.filter.month
        ? this.months[this.filter.month - 1]
        : "All";
      const yearValue = this.filter.year || new Date().getFullYear();

      if (type === "pdf") {
        // --- PDF Export ---
        const pdfBody = [
          [
            "Item Name",
            "Remaining Stock",
            "Usage (Current Month)",
            "Buy This Many",
          ],
        ];

        filtered.forEach((item) =>
          pdfBody.push([
            item.name,
            item.remainingStock.toString(),
            item.usage.toString(),
            item.recommendation.toString(),
          ]),
        );

        const docDefinition = {
          pageSize: "A4",
          pageOrientation: "portrait",
          content: [
            {
              text: "Inventory Usage Report",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              text: `Month: ${monthName}, Year: ${yearValue}`,
              margin: [0, 0, 0, 20],
            },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto", "auto", "auto"],
                body: pdfBody,
              },
              layout: {
                fillColor: (rowIndex) => (rowIndex === 0 ? "#ffffff" : null),
                hLineWidth: () => 2,
                vLineWidth: () => 0.5,
                hLineColor: () => "#cccccc",
                vLineColor: () => "#cccccc",
              },
            },
          ],
          styles: {
            header: { fontSize: 16, bold: true },
          },
          defaultStyle: {
            fontSize: 12,
          },
        };

        pdfMake
          .createPdf(docDefinition)
          .download(`Inventory_Usage_${monthName}_${yearValue}.pdf`);
      } else if (type === "excel") {
        // --- Excel Export ---
        const wsData = [
          [
            "Inventory Name",
            "Remaining Stock",
            "Usage (Current Month)",
            "Recommendation",
          ],
        ];
        filtered.forEach((item) =>
          wsData.push([
            item.name,
            item.remainingStock,
            item.usage,
            item.recommendation,
          ]),
        );

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Bold header & center alignment
        const headerRange = XLSX.utils.decode_range(ws["!ref"]);
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
          if (!ws[cellAddress]) continue;
          ws[cellAddress].s = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }

        // Set row heights (header taller)
        ws["!rows"] = [];
        for (let R = 0; R <= wsData.length; R++) {
          ws["!rows"][R] = { hpt: R === 0 ? 25 : 20 }; // header = 25pt, others = 20pt
        }

        // Optional: center-align number columns
        for (let R = 1; R < wsData.length; R++) {
          for (let C = 1; C <= 3; C++) {
            // columns 1-3 = numbers
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = {
              alignment: { horizontal: "center", vertical: "center" },
            };
          }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "InventoryUsage");
        XLSX.writeFile(wb, `Inventory_Usage_${monthName}_${yearValue}.xlsx`);
      }
    },
  },

  mounted() {
    const store = useFetchDataStore();
    store.fetchMedications?.();
    store.fetchInventories?.();
  },
};
</script>
