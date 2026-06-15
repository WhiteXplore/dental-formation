<template>
  <div class="bg-[#34699A] w-screen h-screen flex">
    <!-- Sidebar -->
    <div
      :class="{ 'w-16': !isExpanded, 'w-64': isExpanded }"
      class="h-full fixed left-0 top-0 bg-[#34699A] text-white p-3 transition-all duration-300 ease-in-out"
      v-if="user.role"
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
      <div class="flex flex-col items-center justify-center w-full">
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
        <template v-for="section in roleMenuSections" :key="section.title">
          <div v-if="isExpanded" class="text-md text-white mt-2 text-left">
            {{ section.title }}
          </div>

          <div v-for="item in section.items" :key="item.name" class="w-full">
            <!-- No children -->
            <router-link
              v-if="!item.children"
              :to="item.route"
              class="flex items-center w-full gap-5 p-2 rounded-md transition-all duration-200"
              :class="[
                $route.path.startsWith(item.route)
                  ? 'bg-white text-green-700'
                  : 'text-white hover:bg-white hover:text-gray-800',
                !isExpanded ? 'justify-center' : 'justify-start',
              ]"
            >
              <icon :name="item.icon" />
              <span v-show="isExpanded">{{ item.name }}</span>
            </router-link>

            <!-- With children -->
            <div v-else>
              <div
                @click="toggleDropdown(item.name)"
                class="flex items-center justify-between w-full p-2 cursor-pointer transition-all duration-200"
                :class="[
                  isDropdownOpen === item.name
                    ? `bg-white text-gray-800 ${
                        !isExpanded ? 'rounded-md' : 'rounded-t-md'
                      }`
                    : 'text-white hover:bg-white hover:text-gray-800 hover:rounded-md',
                ]"
              >
                <div
                  :class="[!isExpanded ? 'justify-center w-full' : 'justify-start gap-5']"
                  class="flex items-center"
                >
                  <icon :name="item.icon" />
                  <span v-show="isExpanded">{{ item.name }}</span>
                </div>
                <icon
                  name="arrow-down"
                  v-show="isExpanded"
                  class="transition-transform"
                  :class="{ 'rotate-180': isDropdownOpen === item.name }"
                />
              </div>

              <transition name="slide">
                <div v-show="isDropdownOpen === item.name && isExpanded">
                  <router-link
                    v-for="(sub, index) in item.children"
                    :key="sub.name"
                    :to="sub.route"
                    class="block w-full py-2 px-[60px] text-[12px] transition-all duration-200 text-left border border-white"
                    :class="[
                      $route.path.startsWith(sub.route)
                        ? 'bg-[#34699A] text-white'
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
        </template>
      </div>
    </div>

    <!-- Main Content -->
    <div
      :class="{ 'ml-16': !isExpanded, 'ml-64': isExpanded }"
      class="flex-grow transition-all min-h-screen overflow-hidden z-50"
    >
      <slot>
        <div class="bg-white w-auto h-full shadow">
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
import axios from "axios";
import icon from "@/assets/icon.vue";
import receptionistTopbar from "../../../components/global/navigation/topbar.vue";

