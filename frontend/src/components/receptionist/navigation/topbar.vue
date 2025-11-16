<template>
  <div
    class="bg-white py-1 rounded-t-lg flex justify-between items-center p-6 shadow px-5"
  >
    <!-- Left Section: Title -->
    <div class="text-green-900 font-semibold text-[16px] tracking-wide">
      ToothFormation
    </div>

    <!-- Center Section: Current Date & Time -->
    <div class="text-center mr-52">
      <div class="text-[14px]">{{ formattedDate }}</div>
      <div class="text-[14px]">{{ formattedTime }}</div>
    </div>

    <!-- Right Section: User Info & Profile -->
    <div class="flex gap-4 items-center text-right">
      <div>
        <h1 class="text-[13px] font-semibold">
          {{ user.last_name }},
          {{ user.first_name || "Guest" }}
        </h1>
        <h2 class="text-[12px]">
          {{ user.role || "No Role" }}
        </h2>
      </div>

      <!-- Profile Picture with Click Event -->
      <div
        ref="profileIcon"
        class="text-[13px] cursor-pointer hover:border-green-600 border-2 rounded-full z-20"
        @click="toggleOpenProfile"
      >
        <img
          src="../../../assets/img/users.png"
          alt="Profile Picture"
          class="w-8 h-8 rounded-full object-cover"
        />
      </div>
    </div>
  </div>

  <!-- Profile Dropdown -->
  <div class="absolute top-[70px] right-6 z-50" ref="profileDropdown">
    <Profile v-if="isOpenProfile" />
  </div>
</template>

<script>
import axios from "axios";
import Profile from "./profile-setting.vue";

export default {
  name: "TopBarPage",
  components: { Profile },
  data() {
    return {
      isOpenProfile: false,
      user: {},
    };
  },
  computed: {
    formattedDate() {
      const date = new Date();
      const options = {
        year: "numeric",
        month: "long",
        day: "2-digit",
        weekday: "long",
      };
      return date.toLocaleDateString("en-US", options);
    },
    formattedTime() {
      const date = new Date();
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      return date.toLocaleTimeString("en-US", options);
    },
  },
  mounted() {
    this.fetchUser();
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggleOpenProfile() {
      this.isOpenProfile = true;
    },
    handleClickOutside(event) {
      const dropdown = this.$refs.profileDropdown;
      const icon = this.$refs.profileIcon;

      if (
        dropdown &&
        !dropdown.contains(event.target) &&
        icon &&
        !icon.contains(event.target)
      ) {
        this.isOpenProfile = false;
      }
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
};
</script>
