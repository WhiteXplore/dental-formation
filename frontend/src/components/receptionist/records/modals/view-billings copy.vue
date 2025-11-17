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
                <select
                  v-else
                  v-model="form.payment_status"
                  @change="updatePaymentStatus"
                  @blur="isEditingStatus = false"
                  class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="For Payment">For Payment</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Medications -->
          <div v-if="form.prescribe_medications?.length">
            <label class="block text-gray-600 font-semibold mb-2">
              Prescribed Medications
            </label>
            <div
              class="border border-gray-200 rounded-lg overflow-hidden divide-y"
            >
              <div
                v-for="(med, index) in form.prescribe_medications"
                :key="index"
                class="flex justify-between items-center px-4 py-3"
              >
                <div>
                  <div class="font-medium">{{ med.name }}</div>
                  <div class="text-gray-500 text-xs">{{ med.pcs }} pcs</div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-500">
                    ₱{{ Number(med.price_per_unit).toFixed(2) }}
                  </div>
                  <div class="text-green-700 font-semibold">
                    ₱{{ (med.pcs * med.price_per_unit).toFixed(2) }}
                  </div>
                </div>
              </div>
              <!-- Medications Total -->
              <div
                class="flex justify-between items-center px-4 py-3 bg-gray-50 font-semibold"
              >
                <div>Total (Medications)</div>
                <div class="text-green-700">
                  ₱{{ medicationTotal.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tooth Procedure -->
          <div v-if="form.teeth?.length">
            <label class="block text-gray-600 font-semibold mb-2">
              Tooth Procedure Details
            </label>
            <div
              class="border border-gray-200 rounded-lg overflow-hidden divide-y"
            >
              <div
                v-for="(tooth, index) in form.teeth"
                :key="index"
                class="flex justify-between items-center px-4 py-3"
              >
                <div>
                  <div class="font-medium">Tooth #{{ tooth.tooth_number }}</div>
                  <div class="text-gray-500 text-xs">
                    <span v-if="tooth.priceProcedure">
                      {{ tooth.priceProcedure.procedure_name }}
                    </span>
                    <span v-else class="italic text-gray-400">
                      No procedure assigned
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-500">Procedure Fee</div>
                  <div class="text-green-700 font-semibold">
                    ₱{{
                      tooth.priceProcedure
                        ? parseFloat(tooth.priceProcedure.price).toFixed(2)
                        : "0.00"
                    }}
                  </div>
                </div>
              </div>
              <!-- Procedures Total -->
              <div
                class="flex justify-between items-center px-4 py-3 bg-gray-50 font-semibold"
              >
                <div>Total (Procedures)</div>
                <div class="text-green-700">
                  ₱{{ procedureTotal.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Grand Total -->
          <div class="text-right pt-4 border-t mt-4">
            <label class="block text-gray-600 font-medium mb-1">
              Grand Total Payment
            </label>
            <span class="text-2xl font-bold text-green-600">
              ₱{{ totalPayment.toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="px-6 py-4 bg-gray-100 rounded-b-xl flex justify-end">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded-md font-medium"
          >
            Close
          </button>
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
import { toRaw } from "vue";

export default {
  name: "PatientBillingSummary",
  components: { icon },
  props: { record: Object },

  data() {
    return {
      isEditingStatus: false,
      form: {
        dental_ids: [],
        patient_id: "",
        inventory_id: "",
        dentist_id: "",
        payment_status: "For Payment",
        issued_date: dayjs().format("YYYY-MM-DD"),
        prescribe_medications: [],
        instruction: "",
        patient_payment: 0,
        teeth: [],
      },
      fetchDataStore: useFetchDataStore(),
    };
  },

  computed: {
    patientFullName() {
      const patient = this.record?.dentalChart?.patient;
      if (!patient) return "No patient info";

      const firstName = patient.first_name || "";
      const middleName = patient.middle_name || "";
      const lastName = patient.last_name || "";

      return `${lastName}, ${firstName} ${middleName}`.trim();
    },
    medicationTotal() {
      return this.form.prescribe_medications.reduce((sum, item) => {
        return sum + Number(item.pcs) * Number(item.price_per_unit || 0);
      }, 0);
    },
    procedureTotal() {
      return this.form.teeth.reduce((sum, tooth) => {
        return (
          sum +
          (tooth.priceProcedure ? Number(tooth.priceProcedure.price || 0) : 0)
        );
      }, 0);
    },
    totalPayment() {
      return this.medicationTotal + this.procedureTotal;
    },
  },

  watch: {
    record: {
      handler(newRecord) {
        if (!newRecord) return;

        this.form.issued_date =
          dayjs(newRecord?.dentalChart?.created_at).format("YYYY-MM-DD") || "";
        this.form.dental_ids = [newRecord.dentalChart?.dental_id].filter(
          Boolean
        );

        this.form.prescribe_medications =
          newRecord?.prescribedMedications?.map((med) => ({
            name: med.inventory?.name || "",
            pcs: med.pcs || 0,
            inventory_id: med.inventory_id || med.inventory?.inventory_id,
            price_per_unit: med.inventory?.price_per_unit || 0,
          })) || [];

        this.form.payment_status = newRecord?.payment_status || "For Payment";
        this.form.instruction = newRecord?.instruction || "";
        this.form.teeth = newRecord?.dentalChart?.teeth || [];

        this.form.patient_payment = this.totalPayment;
      },
      immediate: true,
    },
  },

  methods: {
    async updatePaymentStatus() {
      try {
        const payload = {
          payment_status: this.form.payment_status,
          patient_payment: this.form.patient_payment,
          issued_date: this.form.issued_date,
        };

        await axios.patch(
          process.env.VUE_APP_API_BASE_URL +
            `/prescription/update-by-chart/${this.record?.dentalChart?.dental_id}`,
          payload
        );

        toast.success("Payment status updated");
        new Audio(require("@/assets/add.mp3")).play();
        this.isEditingStatus = false;
        this.$emit("refresh");
      } catch (error) {
        console.error("Update error:", error);
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
        payment_status: this.form.payment_status,
        issued_date: this.form.issued_date,
        instruction: this.form.instruction,
        patient_payment: this.form.patient_payment,
        medications: this.form.prescribe_medications.map((med) => ({
          inventory_id: med.inventory_id,
          pcs: Number(med.pcs),
          issued_date: this.form.issued_date,
        })),
      };

      try {
        await axios.patch(
          process.env.VUE_APP_API_BASE_URL +
            `/prescription/update-by-chart/${payload.dental_chart_id}`,
          payload
        );

        toast.success("Prescription updated successfully!");
        new Audio(require("@/assets/add.mp3")).play();
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error("Submit error:", error.response?.data || error.message);
        toast.error("Failed to update prescription.");
      }
    },
  },

  async mounted() {
    await this.fetchDataStore.fetchDentalChart();
    await this.fetchDataStore.fetchInventories();

    console.log("Record:", toRaw(this.record));
    console.log("dentalChart:", toRaw(this.record?.dentalChart));
    console.log("teeth:", toRaw(this.record?.dentalChart?.teeth));
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
