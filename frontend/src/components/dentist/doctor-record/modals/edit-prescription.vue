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
            <h1 class="font-bold tracking-wide text-lg">Edit Prescription</h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>
        <!-- Form Body -->
        <div class="p-5 w-[30vw] space-y-3">
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
          <!-- Patient Dropdown -->
          <div class="w-full space-y-1.5 text-left relative">
            <label class="font-bold">Patient:</label>
            <input
              v-model="searchPatientQuery"
              type="text"
              placeholder="Search patient..."
              class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800 bg-gray-100 cursor-not-allowed"
              readonly
              disabled
            />
          </div>
          <!-- Medication Selection -->
          <div class="w-full space-y-2 text-left flex flex-col relative">
            <label class="font-bold">Prescribe Medication:</label>
            <input
              type="text"
              v-model="searchMedicationQuery"
              @focus="showMedicationDropdown = true"
              @blur="hideDropdown('medication')"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="Search medication..."
              autocomplete="off"
            />
            <!-- Unified Medication Dropdown -->
            <div
              v-if="showMedicationDropdown"
              class="absolute left-0 top-full z-30 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto w-full mt-1"
            >
              <div
                v-for="(med, index) in filteredAllMedications"
                :key="med.name + index"
                class="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b"
                @mousedown.prevent="toggleMedication(med)"
              >
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-800">{{
                    med.name
                  }}</span>
                  <span class="text-xs text-gray-600 italic"
                    >{{ med.type || "N/A" }} • {{ med.dosage || "N/A" }}</span
                  >
                </div>
                <input
                  type="checkbox"
                  :checked="isMedicationSelected(med)"
                  readonly
                />
              </div>

              <div
                v-if="filteredAllMedications.length === 0"
                class="p-3 text-gray-500 italic text-center text-sm"
              >
                No medications found
              </div>
            </div>

            <!-- Selected Medications -->
            <div
              v-if="form.prescribe_medications.length > 0"
              class="mt-2 space-y-2"
            >
              <div
                v-for="(med, index) in form.prescribe_medications"
                :key="med.name + index"
                class="flex justify-between items-center border border-green-300 bg-white shadow-sm rounded-lg px-4 py-2"
              >
                <div class="flex flex-col w-full text-sm">
                  <div class="flex justify-between items-center">
                    <span>
                      {{ med.name }}
                      <span class="text-xs text-gray-500">
                        ({{ med.type || "N/A" }} • {{ med.dosage || "N/A" }})
                      </span>
                    </span>
                    <input
                      type="number"
                      min="1"
                      class="border rounded px-2 py-1 w-[70px] text-sm"
                      v-model.number="med.pcs"
                      placeholder="pcs"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeMedication(index)"
                  class="ml-3 text-red-500 text-xs hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          <!-- Instruction -->
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
              Save Changes
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
  name: "EditPrescription",
  components: { icon },
  props: {
    prescription: Object,
    isEdit: Boolean,
    group: Object,
  },
  data() {
    return {
      form: {
        dental_ids: [],
        patient_id: "",
        prescribe_medication_id: "",
        user_id: "",
        payment_status: "For Payment",
        issued_date: dayjs().format("YYYY-MM-DD"),
        prescribe_medications: [],
        instruction: "",
      },
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
  watch: {
    prescription: {
      immediate: true,
      handler(newPrescription) {
        if (!newPrescription) return;

        const { dentalChart, prescribedMedications, instruction } =
          newPrescription;

        this.form.issued_date = dentalChart?.procedure_date
          ? dayjs(dentalChart.procedure_date).format("YYYY-MM-DD")
          : "";

        this.form.dental_ids =
          dentalChart?.teeth?.map((t) => t.tooth_number) || [];

        this.form.prescribe_medications =
          prescribedMedications?.map((med) => {
            const fallbackMed =
              this.medicationOptions.find((m) => m.name === med.name) || {};

            return {
              prescribe_medication_id: med.prescribe_medication_id || null,
              pcs: med.pcs || 1,
              name: med.name || "",
              type: med.type || fallbackMed.type || "N/A",
              dosage: med.dosage || fallbackMed.dosage || "N/A",
            };
          }) || [];

        this.form.instruction = instruction || "";

        this.searchPatientQuery = dentalChart?.patient
          ? `${dentalChart.patient.first_name} ${dentalChart.patient.last_name}`
          : "";
      },
    },
  },
  computed: {
    ...mapState(useFetchDataStore, ["dentalCharts", "prescribemedication"]),
    filteredAllMedications() {
      const query = this.searchMedicationQuery.toLowerCase();

      // Database medications matching the search query
      const dbMeds = this.prescribemedication
        .filter((m) => m.name.toLowerCase().includes(query))
        .map((m) => ({ ...m, type: m.type, dosage: m.dosage }));

      // Manual medication options matching the query
      const manualMeds = this.medicationOptions.filter((m) =>
        m.name.toLowerCase().includes(query)
      );

      // Merge all medications
      const merged = [...dbMeds];
      manualMeds.forEach((m) => {
        if (!merged.some((x) => x.name === m.name)) merged.push(m);
      });

      // Remove medications that are already selected
      const filtered = merged.filter(
        (m) =>
          !this.form.prescribe_medications.some((sel) => sel.name === m.name)
      );

      console.log("Filtered Medications (unselected only):", filtered);

      return filtered;
    },
  },
  methods: {
    ...mapActions(useFetchDataStore, [
      "fetchDentalChart",
      "fetchPrecribeMedication",
    ]),

    isMedicationSelected(med) {
      return this.form.prescribe_medications.some((m) => m.name === med.name);
    },

    toggleMedication(med) {
      const index = this.form.prescribe_medications.findIndex(
        (m) => m.name === med.name
      );
      if (index === -1) {
        this.form.prescribe_medications.push({ ...med, pcs: 1 });
      } else {
        this.form.prescribe_medications.splice(index, 1);
      }
    },

    removeMedication(index) {
      this.form.prescribe_medications.splice(index, 1);
    },

    hideDropdown(type) {
      setTimeout(() => {
        if (type === "patient") this.showPatientDropdown = false;
        if (type === "medication") this.showMedicationDropdown = false;
      }, 150);
    },

    async submitData() {
      if (this.form.prescribe_medications.length === 0) {
        toast.warning("Please select at least one medication.");
        return;
      }

      for (const med of this.form.prescribe_medications) {
        if (!med.pcs || med.pcs <= 0) {
          toast.warning(`Enter valid quantity for ${med.name}`);
          return;
        }
      }
      const payload = {
        prescription_id: this.prescription?.prescription_id,
        instruction: this.form.instruction,
        medications: this.form.prescribe_medications.map((med) => ({
          prescribe_medication_id: med.prescribe_medication_id || null,
          name: med.name,
          type: med.type || "N/A",
          dosage: med.dosage || "N/A",
          pcs: Number(med.pcs),
        })),
      };

      try {
        await axios.patch(
          process.env.VUE_APP_API_BASE_URL +
            `/prescription/update-by-chart/${this.prescription.dentalChart.dental_id}`,
          payload
        );
        toast.success("Prescription updated successfully!");
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update prescription."
        );
      }
    },
  },
  mounted() {
    this.fetchDentalChart();
    this.fetchPrecribeMedication();
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
