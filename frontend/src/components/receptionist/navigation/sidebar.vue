<template>
  <div class="bg-[#34699A] w-screen h-screen flex">
    <!-- Sidebar -->
    <div
      :class="{ 'w-16': !isExpanded, 'w-64': isExpanded }"
      class="h-full fixed left-0 top-0 bg-[#34699A] text-white p-3 transition-all duration-300 ease-in-out"
    >
      <!-- Toggle Sidebar -->
      <div @click="toggleSidebar" class="justify-end flex">
        <icon
          :name="'burger'"
          class="cursor-pointer"
          :class="{ 'mr-3 mt-1': !isExpanded }"
        />
      </div>

      <!-- Logo and user info -->
      <div class="flex flex-col items-center justify-c enter w-full">
        <img
          src="../../../assets/img/clinic-logo.vue.png"
          alt="Logo"
          :class="{
            'w-16 rounded-full border-white border ': isExpanded,
            hidden: !isExpanded,
          }"
        />
        <p
          :class="{
            'text-sm font-medium mt-2': isExpanded,
            hidden: !isExpanded,
          }"
        >
          {{ user.first_name }} {{ user.last_name }}
        </p>
        <p
          :class="{
            'text-[12px] font-medium tracking-wider': isExpanded,
            hidden: !isExpanded,
          }"
        >
          {{ user.email }}
        </p>
      </div>

      <div v-if="isExpanded" class="w-full h-0.5 bg-[#fbfbfb] mt-4"></div>

      <!-- Dynamic Menu -->
      <div class="flex flex-col mt-6 gap-2 tracking-wide text-[12px] w-full">
        <!-- Home Section -->
        <div v-if="isExpanded" class="text-md text-white mt-2 text-left">
          Home
        </div>
        <div v-for="item in homeItems" :key="item.name" class="w-full">
          <router-link
            v-if="!item.children"
            :to="item.route"
            @click="handleDashboardClick"
            class="flex items-center w-full gap-5 p-2 rounded-md transition-all duration-200"
            :class="[
              $route.path === item.route
                ? 'bg-white text-green-700'
                : 'text-white hover:bg-white hover:text-gray-800',
              !isExpanded ? 'justify-center' : 'justify-start',
            ]"
          >
            <icon :name="item.icon" />
            <span v-show="isExpanded">{{ item.name }}</span>
          </router-link>
        </div>

        <!-- !Services Section  -->
        <div v-if="isExpanded" class="text-md text-white text-left">
          Services
        </div>
        <div
          v-for="item in serviceMaintenanceItems"
          :key="item.name"
          class="w-full"
        >
          <!-- Non-children router-link -->
          <router-link
            v-if="!item.children"
            :to="item.route"
            class="flex items-center w-full gap-5 p-2 rounded-md transition-all duration-200"
            :class="[
              $route.path.startsWith(item.route) // Match parent route for child paths
                ? 'bg-white text-green-700 '
                : 'text-white hover:bg-white hover:text-gray-800 ',
              !isExpanded ? 'justify-center' : 'justify-start',
            ]"
          >
            <icon :name="item.icon" />
            <span v-show="isExpanded">{{ item.name }}</span>
          </router-link>

          <!-- Collapsible Parent -->
          <div v-else>
            <div
              @click="toggleDropdown(item.name)"
              class="flex items-center justify-between w-full p-2 cursor-pointer transition-all duration-200"
              :class="[
                isDropdownOpen === item.name
                  ? `bg-white text-gray-800 ${
                      !isExpanded ? 'rounded-md' : 'rounded-t-md'
                    }`
                  : 'text-white hover:bg-white hover:text-gray-800 hover:rounded-md ',
              ]"
            >
              <!-- Icon + Label -->
              <div
                :class="[
                  !isExpanded ? 'justify-center w-full' : 'justify-start gap-5',
                ]"
                class="flex items-center"
              >
                <icon :name="item.icon" />
                <span v-show="isExpanded">{{ item.name }}</span>
              </div>
              <!-- Arrow icon (only show when expanded) -->
              <icon
                name="arrow-down"
                v-show="isExpanded"
                class="transition-transform"
                :class="{ 'rotate-180': isDropdownOpen === item.name }"
              />
            </div>

            <!-- Dropdown children -->
            <transition name="slide">
              <div v-show="isDropdownOpen === item.name && isExpanded">
                <router-link
                  v-for="(sub, index) in item.children"
                  :key="sub.name"
                  :to="sub.route"
                  class="block w-full py-2 px-[60px] text-[12px] transition-all duration-200 text-left border border-white"
                  :class="[
                    $route.path.startsWith(sub.route) // This ensures the parent is active when on a child route
                      ? 'bg-[#34699A] text-white '
                      : 'bg-white text-gray-800 hover:bg-gray-200',
                    index === item.children.length - 1
                      ? 'rounded-b-md border border-white'
                      : '',
                  ]"
                >
                  {{ sub.name }}
                </router-link>
              </div>
            </transition>
          </div>
        </div>

        <!-- !Billing Section  -->
        <div v-if="isExpanded" class="text-md text-white text-left">
          Billing
        </div>
        <div v-for="item in billingItems" :key="item.name" class="w-full">
          <!-- Non-children router-link -->
          <router-link
            v-if="!item.children"
            :to="item.route"
            class="flex items-center w-full gap-5 p-2 rounded-md transition-all duration-200"
            :class="[
              $route.path.startsWith(item.route) // Match parent route for child paths
                ? 'bg-white text-green-700 '
                : 'text-white hover:bg-white hover:text-gray-800 ',
              !isExpanded ? 'justify-center' : 'justify-start',
            ]"
          >
            <icon :name="item.icon" />
            <span v-show="isExpanded">{{ item.name }}</span>
          </router-link>

          <!-- Collapsible Parent -->
          <div v-else>
            <div
              @click="toggleDropdown(item.name)"
              class="flex items-center justify-between w-full p-2 cursor-pointer transition-all duration-200"
              :class="[
                isDropdownOpen === item.name
                  ? `bg-white text-gray-800 ${
                      !isExpanded ? 'rounded-md' : 'rounded-t-md'
                    }`
                  : 'text-white hover:bg-white hover:text-gray-800 hover:rounded-md ',
              ]"
            >
              <!-- Icon + Label -->
              <div
                :class="[
                  !isExpanded ? 'justify-center w-full' : 'justify-start gap-5',
                ]"
                class="flex items-center"
              >
                <icon :name="item.icon" />
                <span v-show="isExpanded">{{ item.name }}</span>
              </div>
              <!-- Arrow icon (only show when expanded) -->
              <icon
                name="arrow-down"
                v-show="isExpanded"
                class="transition-transform"
                :class="{ 'rotate-180': isDropdownOpen === item.name }"
              />
            </div>

            <!-- Dropdown children -->
            <transition name="slide">
              <div v-show="isDropdownOpen === item.name && isExpanded">
                <router-link
                  v-for="(sub, index) in item.children"
                  :key="sub.name"
                  :to="sub.route"
                  class="block w-full py-2 px-[60px] text-[12px] transition-all duration-200 text-left border border-white"
                  :class="[
                    $route.path.startsWith(sub.route) // This ensures the parent is active when on a child route
                      ? 'bg-[#34699A] text-white '
                      : 'bg-white text-gray-800 hover:bg-gray-200',
                    index === item.children.length - 1
                      ? 'rounded-b-md border border-white'
                      : '',
                  ]"
                >
                  {{ sub.name }}
                </router-link>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div
      :class="{
        'ml-16': !isExpanded,
        'ml-64': isExpanded,
      }"
      class="flex-grow transition-all pt-2 min-h-screen rounded-t-[20px] overflow-hidden z-50"
    >
      <slot>
        <div class="bg-white w-auto h-full shadow mr-2 rounded-t-[20px]">
          <receptionistTopbar />
          <div class="p-2">
            <router-view></router-view>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import receptionistTopbar from "../../../components/receptionist/navigation/topbar.vue";
