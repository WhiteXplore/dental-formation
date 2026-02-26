<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
  >
    <div
      class="rounded-xl shadow-2xl animate-fadeInUp bg-white w-[600px] max-h-[90vh] overflow-y-auto"
    >
      <form @submit.prevent="submitData" ref="patientForm" class="text-[14px]">
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-xl flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-2 items-center">
            <icon :name="'payment'" />
            <h1 class="font-bold tracking-wide text-lg">
              Patient Billing Summary
            </h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Content -->
        <div class="px-6 py-5 space-y-6 text-sm text-gray-800">
          <!-- Patient Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-600 font-medium mb-1"
                >Patient Name</label
              >
              <div class="font-semibold">{{ patientFullName }}</div>
            </div>

            <div class="text-right">
              <label class="block text-gray-600 font-medium mb-1"
                >Payment Status</label
              >
              <div class="flex justify-end items-center gap-3">
                <span
                  v-if="!isEditingStatus"
                  @click="isEditingStatus = true"
                  :class="{
                    'bg-yellow-100 text-yellow-800':
                      form.payment_status === 'For Payment',
                    'bg-green-100 text-green-800':
                      form.payment_status === 'Paid',
                  }"
                  class="inline-block px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 transition"
                >
                  {{ form.payment_status }}
                </span>

                <!-- ✅ FIXED: NO API CALL HERE -->
                <select
                  v-else
                  v-model="form.payment_status"
                  @blur="isEditingStatus = false"
                  class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="For Payment">For Payment</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Payment Type -->
          <div class="grid grid-cols-2 gap-4 items-end">
            <div>
              <label class="block text-gray-600 font-medium mb-1"
                >Payment Type</label
              >
              <select
                v-model="form.payment_type"
                @change="updatePaymentAndGuarantor"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            <!-- HMO / Guarantor -->
            <div v-if="form.payment_type === 'Credit'" class="relative">
              <label class="block text-gray-600 font-medium mb-1"
                >HMO / Guarantor</label
              >
              <input
                type="text"
                v-model="searchQuery"
                @focus="showDropdown = true"
                @input="showDropdown = true"
                @blur="hideDropdown"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                placeholder="Search HMO / Guarantor..."
              />

              <ul
                v-show="showDropdown && filteredData.length"
                class="absolute z-50 bg-white border border-gray-300 rounded-md w-full mt-1 max-h-48 overflow-y-auto shadow-lg"
              >
                <li
                  v-for="item in filteredData"
                  :key="item.hmo_guarantor_id"
                  @mousedown.prevent="selectGuarantor(item)"
                  class="px-3 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {{ item.full_name }} - {{ item.company }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Excess -->
          <div>
            <label class="block text-gray-600 font-medium mb-1"
              >Excess Payment</label
            >
            <input
              type="number"
              step="0.01"
              v-model.number="form.excess_payment"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
            />
          </div>
          <!-- Tooth Procedure -->
          <div v-if="form.teeth?.length">
            <label class="block text-gray-600 font-semibold mb-2">
              Tooth Procedure Details
            </label>

            <div
              class="border border-gray-200 rounded-lg max-h-[30vh] overflow-y-auto"
            >
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-gray-600 font-medium">
                      Tooth #
                    </th>
                    <th class="px-4 py-2 text-left text-gray-600 font-medium">
                      Procedure
                    </th>
                    <th class="px-4 py-2 text-left text-gray-600 font-medium">
                      Pricing Scope
                    </th>
                    <th class="px-4 py-2 text-right text-gray-600 font-medium">
                      Fee (₱)
                    </th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="(tooth, index) in displayedTeeth"
                    :key="tooth.priceProcedure?.price_procedure_id ?? index"
                    class="hover:bg-gray-50"
                  >
                    <td class="px-4 py-3 font-medium">
                      <span
                        v-if="
                          tooth.priceProcedure?.pricing_scope === 'one_time'
                        "
                        >—</span
                      >
                      <span v-else>#{{ tooth.tooth_number }}</span>
                    </td>

                    <td class="px-4 py-3 text-gray-500">
                      <span v-if="tooth.priceProcedure">
                        {{ tooth.priceProcedure.procedure_name }}
                      </span>
                      <span v-else class="italic text-gray-400">
                        No procedure assigned
                      </span>
                    </td>

                    <td class="px-4 py-3 text-gray-500 font-medium">
                      {{
                        tooth.priceProcedure?.pricing_scope ===
                        "per_tooth_payment"
                          ? "Per Tooth"
                          : "One Time"
                      }}
                    </td>

                    <td
                      class="px-4 py-3 text-right text-green-700 font-semibold"
                    >
                      ₱{{
                        Number(getToothFee(tooth)).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Grand Total -->
          <div class="text-right pt-4 border-t mt-4">
            <label class="block text-gray-600 font-medium mb-1"
              >Grand Total Payment</label
            >
            <span class="text-2xl font-bold text-green-600">
              ₱{{
                totalPayment.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })
              }}
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-6 py-4 bg-gray-100 rounded-b-xl flex justify-between items-center"
        >
          <span class="text-xs text-gray-500 italic">
            Changes will not be saved until you click Save
          </span>

          <div class="flex gap-2">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              :disabled="form.payment_status === 'Paid'"
              class="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400"
            >
              Paid
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
import { useFetchDataStore } from "@/store/fetch-data-store";
import dayjs from "dayjs";

