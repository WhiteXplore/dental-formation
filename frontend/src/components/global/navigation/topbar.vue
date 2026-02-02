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
      <div
        v-if="user.role === 'Dentist' || user.role === 'Admin'"
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

      <!-- Notification Dropdown -->
      <div
        v-if="isOpenNotifications"
        ref="notificationDropdown"
        class="absolute top-12 right-16 w-80 bg-white shadow-xl rounded-2xl z-50 border overflow-hidden"
      >
        <div
          class="flex justify-between items-center px-4 py-3 border-b bg-gray-50"
        >
          <h3 class="font-semibold text-sm">Notifications</h3>
          <button
            v-if="user.role === 'Dentist'"
            @click="markAllRead"
            class="text-xs text-green-600 hover:underline"
          >
            Mark all as read
          </button>
        </div>

        <ul class="max-h-60 overflow-y-auto">
          <li
            v-for="(notif, index) in notifications"
            :key="index"
            @click="handleNotificationClick(notif, index)"
            class="px-4 py-3 cursor-pointer border-b hover:bg-gray-50"
            :class="notif.notif_status === null ? 'bg-green-50' : ''"
          >
            <!-- ADMIN -->
            <template v-if="notif.type === 'inventory'">
              <p class="text-sm font-medium">
                <span v-if="notif.level === 'out'" class="text-red-600">
                  ❌ {{ notif.name }} is out of stock
                </span>
                <span v-else class="text-yellow-600">
                  ⚠️ {{ notif.name }} low stock ({{ notif.quantity }})
                </span>
              </p>
              <p class="text-xs text-gray-400">Inventory Alert</p>
            </template>

            <!-- DENTIST -->
            <p class="text-xs text-gray-400">
              <span v-if="notif.notif_status === null"
                >New •
                {{ new Date(notif.notif_viewed_at).toLocaleString() }}</span
              >
              <span v-else
                >Viewed •
                {{ new Date(notif.notif_viewed_at).toLocaleString() }}</span
              >
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

  <!-- Profile Dropdown -->
  <div class="absolute top-[70px] right-6 z-50" ref="profileDropdown">
    <Profile v-if="isOpenProfile" :userId="user.sub" />
  </div>
</template>

