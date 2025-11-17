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

    <!-- Right Section -->
    <div class="flex gap-4 items-center text-right relative">
      <!-- Dentist Notification Bell -->
      <template v-if="user.role === 'Dentist'">
        <div
          ref="notificationIcon"
          class="relative cursor-pointer text-[13px] hover:text-green-600"
          @click="toggleNotifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a2 2 0 10-4 0v.083A6 6 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m5 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            v-if="unreadCount > 0"
            :class="[
              'absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full',
              { 'pulse-bg': isPulsing },
            ]"
          >
            {{ unreadCount }}
          </span>
        </div>

        <!-- Dentist Notifications Dropdown -->
        <div
          v-if="isOpenNotifications"
          ref="notificationDropdown"
          class="absolute top-12 right-16 w-72 bg-white shadow-xl rounded-2xl z-50 border border-gray-200 overflow-hidden"
        >
          <div
            class="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50"
          >
            <h3 class="font-semibold text-gray-700 text-sm">Notifications</h3>
            <button
              @click="markAllRead"
              class="text-xs text-green-600 hover:underline focus:outline-none"
            >
              Mark all as read
            </button>
          </div>

          <ul class="max-h-60 overflow-y-auto">
            <li
              v-for="(notif, index) in notifications"
              :key="notif.dental_id"
              @click="handleNotificationClick(notif, index)"
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3 border-b border-gray-100"
            >
              <div class="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-green-500 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M12 20h.01M6.938 6.938l1.414 1.414M17.657 17.657l1.414 1.414M6.938 17.657l1.414-1.414M17.657 6.938l1.414-1.414"
                  />
                </svg>
              </div>

              <div class="flex-1">
                <p class="text-sm text-gray-700 font-medium">
                  {{
                    notif.notif_status === null
                      ? `New booking for ${notif.patient?.first_name} ${notif.patient?.last_name}`
                      : `Viewed booking for ${notif.patient?.first_name} ${notif.patient?.last_name}`
                  }}
                </p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{
                    notif.notif_status === null
                      ? notif.procedure_date
                        ? new Date(notif.procedure_date).toLocaleString()
                        : "Just now"
                      : notif.notif_viewed_at
                      ? `Last viewed: ${new Date(
                          notif.notif_viewed_at
                        ).toLocaleString()}`
                      : "Viewed"
                  }}
                </p>
              </div>
            </li>

            <li
              v-if="notifications.length === 0"
              class="px-4 py-4 text-center text-gray-400 text-sm"
            >
              No notifications
            </li>
          </ul>
        </div>
      </template>

      <!-- User Info -->
      <div>
        <h1 class="text-[13px] font-semibold">
          {{ user.last_name }}, {{ user.first_name || "Guest" }}
        </h1>
        <h2 class="text-[12px]">{{ user.role || "No role" }}</h2>
      </div>

      <!-- Profile Picture -->
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
    <Profile v-if="isOpenProfile" :userId="user.sub || user.user_id" />
  </div>
</template>

<script>
import axios from "axios";
import Profile from "./profile-setting.vue";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";

export default {
  name: "TopBarPage",
  components: { Profile },
  data() {
    return {
      isOpenProfile: false,
      isOpenNotifications: false,
      user: {},
      notifications: [],
      unreadCount: 0,
      isPulsing: false,
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL + "/appointment", // ✅ corrected
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),
    formattedDate() {
      return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        weekday: "long",
      });
    },
    formattedTime() {
      return new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    },
  },
  watch: {
    appointments: {
      immediate: true,
      handler(newAppointments) {
        if (this.user.role !== "Dentist") return;

        // Map notifications
        this.notifications = newAppointments.map((appt) => ({
          appointment_id: appt.appointment_id, // ✅ use correct id
          patient: appt.patient,
          procedure_date: appt.scheduled_date,
          notif_status: appt.notif_status || null,
          notif_viewed_at: appt.notif_viewed_at || null,
        }));

        this.unreadCount = this.notifications.filter(
          (n) => n.notif_status === null
        ).length;
        this.isPulsing = this.unreadCount > 0;
      },
    },
  },
  methods: {
    toggleOpenProfile() {
      this.isOpenProfile = !this.isOpenProfile;
      this.isOpenNotifications = false;
    },
    toggleNotifications() {
      this.isOpenNotifications = !this.isOpenNotifications;
      this.isOpenProfile = false;
      if (this.isOpenNotifications) this.isPulsing = false;
    },
    markAllRead() {
      this.notifications.forEach((n) => (n.notif_status = "Viewed"));
      this.unreadCount = 0;
      this.isPulsing = false;
    },
    handleClickOutside(event) {
      const dropdowns = [
        this.$refs.profileDropdown,
        this.$refs.notificationDropdown,
      ];
      const icons = [this.$refs.profileIcon, this.$refs.notificationIcon];
      dropdowns.forEach((dropdown, index) => {
        if (
          dropdown &&
          !dropdown.contains(event.target) &&
          icons[index] &&
          !icons[index].contains(event.target)
        ) {
          if (index === 0) this.isOpenProfile = false;
          if (index === 1) this.isOpenNotifications = false;
        }
      });
    },
    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + `/auth/me`,
          {
            withCredentials: true,
          }
        );
        if (response.data) this.user = response.data;
        else {
          this.$router.push("/");
          location.reload();
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        this.$router.push("/");
      }
    },
    async loadAppointments() {
      if (this.user.role === "Dentist") {
        const store = useFetchDataStore();
        await store.fetchAppointments();
      }
    },

    // ✅ updated handler
    async handleNotificationClick(notif, index) {
      if (!notif?.appointment_id) {
        console.error("Appointment ID is missing for notification:", notif);
        return;
      }

      try {
        // Only update if notif_status is null
        if (notif.notif_status === null) {
          const response = await axios.patch(
            `${this.apiBaseUrl}/${notif.appointment_id}`, // correct endpoint
            { notif_status: "Viewed" },
            { withCredentials: true }
          );

          // Update local notification
          this.notifications[index] = {
            ...this.notifications[index],
            notif_status: response.data.notif_status,
          };

          this.unreadCount = this.notifications.filter(
            (n) => n.notif_status === null
          ).length;
          this.isPulsing = this.unreadCount > 0;
        }

        this.isOpenNotifications = false;
        this.$router.push("/dental-chart");
      } catch (err) {
        console.error(
          "Failed to mark notification as viewed:",
          err.response || err
        );
      }
    },
  },
  async mounted() {
    await this.fetchUser();
    if (this.user.role === "Dentist") this.loadAppointments();
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
@keyframes pulse-bg {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
}

.pulse-bg {
  animation: pulse-bg 1.5s infinite;
}
</style>
