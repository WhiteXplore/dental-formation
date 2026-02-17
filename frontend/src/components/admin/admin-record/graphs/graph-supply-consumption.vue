<template>
  <div class="bg-white rounded-2xl h-[43vh] flex flex-col">
    <div class="flex-1">
      <canvas v-if="chartData.labels.length" ref="supplyChart"></canvas>
      <div v-else class="w-full h-full flex justify-center items-center">
        <p class="text-gray-400 text-center text-lg">No Data Available</p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  BarController,
} from "chart.js";
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";

Chart.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  BarController,
);

export default {
  name: "GraphSupplyConsumption",

  props: {
    filter: {
      type: Object,
      default: () => ({
        year: null,
        month: null,
      }),
    },
  },

  data() {
    return {
      chartInstance: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications", "inventories"]),

    filteredMedications() {
      if (!Array.isArray(this.medications)) return [];

      return this.medications.filter((med) => {
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

    chartData() {
      const monthMap = new Map(); // month -> { inventories: Map(name->qty), addItems: Map(inventory_id->qty) }
      const generateColor = (idx, type = "procedure") => {
        // Base hue spread for distinct colors
        const hue = (idx * 137) % 360;

        // Use more muted saturation for a professional look
        const saturation = type === "procedure" ? 55 : 45;

        // Adjust lightness slightly for additional items to differentiate stacks
        const lightness = type === "procedure" ? 50 : 65;

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      };

      // --- Create lookup for inventory_id -> name ---
      const inventoryLookup = new Map();
      (this.inventories || []).forEach((inv) => {
        inventoryLookup.set(inv.inventory_id, inv.name);
      });

      // inside computed -> chartData
      this.filteredMedications.forEach((med) => {
        const dateStr = med?.dentalChart?.procedure_date;
        if (!dateStr) return;

        const date = new Date(dateStr);
        const monthLabel = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        if (!monthMap.has(monthLabel)) {
          monthMap.set(monthLabel, {
            inventories: new Map(),
            addItems: new Map(),
          });
        }
        const monthData = monthMap.get(monthLabel);

        // Track which ALL_TEETH inventories we've already counted per procedure
        const countedAllTeeth = new Set();

        const teeth = med?.dentalChart?.teeth || [];
        teeth.forEach((tooth) => {
          const proc = tooth?.priceProcedure;
          if (!proc) return;

          const scope = proc.procedure_scope || "PER_TOOTH";
          const inventories = proc?.procedureInventories || [];

          inventories.forEach((pi) => {
            const name = pi?.inventory?.name || "Unknown";
            const qty = Number(pi?.quantity || 0);

            if (scope === "ALL_TEETH") {
              // Only count once per procedure
              if (!countedAllTeeth.has(name)) {
                monthData.inventories.set(
                  name,
                  (monthData.inventories.get(name) || 0) + qty,
                );
                countedAllTeeth.add(name);
              }
            } else {
              // PER_TOOTH: count each tooth individually
              monthData.inventories.set(
                name,
                (monthData.inventories.get(name) || 0) + qty,
              );
            }
          });
        });

        // Additional Items
        const addItems = med?.dentalChart?.addItems || [];
        addItems.forEach((item) => {
          const inventoryId = item?.inventory_id;
          if (!inventoryId) return;

          const inventoryName = inventoryLookup.get(inventoryId) || "Unknown";
          const qty = Number(item?.pcs || 0);

          monthData.addItems.set(
            inventoryName,
            (monthData.addItems.get(inventoryName) || 0) + qty,
          );
        });
      });

      // --- Collect unique items ---
      const inventoryItems = new Set();
      const addItemItems = new Set();
      monthMap.forEach((data) => {
        data.inventories.forEach((_, name) => inventoryItems.add(name));
        data.addItems.forEach((_, key) => addItemItems.add(key));
      });

      // --- Sort months ---
      const months = Array.from(monthMap.keys()).sort(
        (a, b) => new Date(a + " 1") - new Date(b + " 1"),
      );

      // --- Procedure Inventory datasets ---
      const inventoryDatasets = Array.from(inventoryItems).map((name, idx) => ({
        label: `Inventory: ${name}`,
        data: months.map(
          (month) => monthMap.get(month).inventories.get(name) || 0,
        ),
        backgroundColor: generateColor(idx),

        borderRadius: 6,
        barThickness: 70,
        stack: "inventories",
      }));

      // --- Add Item datasets ---
      const addItemDatasets = Array.from(addItemItems).map((key, idx) => {
        const [name] = key.split("|"); // ESLint-safe
        return {
          label: `Add Item: ${name}`,
          data: months.map(
            (month) => monthMap.get(month).addItems.get(key) || 0,
          ),
          backgroundColor: `hsl(${(idx * 60 + 180) % 360}, 70%, 50%)`,
          borderRadius: 6,
          barThickness: 70,
          stack: "addItems",
        };
      });

      return {
        labels: months,
        datasets: [...inventoryDatasets, ...addItemDatasets],
      };
    },
  },

  watch: {
    chartData: {
      async handler() {
        await this.$nextTick();
        this.renderChart();
      },
      deep: true,
    },
    filter: {
      async handler() {
        await this.$nextTick();
        this.renderChart();
      },
      deep: true,
    },
  },

  methods: {
    renderChart() {
      const canvas = this.$refs.supplyChart;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }

      if (!this.chartData.labels.length) return;

      this.chartInstance = new Chart(ctx, {
        type: "bar",
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            tooltip: { mode: "index", intersect: false },
            legend: { position: "top" },
          },
          scales: {
            x: {
              stacked: true,
              title: { display: true, text: "Month" },
              grid: { display: false },
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: { display: true, text: "Quantity Used" },
              ticks: { stepSize: 1 },
              grid: { color: "#f1f5f9" },
            },
          },
        },
      });
    },
  },

  mounted() {
    const store = useFetchDataStore();
    store.fetchMedications();
    store.fetchInventories(); // make sure inventories are loaded
  },
};
</script>
