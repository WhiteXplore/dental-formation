<template>
  <div class="bg-white">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
      🦷 Patient by Procedure Type
    </h3>

    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-700">
        <thead class="text-xs uppercase text-gray-500 bg-gray-50">
          <tr>
            <th class="px-4 py-2">Procedure</th>
            <th class="px-4 py-2">Patients</th>
            <th class="px-4 py-2">Revenue</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, i) in procedureSummary"
            :key="i"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-4 py-3">{{ item.procedure }}</td>
            <td class="px-4 py-3">{{ item.patients }}</td>
            <td class="px-4 py-3">₱{{ item.revenue.toLocaleString() }}</td>
          </tr>

          <tr v-if="!procedureSummary.length">
            <td colspan="3" class="text-center py-6 text-gray-400">
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";

export default {
  name: "TablePatientProcedure",

  /* ✅ SAME FILTER USED BY CHARTS */
  props: {
    filter: {
      type: Object,
      default: () => ({
        year: null,
        month: null,
      }),
    },
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    /* ✅ APPLY DATE FILTER */
    filteredMedications() {
      if (!Array.isArray(this.medications)) return [];

      return this.medications.filter((item) => {
        const dateStr = item?.dentalChart?.procedure_date;
        if (!dateStr) return false;

        const date = new Date(dateStr);

        if (
          this.filter.year &&
          date.getFullYear() !== Number(this.filter.year)
        ) {
          return false;
        }

        if (
          this.filter.month &&
          date.getMonth() + 1 !== Number(this.filter.month)
        ) {
          return false;
        }

        return true;
      });
    },

    /* ✅ PROCEDURE SUMMARY */
    procedureSummary() {
      const map = new Map();

      this.filteredMedications.forEach((item) => {
        const dentalChart = item.dentalChart;
        const patient = dentalChart?.patient;
        const teeth = dentalChart?.teeth || [];

        if (!patient) return;
        const patientId = patient.patient_id;

        teeth.forEach((tooth) => {
          const procedure = tooth?.priceProcedure;
          if (!procedure) return;

          const name = procedure.procedure_name;
          const price = Number(procedure.price || 0);
          const pricingScope = procedure.pricing_scope || "per_tooth_payment"; // default fallback

          if (!map.has(name)) {
            map.set(name, {
              procedure: name,
              patients: new Set(),
              revenue: 0,
              countedPatients: new Set(), // for one_time procedures
            });
          }

          const entry = map.get(name);

          // Add patient to the patients count (always count unique patients)
          entry.patients.add(patientId);

          // Add revenue depending on pricing_scope
          if (pricingScope === "per_tooth_payment") {
            entry.revenue += price;
          } else if (pricingScope === "one_time") {
            // Only add price once per patient
            if (!entry.countedPatients.has(patientId)) {
              entry.revenue += price;
              entry.countedPatients.add(patientId);
            }
          }
        });
      });

      return Array.from(map.values()).map((p) => ({
        procedure: p.procedure,
        patients: p.patients.size,
        revenue: p.revenue,
      }));
    },
  },

  mounted() {
    const store = useFetchDataStore();
    store.fetchMedications();
  },
};
</script>
