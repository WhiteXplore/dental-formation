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
        <icon :name="'circle-close3'" @click="$emit('close')" class="cursor-pointer" />
      </div>

      <!-- Form Body -->
      <div class="p-2 space-y-3">
        <!-- Patient & Issued Date -->
        <div class="flex items-center gap-2">
          <div class="w-full space-y-1.5 text-left relative">
            <label for="patient_id" class="font-bold">Patient:</label>
            <input
              :value="isPatientLocked ? selectedPatientName : searchPatientQuery"
              @input="searchPatientQuery = $event.target.value"
              type="text"
              placeholder="Search patient..."
              class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              :class="isPatientLocked ? 'bg-gray-100 cursor-not-allowed' : ''"
              @focus="!isPatientLocked && (showPatientDropdown = true)"
              @blur="hideDropdown('patient')"
              :disabled="isPatientLocked"
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
              <div v-else class="px-3 py-2 text-gray-500 italic">No results found</div>
            </div>

            <!-- Selected Patients -->
            <!-- <div
              v-if="form.user_id.length > 0 && !editMode"
              class="mt-2 space-y-2"
            >
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
                >
                  Remove
                </button>
              </div>
            </div> -->
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
        <div class="flex flex-col gap-3 relative">
          <label class="font-bold text-gray-700 text-sm"> Prescribe Medication </label>

          <!-- Search Medication -->
          <div class="relative">
            <input
              type="text"
              v-model="searchMedicationQuery"
              @focus="showMedicationDropdown = true"
              @blur="hideDropdown('medication')"
              class="w-full border px-4 py-3 border-gray-400 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34699A]"
              placeholder="Search medication name..."
            />

            <!-- Dropdown -->
            <div
              v-if="showMedicationDropdown"
              class="absolute z-30 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto w-full mt-1"
              @mouseleave="showMedicationDropdown = false"
            >
              <!-- MED LIST -->
              <div
                v-for="(med, index) in filteredManualMedications"
                :key="index"
                class="p-3 hover:bg-blue-50 cursor-pointer border-b flex justify-between items-center"
                @mousedown.prevent="toggleManualMedication(med)"
              >
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-800">
                    {{ med.name }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ med.type }} • {{ med.dosage }}
                  </span>
                </div>

                <icon name="add" class="w-4 text-blue-500" />
              </div>

              <!-- ✅ ADD THIS EXACTLY HERE -->
              <div
                class="p-3 text-center text-red-500 cursor-pointer hover:bg-red-50 border-t"
                @mousedown.prevent="setNoMedication"
              >
                🚫 None (No Medication)
              </div>

              <!-- EMPTY STATE -->
              <div
                v-if="filteredManualMedications.length === 0"
                class="p-3 text-gray-500 italic text-center text-sm"
              >
                No medications found
              </div>
            </div>
          </div>

          <!-- Selected Medications -->
          <div
            v-if="form.prescribe_medications.length > 0 || noMedication"
            class="space-y-3 max-h-[250px] overflow-y-auto border rounded-lg p-3 bg-gray-50"
          >
            <!-- NONE SELECTED -->
            <div v-if="noMedication" class="text-center text-gray-500 italic py-3">
              🚫 No medication prescribed
            </div>
            <div
              v-for="(med, index) in form.prescribe_medications"
              :key="index"
              class="bg-white border rounded-xl shadow-sm p-3 flex flex-col gap-3"
            >
              <!-- Header -->
              <div class="flex justify-between items-center">
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-800">
                    {{ med.name }}
                  </span>

                  <span class="text-xs text-gray-500">
                    {{ med.type }} • {{ med.dosage }}
                  </span>
                </div>

                <button
                  type="button"
                  @click="removeManualMedication(index)"
                  class="text-red-500 hover:text-red-700"
                >
                  <icon name="delete1" class="w-4" />
                </button>
              </div>

              <!-- Inputs -->
              <div class="flex gap-3">
                <!-- PCS -->
                <div class="w-[90px]">
                  <label class="text-xs text-gray-500">PCS</label>
                  <input
                    type="number"
                    v-model.number="med.pcs"
                    class="w-full border rounded-lg px-2 py-1 text-sm"
                    placeholder="1"
                  />
                </div>

                <!-- Instruction -->
                <div class="flex-1">
                  <label class="text-xs text-gray-500"> Medication Instruction </label>

                  <input
                    type="text"
                    v-model="med.med_instruction"
                    class="w-full border rounded-lg px-3 py-1 text-sm"
                    placeholder="Ex: Take after meals"
                  />
                </div>
              </div>
            </div>
          </div>
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
        payment_status: "For Payment",
        noMedication: false,
      },

      searchPatientQuery: "",
      showPatientDropdown: false,

      searchMedicationQuery: "",
      showMedicationDropdown: false,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, [
      "dentalCharts",
      "medicines", // ✅ medicines from database
    ]),

    selectedPatientName() {
      if (!this.form.user_id.length) return "";
      return this.getPatientName(this.form.user_id[0]);
    },

    isPatientLocked() {
      return !!this.dentalId;
    },

    // ✅ FILTER MEDICINES FROM DATABASE
    filteredManualMedications() {
      const q = this.searchMedicationQuery.toLowerCase();

      return this.medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(q) &&
          !this.form.prescribe_medications.some((selected) => selected.name === m.name)
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
        const fullName = `${p.last_name}, ${p.first_name} ${p.middle_name}`.toLowerCase();
        return fullName.includes(query);
      });
    },
  },

  methods: {
    ...mapActions(useFetchDataStore, [
      "fetchDentalChart",
      "fetchMedicines", // ✅ load medicines
    ]),
    setNoMedication() {
      this.form.prescribe_medications = [];
      this.noMedication = true;

      this.searchMedicationQuery = "";
      this.showMedicationDropdown = false;

      toast.info("No medication selected");
    },
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
      this.noMedication = false;
      const exists = this.form.prescribe_medications.some(
        (item) => item.name === med.name
      );

      if (exists) {
        toast.info(`${med.name} already selected`);
        return;
      }

      this.form.prescribe_medications.push({
        name: med.name,
        type: med.type,
        dosage: med.dosage,
        pcs: 1,
        med_instruction: "",
      });

      this.searchMedicationQuery = "";
    },

    removeManualMedication(index) {
      this.form.prescribe_medications.splice(index, 1);
    },

    toggleDentalSelection(dentalChart) {
      const id = dentalChart.dental_id;
      const index = this.form.user_id.indexOf(id);

      index === -1 ? this.form.user_id.push(id) : this.form.user_id.splice(index, 1);
    },

    removeDentalSelection(id) {
      const index = this.form.user_id.indexOf(id);

      if (index !== -1) {
        this.form.user_id.splice(index, 1);
      }
    },

    hideDropdown(type) {
      setTimeout(() => {
        if (type === "patient") this.showPatientDropdown = false;
        if (type === "medication") this.showMedicationDropdown = false;
      }, 150);
    },

    async submitData() {
      if (!this.form.user_id.length) {
        toast.warning("Please select a patient.");
        return;
      }

      try {
        const payload = {
          dental_chart_id: Number(this.form.user_id[0]),
          payment_status: this.form.payment_status,
          issued_date: this.form.issued_date,

          // ✅ Allow empty medications
          medications: this.form.prescribe_medications.length
            ? this.form.prescribe_medications.map((med) => ({
                name: med.name,
                type: med.type,
                dosage: med.dosage,
                pcs: Number(med.pcs),
                med_instruction: med.med_instruction,
              }))
            : [], // 👈 important
        };

        if (this.editMode) {
          await axios.patch(
            process.env.VUE_APP_API_BASE_URL +
              `/prescription/update-by-chart/${this.form.user_id[0]}`,
            payload
          );

          toast.success("Prescription updated successfully!");
        } else {
          await axios.post(
            process.env.VUE_APP_API_BASE_URL + "/prescription/add-prescription",
            payload
          );

          // ✅ Better message when no meds
          if (!this.form.prescribe_medications.length) {
            toast.success("Prescription saved (No medication prescribed).");
          } else {
            toast.success("Prescription added successfully!");
          }
        }

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
          process.env.VUE_APP_API_BASE_URL + `/prescription/by-dental/${dentalId}`
        );

        const prescription = res.data;

        if (!prescription) return;

        this.form.issued_date = prescription.issued_date || dayjs().format("YYYY-MM-DD");

        this.form.payment_status = prescription.payment_status || "For Payment";

        this.form.prescribe_medications =
          prescription.prescribedMedications?.map((med) => ({
            prescribe_medication_id: med.prescribe_medication_id,
            name: med.name,
            type: med.type,
            dosage: med.dosage,
            pcs: med.pcs,
            med_instruction: med.med_instruction || "",
          })) || [];
        this.noMedication = this.form.prescribe_medications.length === 0;
      } catch (err) {
        console.error("Failed to fetch prescription:", err);
        toast.error("Failed to load prescription.");
      }
    },
  },

  async mounted() {
    await this.fetchDentalChart();
    await this.fetchMedicines(); // ✅ LOAD MEDICINES

    if (this.dentalId) {
      this.form.user_id = [this.dentalId];

      if (this.editMode) {
        await this.fetchPrescriptionForDental(this.dentalId);
      }
    }
  },
};
</script>
