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
          <!-- Row 1: Names -->
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

          <!-- Role -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="role" class="font-bold">Role:</label>
              <select
                v-model="form.role"
                id="role"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Receptionist">Staff</option>
                <option value="Dentist">Dentist</option>
              </select>
            </div>
          </div>

          <!-- Dentist-only fields -->
          <div v-if="form.role === 'Dentist'" class="space-y-4">
            <div class="flex gap-2">
              <div class="w-full space-y-1.5 flex flex-col">
                <label class="font-bold">License No:</label>
                <input
                  v-model="form.license_no"
                  type="text"
                  class="w-full border px-3 py-3 border-gray-600 rounded-md"
                  required
                />
              </div>

              <div class="w-full space-y-1.5 flex flex-col">
                <label class="font-bold">PRC Type:</label>
                <input
                  v-model="form.prc_type"
                  type="text"
                  class="w-full border px-3 py-3 border-gray-600 rounded-md"
                  required
                />
              </div>
            </div>

            <!-- 🟦 Dentist Schedules -->
            <div class="space-y-2">
              <label class="font-bold">Dentist Schedule</label>

              <div
                v-for="(s, index) in schedules"
                :key="index"
                class="flex gap-2 items-center"
              >
                <select
                  v-model="s.day"
                  class="border px-2 py-2 rounded-md w-[120px]"
                  required
                >
                  <option disabled value="">Day</option>
                  <option v-for="d in days" :key="d">{{ d }}</option>
                </select>

                <input
                  type="time"
                  v-model="s.start_time"
                  class="border px-2 py-2 rounded-md"
                  required
                />

                <input
                  type="time"
                  v-model="s.end_time"
                  class="border px-2 py-2 rounded-md"
                  required
                />

                <button
                  type="button"
                  class="text-red-600 font-bold"
                  @click="removeSchedule(index)"
                >
                  ✕
                </button>
              </div>

              <button
                type="button"
                class="bg-green-600 text-white px-3 py-1 rounded-md"
                @click="addSchedule"
              >
                + Add Schedule
              </button>
            </div>
          </div>

          <!-- Email & Password -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="email" class="font-bold">Email:</label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter email"
              />
            </div>

            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label class="font-bold">Password:</label>

              <!-- Edit mode: show change password button -->
              <div v-if="isEditMode && !showPasswordInput">
                <button
                  type="button"
                  class="w-full bg-yellow-400 text-black px-3 py-3 rounded-md hover:bg-yellow-300"
                  @click="showPasswordInput = true"
                >
                  Change Password
                </button>
              </div>

              <!-- Password input -->
              <div v-else>
                <input
                  v-model="form.password"
                  type="password"
                  id="password"
                  :required="!isEditMode || showPasswordInput"
                  class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                  placeholder="Enter password"
                />
                <small v-if="isEditMode" class="text-gray-500 text-xs">
                  Leave blank to keep current password
                </small>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="status" class="font-bold">Status:</label>
              <select
                v-model="form.status"
                id="status"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select Status</option>
                <option>Active</option>
                <option>Not Active</option>
              </select>
            </div>
          </div>

          <div class="w-full h-[1px] bg-gray-200 mt-4"></div>

          <!-- Buttons -->
          <div class="tracking-wide flex justify-end gap-2 mt-4">
            <button
              type="button"
              class="bg-red-600 p-2 px-3 rounded-lg text-white hover:bg-white hover:border-red-800 hover:text-red-800 hover:shadow-md"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              class="bg-[#34699A] p-2 px-3 rounded-lg text-white hover:bg-white hover:border-green-800 hover:text-green-800 hover:shadow-md"
              type="submit"
            >
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
  name: "UserModal",
  components: { icon },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      showPasswordInput: false,
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
      },
      schedules: [],
    };
  },

  computed: {
    isEditMode() {
      return !!this.user;
    },
  },

  methods: {
    addSchedule() {
      this.schedules.push({
        day: "",
        start_time: "",
        end_time: "",
      });
    },

    removeSchedule(index) {
      this.schedules.splice(index, 1);
    },

    async submitData() {
      const formEl = this.$refs.userForm;
      if (!formEl.checkValidity()) {
        formEl.reportValidity();
        return;
      }

      try {
        let payload = {
          ...this.form,
          schedules: this.form.role === "Dentist" ? this.schedules : [],
        };

        if (this.isEditMode && !payload.password) {
          delete payload.password;
        }

        if (this.isEditMode) {
          await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL}/user/update/${this.user.user_id}`,
            payload
          );
          toast.success("User updated successfully!");
        } else {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/user/add-user`,
            payload
          );
          toast.success("User added successfully!");
        }

        const audio = new Audio(require("@/assets/add.mp3"));
        audio.play();

        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        toast.error(
          this.isEditMode ? "Failed to update user." : "Failed to add user."
        );
      }
    },
  },
  mounted() {
    if (this.isEditMode) {
      this.form = {
        ...this.user,
        password: "",
      };

      this.schedules = this.user.schedules ? [...this.user.schedules] : [];
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
