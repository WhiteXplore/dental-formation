<template>
  <div class="relative w-full min-h-screen flex flex-col">
    <!-- Background Image -->
    <img
      src="@/assets/img/clinic-bg.jpg"
      alt="Background"
      class="absolute inset-0 object-cover w-full h-full z-0 opacity-95"
    />
    <div class="bg-gray-900 opacity-70 w-full min-h-screen z-10 absolute inset-0"></div>

    <!-- Form Container -->
    <div class="flex items-center justify-center min-h-screen relative z-20 px-4 sm:px-6 lg:px-4">
      <div
        class="w-full max-w-4xl rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden relative bg-white/10 backdrop-blur-sm p-2 md:p-2"
      >
        <!-- Left Info Panel -->
        <div
          class="z-10 w-full md:w-1/2 flex justify-center items-start text-white p-4 md:p-6"
        >
          <div class="flex flex-col justify-center items-center text-center">
            <img src="@/assets/img/clinic-logo.vue.png" alt="" class="w-20 md:w-24" />
            <h1 class="font-bold text-2xl md:text-3xl mt-2">Dental Formation</h1>
            <p class="text-sm md:text-base text-justify mt-4 md:mt-5">
              Dental Formation is a digital platform designed to manage and
              streamline dental records efficiently. It provides tools for
              accurate dental charting, patient history tracking, and
              treatment documentation. With its user-friendly interface, it
              supports dental professionals in delivering organized and effective patient care.
              <a href="#" class="text-left flex mt-3 md:mt-5 font-bold text-blue-300 hover:underline">
                Click here for more information!
              </a>
            </p>
          </div>
        </div>

        <!-- Right Login Panel -->
        <div
          class="z-10 w-full md:w-1/2 flex flex-col justify-start items-center bg-white rounded-xl p-2 md:p-6 space-y-6 text-left text-[14px]"
        >
          <!-- Title -->
          <div class="w-full space-y-1 mt-3">
            <h2 class="text-xl md:text-2xl font-semibold text-gray-800">
              Sign in to Your Account
            </h2>
            <p class="text-[13px] md:text-sm text-gray-600 tracking-wider">
              Welcome back! Please enter your details
            </p>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="login" class="w-full space-y-4">
            <!-- Email Input -->
            <div>
              <label class="block text-sm md:text-base font-medium text-gray-700">Email</label>
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email"
                class="mt-1 w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-sm md:text-base font-medium text-gray-700">Password</label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="mt-1 w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  @click="togglePassword"
                  class="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  <icon :name="showPassword ? 'eye-close' : 'eye-open'" />
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full text-[16px] md:text-[18px] bg-[#34699A] text-white py-3 rounded-md hover:bg-blue-700 transition"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import authMixin from "../../mixin/authMixin";
export default {
  name: "LoginRegisterPage",
  mixins: [authMixin],
  components: {
    icon,
  },
  data() {
    return {
      showLogin: true,
      registrationStep: 1,
    };
  },
  methods: {
    toggleForm() {
      this.showLogin = !this.showLogin;
      this.registrationStep = 1;
      this.errorMessage = "";
    },
  },
};
</script>

<style scoped></style>