export default {
  name: "PatientBillingSummary",
  components: { icon },
  props: { record: Object },

  data() {
    return {
      isEditingStatus: false,
      searchQuery: "",
      showDropdown: false,
      selectedGuarantor: null,
      form: {
        dental_ids: [],
        patient_id: "",
        dentist_id: "",
        payment_status: "For Payment",
        payment_type: "Cash",
        issued_date: dayjs().format("YYYY-MM-DD"),
        instruction: "",
        patient_payment: 0,
        excess_payment: 0,
        teeth: [],
      },
      fetchDataStore: useFetchDataStore(),
    };
  },

  computed: {
    displayedTeeth() {
      const seenOneTime = new Set();

      return (this.form.teeth || [])
        .filter((tooth) => tooth && typeof tooth === "object")
        .filter((tooth) => {
          const proc = tooth.priceProcedure;
          if (!proc) return true;

          if (proc.pricing_scope === "one_time") {
            if (seenOneTime.has(proc.price_procedure_id)) return false;
            seenOneTime.add(proc.price_procedure_id);
          }

          return true;
        });
    },

    patientFullName() {
      const patient = this.record?.dentalChart?.patient;
      if (!patient) return "No patient info";
      return `${patient.last_name}, ${patient.first_name} ${patient.middle_name}`.trim();
    },
    // Total sum respecting pricing_scope
    procedureTotal() {
      const countedOneTime = new Set();
      let total = 0;

      this.form.teeth.forEach((tooth) => {
        const proc = tooth.priceProcedure;
        if (!proc) return;

        if (proc.pricing_scope === "one_time") {
          // Add only once per procedure ID
          if (!countedOneTime.has(proc.price_procedure_id)) {
            total += Number(proc.price || 0);
            countedOneTime.add(proc.price_procedure_id);
          }
        } else if (proc.pricing_scope === "per_tooth_payment") {
          // Add per tooth
          total += Number(proc.price || 0);
        }
      });

      return total;
    },
    totalPayment() {
      return (
        Number(this.procedureTotal || 0) + Number(this.form.excess_payment || 0)
      );
    },

    filteredData() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return this.fetchDataStore.hmoGuarantors || [];
      return this.fetchDataStore.hmoGuarantors.filter(
        (item) =>
          item.full_name.toLowerCase().includes(query) ||
          item.company.toLowerCase().includes(query),
      );
    },
  },

  watch: {
    record: {
      handler(newRecord) {
        if (!newRecord) return;

        this.form.payment_status = newRecord?.payment_status || "For Payment";
        this.form.payment_type = newRecord?.payment_type || "Cash";
        this.form.instruction = newRecord?.instruction || "";
        this.form.teeth = newRecord?.dentalChart?.teeth || [];

        // ✅ THIS WAS MISSING
        this.form.excess_payment = Number(newRecord?.excess_payment || 0);

        this.form.patient_payment = this.totalPayment;

        if (newRecord?.hmoGuarantor) {
          this.selectedGuarantor = newRecord.hmoGuarantor;
          this.searchQuery = `${this.selectedGuarantor.full_name} - ${this.selectedGuarantor.company}`;
        }
      },
      immediate: true,
    },
  },

  methods: {
    getToothFee(tooth) {
      const proc = tooth.priceProcedure;
      if (!proc) return 0;

      if (proc.pricing_scope === "one_time") {
        // Only count the first occurrence of this procedure
        const firstOccurrence = this.form.teeth.find(
          (t) =>
            t.priceProcedure?.price_procedure_id === proc.price_procedure_id,
        );
        return firstOccurrence === tooth ? Number(proc.price || 0) : 0;
      }

      // Per tooth payment
      return Number(proc.price || 0);
    },
    selectGuarantor(item) {
      this.selectedGuarantor = item;
      this.searchQuery = `${item.full_name} - ${item.company}`;
      this.showDropdown = false;
      this.updatePaymentAndGuarantor();
    },
    hideDropdown() {
      setTimeout(() => (this.showDropdown = false), 150);
    },
    async updatePaymentAndGuarantor() {
      try {
        const payload = {
          payment_type: this.form.payment_type,
          hmo_guarantor_id: this.selectedGuarantor?.hmo_guarantor_id || null,
          excess_payment: Number(this.form.excess_payment || 0),
        };
        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/prescription/update-by-chart/${this.record?.dentalChart?.dental_id}`,
          payload,
        );
        toast.success("Payment type and HMO/Guarantor updated successfully!");
        this.$emit("refresh");
      } catch (error) {
        console.error(error.response?.data || error.message);
        toast.error("Failed to update Payment Type or HMO/Guarantor.");
      }
    },
    async updatePaymentStatus() {
      try {
        const payload = {
          payment_status: this.form.payment_status,
          patient_payment: this.totalPayment,
          excess_payment: Number(this.form.excess_payment || 0),
          issued_date: this.form.issued_date,
          payment_type: this.form.payment_type,
          hmo_guarantor_id: this.selectedGuarantor?.hmo_guarantor_id || null,
        };
        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/prescription/update-by-chart/${this.record?.dentalChart?.dental_id}`,
          payload,
        );
        toast.success("Payment status updated");
        this.isEditingStatus = false;
        this.$emit("refresh");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update payment status.");
      }
    },
    async submitData() {
      const form = this.$refs.patientForm;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = {
        prescription_id: this.record?.prescription?.prescription_id,
        dental_chart_id: this.record?.dentalChart?.dental_id,
        payment_status: "Paid",
        payment_type: this.form.payment_type,
        patient_payment: this.totalPayment,
        excess_payment: Number(this.form.excess_payment || 0),
        issued_date: this.form.issued_date,
        instruction: this.form.instruction,
        hmo_guarantor_id: this.selectedGuarantor?.hmo_guarantor_id || null,
      };

      try {
        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/prescription/update-by-chart/${payload.dental_chart_id}`,
          payload,
        );
        toast.success("Prescription updated successfully!");
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error(error.response?.data || error.message);
        toast.error("Failed to update prescription.");
      }
    },
  },

  async mounted() {
    await this.fetchDataStore.fetchDentalChart();
    await this.fetchDataStore.fetchHMOGuarantors();
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
