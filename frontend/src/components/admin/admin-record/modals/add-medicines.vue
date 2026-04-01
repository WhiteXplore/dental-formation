<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        class="w-auto bg-white text-[13px] rounded-[15px] shadow-l p-0.5"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="isEdit ? 'edit' : 'add-students'" />

            <h1 class="font-bold tracking-wide text-lg">
              {{ isEdit ? "Edit Medicine" : "Add Medicine" }}
            </h1>
          </div>

          <icon
            name="circle-close3"
            class="cursor-pointer"
            @click="$emit('close')"
          />
        </div>

        <!-- Form -->
        <div class="p-5 w-[27vw] space-y-4">
          <!-- Medicine Name -->
          <div class="space-y-1.5 text-left flex flex-col">
            <label class="font-bold">Medicine Name</label>

            <input
              v-model="form.name"
              type="text"
              required
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="Enter medicine name"
            />
          </div>

          <!-- Medicine Type -->
          <div class="space-y-1.5 text-left flex flex-col">
            <label class="font-bold">Medicine Type</label>

            <select
              v-model="form.type"
              required
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select medicine type</option>

              <option value="Antibiotic">Antibiotic</option>
              <option value="Analgesic">Analgesic (Pain Reliever)</option>
              <option value="Anti-inflammatory">Anti-inflammatory</option>
              <option value="Antipyretic">Antipyretic (Fever Reducer)</option>
              <option value="Antiseptic">Antiseptic</option>
              <option value="Antifungal">Antifungal</option>
              <option value="Antiviral">Antiviral</option>
              <option value="Antihistamine">Antihistamine</option>
              <option value="Local Anesthetic">Local Anesthetic</option>
              <option value="Sedative">Sedative</option>
              <option value="Vitamin / Supplement">Vitamin / Supplement</option>
              <option value="Other">Other (Specify)</option>
            </select>
            <!-- Other Medicine Type -->
            <div
              v-if="form.type === 'Other'"
              class="space-y-1.5 text-left flex flex-col"
            >
              <label class="font-bold">Specify Medicine Type</label>

              <input
                v-model="form.other_type"
                type="text"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter custom medicine type"
              />
            </div>
          </div>

          <!-- Dosage -->
          <div class="space-y-1.5 text-left flex flex-col">
            <label class="font-bold">Dosage</label>

            <input
              v-model="form.dosage"
              type="text"
              required
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="Example: 500mg"
            />
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
              type="submit"
              class="bg-[#34699A] p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
            >
              {{ isEdit ? "Update" : "Submit" }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import axios from "axios";
import { toast } from "vue3-toastify";

export default {
  name: "MedicineModal",

  components: { icon },

  props: {
    medicine: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      form: {
        name: "",
        type: "",
        dosage: "",
      },
    };
  },

  computed: {
    isEdit() {
      return !!this.medicine;
    },
  },

  created() {
    if (this.isEdit) {
      this.populateForm();
    }
  },

  methods: {
    populateForm() {
      this.form.name = this.medicine.name;
      this.form.dosage = this.medicine.dosage;

      const predefinedTypes = [
        "Antibiotic",
        "Analgesic",
        "Anti-inflammatory",
        "Antipyretic",
        "Antiseptic",
        "Antifungal",
        "Antiviral",
        "Antihistamine",
        "Local Anesthetic",
        "Sedative",
        "Vitamin / Supplement",
      ];

      if (predefinedTypes.includes(this.medicine.type)) {
        this.form.type = this.medicine.type;
      } else {
        this.form.type = "Other";
        this.form.other_type = this.medicine.type;
      }
    },

    async submitData() {
      try {
        const payload = {
          name: this.form.name,
          type: this.form.type,
          other_type: this.form.type === "Other" ? this.form.other_type : null,
          dosage: this.form.dosage,
        };
        if (this.isEdit) {
          await axios.patch(
            process.env.VUE_APP_API_BASE_URL + `/medicines/${this.medicine.id}`,
            payload,
          );

          toast.success("Medicine updated successfully!");
        } else {
          await axios.post(
            process.env.VUE_APP_API_BASE_URL + "/medicines/add-medicines",
            payload,
          );

          toast.success("Medicine added successfully!");
        }

        this.$emit("refresh");
        this.$emit("close");
      } catch (err) {
        toast.error("Failed to save medicine.");
      }
    },
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
