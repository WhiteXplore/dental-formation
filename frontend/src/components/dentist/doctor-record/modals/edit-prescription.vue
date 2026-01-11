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
            <h1 class="font-bold tracking-wide text-lg">Edit Prescription</h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Form Body -->
        <div class="p-5 space-y-3">
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

          <!-- Patient Display (read-only) -->
          <div class="w-full space-y-1.5 text-left relative">
            <label class="font-bold">Patient:</label>
            <input
              v-model="searchPatientQuery"
              type="text"
              placeholder="Patient"
              class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800 bg-gray-100 cursor-not-allowed"
              readonly
              disabled
            />
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
                  v-for="(med, index) in filteredAllMedications"
                  :key="index"
                  class="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b"
                  @mousedown.prevent="toggleMedication(med)"
                >
                  <div class="flex flex-col">
                    <span class="font-semibold text-gray-800">{{
                      med.name
                    }}</span>
                    <span class="text-xs text-gray-500 italic"
                      >{{ med.type }} • {{ med.dosage }}</span
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
                class="mt-2 space-y-3 max-h-[25vh] overflow-auto"
              >
                <div
                  v-for="(med, index) in form.prescribe_medications"
                  :key="index"
                  class="flex flex-col md:flex-row justify-between items-start md:items-center border border-green-300 bg-white shadow-sm rounded-lg p-3 gap-3"
                >
                  <!-- Medication Info -->
                  <div class="flex-1 text-sm">
                    <span class="font-medium text-gray-800">{{
                      med.name
                    }}</span>
                    <span class="text-xs text-gray-500"
                      >({{ med.type }} • {{ med.dosage }})</span
                    >
                  </div>

                  <!-- Inputs -->
                  <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto"
                  >
                    <div class="flex flex-col">
                      <label class="text-xs text-gray-500">PCS</label>
                      <input
                        type="number"
                        class="border rounded px-2 py-1 text-sm w-full"
                        v-model.number="med.pcs"
                        placeholder="pcs"
                      />
                    </div>

                    <div class="flex flex-col">
                      <label class="text-xs text-gray-500">Duration</label>
                      <input
                        type="text"
                        class="border rounded px-2 py-1 text-sm w-full"
                        v-model="med.duration"
                        placeholder="days"
                      />
                    </div>

                    <div class="flex flex-col">
                      <label class="text-xs text-gray-500">Frequencies</label>
                      <input
                        type="text"
                        class="border rounded px-2 py-1 text-sm w-full"
                        v-model="med.frequencies"
                        placeholder="times/day"
                      />
                    </div>

                    <div class="flex flex-col">
                      <label class="text-xs text-gray-500">Preparation</label>
                      <input
                        type="text"
                        class="border rounded px-2 py-1 text-sm w-full"
                        v-model="med.preparation"
                        placeholder="before/after meal"
                      />
                    </div>
                  </div>

                  <!-- Remove Button -->
                  <button
                    type="button"
                    @click="removeMedication(index)"
                    class="text-red-500 text-xs hover:underline mt-2 md:mt-0"
                  >
                    <icon name="delete" />
                  </button>
                </div>
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
  },
  data() {
    return {
      form: {
        dental_ids: [],
        issued_date: dayjs().format("YYYY-MM-DD"),
        prescribe_medications: [],
        instruction: "",
      },
      searchPatientQuery: "",
      showMedicationDropdown: false,
      searchMedicationQuery: "",
      medicationOptions: [
        { name: "Amoxicillin", type: "Antibiotic", dosage: "500mg" },
        { name: "Ibuprofen", type: "Pain reliever", dosage: "200mg" },
        { name: "Paracetamol", type: "Analgesic", dosage: "500mg" },
        { name: "Mefenamic Acid", type: "Pain reliever", dosage: "250mg" },
      ],
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["prescribemedication"]),
    filteredAllMedications() {
      const query = this.searchMedicationQuery.toLowerCase();
      const dbMeds = this.prescribemedication
        .filter((m) => m.name.toLowerCase().includes(query))
        .map((m) => ({ ...m, type: m.type, dosage: m.dosage }));

      const manualMeds = this.medicationOptions.filter((m) =>
        m.name.toLowerCase().includes(query)
      );

      const merged = [...dbMeds];
      manualMeds.forEach((m) => {
        if (!merged.some((x) => x.name === m.name)) merged.push(m);
      });

      return merged.filter(
        (m) =>
          !this.form.prescribe_medications.some((sel) => sel.name === m.name)
      );
    },
  },
  watch: {
    prescription: {
      immediate: true,
      handler(pres) {
        if (!pres) return;

        const { dentalChart, prescribedMedications, instruction } = pres;

        this.form.issued_date = dentalChart?.procedure_date
          ? dayjs(dentalChart.procedure_date).format("YYYY-MM-DD")
          : "";

        this.form.dental_ids =
          dentalChart?.teeth?.map((t) => t.tooth_number) || [];

        this.form.prescribe_medications = (prescribedMedications || []).map(
          (med) => ({
            prescribe_medication_id: med.prescribe_medication_id || null,
            pcs: med.pcs || 1,
            name: med.name || "",
            type: med.type || "N/A",
            dosage: med.dosage || "N/A",
            duration: med.duration || "",
            frequencies: med.frequencies || "",
            preparation: med.preparation || "",
          })
        );

        this.form.instruction = instruction || "";

        this.searchPatientQuery = dentalChart?.patient
          ? `${dentalChart.patient.first_name} ${dentalChart.patient.last_name}`
          : "";
      },
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
      if (index === -1)
        this.form.prescribe_medications.push({ ...med, pcs: 1 });
      else this.form.prescribe_medications.splice(index, 1);
    },
    removeMedication(index) {
      this.form.prescribe_medications.splice(index, 1);
    },
    hideDropdown(type) {
      setTimeout(() => {
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
        instruction: this.form.instruction,
        medications: this.form.prescribe_medications.map((med) => ({
          prescribe_medication_id: med.prescribe_medication_id || null,
          name: med.name,
          type: med.type,
          dosage: med.dosage,
          pcs: Number(med.pcs),
          duration: med.duration,
          frequencies: med.frequencies,
          preparation: med.preparation,
        })),
      };

      try {
        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/prescription/update-by-chart/${this.prescription.dentalChart.dental_id}`,
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