<script>
import axios from "axios";
import Profile from "./profile-setting.vue";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";
import { io } from "socket.io-client";

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
      socket: null,
      appointmentApi: process.env.VUE_APP_API_BASE_URL + "/appointment",
      inventoryApi: process.env.VUE_APP_API_BASE_URL + "/inventory",
    };
  },

  computed: {
    ...mapState(useFetchDataStore, ["appointments", "inventories"]),

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
    appointments: { immediate: true, handler: "buildNotifications" },
    inventories: { immediate: true, handler: "buildNotifications" },
    user: { immediate: true, deep: true, handler: "buildNotifications" },
  },

  methods: {
    /* ================= BUILD ================= */
    buildNotifications() {
      this.notifications = [];
      this.unreadCount = 0;

      // Dentist notifications
      if (this.user.role === "Dentist" && Array.isArray(this.appointments)) {
        const dentistNotifs = this.appointments
          .filter((a) => a.user_id === this.user.sub)
          .map((a) => ({
            type: "appointment",
            appointment_id: a.appointment_id,
            patient: a.patient,
            procedure_date: a.scheduled_date,
            notif_status: a.notif_status,
            notif_viewed_at: a.notif_viewed_at,
          }));
        this.notifications = dentistNotifs;
        this.unreadCount = dentistNotifs.filter(
          (n) => n.notif_status === null,
        ).length;
      }

      // Admin notifications
      if (this.user.role === "Admin" && Array.isArray(this.inventories)) {
        this.inventories.forEach((i) => {
          if (i.quantity <= 30) {
            const existingNotif = this.notifications.find(
              (n) => n.inventory_id === i.inventory_id,
            );
            if (!existingNotif || existingNotif.notif_status === "Viewed") {
              this.notifications.push({
                type: "inventory",
                inventory_id: i.inventory_id,
                level: i.quantity === 0 ? "out" : "low",
                name: i.name,
                quantity: i.quantity,
                notif_status: null,
                notif_viewed_at: new Date(),
              });
              this.unreadCount++;
            } else {
              this.notifications.push(existingNotif);
            }
          }
        });
      }

      this.isPulsing = this.unreadCount > 0;
    },

    /* ================= TOGGLES ================= */
    toggleOpenProfile() {
      this.isOpenProfile = !this.isOpenProfile;
      this.isOpenNotifications = false;
    },

    toggleNotifications() {
      this.isOpenNotifications = !this.isOpenNotifications;
      this.isOpenProfile = false;
      this.isPulsing = false;
    },

    /* ================= CLICK ================= */
    async handleNotificationClick(notif, index) {
      if (notif.type === "appointment" && notif.notif_status === null) {
        await axios.patch(
          `${this.appointmentApi}/${notif.appointment_id}`,
          { notif_status: "Viewed" },
          { withCredentials: true },
        );
        this.notifications[index].notif_status = "Viewed";
        this.notifications[index].notif_viewed_at = new Date();
        this.unreadCount--;
      }

      if (notif.type === "inventory" && notif.notif_status === null) {
        await axios.patch(
          `${this.inventoryApi}/${notif.inventory_id}/notification`,
          {},
          { withCredentials: true },
        );
        this.notifications[index].notif_status = "Viewed";
        this.notifications[index].notif_viewed_at = new Date();
        this.unreadCount--;
      }

      this.isOpenNotifications = false;
      this.$router.push(
        this.user.role === "Admin" ? "/inventory" : "/dentist-appointments",
      );
    },

    /* ================= MARK ALL ================= */
    async markAllRead() {
      if (this.user.role === "Dentist") {
        const unread = this.notifications.filter(
          (n) => n.notif_status === null,
        );
        await Promise.all(
          unread.map((n) =>
            axios.patch(
              `${this.appointmentApi}/${n.appointment_id}`,
              { notif_status: "Viewed" },
              { withCredentials: true },
            ),
          ),
        );
      }

      if (this.user.role === "Admin") {
        await axios.patch(
          `${this.inventoryApi}/notifications/mark-all-read`,
          {},
          { withCredentials: true },
        );
      }

      this.notifications = this.notifications.map((n) => ({
        ...n,
        notif_status: "Viewed",
        notif_viewed_at: new Date(),
      }));
      this.unreadCount = 0;
      this.isPulsing = false;
    },

    /* ================= USER ================= */
    async fetchUser() {
      const res = await axios.get(
        process.env.VUE_APP_API_BASE_URL + "/auth/me",
        { withCredentials: true },
      );
      this.user = res.data;
    },

    /* ================= CLICK OUTSIDE ================= */
    handleClickOutside(e) {
      if (
        !this.$refs.notificationDropdown?.contains(e.target) &&
        !this.$refs.notificationIcon?.contains(e.target)
      ) {
        this.isOpenNotifications = false;
      }
      if (
        !this.$refs.profileDropdown?.contains(e.target) &&
        !this.$refs.profileIcon?.contains(e.target)
      ) {
        this.isOpenProfile = false;
      }
    },

    /* ================= WEBSOCKET ================= */
    initInventorySocket() {
      if (!this.socket) {
        this.socket = io(process.env.VUE_APP_API_BASE_URL);

        this.socket.on("inventory-updated", (updatedInventory) => {
          const index = this.inventories.findIndex(
            (i) => i.inventory_id === updatedInventory.inventory_id,
          );

          if (index !== -1) {
            this.inventories[index] = updatedInventory;
          } else {
            this.inventories.push(updatedInventory);
          }

          // Rebuild notifications after inventory changes
          this.buildNotifications();
        });
      }
    },
  },

  async mounted() {
    const store = useFetchDataStore();
    await this.fetchUser();
    await store.fetchAppointments();
    await store.fetchInventories();

    document.addEventListener("click", this.handleClickOutside);

    // Initialize WebSocket for inventory updates
    this.initInventorySocket();
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    if (this.socket) this.socket.disconnect();
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
