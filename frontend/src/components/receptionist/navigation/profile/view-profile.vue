<template>
  <div class="p-6 text-gray-800 w-full min-h-screen bg-[#F4F6F8] rounded-t-xl">
    <h1 class="text-2xl font-bold text-left mb-1">Account Settings</h1>
    <p class="text-sm text-gray-500 mb-5 text-left">
      Manage your personal details and security preferences here.
    </p>

    <div class="flex flex-wrap gap-5">
      <!-- Profile Card -->
      <div
        class="w-full lg:w-[60%] bg-white shadow-md rounded-2xl p-5 space-y-6"
      >
        <div
          class="flex items-center gap-5 border border-gray-100 rounded-xl p-4 shadow-sm"
        >
          <img
            src="../../../../assets/img/employee_picture.png"
            alt="Profile Picture"
            class="w-16 h-16 rounded-full"
          />
          <div class="flex justify-between items-center w-full">
            <div class="text-left">
              <p class="text-lg font-semibold">
                {{ user.first_name }} {{ user.last_name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ user.position || "No Position" }}
              </p>
            </div>
            <div
              class="gap-1 flex cursor-pointer border border-green-600 text-green-600 px-2 py-1 rounded-lg hover:bg-green-50 transition"
            >
              <icon :name="'edit'" />
              <button>Edit</button>
            </div>
          </div>
        </div>

        <!-- Personal Info -->
        <div class="text-left p-4">
          <h2 class="text-lg font-semibold mb-3">Personal Information</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Column 1 -->
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-500">First Name</label>
                <p class="font-medium">{{ user.first_name }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">Position</label>
                <p class="font-medium">{{ user.position || "No Position" }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">Email Address</label>
                <p class="font-medium">{{ user.email || "No Email" }}</p>
              </div>
            </div>

            <!-- Column 2 -->
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-500">Last Name</label>
                <p class="font-medium">{{ user.last_name }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">Office</label>
                <p class="font-medium">{{ user.office || "No Office" }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">Contact Number</label>
                <p class="font-medium">
                  {{ user.contact_number || "No Contact" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div
        class="w-full lg:flex-1 bg-white shadow-md rounded-2xl p-5 text-left"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Change Password</h2>
          <div
            class="gap-1 flex cursor-pointer border border-green-600 text-green-600 px-2 py-1 rounded-lg hover:bg-green-50 transition"
          >
            <icon :name="'edit'" />
            <button>Edit</button>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label for="old_password" class="text-sm text-gray-600 font-medium"
              >Old Password</label
            >
            <input
              type="password"
              id="old_password"
              class="w-full p-3 mt-1 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              placeholder="Enter old password"
            />
          </div>
          <div>
            <label for="new_password" class="text-sm text-gray-600 font-medium"
              >New Password</label
            >
            <input
              type="password"
              id="new_password"
              class="w-full p-3 mt-1 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label
              for="confirm_password"
              class="text-sm text-gray-600 font-medium"
              >Confirm Password</label
            >
            <input
              type="password"
              id="confirm_password"
              class="w-full p-3 mt-1 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              placeholder="Confirm new password"
            />
          </div>
          <button
            class="w-full py-3 bg-[#34699A] hover:bg-green-500 text-white font-semibold rounded-xl text-sm tracking-wide transition"
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import axios from "axios";
export default {
  name: "ProfileContentPage",
  components: {
    icon,
  },
  data() {
    return {
      isOpenProfile: false,
      user: {},
    };
  },
  methods: {
    toggleOpenProfile() {
      this.isOpenProfile = !this.isOpenProfile;
    },
    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          this.user = response.data;
          console.log("Authenticated User:", this.user);
        } else {
          this.$router.push("/");
          location.reload();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        this.$router.push("/");
      }
    },
  },
  mounted() {
    this.fetchUser();
  },
};
</script>

<style></style>