import axios from "axios";
export default {
  name: "AdminSidebar",
  components: {
    icon,
    receptionistTopbar,
  },
  data() {
    return {
      isExpanded: false,
      isDropdownOpen: null,
      user: {},

      homeItems: [
        {
          name: "Dashboard",
          icon: "dashboard",
          route: "/receptionist-dashboard",
        },
      ],
      serviceMaintenanceItems: [
        {
          name: "Patient Records",
          icon: "users",
          children: [
            {
              name: "Patients List",
              route: "/patient-records",
            },
            {
              name: "Appointement",
              route: "/appointments",
            },
            {
              name: "Dental Chart",
              route: "/recep-dental-chart",
            },
          ],
        },
      ],
      billingItems: [
        {
          name: "Payment Records",
          icon: "payment",
          children: [
            {
              name: "Billing & Payments",
              route: "/billing-payments",
            },
          ],
        },
      ],
    };
  },
  watch: {
    "$route.path"(newPath) {
      this.expandDropdownForCurrentRoute(newPath);
    },
  },
  created() {
    this.expandDropdownForCurrentRoute(this.$route.path);
  },
  mounted() {
    this.fetchUser();
  },
  methods: {
    toggleSidebar() {
      this.isExpanded = !this.isExpanded;
    },
    toggleDropdown(name) {
      this.isExpanded = true;
      this.isDropdownOpen = this.isDropdownOpen === name ? null : name;
    },
    expandDropdownForCurrentRoute(path) {
      const allDropdownItems = [
        ...this.serviceMaintenanceItems,
        ...this.billingItems,
      ];
      for (const item of allDropdownItems) {
        if (item.children) {
          const match = item.children.find((child) =>
            path.startsWith(child.route)
          );
          if (match || path.startsWith(item.route)) {
            this.isExpanded = true;
            this.isDropdownOpen = item.name;
            break;
          }
        }
      }
    },
    handleDashboardClick() {
      this.isDropdownOpen = null;
      this.isExpanded = false;
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

<style scoped>
.transition-transform {
  transition: transform 0.1s ease;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.1s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
