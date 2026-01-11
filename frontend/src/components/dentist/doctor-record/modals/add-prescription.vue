<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        ref="patientForm"
        class="bg-white text-[13px] rounded-[15px] shadow-l p-0.5 w-[40vw]"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">Add Prescription</h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Form Body -->
        <div class="p-5 space-y-3">
          <div class="flex items-center gap-2">
            <!-- Patient Dropdown -->
            <div class="w-full space-y-1.5 text-left relative">
              <label for="patient_id" class="font-bold">Patient:</label>
              <input
                v-model="searchPatientQuery"
                type="text"
                placeholder="Search patient..."
                class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
                @focus="showPatientDropdown = true"
                @blur="hideDropdown('patient')"
              />
              <div
                v-if="showPatientDropdown"
                class="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto z-10"
              >
                <div v-if="filteredPatients.length > 0">
                  <div
                    v-for="dentalChart in filteredPatients"
                    :key="dentalChart.dental_id"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    @mousedown="toggleDentalSelection(dentalChart)"
                  >
                    <div class="flex gap-1 items-start">
                      <input
                        type="checkbox"
                        :checked="form.user_id.includes(dentalChart.dental_id)"
                        class="mr-2 mt-2"
                      />
                      <div class="flex flex-col">
                        <div>
                          {{ dentalChart.patient?.last_name }},
                          {{ dentalChart.patient?.first_name }}
                          {{ dentalChart.patient?.middle_name }} -
                          <!-- {{ dentalChart.tooth_number }} - -->
                          {{ dentalChart.status }}
                        </div>
                        <span class="italic text-gray-600">
                          {{ formatDate(dentalChart.procedure_date) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="px-3 py-2 text-gray-500 italic">
                  No results found
                </div>
              </div>

              <!-- Selected Patients Display -->
              <div v-if="form.user_id.length > 0" class="mt-2 space-y-2">
                <div
                  v-for="id in form.user_id"
                  :key="id"
                  class="flex justify-between items-center border border-green-300 bg-white shadow-sm rounded-lg px-4 py-3"
                >
                  <div class="text-sm text-gray-800 font-medium">
                    {{ getPatientName(id) }}
                    <!-- <div class="text-xs text-gray-500 whitespace-pre-line">
                    {{ getToothInfo(id) }}
                  </div> -->
                  </div>
                  <button
                    type="button"
                    @click="removeDentalSelection(id)"
                    class="text-red-500 text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <!-- Issued Date -->
            <div class="w-full space-y-1.5 text-left flex-col">
              <label for="issued_date" class="font-bold">Issued Date:</label>
              <input
                v-model="form.issued_date"
                type="date"
                id="issued_date"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              />
            </div>
          </div>

          <!-- Prescribe Medication -->
          <div class="flex flex-col gap-2 relative">
            <div class="w-full flex flex-col space-y-2">
              <label class="font-bold text-gray-700"
                >Prescribe Medication:</label
              >

              <!-- Search Input -->
              <input
                type="text"
                v-model="searchMedicationQuery"
                @focus="showMedicationDropdown = true"
                @blur="hideDropdown('medication')"
                class="w-full border px-3 py-3.5 border-gray-400 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Search medication..."
              />

              <!-- Dropdown -->
              <div
                v-if="showMedicationDropdown"
                class="absolute top-16 left-0 z-30 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto w-full"
                @mouseleave="showMedicationDropdown = false"
              >
                <div
                  v-for="(med, index) in filteredManualMedications"
                  :key="index"
                  class="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b"
                  @mousedown.prevent="toggleManualMedication(med)"
                >
                  <div class="flex flex-col">
                    <span class="font-semibold text-gray-800">{{
                      med.name
                    }}</span>
                    <span class="text-xs text-gray-500 italic"
                      >{{ med.type }} • {{ med.dosage }}</span
                    >
                  </div>
                </div>

                <div
                  v-if="filteredManualMedications.length === 0"
                  class="p-3 text-gray-500 italic text-center text-sm"
                >
                  No medications found
                </div>
              </div>

              <!-- Selected Medications -->
              <div
                v-if="form.prescribe_medications.length > 0"
                class="mt-2 space-y-3 max-h-[25vh] overflow-auto"
              >
                <div
                  v-for="(med, index) in form.prescribe_medications"
                  :key="index"
                  class="flex flex-col border border-green-300 bg-white shadow-sm rounded-lg p-3 gap-3"
                >
                  <div class="flex justify-between items-center">
                    <!-- Medication Info -->
                    <div class="flex-1 w-[250px] text-sm">
                      <span class="font-medium text-gray-800">{{
                        med.name
                      }}</span>
                      <span class="text-xs text-gray-500"
                        >({{ med.type }} • {{ med.dosage }})</span
                      >
                    </div>
                    <!-- Remove Button -->
                    <button
                      type="button"
                      @click="removeManualMedication(index)"
                      class="text-red-500 text-xs hover:underline mt-2 md:mt-0"
                    >
                      <icon name="delete1" class="w-4" />
                    </button>
                  </div>

                  <!-- Inputs -->
                  <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 w-full"
                  >
                    <div class="flex flex-col">
                      <label class="text-xs text-gray-500">PCS</label>
                      <input
                        type="number"
                        class="border rounded-full px-2 py-1 text-sm"
                        v-model.number="med.pcs"
                        placeholder="pcs"
                      />
                    </div>

                    <div class="flex flex-col">
                      <label class="text-xs text-gray-500">Duration</label>
                      <input
                        type="text"
                        class="border rounded-full px-2 py-1 text-sm w-full"
                        v-model="med.duration"
                        placeholder="days"
                      />
                    </div>

                    <div class="flex flex-col">
                      <label class="text-xs text-gray-500">Frequencies</label>
                      <input
                        type="text"
                        class="border rounded-full px-2 py-1 text-sm w-full"
                        v-model="med.frequencies"
                        placeholder="times/day"
                      />
                    </div>

                    <div class="flex flex-col">
                      <label class="text-xs text-gray-500">Preparation</label>
                      <input
                        type="text"
                        class="border rounded-full px-2 py-1 text-sm w-full"
                        v-model="med.preparation"
                        placeholder="before/after meal"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="w-full space-y-2 text-left flex flex-col">
            <label for="instruction" class="font-bold">Instruction:</label>
            <textarea
              id="instruction"
              v-model="form.instruction"
              placeholder="Enter instruction here..."
              class="w-full border px-3 py-2 border-gray-400 rounded-md text-sm resize-none min-h-[100px]"
              required
            >
            </textarea>
          </div>

          <!-- Divider -->
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
import dayjs from "dayjs";

export default {
  name: "AddAppointment",
  components: { icon },
  data() {
    return {
      form: {
        user_id: [],
        patient_id: "",
        inventory_id: "",
        dentist_id: "",
        payment_status: "For Payment",
        issued_date: dayjs().format("YYYY-MM-DD"),
        prescribe_medications: [],
        instruction: "",
      },
      user: null, // holds authenticated user
      searchPatientQuery: "",
      showPatientDropdown: false,
      searchMedicationQuery: "",
      showMedicationDropdown: false,
      medicationOptions: [
        { name: "Amoxicillin", type: "Antibiotic", dosage: "500mg" },
        { name: "Ibuprofen", type: "Pain reliever", dosage: "200mg" },
        { name: "Paracetamol", type: "Analgesic", dosage: "500mg" },
        { name: "Mefenamic Acid", type: "Pain reliever", dosage: "250mg" },
      ],
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["dentalCharts", "inventories"]),
    filteredManualMedications() {
      const q = this.searchMedicationQuery.toLowerCase();
      return this.medicationOptions.filter(
        (m) =>
          m.name.toLowerCase().includes(q) &&
          !this.form.prescribe_medications.some(
            (selected) => selected.name === m.name
          )
      );
    },

    filteredPatients() {
      const query = this.searchPatientQuery.toLowerCase();
      const userId = this.user?.sub || null;

      // Filter charts for this user
      const charts = this.dentalCharts.filter(
        (chart) =>
          chart.user_accounts?.user_id === userId && chart.dental_id != null
      );

      // Get latest chart per patient
      const latestPerPatient = charts.reduce((acc, chart) => {
        const patientId = chart.patient?.patient_id;
        if (!patientId) return acc;

        // If no chart yet for this patient or this chart is newer, set it
        if (
          !acc[patientId] ||
          dayjs(chart.procedure_date).isAfter(acc[patientId].procedure_date)
        ) {
          acc[patientId] = chart;
        }
        return acc;
      }, {});

      // Convert object to array
      const latestCharts = Object.values(latestPerPatient);

      // Filter by search query
      return latestCharts.filter((chart) => {
        if (!query) return true;
        const patient = chart.patient;
        if (!patient) return false;
        const fullName = `${patient.last_name}, ${patient.first_name} ${
          patient.middle_name || ""
        }`.toLowerCase();
        return fullName.includes(query);
      });
    },

    filteredMedications() {
      const query = this.searchMedicationQuery.toLowerCase();
      const today = dayjs().startOf("day");

      return this.inventories
        .filter((inv) => inv.type === "Medication")
        .map((inv) => ({
          ...inv,
          isExpired: inv.expiration && dayjs(inv.expiration).isBefore(today),
        }))
        .filter((inv) => inv.name.toLowerCase().includes(query));
    },
  },
  methods: {
    ...mapActions(useFetchDataStore, ["fetchDentalChart", "fetchInventories"]),
    toggleManualMedication(med) {
      const exists = this.form.prescribe_medications.some(
        (item) => item.name === med.name
      );

      if (!exists) {
        this.form.prescribe_medications.push({
          name: med.name,
          type: med.type,
          dosage: med.dosage,
          pcs: 1,
          duration: med.duration,
          frequencies: med.frequencies,
          preparation: med.preparation,
        });
      } else {
        toast.info(`${med.name} already selected`);
      }
    },

    removeManualMedication(index) {
      this.form.prescribe_medications.splice(index, 1);
    },

    formatDate(date) {
      return dayjs(date).format("MMMM D, YYYY - h:mm A");
    },
    getPatientName(id) {
      const chart = this.dentalCharts.find((c) => c.dental_id === id);
      if (!chart || !chart.patient) return "";
      const { last_name, first_name, middle_name } = chart.patient;
      return `${last_name}, ${first_name} ${middle_name || ""}`;
    },
    // getToothInfo(id) {
    //   const chart = this.dentalCharts.find((c) => c.dental_id === id);
    //   if (!chart || !Array.isArray(chart.teeth)) return "No tooth info";
    //   return chart.teeth
    //     .map((tooth) => `Tooth ${tooth.tooth_number} - ${tooth.status}`)
    //     .join(", ");
    // },
    isExpired(date) {
      if (!date) return false;
      return dayjs(date).isBefore(dayjs().startOf("day"));
    },

    formatDateDisplay(date) {
      return dayjs(date).format("MMM D, YYYY");
    },
    removeDentalSelection(id) {
      const index = this.form.user_id.indexOf(id);
      if (index !== -1) this.form.user_id.splice(index, 1);
    },
    toggleDentalSelection(dentalChart) {
      const id = dentalChart.dental_id;
      const index = this.form.user_id.indexOf(id);
      index === -1
        ? this.form.user_id.push(id)
        : this.form.user_id.splice(index, 1);
    },
    toggleMedicationSelection(name) {
      const inventory = this.inventories.find((inv) => inv.name === name);
      if (!inventory) return;

      const exists = this.form.prescribe_medications.some(
        (med) => med.inventory_id === inventory.inventory_id
      );

      if (!exists) {
        this.form.prescribe_medications.push({
          name,
          pcs: 1,
          inventory_id: inventory.inventory_id,
          unit: inventory.unit || "",
        });
      } else {
        toast.info(`${name} is already selected`);
      }
    },
    removeMedicationSelection(index) {
      this.form.prescribe_medications.splice(index, 1);
    },
    selectMedication(name) {
      this.form.prescribe_medication = name;
      this.searchMedicationQuery = name;
      this.showMedicationDropdown = false;
    },
    hideDropdown(type) {
      setTimeout(() => {
        if (type === "patient") this.showPatientDropdown = false;
        if (type === "medication") this.showMedicationDropdown = false;
      }, 150);
    },
    formatMedication(med) {
      const unitInfo = med.unit ? ` - ${med.unit}` : "";
      return `${med.name} (${med.pcs} pcs${unitInfo})`;
    },

    async submitData() {
      const form = this.$refs.patientForm;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!Array.isArray(this.form.user_id) || this.form.user_id.length === 0) {
        toast.warning("Please select at least one dental chart.");
        return;
      }

      if (
        !Array.isArray(this.form.prescribe_medications) ||
        this.form.prescribe_medications.length === 0
      ) {
        toast.warning("Please add at least one medication.");
        return;
      }

      // Validate pcs for each medication
      for (const med of this.form.prescribe_medications) {
        // Set pcs same as duration, frequencies, and preparation for saving
        med.pcs = med.duration || 1; // or use any logic you want
        med.frequencies = med.frequencies || 1;
        med.preparation = med.preparation || "N/A";

        const pcsNumber = Number(med.pcs);
        if (!pcsNumber || pcsNumber <= 0) {
          toast.warning(`Please enter a valid quantity for ${med.name}`);
          return;
        }
      }

      const trimmedInstruction = this.form.instruction.trim();
      if (!trimmedInstruction) {
        toast.warning("Please provide prescription instruction.");
        return;
      }

      // Create payload for each dental chart
      const payloads = this.form.user_id.map((dental_id) => {
        const chart = this.dentalCharts.find((c) => c.dental_id === dental_id);
        const issuedDate = chart?.procedure_date
          ? dayjs(chart.procedure_date).format("YYYY-MM-DD")
          : this.form.issued_date;

        return {
          dental_chart_id: Number(dental_id),
          payment_status: this.form.payment_status,
          issued_date: issuedDate,
          instruction: this.form.instruction,
          medications: this.form.prescribe_medications.map((med) => ({
            name: med.name,
            type: med.type,
            dosage: med.dosage,
            duration: med.duration,
            frequencies: med.frequencies,
            preparation: med.preparation,
            pcs: Number(med.pcs),
            issued_date: issuedDate,
          })),
        };
      });

      try {
        for (const payload of payloads) {
          await axios.post(
            process.env.VUE_APP_API_BASE_URL + "/prescription/add-prescription",
            payload
          );
        }

        toast.success("Prescription(s) added successfully!");
        const audio = new Audio(require("@/assets/add.mp3"));
        audio.play();
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error(
          "Prescription submit error:",
          error.response?.data || error.message
        );
        toast.error(
          error.response?.data?.message || "Failed to add prescription."
        );
      }
    },

    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          this.user = response.data;
          console.log("Authenticated User:", this.user);
        } else {
          this.$router.push("/");
          location.reload();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        this.$router.push("/");
      }
    },
  },
  async mounted() {
    await this.fetchDentalChart();
    await this.fetchInventories();
    await this.fetchUser();

    console.log(
      "Matching Records for Logged-in User:",
      this.dentalCharts.filter(
        (item) => item.user_accounts?.user_id === this.user?.sub
      )
    );
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
