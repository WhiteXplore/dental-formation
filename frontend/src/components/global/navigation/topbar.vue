<template>
  <div
    class="bg-white py-1 rounded-t-lg flex justify-between items-center p-6 shadow px-5"
  >
    <!-- Left -->
    <div class="text-green-900 font-semibold text-[16px] tracking-wide">
      ToothFormation
    </div>

    <!-- Center -->
    <div class="text-center mr-52">
      <div class="text-[14px]">{{ formattedDate }}</div>
      <div class="text-[14px]">{{ formattedTime }}</div>
    </div>

    <!-- Right -->
    <div class="flex gap-4 items-center text-right relative">
      <!-- Notification Bell -->
      <template v-if="user.role === 'Dentist'">
        <div
          ref="notificationIcon"
          class="relative cursor-pointer hover:text-green-600"
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
              'absolute top-0 right-0 px-1.5 py-1 text-xs font-bold text-white bg-red-600 rounded-full',
              { 'pulse-bg': isPulsing },
            ]"
          >
            {{ unreadCount }}
          </span>
        </div>

        <!-- Dropdown -->
        <div
          v-if="isOpenNotifications"
          ref="notificationDropdown"
          class="absolute top-12 right-16 w-72 bg-white shadow-xl rounded-2xl z-50 border overflow-hidden"
          @mouseleave="isOpenNotifications = false"
        >
          <div
            class="flex justify-between items-center px-4 py-3 border-b bg-gray-50"
          >
            <h3 class="font-semibold text-sm">Notifications</h3>
            <button
              @click="markAllRead"
              class="text-xs text-green-600 hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <ul class="max-h-60 overflow-y-auto">
            <li
              v-for="(notif, index) in notifications"
              :key="notif.appointment_id"
              @click="handleNotificationClick(notif, index)"
              class="px-4 py-3 cursor-pointer border-b"
              :class="
                notif.notif_status === null ? 'bg-green-50' : 'hover:bg-gray-50'
              "
            >
              <p class="text-sm font-medium">
                New booking for {{ notif.patient?.first_name }}
                {{ notif.patient?.last_name }}
              </p>
              <p class="text-xs text-gray-400">
                <span v-if="notif.notif_status === null">
                  {{ new Date(notif.procedure_date).toLocaleString() }}
                </span>
                <span v-else>
                  Viewed •
                  {{ new Date(notif.notif_viewed_at).toLocaleString() }}
                </span>
              </p>
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
          {{ user.last_name }}, {{ user.first_name }}
        </h1>
        <h2 class="text-[12px]">{{ user.role }}</h2>
      </div>

      <!-- Profile -->
      <div
        ref="profileIcon"
        class="cursor-pointer border-2 rounded-full"
        @click="toggleOpenProfile"
      >
        <img src="../../../assets/img/users.png" class="w-8 h-8 rounded-full" />
      </div>
    </div>
  </div>

  <div class="absolute top-[70px] right-6 z-50" ref="profileDropdown">
    <Profile v-if="isOpenProfile" :userId="user.sub" />
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
      user: {},
      notifications: [],
      unreadCount: 0,
      isPulsing: false,
      isOpenProfile: false,
      isOpenNotifications: false,
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL + "/appointment",
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),

    formattedDate() {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit",
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
      handler() {
        this.buildNotifications();
      },
    },
    user: {
      immediate: true,
      deep: true,
      handler() {
        this.buildNotifications();
      },
    },
  },

  methods: {
    buildNotifications() {
      if (!this.user?.sub || this.user.role !== "Dentist") return;

      const dentistId = this.user.sub;

      this.notifications = this.appointments
        .filter((a) => a.user_id === dentistId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((a) => ({
          appointment_id: a.appointment_id,
          patient: a.patient,
          procedure_date: a.scheduled_date,
          notif_status: a.notif_status, // ✅ KEEP
          notif_viewed_at: a.notif_viewed_at, // ✅ KEEP
        }));

      this.unreadCount = this.notifications.filter(
        (n) => n.notif_status === null
      ).length;

      this.isPulsing = this.unreadCount > 0;
    },

    toggleOpenProfile() {
      this.isOpenProfile = !this.isOpenProfile;
      this.isOpenNotifications = false;
    },

    toggleNotifications() {
      this.isOpenNotifications = !this.isOpenNotifications;
      this.isOpenProfile = false;
      this.isPulsing = false;
    },

    async fetchUser() {
      const res = await axios.get(
        process.env.VUE_APP_API_BASE_URL + "/auth/me",
        { withCredentials: true }
      );
      this.user = res.data;
    },

    async loadAppointments() {
      const store = useFetchDataStore();
      await store.fetchAppointments();
    },
    async handleNotificationClick(notif, index) {
      if (notif.notif_status === null) {
        await axios.patch(
          `${this.apiBaseUrl}/${notif.appointment_id}`,
          { notif_status: "Viewed" },
          { withCredentials: true }
        );

        this.notifications[index].notif_status = "Viewed";
        this.notifications[index].notif_viewed_at = new Date();

        if (this.unreadCount > 0) this.unreadCount--;
      }

      this.isOpenNotifications = false;
      this.$router.push("/dentist-appointments");
    },
    async markAllRead() {
      const unread = this.notifications.filter((n) => n.notif_status === null);

      await Promise.all(
        unread.map((n) =>
          axios.patch(
            `${this.apiBaseUrl}/${n.appointment_id}`,
            { notif_status: "Viewed" },
            { withCredentials: true }
          )
        )
      );

      this.notifications = this.notifications.map((n) => ({
        ...n,
        notif_status: "Viewed",
        notif_viewed_at: new Date(),
      }));

      this.unreadCount = 0;
      this.isPulsing = false;
    },
  },

  async mounted() {
    await this.fetchUser();
    await this.loadAppointments();
    document.addEventListener("click", this.handleClickOutside);
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
