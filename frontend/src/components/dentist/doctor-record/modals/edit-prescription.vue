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

            <div
              v-if="showMedicationDropdown"
              class="absolute left-0 top-full z-20 bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto w-full"
            >
              <div
                v-for="(med, idx) in filteredMedications"
                :key="med.inventory_id || idx"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                @mousedown.prevent="toggleMedicationSelection(med.name)"
              >
                <input
                  type="checkbox"
                  class="mr-2"
                  :checked="
                    form.prescribe_medications.some((m) => m.name === med.name)
                  "
                  readonly
                />
                {{ med.name }} - {{ med.quantity || med.unit || "" }}
              </div>
              <div
                v-if="filteredMedications.length === 0"
                class="px-3 py-2 text-gray-500 italic"
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
                v-for="(medication, index) in form.prescribe_medications"
                :key="medication.inventory_id || index"
                class="flex justify-between items-center border border-green-300 bg-white shadow-sm rounded-lg px-4 py-2"
              >
                <div
                  class="flex flex-col text-sm text-gray-800 font-medium w-full"
                >
                  <div class="flex justify-between items-center w-full gap-2">
                    <span>{{ medication.name }}</span>
                    <input
                      type="number"
                      min="1"
                      class="border rounded px-2 py-1 w-[70px] text-sm"
                      v-model.number="form.prescribe_medications[index].pcs"
                      placeholder="pcs"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeMedicationSelection(index)"
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
    group: Object, // ✅ Add this line
  },

  data() {
    return {
      form: {
        dental_ids: [],
        patient_id: "",
        inventory_id: "",
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
          prescribedMedications?.map((med) => ({
            inventory_id: med.inventory?.inventory_id,
            pcs: med.pcs,
            name: med.inventory?.name || "", // add name for consistency
          })) || [];

        this.form.instruction = instruction || "";

        this.searchPatientQuery = dentalChart?.patient?.first_name || "";
      },
    },
  },
  computed: {
    ...mapState(useFetchDataStore, ["dentalCharts", "inventories"]),
    filteredPatients() {
      const query = this.searchPatientQuery.toLowerCase();
      if (!query) return this.dentalCharts;
      return this.dentalCharts.filter((chart) => {
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
      return this.inventories.filter((inv) =>
        inv.name.toLowerCase().includes(query)
      );
    },
  },

  methods: {
    ...mapActions(useFetchDataStore, ["fetchDentalChart", "fetchInventories"]),

    formatDate(date) {
      return dayjs(date).format("MMMM D, YYYY - h:mm A");
    },

    getPatientName(id) {
      const chart = this.dentalCharts.find((c) => c.dental_id === id);
      if (!chart || !chart.patient) return "";
      const { last_name, first_name, middle_name } = chart.patient;
      return `${last_name}, ${first_name} ${middle_name || ""}`;
    },

    getToothInfo(id) {
      const chart = this.dentalCharts.find((c) => c.dental_id === id);
      if (!chart || !Array.isArray(chart.teeth)) return "No tooth info";
      return chart.teeth
        .map((tooth) => `Tooth ${tooth.tooth_number} - ${tooth.status}`)
        .join(", ");
    },

    removeDentalSelection(id) {
      const index = this.form.dental_ids.indexOf(id);
      if (index !== -1) this.form.dental_ids.splice(index, 1);
    },

    toggleDentalSelection(dentalChart) {
      const id = dentalChart.dental_id;
      const index = this.form.dental_ids.indexOf(id);
      if (index === -1) {
        this.form.dental_ids.push(id);
      } else {
        this.form.dental_ids.splice(index, 1);
      }
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

    hideDropdown(type) {
      setTimeout(() => {
        if (type === "patient") this.showPatientDropdown = false;
        if (type === "medication") this.showMedicationDropdown = false;
      }, 150);
    },

    isFormChanged() {
      const original = this.group;
      if (!original) return true;

      const origDentalIds = original.rows.map((r) => r.dentalChart?.dental_id);
      const formDentalIds = this.form.dental_ids;

      const dentalChanged =
        JSON.stringify(origDentalIds.sort()) !==
        JSON.stringify(formDentalIds.sort());

      const origMedications = original.rows[0]?.prescribedMedications || [];
      const medsChanged = this.form.prescribe_medications.some((med) => {
        const orig = origMedications.find(
          (o) => o.inventory?.inventory_id === med.inventory_id
        );
        return !orig || med.pcs !== orig.pcs;
      });

      const instructionChanged =
        this.form.instruction.trim() !==
        (original.rows[0]?.instruction || "").trim();

      return dentalChanged || medsChanged || instructionChanged;
    },

    async submitData() {
      const formEl = this.$refs.patientForm;
      if (!formEl.checkValidity()) {
        formEl.reportValidity();
        return;
      }

      if (
        !Array.isArray(this.form.dental_ids) ||
        this.form.dental_ids.length === 0
      ) {
        toast.warning("Please select at least one dental chart.");
        return;
      }

      if (
        !Array.isArray(this.form.prescribe_medications) ||
        this.form.prescribe_medications.length === 0
      ) {
        toast.warning("Please select at least one medication.");
        return;
      }

      for (const med of this.form.prescribe_medications) {
        const pcsNumber = Number(med.pcs);
        if (!pcsNumber || pcsNumber <= 0) {
          toast.warning(`Please enter a valid quantity for ${med.name}`);
          return;
        }
      }

      if (!this.form.instruction.trim()) {
        toast.warning("Please provide prescription instruction.");
        return;
      }

      if (!this.isFormChanged()) {
        toast.info("No changes detected. Submitting anyway...");
      }

      const payload = {
        prescription_id: this.prescription?.prescription_id,
        instruction: this.form.instruction, // ✅ add this
        medications: this.form.prescribe_medications.map((med) => ({
          inventory_id: med.inventory_id,
          pcs: Number(med.pcs),
        })),
      };

      try {
        await axios.patch(
          `http://localhost:8000/prescription/update-by-chart/${this.prescription.dentalChart.dental_id}`,
          payload
        );

        toast.success("Prescription updated successfully!");
        const audio = new Audio(require("@/assets/add.mp3"));
        audio.play();

        this.$emit("refresh");
        // Optionally close modal:
        // this.$emit("close");
      } catch (error) {
        console.error(
          "Prescription submit error:",
          error.response?.data || error.message
        );
        toast.error(
          error.response?.data?.message || "Failed to update prescription."
        );
      }
    },
  },

  mounted() {
    this.fetchDentalChart();
    this.fetchInventories();
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
