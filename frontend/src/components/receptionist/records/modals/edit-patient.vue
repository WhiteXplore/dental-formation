<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        class="w-auto bg-white text-[13px] rounded-[15px] shadow-l p-0.5"
        ref="patientForm"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">Edit Patients</h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <div class="p-5 w-[40vw] space-y-3">
          <!-- ROW 1 -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="first_name" class="font-bold">First Name:</label>
              <input
                v-model="form.first_name"
                type="text"
                id="first_name"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter first name"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="middle_name" class="font-bold">Middle Name:</label>
              <input
                v-model="form.middle_name"
                type="text"
                id="middle_name"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter middle name"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="last_name" class="font-bold">Last Name:</label>
              <input
                v-model="form.last_name"
                type="text"
                id="last_name"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <!-- ROW 2 -->
          <div class="flex gap-2 items-center w-full">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="gender" class="font-bold">Gender:</label>
              <select
                v-model="form.gender"
                required
                class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="birthdate" class="font-bold">Birthdate:</label>
              <input
                v-model="form.birthdate"
                type="date"
                id="birthdate"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="age" class="font-bold">Age:</label>
              <input
                v-model="form.age"
                type="number"
                id="age"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter age"
              />
            </div>
          </div>

          <!-- ROW 3 -->
          <div class="flex gap-2 items-center w-full">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="contact_number" class="font-bold">Contact No.:</label>
              <input
                v-model="form.contact_number"
                type="number"
                id="contact_number"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter contact number"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="religion" class="font-bold">Religion:</label>
              <input
                v-model="form.religion"
                type="text"
                id="religion"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter religion"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="nationality" class="font-bold">Nationality:</label>
              <input
                v-model="form.nationality"
                type="text"
                id="nationality"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter nationality"
              />
            </div>
          </div>

          <!-- ROW 4 -->
          <div class="flex gap-2 items-center w-full">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="marital_status" class="font-bold">Status:</label>
              <input
                v-model="form.marital_status"
                type="text"
                id="marital_status"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter marital status"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="occupation" class="font-bold">Occupation:</label>
              <input
                v-model="form.occupation"
                type="text"
                id="occupation"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter occupation"
              />
            </div>
          </div>
          <div class="w-full space-y-1.5 text-left flex flex-col">
            <label class="font-bold">Dental Insurance:</label>
            <select
              v-model="form.has_insurance"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Do you have insurance?</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            <input
              v-if="form.has_insurance === 'Yes'"
              v-model="form.dental_insurance"
              type="text"
              id="dental_insurance"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800 mt-2"
              placeholder="Enter insurance provider"
              :required="form.has_insurance === 'Yes'"
            />
          </div>
          <!-- ROW 5 -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="parent_fullname" class="font-bold">Parent:</label>
              <input
                v-model="form.parent_fullname"
                type="text"
                id="parent_fullname"
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter the parent name if the client is minor"
              />
            </div>
          </div>

          <!-- ROW 6 -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="address" class="font-bold">Address:</label>
              <input
                v-model="form.address"
                type="text"
                id="address"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter address"
              />
            </div>
          </div>

          <!-- Divider -->
          <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>

          <!-- Buttons -->
          <div class="tracking-wide flex justify-end gap-2 mt-4">
            <button
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

export default {
  name: "EditPatient",
  components: { icon },
  props: {
    patient: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        birthdate: "",
        age: "",
        contact_number: "",
        religion: "",
        nationality: "",
        marital_status: "",
        occupation: "",
        has_insurance: "",
        dental_insurance: "",
        parent_fullname: "",
        address: "",
      },
    };
  },
  mounted() {
    if (this.patient) {
      this.form = {
        ...this.patient,
        has_insurance: this.patient.dental_insurance ? "Yes" : "No",
        dental_insurance: this.patient.dental_insurance || "",
      };
    }
  },
  methods: {
    async submitData() {
      const form = this.$refs.patientForm;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      try {
        // ✅ FIXED: Use patient.patient_id instead of patient.id
        const response = await axios.patch(
          `http://localhost:8000/patient/update-patient/${this.patient.patient_id}`,
          {
            ...this.form,
            dental_insurance:
              this.form.has_insurance === "Yes"
                ? this.form.dental_insurance
                : "",
          }
        );

        if (response.status === 200) {
          toast.success("Patient updated successfully!");
          const audio = new Audio(require("@/assets/add.mp3"));
          audio.play();
          this.$emit("refresh");
          this.$emit("close");
        }
      } catch (err) {
        console.error("Update failed:", err);
        toast.error("Failed to update patient.");
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
