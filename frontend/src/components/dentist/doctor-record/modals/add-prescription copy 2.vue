<template>
  <div class="rounded-[15px] justify-center w-full flex">
    <form
      @submit.prevent="submitData"
      ref="patientForm"
      class="bg-white text-[13px] rounded-[15px] shadow-l p-0.5 w-[40vw] border"
    >
      <!-- Header -->
      <div
        class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
      >
        <div class="flex gap-1 items-center">
          <icon :name="'add-students'" />
          <h1 class="font-bold tracking-wide text-lg">
            {{ editMode ? "Edit Prescription" : "Add Prescription" }}
          </h1>
        </div>
        <icon
          :name="'circle-close3'"
          @click="$emit('close')"
          class="cursor-pointer"
        />
      </div>

      <!-- Form Body -->
      <div class="p-2 space-y-3">
        <!-- Patient & Issued Date -->
        <div class="flex items-center gap-2">
          <div class="w-full space-y-1.5 text-left relative">
            <label for="patient_id" class="font-bold">Patient:</label>
            <input
              v-model="searchPatientQuery"
              type="text"
              placeholder="Search patient..."
              class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              @focus="showPatientDropdown = true"
              @blur="hideDropdown('patient')"
              :disabled="editMode"
            />

            <!-- Dropdown -->
            <div
              v-if="showPatientDropdown && !editMode"
              class="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto z-10"
            >
              <div v-if="filteredPatients.length > 0">
                <div
                  v-for="patient in filteredPatients"
                  :key="patient.dental_id"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  @mousedown="toggleDentalSelection(patient)"
                >
                  <div class="flex gap-1 items-start">
                    <input
                      type="checkbox"
                      :checked="form.user_id.includes(patient.dental_id)"
                      class="mr-2 mt-2"
                    />
                    <div class="flex flex-col">
                      <div>
                        {{ patient.last_name }}, {{ patient.first_name }}
                        {{ patient.middle_name }}
                      </div>
                      <span class="italic text-gray-600">
                        {{ formatDate(patient.procedure_date) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="px-3 py-2 text-gray-500 italic">
                No results found
              </div>
            </div>

            <!-- Selected Patients -->
            <div v-if="form.user_id.length > 0" class="mt-2 space-y-2">
              <div
                v-for="id in form.user_id"
                :key="id"
                class="flex justify-between items-center border border-green-300 bg-white shadow-sm rounded-lg px-4 py-3"
              >
                <div class="text-sm text-gray-800 font-medium">
                  {{ getPatientName(id) }}
                </div>
                <button
                  type="button"
                  @click="removeDentalSelection(id)"
                  class="text-red-500 text-xs hover:underline"
                  :disabled="editMode"
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
            <label class="font-bold text-gray-700">Prescribe Medication:</label>

            <input
              type="text"
              v-model="searchMedicationQuery"
              @focus="showMedicationDropdown = true"
              @blur="hideDropdown('medication')"
              class="w-full border px-3 py-3.5 border-gray-400 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search medication..."
            />

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
                  <div class="flex-1 w-[250px] text-sm">
                    <span class="font-medium text-gray-800">{{
                      med.name
                    }}</span>
                    <span class="text-xs text-gray-500"
                      >({{ med.type }} • {{ med.dosage }})</span
                    >
                  </div>
                  <button
                    type="button"
                    @click="removeManualMedication(index)"
                    class="text-red-500 text-xs hover:underline mt-2 md:mt-0"
                    :disabled="editMode"
                  >
                    <icon name="delete1" class="w-4" />
                  </button>
                </div>

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
                      placeholder="number of days"
                    />
                  </div>

                  <div class="flex flex-col">
                    <label class="text-xs text-gray-500">Frequencies</label>
                    <input
                      type="text"
                      class="border rounded-full px-2 py-1 text-sm w-full"
                      v-model="med.frequencies"
                      placeholder="number of times"
                    />
                  </div>

                  <div class="flex flex-col">
                    <label class="text-xs text-gray-500">Preparation</label>
                    <select
                      v-model="med.preparation"
                      class="border rounded-full px-2 py-1 text-sm w-full"
                    >
                      <option disabled value="">Select preparation</option>
                      <option
                        v-for="prep in med.preparationOptions"
                        :key="prep"
                        :value="prep"
                      >
                        {{ prep }}
                      </option>
                    </select>
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
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="tracking-wide flex justify-end gap-2 mt-4">
          <!-- <button
            type="button"
            class="bg-red-600 p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
            @click="$emit('close')"
          >
            Cancel
          </button> -->
          <button
            class="bg-[#34699A] p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
            type="submit"
          >
            {{ editMode ? "Save Changes" : "Submit" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import { toast } from "vue3-toastify";
import axios from "axios";
import { mapState, mapActions } from "pinia";
import dayjs from "dayjs";
import { useFetchDataStore } from "@/store/fetch-data-store";

export default {
  name: "AddPrescription",
  components: { icon },

  props: {
    dentalId: { type: Number, default: null },
    editMode: { type: Boolean, default: false },
  },

  data() {
    return {
      form: {
        user_id: [],
        issued_date: dayjs().format("YYYY-MM-DD"),
        prescribe_medications: [],
        instruction: "",
        payment_status: "For Payment",
      },

      searchPatientQuery: "",
      showPatientDropdown: false,

      searchMedicationQuery: "",
      showMedicationDropdown: false,

      medicationOptions: [
        {
          name: "Amoxicillin",
          type: "Antibiotic",
          dosage: "500mg",
          preparationOptions: ["Capsule", "Syrup", "Tablet"],
        },
        {
          name: "Ibuprofen",
          type: "Pain reliever",
          dosage: "200mg",
          preparationOptions: ["Tablet", "Capsule", "Syrup"],
        },
        {
          name: "Paracetamol",
          type: "Analgesic",
          dosage: "500mg",
          preparationOptions: ["Tablet", "Syrup", "Caplet"],
        },
        {
          name: "Mefenamic Acid",
          type: "Pain reliever",
          dosage: "250mg",
          preparationOptions: ["Capsule", "Tablet"],
        },
        {
          name: "Cefalexin",
          type: "Antibiotic",
          dosage: "500mg",
          preparationOptions: ["Capsule", "Syrup"],
        },
        {
          name: "Metronidazole",
          type: "Antibiotic",
          dosage: "400mg",
          preparationOptions: ["Tablet", "Capsule"],
        },
      ],
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["dentalCharts"]),

    filteredManualMedications() {
      const q = this.searchMedicationQuery.toLowerCase();
      return this.medicationOptions.filter(
        (m) =>
          m.name.toLowerCase().includes(q) &&
          !this.form.prescribe_medications.some(
            (selected) => selected.name === m.name,
          ),
      );
    },

    simplifiedPatients() {
      return this.dentalCharts.map((chart) => ({
        dental_id: chart.dental_id,
        first_name: chart.patient?.first_name || "",
        middle_name: chart.patient?.middle_name || "",
        last_name: chart.patient?.last_name || "",
      }));
    },

    filteredPatients() {
      const query = this.searchPatientQuery.toLowerCase();

      return this.simplifiedPatients.filter((p) => {
        const fullName =
          `${p.last_name}, ${p.first_name} ${p.middle_name}`.toLowerCase();
        return fullName.includes(query);
      });
    },
  },

  methods: {
    ...mapActions(useFetchDataStore, ["fetchDentalChart"]),

    formatDate(date) {
      return dayjs(date).format("MMMM D, YYYY");
    },

    getPatientName(id) {
      const chart = this.dentalCharts.find((c) => c.dental_id === id);
      if (!chart?.patient) return "";
      return `${chart.patient.last_name}, ${chart.patient.first_name} ${
        chart.patient.middle_name || ""
      }`;
    },

    toggleManualMedication(med) {
      const exists = this.form.prescribe_medications.some(
        (item) => item.name === med.name,
      );

      if (exists) {
        toast.info(`${med.name} already selected`);
        return;
      }

      this.form.prescribe_medications.push({
        ...med,
        pcs: 1,
        duration: 1,
        frequencies: 1,
        preparation: med.preparationOptions[0] || "",
      });

      this.searchMedicationQuery = "";
    },

    removeManualMedication(index) {
      this.form.prescribe_medications.splice(index, 1);
    },

    toggleDentalSelection(dentalChart) {
      const id = dentalChart.dental_id;
      const index = this.form.user_id.indexOf(id);

      index === -1
        ? this.form.user_id.push(id)
        : this.form.user_id.splice(index, 1);
    },

    removeDentalSelection(id) {
      const index = this.form.user_id.indexOf(id);
      if (index !== -1) this.form.user_id.splice(index, 1);
    },

    hideDropdown(type) {
      setTimeout(() => {
        if (type === "patient") this.showPatientDropdown = false;
        if (type === "medication") this.showMedicationDropdown = false;
      }, 150);
    },

    async submitData() {
      if (!this.form.user_id.length) {
        toast.warning("Please select at least one dental chart.");
        return;
      }

      if (!this.form.prescribe_medications.length) {
        toast.warning("Please add at least one medication.");
        return;
      }

      const payloads = this.form.user_id.map((dental_id) => ({
        dental_chart_id: dental_id,
        payment_status: this.form.payment_status,
        issued_date: this.form.issued_date,
        instruction: this.form.instruction,
        medications: this.form.prescribe_medications.map((med) => ({
          name: med.name,
          type: med.type,
          dosage: med.dosage,
          duration: med.duration,
          frequencies: med.frequencies,
          preparation: med.preparation,
          pcs: med.pcs,
        })),
      }));

      try {
        await Promise.all(
          payloads.map((payload) =>
            axios.post(
              process.env.VUE_APP_API_BASE_URL +
                "/prescription/add-prescription",
              payload,
            ),
          ),
        );

        toast.success(
          this.editMode
            ? "Dental Information updated successfully!"
            : "Dental Information added successfully!",
        );

        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error(error);
        toast.error("Failed to save prescription.");
      }
    },

    async fetchPrescriptionForDental(dentalId) {
      try {
        const res = await axios.get(
          process.env.VUE_APP_API_BASE_URL +
            `/prescription/by-dental/${dentalId}`,
        );

        const prescription = res.data;

        if (!prescription) return;

        // Set basic fields
        this.form.instruction = prescription.instruction || "";
        this.form.issued_date =
          prescription.issued_date || dayjs().format("YYYY-MM-DD");
        this.form.payment_status = prescription.payment_status || "For Payment";

        // Map medications correctly
        this.form.prescribe_medications =
          prescription.prescribedMedications?.map((med) => {
            const matchedOption = this.medicationOptions.find(
              (opt) => opt.name === med.name,
            );

            return {
              name: med.name,
              type: med.type,
              dosage: med.dosage,
              duration: med.duration,
              frequencies: med.frequencies,
              preparation: med.preparation,
              pcs: med.pcs,
              preparationOptions: matchedOption?.preparationOptions || [],
            };
          }) || [];
      } catch (err) {
        console.error("Failed to fetch prescription:", err);
        toast.error("Failed to load prescription.");
      }
    },
  },

  async mounted() {
    await this.fetchDentalChart();

    if (this.dentalId) {
      this.form.user_id = [this.dentalId];

      if (this.editMode) {
        await this.fetchPrescriptionForDental(this.dentalId);
      }
    }
  },
};
</script>