export default {
  name: "RoleBasedSidebar",
  components: { icon, receptionistTopbar },
  data() {
    return {
      isExpanded: false,
      isDropdownOpen: null,
      user: {},

      // ✅ Menu configuration by role
      menuItemsByRole: {
        Admin: [
          {
            title: "Home",
            items: [
              {
                name: "Dashboard",
                icon: "dashboard",
                route: "/admin-dashboard",
              },
            ],
          },
          {
            title: "Master Files",
            items: [
              {
                name: "Patient History",
                route: "/tracker",
                icon: "general",
              },
              {
                name: "Item & Services",
                icon: "inventory",
                children: [
                  {
                    name: "Inventory",
                    route: "/inventory",
                  },
                  {
                    name: "Procedures",
                    route: "/price-procedure",
                  },
                  {
                    name: "Status",
                    route: "/status",
                  },
                  {
                    name: "Medicines",
                    route: "/medicines",
                  },
                ],
              },
              {
                name: "HMO's / Guarantors",
                route: "/hmo-guarantors",
                icon: "general",
              },
            ],
          },
          {
            title: "Transactions",
            items: [
              {
                name: "Appointments",
                route: "/appointments",
                icon: "general",
              },
              {
                name: "Cash Receipt",
                route: "/billing-payments",
                icon: "payment",
              },
              {
                name: "Dental Charts",
                route: "/recep-dental-chart",
                icon: "clipboard",
              },
            ],
          },
          {
            title: "Others",
            items: [
              {
                name: "Monthly Summary",
                route: "/report-analytics",
                icon: "graph",
              },
              {
                name: "Revenue Forcasting",
                route: "/revenue-forcasting",
                icon: "graph",
              },
              {
                name: "Usage Consumption",
                route: "/usage-consumption",
                icon: "graph",
              },
              {
                name: "System Users",
                icon: "users",
                route: "/user-accounts",
              },
            ],
          },
        ],

        Dentist: [
          {
            title: "Home",
            items: [
              {
                name: "Dashboard",
                icon: "dashboard",
                route: "/dentist-dashboard",
              },
            ],
          },
          {
            title: "Records Management",
            items: [
              {
                name: "Charts Records",
                icon: "graph",
                children: [
                  {
                    name: "Appointment",
                    route: "/dentist-appointments",
                  },
                  {
                    name: "Patient History",
                    route: "/tracker",
                    icon: "general",
                  },
                  {
                    name: "Dental Charts",
                    route: "/dentist-dental-chart",
                  },
                ],
              },
            ],
          },
          // {
          //   title: "Prescription Management",
          //   items: [
          //     {
          //       name: "Medication",
          //       icon: "general",
          //       route: "/prescription-medication",
          //     },
          //   ],
          // },
          {
            title: "Reports",
            items: [
              {
                name: "Monthly Income",
                icon: "payment",
                route: "/monthly-income",
              },
            ],
          },
        ],

        Receptionist: [
          {
            title: "Home",
            items: [
              {
                name: "Dashboard",
                icon: "dashboard",
                route: "/receptionist-dashboard",
              },
            ],
          },
          {
            title: "Patient Management",
            items: [
              {
                name: "Patient Records",
                icon: "users",
                children: [
                  { name: "Patients List", route: "/patient-records" },
                  { name: "Appointment", route: "/appointments" },
                  { name: "Dental Chart", route: "/recep-dental-chart" },
                ],
              },
            ],
          },
          {
            title: "Billing",
            items: [
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
          },
          {
            title: "Reports",
            items: [
              {
                name: "Dental Certificate",
                icon: "clipboard",
                route: "/dental-certificate",
              },
              {
                name: "Outpatient List",
                icon: "clipboard",
                route: "/outpatient-list",
              },
              {
                name: "Monthly Reports",
                icon: "clipboard",
                route: "/monthly-reports",
              },
            ],
          },
        ],
      },
    };
  },
  computed: {
    roleMenuSections() {
      return this.menuItemsByRole[this.user.role] || this.menuItemsByRole["Receptionist"];
    },
  },
  watch: {
    "$route.path"(newPath) {
      this.expandDropdownForCurrentRoute(newPath);
    },
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
      const sections = this.roleMenuSections || [];
      const allDropdownItems = sections.flatMap((s) => s.items);
      for (const item of allDropdownItems) {
        if (item.children) {
          const match = item.children.find((child) => path.startsWith(child.route));
          if (match) {
            this.isDropdownOpen = item.name;
            break;
          }
        }
      }
    },
    async fetchUser() {
      try {
        const response = await axios.get(process.env.VUE_APP_API_BASE_URL + "/auth/me", {
          withCredentials: true,
        });
        if (response.data) {
          this.user = response.data;
          console.log("Authenticated User:", this.user);
        } else {
          this.$router.push("/");
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
