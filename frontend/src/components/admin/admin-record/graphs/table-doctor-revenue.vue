<template>
  <div class="bg-white">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
      👨‍⚕️ Doctor Revenue Summary
    </h3>

    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-700">
        <thead class="text-xs uppercase text-gray-500 bg-gray-50">
          <tr>
            <th class="px-4 py-2">Doctor</th>
            <th class="px-4 py-2">Patients</th>
            <th class="px-4 py-2">Revenue</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(doctor, i) in doctorRevenue"
            :key="i"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-4 py-3">{{ doctor.name }}</td>
            <td class="px-4 py-3">{{ doctor.patients }}</td>
            <td class="px-4 py-3">₱{{ doctor.revenue.toLocaleString() }}</td>
          </tr>

          <tr v-if="!doctorRevenue.length">
            <td colspan="3" class="text-center py-6 text-gray-400">
              No data available
            </td>
          </tr>
        </tbody>

        <tfoot class="bg-gray-50 font-semibold">
          <tr>
            <td class="px-4 py-3 text-right">Total</td>
            <td class="px-4 py-3">
              {{ doctorRevenue.reduce((sum, doc) => sum + doc.patients, 0) }}
            </td>
            <td class="px-4 py-3">
              ₱{{
                doctorRevenue
                  .reduce((sum, doc) => sum + doc.revenue, 0)
                  .toLocaleString()
              }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";

export default {
  name: "TableDoctorRevenue",

  props: {
    filter: {
      type: Object,
      default: () => ({ year: null, month: null }),
    },
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    // Apply same year/month filter
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

    // Doctor revenue summary
    doctorRevenue() {
      const map = new Map();

      this.filteredMedications.forEach((item) => {
        const chart = item.dentalChart;
        const doctor = chart?.user_accounts;
        const patient = chart?.patient;
        const teeth = chart?.teeth || [];
        const medications = item.prescribedMedications || [];

        if (!doctor || !patient) return;

        const doctorId = doctor.user_id;
        const patientId = patient.patient_id;

        if (!map.has(doctorId)) {
          map.set(doctorId, {
            name: `${doctor.first_name} ${doctor.last_name}`,
            patients: new Set(),
            revenue: 0,
            countedProcedures: new Map(), // for one_time procedures
          });
        }

        const entry = map.get(doctorId);
        entry.patients.add(patientId);

        // --- TEETH REVENUE BASED ON PATIENT PAYMENT AND PROCEDURE TYPE ---
        teeth.forEach((tooth) => {
          const procedure = tooth?.priceProcedure;
          if (!procedure) return;

          const patientPayment = parseFloat(
            tooth?.patient_payment || procedure.price || 0
          );
          const pricingScope = procedure.pricing_scope || "per_tooth_payment";
          const procName = procedure.procedure_name;
          const procedureType = procedure.procedure_type || "Basic Procedure";

          // Determine doctor share percentage
          let doctorShare = 0.4; // default 40%
          if (procedureType === "Special Case") doctorShare = 0.5;

          const revenueToAdd = patientPayment * doctorShare;

          if (pricingScope === "per_tooth_payment") {
            entry.revenue += revenueToAdd;
          } else if (pricingScope === "one_time") {
            if (!entry.countedProcedures.has(procName)) {
              entry.countedProcedures.set(procName, new Set());
            }
            const patientsSet = entry.countedProcedures.get(procName);
            if (!patientsSet.has(patientId)) {
              entry.revenue += revenueToAdd;
              patientsSet.add(patientId);
            }
          }
        });

        // --- MEDICATION REVENUE (unchanged, full price) ---
        medications.forEach((med) => {
          const unitPrice = parseFloat(med.inventory?.price_per_unit || 0);
          const pcs = med.pcs || 0;
          entry.revenue += unitPrice * pcs;
        });
      });

      return Array.from(map.values()).map((d) => ({
        name: d.name,
        patients: d.patients.size,
        revenue: d.revenue,
      }));
    },
  },

  mounted() {
    const store = useFetchDataStore();
    store.fetchMedications();
  },
};
</script>
