<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        ref="userForm"
        class="w-auto bg-white text-[13px] rounded-[15px] shadow-l p-0.5"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="isEditMode ? 'edit' : 'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">
              {{ isEditMode ? "Edit HMO" : "Add HMO" }}
            </h1>
          </div>
          <icon
            name="circle-close3"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Body -->
        <div class="p-5 w-[30vw] space-y-3">
          <!-- Company -->
          <div class="space-y-1.5">
            <label class="font-bold">Entity Type:</label>
            <select v-model="form.company" required class="input">
              <option disabled value="">Select entity type</option>
              <option value="Maxicare">Maxicare</option>
              <option value="Intellicare">Intellicare</option>
              <option value="Avega">Avega</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <!-- Company (Other) -->
          <div v-if="form.company === 'Other'" class="space-y-1.5">
            <label class="font-bold">Specify Company:</label>
            <input
              v-model="form.company_other"
              type="text"
              required
              class="input"
              placeholder="Enter company name"
            />
          </div>

          <!-- Full Name -->
          <div class="space-y-1.5">
            <label class="font-bold">Full Name:</label>
            <input
              v-model="form.full_name"
              type="text"
              required
              class="input"
              placeholder="Enter full name"
            />
          </div>

          <div class="w-full h-[1px] bg-gray-200 mt-4"></div>

          <!-- Buttons -->
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" @click="$emit('close')" class="btn-danger">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              {{ isEditMode ? "Update" : "Submit" }}
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

export default {
  name: "HMOModal",
  components: { icon },
  props: {
    guarantor: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      form: {
        full_name: "",
        company: "",
        company_other: "",
      },
    };
  },

  computed: {
    isEditMode() {
      return !!this.guarantor;
    },
  },

  mounted() {
    if (this.isEditMode) {
      const predefinedCompanies = ["Maxicare", "Intellicare", "Avega"];
      const isPredefined = predefinedCompanies.includes(this.guarantor.company);

      this.form = {
        full_name:
          this.guarantor.full_name ||
          `${this.guarantor.first_name} ${this.guarantor.middle_name || ""} ${
            this.guarantor.last_name
          }`.trim(),
        company: isPredefined ? this.guarantor.company : "Other",
        company_other: isPredefined ? "" : this.guarantor.company,
      };
    }
  },

  methods: {
    async submitData() {
      const formEl = this.$refs.userForm;
      if (!formEl.checkValidity()) {
        formEl.reportValidity();
        return;
      }

      try {
        const payload = {
          full_name: this.form.full_name,
          company:
            this.form.company === "Other"
              ? this.form.company_other
              : this.form.company,
        };

        if (this.isEditMode) {
          await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL}/hmo-guarantors/${this.guarantor.hmo_guarantor_id}`,
            payload
          );

          toast.success("HMO updated successfully!");
        } else {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/hmo-guarantors`,
            payload
          );
          toast.success("HMO added successfully!");
        }

        new Audio(require("@/assets/add.mp3")).play();
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error(error);
        toast.error(
          this.isEditMode ? "Failed to update HMO." : "Failed to add HMO."
        );
      }
    },
  },
};
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #4b5563;
  padding: 0.75rem;
  border-radius: 0.375rem;
  color: #1f2937;
}

.btn-primary {
  background: #34699a;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: white;
}

.btn-danger {
  background: #dc2626;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: white;
}
</style>
