<template>
  <div class="max-h-[40vh] overflow-y-auto">
    <div class="bg-white overflow-x-auto rounded-lg shadow-sm">
      <h2 class="text-lg font-semibold mb-4">Patient Payment History</h2>
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left">Patient</th>
            <th class="px-4 py-2 text-left">Scheduled Date</th>
            <th class="px-4 py-2 text-left">Total Amount</th>
            <th class="px-4 py-2 text-left">Procedure Type</th>
            <th class="px-4 py-2 text-left">Clinic Share</th>
            <th class="px-4 py-2 text-left">Doctor Share</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="item in filteredPayments"
            :key="item.prescription_id || item.id"
          >
            <td class="px-4 py-2">
              {{ item.dentalChart?.patient?.first_name || "-" }}
              {{ item.dentalChart?.patient?.last_name || "" }}
            </td>
            <td class="px-4 py-2">
              {{ formatDate(item.dentalChart?.procedure_date) }}
            </td>
            <td class="px-4 py-2">₱{{ formatCurrency(totalAmount(item)) }}</td>
            <td class="px-4 py-2">
              {{
                item.dentalChart?.teeth?.[0]?.priceProcedure?.procedure_type ||
                "-"
              }}
            </td>
            <td class="px-4 py-2">₱{{ formatCurrency(clinicShare(item)) }}</td>
            <td class="px-4 py-2">₱{{ formatCurrency(doctorShare(item)) }}</td>
          </tr>

          <!-- Show when no payments exist -->
          <tr v-if="!filteredPayments || filteredPayments.length === 0">
            <td colspan="7" class="text-center py-4 text-gray-400">
              No payment history available
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";

export default {
  name: "CardPatientByDoctor",

  props: {
    filter: {
      type: Object,
      default: () => ({ year: null, month: null }),
    },
  },

  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    filteredPayments() {
      return this.medications.filter((item) => {
        if (!item.dentalChart?.procedure_date) return false;
        const procedureDate = dayjs(item.dentalChart.procedure_date);
        const yearMatch = this.filter.year
          ? procedureDate.year() === +this.filter.year
          : true;
        const monthMatch = this.filter.month
          ? procedureDate.month() + 1 === +this.filter.month
          : true;
        return yearMatch && monthMatch;
      });
    },
  },

  methods: {
    formatDate(date) {
      return date ? dayjs(date).format("MMM D, YYYY") : "-";
    },

    formatCurrency(amount) {
      const val = parseFloat(amount) || 0;
      return val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    totalAmount(item) {
      let total = 0;

      // Teeth + ProcedureInventories
      item.dentalChart?.teeth?.forEach((tooth) => {
        total += parseFloat(tooth.priceProcedure?.price || 0);
        tooth.priceProcedure?.procedureInventories?.forEach((inv) => {
          total +=
            parseFloat(inv.inventory?.price_per_unit || 0) *
            parseFloat(inv.quantity || 0);
        });
      });

      // Medications
      item.prescribedMedications?.forEach((med) => {
        total +=
          parseFloat(med.inventory?.price_per_unit || 0) *
          parseFloat(med.pcs || 0);
      });

      // Override if patient_payment exists
      if (item.patient_payment) total = parseFloat(item.patient_payment);

      return total;
    },

    doctorShare(item) {
      const patientPayment = parseFloat(item.patient_payment || 0);
      const firstTooth = item.dentalChart?.teeth?.[0];
      const procedureType =
        firstTooth?.priceProcedure?.procedure_type || "Basic Procedure";

      if (procedureType === "Basic Procedure") return patientPayment * 0.4;
      if (procedureType === "Special Case") return patientPayment * 0.5;
      return patientPayment * 0.4;
    },

    clinicShare(item) {
      return this.totalAmount(item) - this.doctorShare(item);
    },
  },
};
</script>

<style scoped>
table th {
  font-weight: 600;
}
</style>
