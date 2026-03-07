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
              {{ isEditMode ? "Edit User Account" : "Add User Account" }}
            </h1>
          </div>

          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <div class="p-5 w-[30vw] space-y-3">
          <!-- STEP 1 -->
          <div v-if="step === 1" class="space-y-3">
            <!-- Names -->
            <div class="flex gap-2">
              <div class="w-full flex flex-col space-y-1">
                <label class="font-bold">First Name</label>
                <input
                  v-model="form.first_name"
                  required
                  type="text"
                  class="border px-3 py-3 rounded-md border-gray-600"
                />
              </div>

              <div class="w-full flex flex-col space-y-1">
                <label class="font-bold">Middle Name</label>
                <input
                  v-model="form.middle_name"
                  type="text"
                  class="border px-3 py-3 rounded-md border-gray-600"
                />
              </div>

              <div class="w-full flex flex-col space-y-1">
                <label class="font-bold">Last Name</label>
                <input
                  v-model="form.last_name"
                  required
                  type="text"
                  class="border px-3 py-3 rounded-md border-gray-600"
                />
              </div>
            </div>

            <!-- Role -->
            <div class="flex flex-col space-y-1">
              <label class="font-bold">Role</label>
              <select
                v-model="form.role"
                required
                class="border px-3 py-3 rounded-md border-gray-600"
              >
                <option disabled value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Receptionist">Staff</option>
                <option value="Dentist">Dentist</option>
              </select>
            </div>

            <!-- Dentist fields -->
            <div v-if="form.role === 'Dentist'" class="space-y-3">
              <div class="flex gap-2">
                <div class="w-full flex flex-col">
                  <label class="font-bold">License No</label>
                  <input
                    v-model="form.license_no"
                    required
                    type="text"
                    class="border px-3 py-3 rounded-md border-gray-600"
                  />
                </div>

                <div class="w-full flex flex-col">
                  <label class="font-bold">PRC Type</label>
                  <input
                    v-model="form.prc_type"
                    required
                    type="text"
                    class="border px-3 py-3 rounded-md border-gray-600"
                  />
                </div>
              </div>

              <!-- Schedule -->
              <div class="space-y-2">
                <label class="font-bold">Dentist Schedule</label>

                <div
                  v-for="(s, index) in schedules"
                  :key="index"
                  class="flex gap-2 items-center"
                >
                  <select
                    v-model="s.day"
                    class="border px-2 py-2 rounded-md w-full"
                  >
                    <option disabled value="">Day</option>
                    <option v-for="d in days" :key="d">{{ d }}</option>
                  </select>

                  <input
                    type="time"
                    v-model="s.start_time"
                    class="border px-2 py-2 rounded-md w-full"
                  />

                  <input
                    type="time"
                    v-model="s.end_time"
                    class="border px-2 py-2 rounded-md w-full"
                  />

                  <button
                    type="button"
                    @click="removeSchedule(index)"
                    class="text-red-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <button
                  type="button"
                  @click="addSchedule"
                  class="bg-green-600 text-white px-3 py-1 rounded-md"
                >
                  + Add Schedule
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 2 -->
          <div v-if="step === 2" class="space-y-3">
            <!-- Email -->
            <div class="flex flex-col space-y-1">
              <label class="font-bold">Email</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="border px-3 py-3 rounded-md border-gray-600"
              />
            </div>

            <!-- Password -->
            <div class="flex flex-col space-y-1">
              <label class="font-bold">Password</label>

              <div v-if="isEditMode && !showPasswordInput">
                <button
                  type="button"
                  @click="showPasswordInput = true"
                  class="bg-yellow-400 px-3 py-3 rounded-md w-full"
                >
                  Change Password
                </button>
              </div>

              <div v-else>
                <input
                  v-model="form.password"
                  type="password"
                  :required="!isEditMode || showPasswordInput"
                  class="border px-3 py-3 rounded-md border-gray-600"
                />
              </div>
            </div>

            <!-- Signature -->
            <div class="space-y-2">
              <label class="font-bold">E-Signature</label>

              <input
                type="file"
                accept="image/*"
                @change="handleSignatureUpload"
                class="border px-3 py-2 rounded-md border-gray-600 w-full"
              />

              <div v-if="form.signature">
                <p class="text-xs text-gray-500">Signature Preview</p>

                <div class="flex items-center gap-2">
                  <img
                    :src="signaturePreview"
                    class="h-[80px] border rounded bg-white p-1"
                  />

                  <button
                    type="button"
                    @click="removeSignature"
                    class="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="flex flex-col space-y-1">
              <label class="font-bold">Status</label>
              <select
                v-model="form.status"
                required
                class="border px-3 py-3 rounded-md border-gray-600"
              >
                <option disabled value="">Select Status</option>
                <option>Active</option>
                <option>Not Active</option>
              </select>
            </div>
          </div>

          <!-- Divider -->
          <div class="w-full h-[1px] bg-gray-200"></div>

          <!-- Buttons -->
          <div class="flex justify-between">
            <button
              v-if="step === 2"
              type="button"
              @click="step--"
              class="bg-gray-500 text-white px-3 py-2 rounded-lg"
            >
              Back
            </button>

            <div class="ml-auto flex gap-2">
              <button
                type="button"
                @click="$emit('close')"
                class="bg-red-600 text-white px-3 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                v-if="step === 1"
                type="button"
                @click="step = 2"
                class="bg-blue-600 text-white px-3 py-2 rounded-lg"
              >
                Next
              </button>

              <button
                v-if="step === 2"
                type="submit"
                class="bg-[#34699A] text-white px-3 py-2 rounded-lg"
              >
                {{ isEditMode ? "Update" : "Submit" }}
              </button>
            </div>
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
  components: { icon },

  props: {
    user: { type: Object, default: null },
  },

  data() {
    return {
      step: 1,
      showPasswordInput: false,
      signatureFile: null,
      removeSignatureFlag: false,
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],

      form: {
        first_name: "",
        middle_name: "",
        last_name: "",
        license_no: "",
        prc_type: "",
        email: "",
        password: "",
        role: "",
        status: "",
        signature: "",
      },

      schedules: [],
    };
  },

  computed: {
    isEditMode() {
      return !!this.user;
    },

    signaturePreview() {
      if (!this.form.signature) return "";

      // preview for newly uploaded file
      if (this.form.signature.startsWith("blob:")) {
        return this.form.signature;
      }

      // existing file from backend
      return `${process.env.VUE_APP_API_BASE_URL}/uploads/signatures/${this.form.signature}`;
    },
  },

  methods: {
    handleSignatureUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.signatureFile = file;
      this.form.signature = URL.createObjectURL(file);
    },

    removeSignature() {
      this.signatureFile = null;
      this.form.signature = "";
      this.removeSignatureFlag = true; // ⭐ tell backend to delete
    },

    addSchedule() {
      this.schedules.push({ day: "", start_time: "", end_time: "" });
    },

    removeSchedule(i) {
      this.schedules.splice(i, 1);
    },

    async submitData() {
      const formData = new FormData();

      Object.keys(this.form).forEach((key) => {
        if (this.form[key] !== undefined && this.form[key] !== null) {
          formData.append(key, this.form[key]);
        }
      });

      if (this.signatureFile) {
        formData.append("signature", this.signatureFile);
      }

      if (this.removeSignatureFlag) {
        formData.append("removeSignature", "true");
      }

      if (this.form.role === "Dentist") {
        formData.append("schedules", JSON.stringify(this.schedules));
      }

      try {
        if (this.isEditMode) {
          await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL}/user/update/${this.user.user_id}`,
            formData,
          );

          toast.success("User updated successfully");
        } else {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/user/add-user`,
            formData,
          );

          toast.success("User added successfully");
        }

        this.$emit("refresh");
        this.$emit("close");
      } catch {
        toast.error("Error saving user");
      }
    },
  },

  mounted() {
    if (this.isEditMode) {
      this.form = {
        first_name: this.user.first_name,
        middle_name: this.user.middle_name,
        last_name: this.user.last_name,
        license_no: this.user.license_no,
        prc_type: this.user.prc_type,
        email: this.user.email,
        role: this.user.role,
        status: this.user.status,
        password: "",
        signature: this.user.signature || "",
      };

      this.schedules = this.user.schedules
        ? this.user.schedules.map((s) => ({
            day: s.day,
            start_time: s.start_time,
            end_time: s.end_time,
          }))
        : [];
    }
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
