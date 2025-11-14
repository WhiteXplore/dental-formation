<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        ref="patientForm"
        class="w-auto bg-white text-[13px] rounded-[15px] shadow-l p-0.5"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">Add Billing</h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Form Body -->
        <div class="p-5 w-[30vw] space-y-3">
          <!-- Patient Dropdown -->

          <!-- Dental Dropdown -->
          <div
            class="relative w-full"
            @mouseleave="hideDropdown('dental')"
            @focusin="showDentalDropdown = true"
            @focusout="hideDropdown('dental')"
          >
            <label class="text-gray-700 text-sm mb-1 font-bold">Patient</label>
            <input
              v-model="searchDentalQuery"
              type="text"
              placeholder="Search dental..."
              class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              @focus="showDentalDropdown = true"
              @input="showDentalDropdown = true"
            />
            <div
              v-if="showDentalDropdown && filteredDental.length > 0"
              class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="dental in filteredDental"
                :key="dental.dental_id"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                @mousedown.prevent="selectDental(dental)"
              >
                <div class="font-medium">
                  {{ dental.procedure_notes }} - {{ dental.status }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ dental.patient.last_name }},
                  {{ dental.patient.first_name }} •
                  <span
                    v-html="
                      dental.teeth
                        .map((t) => `Tooth #${t.tooth_number} (${t.status})`)
                        .join(', ')
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Date -->
          <div class="flex gap-2 items-center w-full">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="scheduled_date" class="font-bold">Date:</label>
              <input
                v-model="form.scheduled_date"
                type="date"
                id="scheduled_date"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              />
            </div>
          </div>

          <!-- Payment -->
          <div class="flex flex-col gap-2">
            <div class="w-full space-y-2 text-left flex flex-col">
              <label for="payment_method" class="font-bold"
                >Payment Method:</label
              >
              <select
                v-model="form.payment_method"
                required
                class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select payment method</option>
                <option value="Ecash">Gcash</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="payment_amount" class="font-bold">Amount:</label>
              <input
                v-model="form.payment_amount"
                type="number"
                id="payment_amount"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter amount"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="customer_payment" class="font-bold"
                >Customer Amount:</label
              >
              <input
                v-model="form.customer_payment"
                type="number"
                id="customer_payment"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter customer payment"
              />
            </div>
          </div>

          <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>

          <!-- Buttons -->
          <div class="tracking-wide flex justify-end gap-2 mt-4">
            <button
              type="button"
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
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState, mapActions } from "pinia";

export default {
  name: "AddAppointment",
  components: { icon },
  data() {
    return {
      form: {
        dental_id: "",
        scheduled_date: "",
        appointment_status: "",
        appointment_time: "",
        medical_history: "",
        payment_method: "",
        payment_amount: "",
        customer_payment: "",
      },

      searchDentalQuery: "",
      showDentalDropdown: false,

      // Local data (unused for patients now)
      localAppointments: [],
      localDentists: [],
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["dentalCharts"]),

    filteredDental() {
      const query = this.searchDentalQuery.toLowerCase();
      if (!query) return this.dentalCharts;
      return this.dentalCharts.filter((d) =>
        `${d.procedure_notes} ${d.status}`.toLowerCase().includes(query)
      );
    },
  },
  methods: {
    ...mapActions(useFetchDataStore, ["fetchDentalChart"]),

    selectDental(dental) {
      this.form.dental_id = dental.dental_id;
      this.searchDentalQuery = `${dental.procedure_notes} - ${dental.status}`;
      this.showDentalDropdown = false;
    },

    hideDropdown(type) {
      setTimeout(() => {
        if (type === "dental") this.showDentalDropdown = false;
      }, 150);
    },

    async submitData() {
      const form = this.$refs.patientForm;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      try {
        await axios.post(
          process.env.VUE_APP_API_BASE_URL + "/payment/add-billing-payment",
          this.form
        );
        toast.success("Billing added successfully!");
        new Audio(require("@/assets/add.mp3")).play();
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error(error);
        toast.error("Failed to add appointment.");
      }
    },
  },
  mounted() {
    this.fetchDentalChart();
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
