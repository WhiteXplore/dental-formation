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
            <icon :name="'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">Add User Account</h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <div class="p-5 w-[30vw] space-y-3">
          <!-- Row 1 -->
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

          <!-- Row 2 -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="license_no" class="font-bold">License No:</label>
              <input
                v-model="form.license_no"
                type="text"
                id="license_no"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter license no"
              />
            </div>
          </div>

          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="license_no" class="font-bold">PRC:</label>
              <input
                v-model="form.prc_type"
                type="text"
                id="license_no"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter typoe of prc "
              />
            </div>
          </div>

          <!-- Row 3 -->
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
              <label for="password" class="font-bold">Password:</label>
              <input
                v-model="form.password"
                type="password"
                id="password"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter password"
              />
            </div>
          </div>

          <!-- Row 4 -->
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

          <!-- Divider -->
          <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>

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
              Submit
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
  name: "AddUserModal",
  components: { icon },
  data() {
    return {
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
    };
  },
  methods: {
    async submitData() {
      const form = this.$refs.userForm;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      try {
        await axios.post(
          process.env.VUE_APP_API_BASE_URL + "/user/add-user",
          this.form
        );
        toast.success("User added successfully!");
        const audio = new Audio(require("@/assets/add.mp3"));
        audio.play();

        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        toast.error("Failed to add user.");
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
